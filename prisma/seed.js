import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

/*   // 기존 데이터 삭제 (선택사항)
  await prisma.comment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.deleteMany(); */

  // 상품 데이터 생성
  const products = await prisma.product.createMany({
    data: [
      {
        name: "iPhone 13 Pro",
        description: "거의 새것 같은 아이폰 13 프로입니다. 액정 보호필름과 케이스 사용으로 스크래치 없습니다.",
        price: 850000,
        tags: ["전자제품", "스마트폰", "애플", "중고"]
      },
      {
        name: "MacBook Air M2",
        description: "2022년형 맥북 에어 M2 모델입니다. 대학생이 사용했으며 상태 양호합니다.",
        price: 1200000,
        tags: ["전자제품", "노트북", "애플", "대학생"]
      },
      {
        name: "게이밍 키보드",
        description: "기계식 키보드 청축입니다. RGB 백라이트 지원하며 게임용으로 최적화되어 있습니다.",
        price: 120000,
        tags: ["전자제품", "키보드", "게이밍", "기계식"]
      },
      {
        name: "무선 마우스",
        description: "로지텍 무선 마우스입니다. 배터리 수명 길고 정확도 높습니다.",
        price: 45000,
        tags: ["전자제품", "마우스", "로지텍", "무선"]
      },
      {
        name: "책상",
        description: "원목 책상입니다. 크기 120x60cm이며 서랍 2개 포함되어 있습니다.",
        price: 180000,
        tags: ["가구", "책상", "원목", "서랍"]
      }
    ]
  });

  // 게시글 데이터 생성
  const articles = await prisma.article.createMany({
    data: [
      {
        title: "중고 거래 팁 공유합니다",
        content: "안전한 중고 거래를 위한 몇 가지 팁을 공유드립니다. 첫째, 직거래 시 공공장소에서 만나세요. 둘째, 상품 상태를 꼼꼼히 확인하세요. 셋째, 계좌이체보다는 현금 거래를 추천합니다."
      },
      {
        title: "전자제품 구매 시 주의사항",
        content: "중고 전자제품을 구매할 때는 다음 사항들을 확인해보세요. 배터리 상태, 화면 상태, 동작 테스트, A/S 가능 여부 등을 미리 체크하시기 바랍니다."
      },
      {
        title: "학용품 나눔 이벤트",
        content: "새 학기를 맞아 사용하지 않는 학용품들을 나눔하고자 합니다. 필요하신 분들은 댓글로 연락주세요. 선착순으로 진행하겠습니다."
      },
      {
        title: "가구 배송 관련 문의",
        content: "큰 가구류의 경우 배송이 어려운 경우가 많습니다. 직접 픽업 가능한 분들과 거래하는 것이 좋을 것 같은데, 다른 분들은 어떻게 하시나요?"
      },
      {
        title: "사기 피해 신고합니다",
        content: "최근 허위 상품 등록으로 사기를 당했습니다. 모든 분들이 조심하시기 바라며, 의심스러운 거래는 피하시길 권합니다."
      }
    ]
  });

  console.log(`✅ ${products.count}개의 상품이 생성되었습니다.`);
  console.log(`✅ ${articles.count}개의 게시글이 생성되었습니다.`);

  // 생성된 상품과 게시글 ID 가져오기
  const createdProducts = await prisma.product.findMany();
  const createdArticles = await prisma.article.findMany();

  // 댓글 데이터 생성
  const comments = [];
  
  // 상품 댓글
  createdProducts.slice(0, 3).forEach((product, index) => {
    comments.push(
      {
        content: "상품 상태가 어떤가요?",
        productId: product.id
      },
      {
        content: "가격 조금 더 할인 가능한가요?",
        productId: product.id
      }
    );
  });

  // 게시글 댓글
  createdArticles.slice(0, 3).forEach((article, index) => {
    comments.push(
      {
        content: "좋은 정보 감사합니다!",
        articleId: article.id
      },
      {
        content: "저도 같은 경험이 있네요.",
        articleId: article.id
      }
    );
  });

  const commentsResult = await prisma.comment.createMany({
    data: comments
  });

  console.log(`✅ ${commentsResult.count}개의 댓글이 생성되었습니다.`);
  console.log('🎉 시드 데이터 생성 완료!');
}

main()
  .catch(e => {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
