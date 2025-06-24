// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 샘플 데이터 생성
  await prisma.product.createMany({
    data: [
      {
        name: "샘플 상품",
        description: "샘플 상품 설명",
        price: 10000,
        tags: ["전자제품", "중고"]
      }
    ]
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
