import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_BASE =
  PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

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
    const t = await res.text();
    throw new Error(`Failed to fetch PayPal token: ${res.status} ${t}`);
  }
  const d = await res.json();
  return d.access_token as string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { orderId, token } = body || {};
    if (!orderId || !token)
      return NextResponse.json(
        { error: "orderId and token required" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== user.id)
      return NextResponse.json(
        { error: "Unauthorized for this order" },
        { status: 403 }
      );

    // If already paid, nothing to do (idempotent)
    if (order.status === "PAID")
      return NextResponse.json({ ok: true, alreadyPaid: true });

    const accessToken = await getPayPalAccessToken();

    // Optional: verify PayPal order details first
    const getRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!getRes.ok) {
      const t = await getRes.text();
      console.error("Failed to fetch PayPal order details", getRes.status, t);
      return NextResponse.json(
        { error: "Failed to fetch PayPal order details" },
        { status: 502 }
      );
    }
    const orderDetails = await getRes.json();

    // Basic server-side validation: check amounts roughly match
    try {
      const paypalAmount = Number(
        orderDetails.purchase_units?.[0]?.amount?.value || 0
      );
      const localTotal = Number(order.total || 0);
      if (Math.abs(paypalAmount - localTotal) > 0.5) {
        console.warn("PayPal amount mismatch", {
          orderId,
          paypalAmount,
          localTotal,
        });
        // continue but log; you may want to block in stricter scenarios
      }
    } catch {
      // ignore
    }

    // Capture the order
    const capRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!capRes.ok) {
      const t = await capRes.text();
      console.error("PayPal capture failed", capRes.status, t);
      return NextResponse.json(
        { error: "PayPal capture failed", details: t },
        { status: 502 }
      );
    }

    const capJson = await capRes.json();

    // Persist paypal order id if missing
    try {
      if (orderDetails?.id) {
        await prisma.$executeRawUnsafe(
          `UPDATE orders SET paypal_order_id = $1 WHERE id = $2`,
          String(orderDetails.id),
          order.id
        );
      }
    } catch (e) {
      console.error("Failed to persist paypal_order_id", e);
    }

    // Update order status and payment method, decrement stock
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", paymentMethod: "paypal" },
      });
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
    } catch (e) {
      console.error("Failed to update order after capture", e);
    }

    return NextResponse.json({ ok: true, capture: capJson });
  } catch (err) {
    console.error("PayPal capture handler error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
