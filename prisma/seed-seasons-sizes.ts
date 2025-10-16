import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: Criando estações e tamanhos...');

  // Criar estações
  const seasons = ['Primavera', 'Verão', 'Outono', 'Inverno', 'Atemporal'];
  
  for (const seasonName of seasons) {
    await prisma.season.upsert({
      where: { name: seasonName },
      update: {},
      create: { name: seasonName },
    });
    console.log(`✅ Estação criada: ${seasonName}`);
  }

  // Criar tamanhos
  const sizes = [
    { name: 'XS', order: 1 },
    { name: 'S', order: 2 },
    { name: 'M', order: 3 },
    { name: 'L', order: 4 },
    { name: 'XL', order: 5 },
    { name: 'XXL', order: 6 },
  ];

  for (const size of sizes) {
    await prisma.size.upsert({
      where: { name: size.name },
      update: {},
      create: size,
    });
    console.log(`✅ Tamanho criado: ${size.name}`);
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
