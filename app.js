// 1. 기능 호출
// Express 프레임워크 로드
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Express 서버의 핵심 객체 생성
const app = express();

app.use(express.json());
app.use(cors());

// 환경 변수 호출
import dotenv from 'dotenv';
dotenv.config();

// 에러 핸들러 임포트
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// .env 파일에서 PORT를 가져오거나 기본값 3000 사용
const port = process.env.PORT || 3000; 

// 중고마켓, 자유게시판 스키마 가져오기
import productroutes from './productroutes.js';
import articleroutes from './articleroutes.js';

// 댓글 라우터 가져오기
import usedMarketCommentRoutes from './usedMarketCommentRoutes.js';
import freeBoardCommentRoutes from './freeBoardCommentRoutes.js';

// 미들웨어 임포트
import validateProduct from './validation/productvalidation.js';
// Multer 미들웨어 임포트
import upload from './middlewares/upload.js';



// 2. 미들웨어 설정 
// JSON 형식의 요청 본문(body)을 파싱하기 위한 미들웨어
app.use(express.json()); 
// 폼 데이터 처리용
app.use(express.urlencoded({ extended: true })); 


// 3.1 기본 라우트
app.get('/', (req, res) => {
    res.send('Welcome to the User API Server (Node.js + Express)!');
});

app.use('/uploads', express.static('uploads'));


app.post('/upload', upload.single('image'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`; 
    res.status(200).json({ message: '이미지 업로드 성공!', imageUrl: imageUrl });
});


app.use('/products', productroutes);

// 3.3 자유게시판
app.use('/articles', articleroutes);


// 모든 라우트 처리 후에도 요청이 처리되지 않았다면 404 Not Found 처리
app.use(notFoundHandler);

// 최종 에러 처리 미들웨어 (항상 모든 미들웨어와 라우트 뒤에 위치해야 함)
app.use(errorHandler);

// 4. 서버 시작
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

