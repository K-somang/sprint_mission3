스프린트 미션3 과제 수행 진척도

###### 중고마켓
• Product 스키마를 작성해 주세요.👌

• 상품 등록 API를 만들어 주세요.👌
  ☞ POST - http://localhost:3000/products
  ☞ BODY의 raw에서 아래의 내용을 입력하면 등록이 됩니다.
    {
      "name": "iPhone 15 Pro",
      "description": "거의 새것 같은 아이폰 13 프로입니다. 액정 보호필름과 케이스 사용으로 스크래치 없습니다.",
      "price": 950000,
      "tags": [
          "전자제품",
          "스마트폰",
          "애플",
          "중고"
      ],
      "userId": 1
    }  

• 상품 상세 조회 API를 만들어 주세요.👌
  ☞ GET - http://localhost:3000/products/1

• 상품 수정 API를 만들어 주세요.👌
  ☞ PATCH - http://localhost:3000/products/1
  ☞ BODY의 raw에서 아래의 내용을 입력하면 수정이 됩니다.
    {
      "name": "iPhone 15 Pro",
      "price": 950000,
    }

• 상품 삭제 API를 만들어 주세요.👌
  ☞ DELETE - http://localhost:3000/products/5

• 상품 목록 조회 API를 만들어 주세요.👌
  ☞ GET - http://localhost:3000/products

• 각 API에 적절한 에러 처리를 해 주세요.👌
  ☞ 400 401 500번 에러 사용
• 각 API 응답에 적절한 상태 코드를 리턴하도록 해 주세요.👌
  ☞ 


###### 자유게시판
• Article 스키마를 작성해 주세요.👌

• 게시글 등록 API를 만들어 주세요.👌
  ☞ POST - http://localhost:3000/articles
  ☞ BODY의 raw에서 아래의 내용을 입력하면 등록이 됩니다.
  {    
    "title": "중고 거래 팁을 공유합니다",
    "content": "중고 거래를 위한 몇 가지 팁을 알려드립니다. 첫째, 직거래 시 공공장소에서 만나세요.…"
    "userId": 1
    
  }

• 게시글 상세 조회 API를 만들어 주세요.👌
  ☞ GET - http://localhost:3000/articles/1

• 게시글 수정 API를 만들어 주세요.👌
  ☞ PATCH - http://localhost:3000/articles/1
  ☞ BODY의 raw에서 아래의 내용을 입력하면 수정이 됩니다.
  {    
    "title": "중고 거래 팁을 공유합니다",
    "content": "중고 거래를 위한 몇 가지 팁을 알려드립니다. 첫째, 직거래 시 공공장소에서 만나세요.…"
  }

• 게시글 삭제 API를 만들어 주세요.👌
  ☞ DELETE - http://localhost:3000/articles/5

• 게시글 목록 조회 API를 만들어 주세요.👌
  ☞ GET - http://localhost:3000/articles


###### 댓글 ❌ - 코드는 작성했지만 호출이 안되어 오류를 파악하려다 실패하였습니다.
• 댓글 등록 API를 만들어 주세요.❌
• 댓글 수정 API를 만들어 주세요.❌
• 댓글 삭제 API를 만들어 주세요.❌
• 댓글 목록 조회 API를 만들어 주세요.❌


###### 유효성 검증
• 상품 등록 시 필요한 필드(이름, 설명, 가격 등)의 유효성을 검증하는 미들웨어를 구현합니다.👌
• 게시물 등록 시 필요한 필드(제목, 내용 등)의 유효성 검증하는 미들웨어를 구현합니다.👌


###### 이미지 업로드
• multer 미들웨어를 사용하여 이미지 업로드 API를 구현해주세요.👌
  ☞ POST - http://localhost:3000/upload
  ☞ BODY의 form-data에서
    key 값은 image로 text와 file 중 file을 선택하고
    Value에 이미지파일을 넣으면 이미지가 등록됩니다.


###### 에러 처리
• 모든 예외 상황을 처리할 수 있는 에러 핸들러 미들웨어를 구현합니다.👌
• 서버 오류(500), 사용자 입력 오류(400 시리즈), 리소스 찾을 수 없음(404) 등 
  상황에 맞는 상태값을 반환합니다.👌


###### 라우트 중복 제거
• 중복되는 라우트 경로(예: /users에 대한 get 및 post 요청)를 
  app.route()로 통합해 중복을 제거합니다.👌
• express.Router()를 활용하여 중고마켓/자유게시판 관련 라우트를 별도의 모듈로 구분합니다.👌


###### 배포
• .env 파일에 환경 변수를 설정해 주세요.👌
• CORS를 설정해 주세요.👌
• render.com으로 배포해 주세요.👌

###### 멘토에게
댓글 조회 API를 Postman으로 테스트하는 과정에서 500 오류가 발생해 아래와 같이 원인을 추적했습니다. 
시간이 부족해 완전한 해결까지는 도달하지 못했는데, 혹시 제가 놓친 부분이나 더 나은 처리 방법이 있다면 조언 부탁드립니다.

### productId 누락
‑ 쿼리스트링에 productId가 없거나 숫자로 변환되지 않을 때
‑ Prisma 호출: where: { id: undefined } → Argument id is missing 예외 발생

### cursor 처리 미흡
‑ 아직 정의되지 않은 변수나 잘못된 형식(DateTime 대신 문자열 등)을 cursor 옵션에 넘겨 추가 예외 가능성 존재
