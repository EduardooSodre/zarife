// Script para verificar o schema da tabela categories
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategorySchema() {
  try {
    // Tentar uma consulta completa para ver quais campos existem
    const category = await prisma.category.findFirst({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('Primeira categoria encontrada:', category);
    
    // Verificar o schema da tabela
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Colunas da tabela categories:', tableInfo);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategorySchema();
