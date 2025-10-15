import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrders() {
  console.log('🔍 Verificando pedidos no banco de dados...\n');

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log(`📦 Total de pedidos encontrados: ${orders.length}\n`);

  for (const order of orders) {
    console.log(`\n📋 Pedido ID: ${order.id}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Cliente: ${order.customerFirstName} ${order.customerLastName}`);
    console.log(`   Total: €${order.total}`);
    console.log(`   Criado em: ${order.createdAt}`);
    console.log(`   Número de items: ${order.items.length}`);
    
    if (order.items.length > 0) {
      console.log(`   📦 Items:`);
      for (const item of order.items) {
        console.log(`      - ${item.product?.name || 'Produto não encontrado'}`);
        console.log(`        Quantidade: ${item.quantity}`);
        console.log(`        Preço: €${item.price}`);
        if (item.size) console.log(`        Tamanho: ${item.size}`);
        if (item.color) console.log(`        Cor: ${item.color}`);
      }
    } else {
      console.log(`   ⚠️  NENHUM ITEM ENCONTRADO NESTE PEDIDO!`);
    }
    console.log(`   ${'='.repeat(60)}`);
  }

  await prisma.$disconnect();
}

checkOrders().catch(console.error);
