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

    // NOTE: We compute all amounts server-side below for security. Do not trust client-submitted prices/amounts.

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

    // Use any-typed prisma client here to accommodate generated client shape differences
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = prisma as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = await db.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        variants: true,
        promotions: {
          where: { isActive: true },
        },
      },
    });

    if (products.length !== productIds.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const foundIds = products.map((p: any) => p.id);
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

    // We'll compute server-side pricing to prevent tampering.
    let serverSubtotal = 0;

    for (const item of items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = products.find((p: any) => p.id === item.productId);
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
        const normalize = (s?: string | null) =>
          (s || "").toString().trim().toLowerCase();

        // Match variant by the dimensions provided in the order (size and/or color).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variant = (product.variants as any[]).find((v: any) => {
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
          // Do not log variant internals in production - return generic error

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
    // Compute per-item price and accumulate subtotal
    for (const item of items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = products.find((p: any) => p.id === item.productId)!;

      // Determine effective base price (product.price is original)
      const basePrice = Number(product.price);

      // Look for active percent promotions attached to the product
      const promoPercents: number[] = [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prodAny = product as any;
        if (prodAny.promotions && Array.isArray(prodAny.promotions)) {
          for (const promo of prodAny.promotions) {
            if (promo.discountType === "PERCENT" && promo.value != null) {
              let nv = Number(promo.value);
              if (!isNaN(nv)) {
                if (nv > 0 && nv <= 1) nv = nv * 100;
                promoPercents.push(Math.round(nv));
              }
            }
          }
        }
      } catch {
        // ignore
      }

      // Choose the highest promotion percent if any (safe for customer)
      let appliedPercent: number | null = null;
      if (promoPercents.length > 0) {
        appliedPercent = Math.max(...promoPercents);
      } else if (product.isOnSale && product.salePercentage) {
        appliedPercent = Number(product.salePercentage);
      }

      let itemUnitPrice = basePrice;
      if (appliedPercent && appliedPercent >= 1) {
        const discounted = basePrice * (1 - appliedPercent / 100);
        itemUnitPrice = Math.round(discounted * 100) / 100;
      }

      const qty = Number(item.quantity) || 1;
      serverSubtotal += itemUnitPrice * qty;

      // Create order item with server-validated price
      // We'll create order after computing totals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item as any).__serverPrice = itemUnitPrice;
    }

    // Validate/normalize shipping amount provided by client (allow override but sanitize)
    const shippingAmount =
      Number(amounts.shipping) >= 0 ? Number(amounts.shipping) : 0;
    const serverTotal =
      Math.round((serverSubtotal + shippingAmount) * 100) / 100;

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
        subtotal: Number(serverSubtotal),
        shipping: Number(shippingAmount),
        total: Number(serverTotal),
        paymentMethod: payment.method,
        notes: notes || "",
      },
    });

    for (const item of items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serverPrice = Number((item as any).__serverPrice);
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: Number(item.quantity),
          price: serverPrice,
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
