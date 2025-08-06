import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Criando categorias hierárquicas...');

  try {
    // 1. Criar categoria principal: Roupas
    console.log('📁 Criando categoria: Roupas');
    const roupas = await prisma.category.upsert({
      where: { slug: "roupas" },
      update: { name: "Roupas" },
      create: {
        name: "Roupas",
        slug: "roupas",
        description: "Explore nossa coleção completa de roupas para todos os momentos.",
      },
    });

    // Subcategorias de Roupas
    const partesDecima = await prisma.category.upsert({
      where: { slug: "partes-de-cima" },
      update: { name: "Partes de Cima" },
      create: {
        name: "Partes de Cima",
        slug: "partes-de-cima",
        description: "Blusas, camisas, tops e regatas para completar seu look.",
        parentId: roupas.id,
      },
    });

    const partesDebaixo = await prisma.category.upsert({
      where: { slug: "partes-de-baixo" },
      update: { name: "Partes de Baixo" },
      create: {
        name: "Partes de Baixo",
        slug: "partes-de-baixo",
        description: "Shorts, saias e calças para todos os estilos.",
        parentId: roupas.id,
      },
    });

    // Sub-subcategorias de Partes de Cima
    const partesDecimaItems = [
      { name: "Blusa", slug: "blusa" },
      { name: "Camisa", slug: "camisa" },
      { name: "Top", slug: "top" },
      { name: "Camiseta", slug: "camiseta" },
      { name: "Regata", slug: "regata" },
    ];

    for (const item of partesDecimaItems) {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: partesDecima.id,
        },
      });
    }

    // Sub-subcategorias de Partes de Baixo
    const partesDebaixoItems = [
      { name: "Short", slug: "short" },
      { name: "Saia", slug: "saia" },
      { name: "Calça", slug: "calca" },
      { name: "Bermuda", slug: "bermuda" },
    ];

    for (const item of partesDebaixoItems) {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: partesDebaixo.id,
        },
      });
    }

    // 2. Criar categoria: Vestidos
    console.log('📁 Criando categoria: Vestidos');
    const vestidos = await prisma.category.upsert({
      where: { slug: "vestidos" },
      update: { name: "Vestidos" },
      create: {
        name: "Vestidos",
        slug: "vestidos",
        description: "Encontre o vestido perfeito para qualquer ocasião especial.",
      },
    });

    const vestidosItems = [
      { name: "Vestido Casual", slug: "vestido-casual" },
      { name: "Vestido Social", slug: "vestido-social" },
      { name: "Vestido de Festa", slug: "vestido-de-festa" },
      { name: "Vestido Longo", slug: "vestido-longo" },
      { name: "Vestido Curto", slug: "vestido-curto" },
    ];

    for (const item of vestidosItems) {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: vestidos.id,
        },
      });
    }

    // 3. Criar categoria: Conjuntos
    console.log('📁 Criando categoria: Conjuntos');
    const conjuntos = await prisma.category.upsert({
      where: { slug: "conjuntos" },
      update: { name: "Conjuntos" },
      create: {
        name: "Conjuntos",
        slug: "conjuntos",
        description: "Descubra nossa coleção de conjuntos elegantes e coordenados.",
      },
    });

    const conjuntosItems = [
      { name: "Conjunto Casual", slug: "conjunto-casual" },
      { name: "Conjunto Social", slug: "conjunto-social" },
      { name: "Conjunto de Praia", slug: "conjunto-de-praia" },
      { name: "Conjunto Esportivo", slug: "conjunto-esportivo" },
    ];

    for (const item of conjuntosItems) {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: conjuntos.id,
        },
      });
    }

    // 4. Criar categoria: Moda Praia
    console.log('📁 Criando categoria: Moda Praia');
    const modaPraia = await prisma.category.upsert({
      where: { slug: "moda-praia" },
      update: { name: "Moda Praia" },
      create: {
        name: "Moda Praia",
        slug: "moda-praia",
        description: "Descubra nossa coleção de moda praia com biquínis, maiôs e saídas.",
      },
    });

    const modaPraiaItems = [
      { name: "Biquíni", slug: "biquini" },
      { name: "Maiô", slug: "maio" },
      { name: "Saída de Praia", slug: "saida-de-praia" },
      { name: "Canga", slug: "canga" },
    ];

    for (const item of modaPraiaItems) {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: modaPraia.id,
        },
      });
    }

    // 5. Criar categoria: Look Completo
    console.log('📁 Criando categoria: Look Completo');
    const lookCompleto = await prisma.category.upsert({
      where: { slug: "look-completo" },
      update: { name: "Look Completo" },
      create: {
        name: "Look Completo",
        slug: "look-completo",
        description: "Encontre looks completos e coordenados para qualquer ocasião.",
      },
    });

    const lookCompletoItems = [
      { name: "Look Casual", slug: "look-casual" },
      { name: "Look Social", slug: "look-social" },
      { name: "Look Festa", slug: "look-festa" },
      { name: "Look Praia", slug: "look-praia" },
    ];

    for (const item of lookCompletoItems) {
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: lookCompleto.id,
        },
      });
    }

    console.log('✅ Categorias criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar categorias:', error);
    throw error;
  }
}

seedCategories()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
