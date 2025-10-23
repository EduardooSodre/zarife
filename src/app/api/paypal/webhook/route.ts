// This file receives dynamic PayPal webhook payloads; skip strict ESLint rules here
// to avoid noisy 'any' and unused-var errors. Replace with stricter types after
// running `prisma generate` and adding typed payment instruction columns.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_BASE =
  PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not set");

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
    const txt = await res.text();
    throw new Error(`Failed to fetch PayPal token: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function verifyWebhook(
  parsedBody: unknown,
  headers: Record<string, string>
) {
  const access = await getAccessToken();
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID not configured");

  const payload = {
    auth_algo: headers["paypal-auth-algo"] || headers["Paypal-Auth-Algo"],
    cert_url: headers["paypal-cert-url"] || headers["Paypal-Cert-Url"],
    transmission_id:
      headers["paypal-transmission-id"] || headers["Paypal-Transmission-Id"],
    transmission_sig:
      headers["paypal-transmission-sig"] || headers["Paypal-Transmission-Sig"],
    transmission_time:
      headers["paypal-transmission-time"] ||
      headers["Paypal-Transmission-Time"],
    webhook_id: webhookId,
    webhook_event: parsedBody,
  } as const;

  const verifyRes = await fetch(
    `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!verifyRes.ok) {
    const t = await verifyRes.text();
    throw new Error("PayPal verify failed: " + t);
  }

  const v = await verifyRes.json();
  return v && v.verification_status === "SUCCESS";
}

function resolveOrderIdFromEvent(evt: any): string | undefined {
  return (
    evt?.resource?.supplementary_data?.related_ids?.order_id ||
    evt?.resource?.purchase_units?.[0]?.reference_id ||
    evt?.resource?.custom_id ||
    undefined
  );
}

