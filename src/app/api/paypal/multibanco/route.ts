import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_BASE = PAYPAL_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch PayPal token: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

// POST: create + confirm payment source (Multibanco)
// Body: { orderId: string, fullName: string }
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });

    const body = await request.json();
    const { orderId, fullName } = body || {};
    if (!orderId) return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
    if (!fullName) return NextResponse.json({ error: 'fullName obrigatório' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    if (order.userId !== user.id) return NextResponse.json({ error: 'Unauthorized for this order' }, { status: 403 });
    if (order.status !== 'PENDING') return NextResponse.json({ error: 'Pedido não está pendente' }, { status: 400 });

    // Create order in PayPal (EUR required for Multibanco)
    const accessToken = await getPayPalAccessToken();

    const createRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': order.id
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order.id,
          custom_id: order.id,
          amount: { currency_code: 'EUR', value: Number(order.total).toFixed(2) }
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${order.id}&provider=multibanco`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancel=1`
        }
      })
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error('PayPal create order failed (multibanco):', createRes.status, text);
      return NextResponse.json({ error: 'Erro ao criar ordem PayPal' }, { status: 500 });
    }

    const created = await createRes.json();

    // Confirm payment source as multibanco
    const confirmRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${created.id}/confirm-payment-source`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        payment_source: {
          multibanco: {
            name: fullName,
            country_code: 'PT'
          }
        },
        processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL',
        application_context: {
          locale: 'pt-PT',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${order.id}&provider=multibanco`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancel=1`
        }
      })
    });

    if (!confirmRes.ok) {
      const text = await confirmRes.text();
      console.error('PayPal confirm payment source failed:', confirmRes.status, text);
      return NextResponse.json({ error: 'Erro ao confirmar Multibanco' }, { status: 500 });
    }

    const confirmed = await confirmRes.json();
    // Look for payer-action link to redirect buyer to instruction
  type PayPalLink = { href?: string; rel?: string; method?: string };
  const payerAction = (confirmed.links || []).find((l: PayPalLink) => l.rel === 'payer-action' || l.rel === 'approve');

    // Persist paypal order id for lookup
    try {
      if (created?.id) {
        await prisma.$executeRawUnsafe(`UPDATE orders SET paypal_order_id = $1 WHERE id = $2`, String(created.id), order.id);
      }
    } catch (e) {
      console.error('Failed to persist paypal order id (multibanco)', e);
    }

    return NextResponse.json({ orderId: created.id, redirectUrl: payerAction?.href, confirmed });
  } catch (err) {
    console.error('Multibanco create error:', err);
    return NextResponse.json({ error: 'Erro interno ao iniciar Multibanco' }, { status: 500 });
  }
}
