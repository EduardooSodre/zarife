import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_BASE =
  PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "EUR";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret)
    throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch PayPal token: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );

    const body = await request.json();
    const { orderId } = body || {};
    if (!orderId)
      return NextResponse.json(
        { error: "orderId obrigatório" },
        { status: 400 }
      );

    // Load order server-side to avoid client tampering
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order)
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    if (order.userId !== user.id)
      return NextResponse.json(
        { error: "Unauthorized for this order" },
        { status: 403 }
      );
    if (order.status !== "PENDING")
      return NextResponse.json(
        { error: "Pedido não está pendente" },
        { status: 400 }
      );

    // Recalculate totals server-side and compare
    const subtotal = order.items.reduce(
      (sum, it) => sum + Number(it.price) * it.quantity,
      0
    );
    const shipping = Number(order.shipping || 0);
    const total = Number(order.total);
    const computedTotal = Number((subtotal + shipping).toFixed(2));
    if (Math.abs(computedTotal - total) > 0.01) {
      console.warn("Order total mismatch", {
        orderId,
        subtotal,
        shipping,
        total,
        computedTotal,
      });
      return NextResponse.json(
        { error: "Valores do pedido não conferem" },
        { status: 400 }
      );
    }

    // Create PayPal order
    const accessToken = await getPayPalAccessToken();

    const items = order.items.map((it) => ({
      name: `Item ${it.productId}`,
      unit_amount: {
        currency_code: PAYPAL_CURRENCY,
        value: Number(it.price).toFixed(2),
      },
      quantity: String(it.quantity),
      sku: it.productId,
    }));

    const purchase_units = [
      {
        reference_id: order.id,
        custom_id: order.id,
        amount: {
          currency_code: PAYPAL_CURRENCY,
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: PAYPAL_CURRENCY,
              value: subtotal.toFixed(2),
            },
            shipping: {
              currency_code: PAYPAL_CURRENCY,
              value: shipping.toFixed(2),
            },
          },
        },
        items,
      },
    ];

    const createRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // idempotency: use our order id so retrying won't create duplicates
        "PayPal-Request-Id": order.id,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units,
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${order.id}&provider=paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancel=1`,
        },
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("PayPal create order failed:", createRes.status, text);

      // If PayPal complains about unsupported currency, optionally retry with fallback currency
      const fallback = process.env.PAYPAL_FALLBACK_CURRENCY;
      const unsupported =
        /UNSUPPORTED_PAYEE_CURRENCY|VUNSUPPORTED_PAYEE_CURRENCY|currency not supported/i.test(
          text
        );
      if (fallback && unsupported && fallback !== PAYPAL_CURRENCY) {
        try {
          console.info("Attempting fallback currency", {
            from: PAYPAL_CURRENCY,
            to: fallback,
          });

          // Fetch a single conversion rate to avoid rounding inconsistencies
          const rateRes = await fetch(
            `https://api.exchangerate.host/convert?from=${encodeURIComponent(
              PAYPAL_CURRENCY
            )}&to=${encodeURIComponent(fallback)}&amount=1`
          );
          if (!rateRes.ok) throw new Error("Failed to fetch exchange rate");
          const rateJson = await rateRes.json();
          const rate = Number(rateJson.result);
          if (!rate || Number.isNaN(rate) || rate <= 0)
            throw new Error("Invalid exchange rate");

          const itemsFallback = order.items.map((it) => {
            const unit = Number(it.price) || 0;
            const convertedUnit = Number((unit * rate).toFixed(2));
            return {
              name: `Item ${it.productId}`,
              unit_amount: {
                currency_code: fallback,
                value: convertedUnit.toFixed(2),
              },
              quantity: String(it.quantity),
              sku: it.productId,
            };
          });

          const newSubtotal = itemsFallback.reduce(
            (s, it) => s + Number(it.unit_amount.value) * Number(it.quantity),
            0
          );
          const newShipping = Number((shipping * rate).toFixed(2));
          const newTotal = Number((newSubtotal + newShipping).toFixed(2));

          const purchase_units_fb = [
            {
              reference_id: order.id,
              custom_id: order.id,
              amount: {
                currency_code: fallback,
                value: newTotal.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: fallback,
                    value: newSubtotal.toFixed(2),
                  },
                  shipping: {
                    currency_code: fallback,
                    value: newShipping.toFixed(2),
                  },
                },
              },
              items: itemsFallback,
            },
          ];

          const retryRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              "PayPal-Request-Id": order.id,
            },
            body: JSON.stringify({
              intent: "CAPTURE",
              purchase_units: purchase_units_fb,
              application_context: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${order.id}&provider=paypal`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancel=1`,
              },
            }),
          });

          if (retryRes.ok) {
            const data2 = await retryRes.json();
            // persist paypal order id for debugging / lookup
            if (data2?.id) {
              try {
                // write directly to DB while prisma client types are not regenerated
                await prisma.$executeRawUnsafe(
                  `UPDATE orders SET paypal_order_id = $1 WHERE id = $2`,
                  String(data2.id),
                  order.id
                );
              } catch (e) {
                console.error("Failed to save paypalOrderId", e);
              }
            }
            type PayPalLink = { href?: string; rel?: string; method?: string };
            const approve2 = (data2.links || []).find(
              (l: PayPalLink) => l.rel === "approve"
            );
            if (approve2) return NextResponse.json({ url: approve2.href });
          }
        } catch (fbErr) {
          console.error("Fallback currency attempt failed:", fbErr);
        }
      }

      return NextResponse.json(
        { error: "Erro ao iniciar pagamento via PayPal" },
        { status: 500 }
      );
    }

    const data = await createRes.json();
    // Log PayPal order response for debugging currency/links
    try {
      console.debug("PayPal create order response:", {
        id: data.id,
        status: data.status,
        purchase_units: data.purchase_units,
        links: data.links,
      });
    } catch {
      console.debug("PayPal create order response (raw):", data);
    }
    // persist paypal order id for debugging / lookup
    if (data?.id) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE orders SET paypal_order_id = $1 WHERE id = $2`,
          String(data.id),
          order.id
        );
      } catch (e) {
        console.error("Failed to save paypalOrderId", e);
      }
    }
    type PayPalLink = { href?: string; rel?: string; method?: string };
    const approve = (data.links || []).find(
      (l: PayPalLink) => l.rel === "approve"
    );
    if (!approve) {
      console.error("No approve link from PayPal order", data);
      return NextResponse.json(
        { error: "Erro ao iniciar pagamento via PayPal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: approve.href });
  } catch (err) {
    console.error("PayPal checkout error:", err);
    return NextResponse.json(
      { error: "Erro interno ao criar pagamento PayPal" },
      { status: 500 }
    );
  }
}