export async function POST(request: NextRequest) {
  try {
    const headers: Record<string, string> = {};
    for (const [k, v] of request.headers) headers[k.toLowerCase()] = v || "";

    // Read raw and parsed body (PayPal verification expects the event object)
    const raw = await request.text();
    let parsed: unknown = {};
    try {
      parsed = JSON.parse(raw);
    } catch (_e) {
      // If parsing fails, keep raw (unlikely for PayPal webhooks)
      parsed = raw;
    }

    // Verify signature
    const ok = await verifyWebhook(parsed, headers);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );

    const evt: any = parsed as any;
    const eventType: string | undefined = evt?.event_type;
    console.info("PayPal webhook received", { eventType, id: evt?.id ?? null });

    // --- PAYMENT.CAPTURE.PENDING -> persist Multibanco instructions + mark PROCESSING ---
    if (eventType === "PAYMENT.CAPTURE.PENDING") {
      try {
        const orderId = resolveOrderIdFromEvent(evt);

        const paymentSource =
          evt?.resource?.payment_source ||
          evt?.resource?.payments?.[0]?.payment_source ||
          evt?.resource?.purchase_units?.[0]?.payments?.captures?.[0]
            ?.payment_source;
        const multibanco =
          paymentSource?.multibanco ||
          evt?.resource?.payment_source?.multibanco;

        if (multibanco) {
          const reference =
            multibanco.payment_reference || multibanco.paymentReference || null;
          const entity =
            multibanco.payment_entity || multibanco.paymentEntity || null;
          const barcodeUrl =
            multibanco.barcode_url || multibanco.BARCODE_URL || null;

          const payload = JSON.stringify([
            {
              provider: "paypal",
              type: "multibanco",
              entity,
              reference,
              barcodeUrl,
            },
          ]);

          console.info(
            "PAYPAL PENDING: candidateOrderId=",
            orderId,
            "paypalOrderId=",
            evt?.resource?.id
          );
          if (orderId) {
            // Try to persist to payment_instructions JSONB column, fallback to notes
            try {
              await prisma.$executeRawUnsafe(
                `UPDATE orders SET payment_instructions = COALESCE(payment_instructions, '[]'::jsonb) || $1::jsonb WHERE id = $2`,
                payload,
                orderId
              );
            } catch (e) {
              const note = `Multibanco instruction - entity: ${entity}, reference: ${reference}, barcode_url: ${barcodeUrl}`;
              try {
                await prisma.order.update({
                  where: { id: orderId },
                  data: { notes: note },
                });
              } catch (ee) {
                console.error("persist notes failed", ee);
              }
            }

            try {
              await prisma.order.update({
                where: { id: orderId },
                data: { status: "PROCESSING", paymentMethod: "multibanco" },
              });
            } catch (ee) {
              console.error("mark processing failed", ee);
            }
          } else if (evt?.resource?.id) {
            // Try to find order by paypal_order_id (raw query until prisma client is regenerated)
            try {
              const rows = (await prisma.$queryRawUnsafe(
                `SELECT id FROM orders WHERE paypal_order_id = $1 LIMIT 1`,
                String(evt.resource.id)
              )) as unknown as Array<{ id: string }>;
              const found = rows?.[0];
              if (found) {
                const note = `Multibanco instruction - entity: ${entity}, reference: ${reference}, barcode_url: ${barcodeUrl}`;
                try {
                  await prisma.order.update({
                    where: { id: found.id },
                    data: {
                      notes: note,
                      status: "PROCESSING",
                      paymentMethod: "multibanco",
                    },
                  });
                } catch (ee) {
                  console.error("update by paypal id failed", ee);
                }
              }
            } catch (ee) {
              console.error("lookup by paypal_order_id failed", ee);
            }
          }
        }
      } catch (e) {
        console.error("PENDING handler error", e);
      }
    }

    // --- CHECKOUT.ORDER.APPROVED or PAYMENT.CAPTURE.COMPLETED -> mark PAID and decrement stock ---
    if (
      eventType === "CHECKOUT.ORDER.APPROVED" ||
      eventType === "PAYMENT.CAPTURE.COMPLETED"
    ) {
      try {
        let orderId = resolveOrderIdFromEvent(evt);

        if (!orderId && evt?.resource?.id) {
          try {
            const rows = (await prisma.$queryRawUnsafe(
              `SELECT id FROM orders WHERE paypal_order_id = $1 LIMIT 1`,
              String(evt.resource.id)
            )) as unknown as Array<{ id: string }>;
            const found = rows?.[0];
            if (found) orderId = found.id;
          } catch (ee) {
            console.error("resolve by paypal id failed", ee);
          }
        }

        if (orderId) {
          console.info(
            "PAYPAL COMPLETED: resolvedOrderId=",
            orderId,
            "paypalOrderId=",
            evt?.resource?.id
          );
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });
          if (
            order &&
            (order.status === "PENDING" || order.status === "PROCESSING")
          ) {
            // If order was marked as multibanco (pending), keep it; otherwise set provider to paypal
            const wasMultibanco = order.paymentMethod === "multibanco";
            try {
              await prisma.order.update({
                where: { id: orderId },
                data: {
                  status: "PAID",
                  ...(wasMultibanco ? {} : { paymentMethod: "paypal" }),
                },
              });
              console.info("Order updated to PAID", {
                orderId,
                previousPaymentMethod: order.paymentMethod,
                setTo: wasMultibanco ? order.paymentMethod : "paypal",
              });
            } catch (ee) {
              console.error("Failed to update order status/paymentMethod", ee);
            }
            for (const item of order.items || []) {
              try {
                if (item.size || item.color) {
                  await prisma.productVariant.updateMany({
                    where: {
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                    },
                    data: { stock: { decrement: item.quantity } },
                  });
                }
              } catch (ee) {
                console.error("Failed to decrement stock for item", item, ee);
              }
            }
          }
        }
      } catch (e) {
        console.error("COMPLETED handler error", e);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
