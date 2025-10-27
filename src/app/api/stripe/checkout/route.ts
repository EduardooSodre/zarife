import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

// Allow using an env override for apiVersion; cast to Stripe.StripeConfig to avoid literal-type mismatch
const stripeConfig = {
  apiVersion: process.env.STRIPE_API_VERSION || "2025-08-27.basil",
} as unknown as Stripe.StripeConfig;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, stripeConfig);

// Note: we intentionally build line items from server-side order data; no client-submitted item type needed here.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerEmail } = body || {};

    if (!orderId || !customerEmail) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Load order server-side to avoid trusting client data and to include shipping
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    if (order.status !== "PENDING") return NextResponse.json({ error: "Pedido não está pendente" }, { status: 400 });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = (order.items || []).map((it: { productId: string; price: unknown; quantity: number }) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `Item ${it.productId}`,
        },
        unit_amount: Math.round(Number(it.price) * 100),
      },
      quantity: it.quantity,
    }));

    // Add shipping as a separate line item so Stripe charges include it
    const shippingAmount = Number(order.shipping || 0);
    if (shippingAmount > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Envio" },
          unit_amount: Math.round(shippingAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${orderId}&paid=1&provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancel=1`,
      metadata: {
        orderId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão Stripe:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
