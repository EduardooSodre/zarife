import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStock() {
  console.log("📊 Verificando estoque de produtos...\n");

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: true,
      orderItems: {
        include: {
          order: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  for (const product of products) {
    console.log(`\n📦 ${product.name}`);
    console.log(`   Estoque principal: ${product.stock}`);

    if (product.variants.length > 0) {
      console.log(`   Variantes:`);
      for (const variant of product.variants) {
        console.log(
          `      ${variant.size || "N/A"} / ${variant.color || "N/A"}: ${
            variant.stock
          } unidades`
        );
      }
    }

    const totalOrdered = product.orderItems
      .filter((item) =>
        ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
          item.order.status
        )
      )
      .reduce((sum, item) => sum + item.quantity, 0);

    console.log(`   Total vendido (pedidos pagos): ${totalOrdered}`);
  }

  console.log("\n" + "=".repeat(60));

  await prisma.$disconnect();
}

checkStock().catch(console.error);
