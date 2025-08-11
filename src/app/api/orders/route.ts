import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

interface OrderItem {
  productId: string
  quantity: number
  price: number
  variant: {
    size?: string
    color?: string
  }
}

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface ShippingData {
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  complement?: string
}

interface PaymentData {
  method: string
}

interface AmountsData {
  subtotal: number
  shipping: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar usuário pelo clerkId
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado no banco. Faça login novamente.' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Dados recebidos:', JSON.stringify(body, null, 2))
    
    const { items, customer, shipping, payment, amounts, notes }: {
      items: OrderItem[]
      customer: CustomerData
      shipping: ShippingData
      payment: PaymentData
      amounts: AmountsData
      notes?: string
    } = body

    // Validar dados obrigatórios
    if (!items || !customer || !shipping || !payment || !amounts) {
      console.log('Erro: Dados obrigatórios faltando', { items: !!items, customer: !!customer, shipping: !!shipping, payment: !!payment, amounts: !!amounts })
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // Verificar se todos os produtos existem e têm estoque suficiente
    const productIds = items.map((item: OrderItem) => item.productId)
    console.log('Product IDs:', productIds)
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      include: {
        variants: true
      }
    })
    console.log('Products found:', products.length, 'Expected:', productIds.length)

    if (products.length !== productIds.length) {
      console.log('Erro: Alguns produtos não foram encontrados')
      return NextResponse.json({ error: 'Alguns produtos não foram encontrados' }, { status: 400 })
    }

    // Verificar estoque
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        console.log('Erro: Produto não encontrado:', item.productId)
        return NextResponse.json({ error: `Produto ${item.productId} não encontrado` }, { status: 400 })
      }

      // Só exigir variante se o produto realmente tiver variantes cadastradas
      if (product.variants && product.variants.length > 0 && (item.variant.size || item.variant.color)) {
        const variant = product.variants.find(v => 
          v.size === item.variant.size && v.color === item.variant.color
        )
        if (!variant) {
          console.log('Erro: Variante não encontrada:', item.variant)
          return NextResponse.json({ 
            error: `Variante não encontrada para o produto ${product.name}` 
          }, { status: 400 })
        }
        if (variant.stock < item.quantity) {
          console.log('Erro: Estoque insuficiente variante:', variant.stock, 'requested:', item.quantity)
          return NextResponse.json({ 
            error: `Estoque insuficiente para ${product.name}` 
          }, { status: 400 })
        }
      } else {
        // Produto sem variantes cadastradas: validar estoque do produto principal
        if (product.stock < item.quantity) {
          console.log('Erro: Estoque insuficiente produto:', product.stock, 'requested:', item.quantity)
          return NextResponse.json({ 
            error: `Estoque insuficiente para ${product.name}` 
          }, { status: 400 })
        }
      }
    }

    console.log('Validações passou, criando pedido...')

    // Criar o pedido
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
        notes: notes || '',
      }
    });

    // Retornar o id do pedido para o frontend
    return NextResponse.json({ id: order.id }, { status: 200 });

    // Criar os items do pedido
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          size: item.variant.size,
          color: item.variant.color
        }
      })
    }

    // Atualizar estoque dos produtos
    for (const item of items) {
      if (item.variant.size || item.variant.color) {
        // Atualizar estoque da variante
        await prisma.productVariant.updateMany({
          where: {
            productId: item.productId,
            size: item.variant.size,
            color: item.variant.color
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      } else {
        // Atualizar estoque do produto principal
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: {
        id: order.id,
        status: order.status,
        total: order.total
      }
    })

  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
