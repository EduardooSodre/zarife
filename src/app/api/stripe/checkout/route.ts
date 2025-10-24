import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Allow using an env override for apiVersion; cast to Stripe.StripeConfig to avoid literal-type mismatch
const stripeConfig = {
  apiVersion: process.env.STRIPE_API_VERSION || "2025-08-27.basil",
} as unknown as Stripe.StripeConfig;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, stripeConfig);

type CheckoutItem = {
  name: string;
  price: number | string;
  quantity: number;
  description?: string;
  image?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, customerEmail } = body;

    if (!orderId || !items || !customerEmail) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Montar os produtos para Stripe, incluindo imagem e descrição se disponíveis
    const line_items = (items as CheckoutItem[]).map((item: CheckoutItem) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(Number(item.price) * 100), // Stripe espera em centavos
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${orderId}&paid=1`,
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
