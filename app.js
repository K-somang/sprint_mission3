require('dotenv').config();
const productroutes = require('./productroutes'); 
const articleroutes = require('./articleroutes'); 

// 댓글 라우터 가져오기
const usedMarketCommentRoutes = require('./usedMarketCommentRoutes.js');
const freeBoardCommentRoutes = require('./freeBoardCommentRoutes.js');

const express = require('express'); // Express 프레임워크 로드
const { Pool } = require('pg');    // PostgreSQL 드라이버 로드

const app = express();
const validateProduct = require('./validation/productvalidation'); // 위에서 만든 미들웨어 임포트
const upload = require('./middlewares/upload'); // 위에서 만든 Multer 미들웨어 임포트
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler'); // 에러 핸들러 임포트


const port = process.env.PORT || 3000; // .env 파일에서 PORT를 가져오거나 기본값 3000 사용


// --- 1. 미들웨어 설정 ---
// JSON 형식의 요청 본문(body)을 파싱하기 위한 미들웨어
// app.use(express.json());
app.use(express.json()); // POST 등에서 req.body 사용 시 필요
app.use(express.urlencoded({ extended: true })); // 폼 데이터 처리용

// --- 2. PostgreSQL 데이터베이스 연결 풀 설정 ---
// 여러 클라이언트 요청을 효율적으로 처리하기 위해 연결 풀(Connection Pool)을 사용합니다.
const pool = new Pool({
    user: 'ksomang',
    host: 'localhost', // 찾아보고 수정바람
    database: 'sprint_mission3',
    password: 1810,
    port: 5432,
});

// 데이터베이스 연결 테스트 => 중요한 내용 아님
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
    console.error('Error connecting to the database:', err);
});



// 3.1 기본 라우트
app.get('/', (req, res) => {
    res.send('Welcome to the User API Server (Node.js + Express)!');
});
// Express에서 정적 파일 서비스를 위해 'uploads' 폴더를 public하게 설정
// 이렇게 해야 클라이언트가 '/uploads/이미지이름.jpg'로 이미지에 접근할 수 있습니다.
app.use('/uploads', express.static('uploads'));

// 이미지 업로드 API 엔드포인트
// 'image'는 클라이언트에서 파일을 전송할 때 사용하는 필드(폼 데이터의 name 속성) 이름입니다.
app.post('/upload', upload.single('image'), (req, res, next) => {
    if (!req.file) {
        // 파일이 없는 경우 (파일 필터링에 걸렸거나, 아예 파일이 첨부되지 않은 경우)
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    // 업로드된 이미지 정보는 req.file 객체에 담깁니다.
    const imageUrl = `/uploads/${req.file.filename}`; // 클라이언트에서 접근할 수 있는 URL 경로
    res.status(200).json({ message: '이미지 업로드 성공!', imageUrl: imageUrl });
});

// 에러 처리 미들웨어는 별도로 구현해야 합니다 (아래 '에러 처리' 섹션 참조)
// Multer 에러는 `next(err)`로 전달되므로 에러 핸들러에서 처리됩니다.


// 3.2 중고마켓
app.post('/products', validateProduct, (req, res) => {
    // 유효성 검증을 통과한 경우에만 이 블록이 실행됩니다.
    const { name, description, price } = req.body;
    // 데이터베이스 저장 로직 등...
    res.status(201).json({ message: '상품이 성공적으로 등록되었습니다.', product: { name, description, price } });
});
app.use('/products', productroutes);


// 3.3 자유게시판
app.use('./articles', articleroutes);


// 모든 라우트 처리 후에도 요청이 처리되지 않았다면 404 Not Found 처리
app.use(notFoundHandler);

// 최종 에러 처리 미들웨어 (항상 모든 미들웨어와 라우트 뒤에 위치해야 함)
app.use(errorHandler);

// 4. 서버 시작
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

