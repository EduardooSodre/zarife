import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  variant: {
    size?: string;
    color?: string;
  };
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingData {
  address: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  complement?: string;
}

interface PaymentData {
  method: string;
}

interface AmountsData {
  subtotal: number;
  shipping: number;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado no banco. Faça login novamente." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Debug: log a minimal summary (avoid PII) to help tracking 400 causes
    try {
      const itemsSummary = (body.items || []).map((it: unknown) => {
        if (!it || typeof it !== "object") return null;
        const o = it as Record<string, unknown>;
        return {
          productId: String(o.productId || ""),
          quantity: Number(o.quantity || 0),
          variant: o.variant || {},
        };
      });
      console.debug("[orders] incoming order items:", itemsSummary);
    } catch {
      // ignore logging errors
    }

    const {
      items,
      customer,
      shipping,
      payment,
      amounts,
      notes,
    }: {
      items: OrderItem[];
      customer: CustomerData;
      shipping: ShippingData;
      payment: PaymentData;
      amounts: AmountsData;
      notes?: string;
    } = body;

    if (!items || !customer || !shipping || !payment || !amounts) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const productIds = [
      ...new Set(items.map((item: OrderItem) => item.productId)),
    ];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        variants: true,
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        {
          error: `Alguns produtos não foram encontrados ou estão inativos: ${missing.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado` },
          { status: 400 }
        );
      }

      if (
        product.variants &&
        product.variants.length > 0 &&
        (item.variant.size || item.variant.color)
      ) {
        // Normalize helper
  const normalize = (s?: string | null) => (s || "").toString().trim().toLowerCase();

        // Match variant by the dimensions provided in the order (size and/or color).
        const variant = product.variants.find((v) => {
          const sizeMatches = item.variant.size
            ? normalize(v.size) === normalize(item.variant.size)
            : true;
          const colorMatches = item.variant.color
            ? normalize(v.color) === normalize(item.variant.color)
            : true;
          return sizeMatches && colorMatches;
        });

        if (!variant) {
          // Improve debug information to diagnose mismatches (don't log PII)
          try {
            const available = product.variants.map((v) => ({
              id: v.id,
              size: v.size?.toString().trim(),
              color: v.color?.toString().trim(),
            }));
            console.debug(`[orders] variant not found for product ${product.id} (${product.name}). requested:`, item.variant, 'available:', available);
          } catch {
            // ignore
          }

          return NextResponse.json(
            {
              error: `Variante não encontrada para o produto ${product.name}`,
            },
            { status: 400 }
          );
        }

        if ((variant.stock ?? 0) < item.quantity) {
          return NextResponse.json(
            {
              error: `Estoque insuficiente para ${product.name}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingPostalCode: shipping.postalCode,
        shippingState: shipping.state,
        shippingCountry: shipping.country,
        shippingComplement: shipping.complement,
        subtotal: Number(amounts.subtotal),
        shipping: Number(amounts.shipping),
        total: Number(amounts.total),
        paymentMethod: payment.method,
        notes: notes || "",
      },
    });

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          size: item.variant.size,
          color: item.variant.color,
        },
      });
    }

    // Nota: O estoque será decrementado apenas quando o pagamento for confirmado via webhook

    return NextResponse.json({ id: order.id }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
