import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const buf = await request.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Buscar o pedido com seus items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (order && order.status === "PENDING") {
        // Atualizar status do pedido para PAID e definir método de pagamento como Stripe
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            stripePaymentId: (session.payment_intent as string) || undefined,
            paymentMethod: "stripe",
          },
        });

        // Decrementar estoque para cada item do pedido
        for (const item of order.items) {
          if (item.size || item.color) {
            // Se tem variante (tamanho ou cor), atualizar estoque da variante
            await prisma.productVariant.updateMany({
              where: {
                productId: item.productId,
                size: item.size,
                color: item.color,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          } else {
            // Sem variante especificada: não há campo de stock no produto principal (apenas variantes têm stock).
            // Registrar para facilitar debugging — estoque não pode ser decrementado sem variantes.
            console.warn(`Item ${item.id} do pedido ${orderId} não tem variante para decrementar stock.`);
          }
          // Revalidar a página do produto individual para atualizar stock/imagens/labels
          revalidatePath(`/product/${item.productId}`);
        }

        // Revalidar listas e home
        revalidatePath("/");
        revalidatePath("/produtos");
      }
    }
  }

  return NextResponse.json({ received: true });
}
