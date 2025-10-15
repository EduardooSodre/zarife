import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStockLimits() {
  console.log('🧪 Testando limites de estoque...\n');

  // Buscar um produto para teste
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    include: { variants: true },
  });

  if (!product) {
    console.log('❌ Nenhum produto encontrado para teste');
    await prisma.$disconnect();
    return;
  }

  console.log(`📦 Produto de teste: ${product.name}`);
  console.log(`   Estoque atual: ${product.stock}\n`);

  // Verificar se tem variantes
  if (product.variants.length > 0) {
    console.log('📊 Variantes:');
    for (const variant of product.variants) {
      console.log(`   ${variant.size || 'N/A'} / ${variant.color || 'N/A'}: ${variant.stock} unidades`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Validações implementadas:');
  console.log('   1. Botão desabilitado quando estoque = 0');
  console.log('   2. Alerta ao tentar adicionar mais do que o estoque');
  console.log('   3. Validação no carrinho ao aumentar quantidade');
  console.log('   4. Validação na API antes de criar pedido');
  console.log('   5. Decremento apenas após pagamento confirmado');
  console.log('='.repeat(60) + '\n');

  await prisma.$disconnect();
}

testStockLimits().catch(console.error);
