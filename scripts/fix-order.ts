import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixOrder() {
  console.log("🔧 Corrigindo pedido sem items...\n");

  const orderId = "cmgscioas0001kvro7g7jwsfc";

  // Buscar o pedido
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.log("❌ Pedido não encontrado");
    await prisma.$disconnect();
    return;
  }

  console.log(`📦 Pedido encontrado: ${order.id}`);
  console.log(`   Items atuais: ${order.items.length}`);

  if (order.items.length > 0) {
    console.log("✅ Pedido já tem items!");
    await prisma.$disconnect();
    return;
  }

  // Buscar um produto disponível
  const product = await prisma.product.findFirst({
    where: { isActive: true },
  });

  if (!product) {
    console.log("❌ Nenhum produto ativo encontrado");
    await prisma.$disconnect();
    return;
  }

  console.log(`\n🛍️ Adicionando produto de teste: ${product.name}`);

  // Adicionar item ao pedido
  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      price: product.price,
      size: null,
      color: null,
    },
  });

  console.log("✅ Item adicionado ao pedido!");

  // Verificar pedido atualizado
  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`\n📋 Pedido atualizado:`);
  console.log(`   Total de items: ${updatedOrder?.items.length}`);
  if (updatedOrder?.items[0]) {
    console.log(`   Produto: ${updatedOrder.items[0].product?.name}`);
    console.log(`   Quantidade: ${updatedOrder.items[0].quantity}`);
    console.log(`   Preço: €${updatedOrder.items[0].price}`);
  }

  await prisma.$disconnect();
}

fixOrder().catch(console.error);
