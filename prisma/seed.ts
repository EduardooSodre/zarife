import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'feminino' },
      update: {},
      create: {
        name: 'Feminino',
        slug: 'feminino',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'masculino' },
      update: {},
      create: {
        name: 'Masculino',
        slug: 'masculino',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'acessorios' },
      update: {},
      create: {
        name: 'Acessórios',
        slug: 'acessorios',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create sample products
  const products = [
    {
      name: 'Vestido Elegante Preto',
      description: 'Vestido midi elegante em tecido premium, perfeito para ocasiões especiais.',
      price: 299.90,
      oldPrice: 399.90,
      stock: 20,
      categoryId: categories[0].id, // Feminino
      isFeatured: true,
      isActive: true,
      images: [
        { url: '/api/placeholder/400/600', order: 0 },
        { url: '/api/placeholder/400/600', order: 1 },
      ],
      variants: [
        { size: 'P', color: 'Preto', stock: 5 },
        { size: 'M', color: 'Preto', stock: 8 },
        { size: 'G', color: 'Preto', stock: 7 },
      ],
    },
    {
      name: 'Camisa Social Masculina',
      description: 'Camisa social de alta qualidade em algodão premium.',
      price: 189.90,
      oldPrice: 249.90,
      stock: 30,
      categoryId: categories[1].id, // Masculino
      isFeatured: true,
      isActive: true,
      images: [
        { url: '/api/placeholder/400/600', order: 0 },
        { url: '/api/placeholder/400/600', order: 1 },
      ],
      variants: [
        { size: 'M', color: 'Branco', stock: 10 },
        { size: 'G', color: 'Branco', stock: 12 },
        { size: 'GG', color: 'Branco', stock: 8 },
      ],
    },
    {
      name: 'Bolsa de Couro Premium',
      description: 'Bolsa de couro legítimo com acabamento sofisticado.',
      price: 450.00,
      stock: 15,
      categoryId: categories[2].id, // Acessórios
      isFeatured: true,
      isActive: true,
      images: [
        { url: '/api/placeholder/400/600', order: 0 },
        { url: '/api/placeholder/400/600', order: 1 },
      ],
      variants: [
        { color: 'Marrom', stock: 7 },
        { color: 'Preto', stock: 8 },
      ],
    },
    {
      name: 'Tênis Casual Unissex',
      description: 'Tênis confortável e moderno para uso diário.',
      price: 329.90,
      oldPrice: 429.90,
      stock: 25,
      categoryId: categories[2].id, // Acessórios
      isFeatured: true,
      isActive: true,
      images: [
        { url: '/api/placeholder/400/600', order: 0 },
        { url: '/api/placeholder/400/600', order: 1 },
      ],
      variants: [
        { size: '37', color: 'Branco', stock: 3 },
        { size: '38', color: 'Branco', stock: 4 },
        { size: '39', color: 'Branco', stock: 5 },
        { size: '40', color: 'Branco', stock: 4 },
        { size: '41', color: 'Branco', stock: 4 },
        { size: '42', color: 'Branco', stock: 3 },
        { size: '43', color: 'Branco', stock: 2 },
      ],
    },
    {
      name: 'Blusa Feminina Básica',
      description: 'Blusa básica em algodão, confortável e versátil.',
      price: 89.90,
      stock: 40,
      categoryId: categories[0].id, // Feminino
      isFeatured: false,
      isActive: true,
      images: [
        { url: '/api/placeholder/400/600', order: 0 },
      ],
      variants: [
        { size: 'P', color: 'Rosa', stock: 8 },
        { size: 'M', color: 'Rosa', stock: 12 },
        { size: 'G', color: 'Rosa', stock: 10 },
        { size: 'P', color: 'Azul', stock: 5 },
        { size: 'M', color: 'Azul', stock: 5 },
      ],
    },
    {
      name: 'Calça Jeans Masculina',
      description: 'Calça jeans com corte moderno e confortável.',
      price: 199.90,
      stock: 35,
      categoryId: categories[1].id, // Masculino
      isFeatured: false,
      isActive: true,
      images: [
        { url: '/api/placeholder/400/600', order: 0 },
      ],
      variants: [
        { size: '40', color: 'Azul', stock: 8 },
        { size: '42', color: 'Azul', stock: 10 },
        { size: '44', color: 'Azul', stock: 9 },
        { size: '46', color: 'Azul', stock: 8 },
      ],
    },
  ];

  for (const productData of products) {
    const { images, variants, ...product } = productData;
    
    await prisma.product.create({
      data: {
        ...product,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
    });
  }

  console.log('✅ Products created');

  // Create sample coupons
  await Promise.all([
    prisma.coupon.upsert({
      where: { code: 'PRIMEIRA10' },
      update: {},
      create: {
        code: 'PRIMEIRA10',
        discountType: 'PERCENT',
        value: 10,
        isActive: true,
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'FRETE50' },
      update: {},
      create: {
        code: 'FRETE50',
        discountType: 'FIXED',
        value: 50,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Coupons created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
