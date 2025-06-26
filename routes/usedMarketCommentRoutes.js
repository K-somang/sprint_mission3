// src/routes/productRoutes.js (또는 src/routes/usedMarketCommentRoutes.js)

import express from 'express';
// PrismaClient 인스턴스를 가져옵니다.
import prisma from '../prisma/prisma.js';
// 유효성 검증 미들웨어 (JavaScript 파일로 존재해야 함)
import { validate, commentSchema } from '../middlewares/validation.js';
// 커스텀 에러 핸들러 (JavaScript 파일로 존재해야 함)
import { errorHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// --- 중고마켓 댓글 등록 API (POST /products/:productId/comments) ---
// 참고: 이 라우트는 productRoutes.js에 통합되는 것이 더 적합합니다.
router.post('/:productId/comments', validate(commentSchema), async (req, res, next) => {
    try {
        const { productId } = req.params; // Product ID는 UUID 형태일 것으로 가정
        const { content } = req.body;

        const comment = await prisma.productComment.create({
            data: {
                productId: productId, // Prisma는 자동으로 관계 설정
                content: content,
            },
            select: { // 필요한 필드만 선택적으로 반환
                id: true,
                productId: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.status(201).json({
            message: '중고마켓 댓글이 성공적으로 등록되었습니다!',
            comment: comment
        });
    } catch (err) {
        // 에러 처리 미들웨어로 에러 전달
        next(err);
    }
});

// --- 중고마켓 댓글 수정 API (PATCH /products/:productId/comments/:commentId) ---
router.patch('/:productId/comments/:commentId', validate(commentSchema), async (req, res, next) => {
    try {
        const { commentId } = req.params; // Comment ID는 UUID 형태일 것으로 가정
        const { content } = req.body;

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            productId: productId ,
            data: { content: content },
            select: { // 필요한 필드만 선택적으로 반환
                id: true,
                productId: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.status(200).json({
            message: '중고마켓 댓글이 성공적으로 수정되었습니다!',
            comment: updatedComment
        });
    } catch (err) {
        // PrismaClientKnownRequestError: P2025 (레코드를 찾을 수 없을 때)
        if (err.code === 'P2025') {
            return next(new errorHandler('댓글을 찾을 수 없습니다.', 404));
        }
        next(err);
    }
});

// --- 중고마켓 댓글 삭제 API (DELETE /products/:productId/comments/:commentId) ---
router.delete('/:productId/comments/:commentId', async (req, res, next) => {
    try {
        const { commentId } = req.params; // Comment ID는 UUID 형태일 것으로 가정

        await prisma.comment.delete({
            where: { id: commentId },
        });
        res.status(204).send(); // No Content (성공적으로 삭제되었지만 반환할 내용이 없을 때)
    } catch (err) {
        if (err.code === 'P2025') {
            return next(new errorHandler('댓글을 찾을 수 없습니다.', 404));
        }
        next(err);
    }
});

// --- 중고마켓 댓글 목록 조회 API (GET /products/:productId/comments) - Cursor Pagination ---
router.get('/:productId/comments', async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { cursor, limit = '10' } = req.query; // limit은 문자열로 넘어올 수 있으므로 파싱
        const parsedLimit = parseInt(limit);

        if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
            return next(new errorHandler('limit은 1에서 100 사이의 유효한 숫자여야 합니다.', 400));
        }

        // Product 존재 여부 확인 (옵션)
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!existingProduct) {
            return next(new errorHandler('상품을 찾을 수 없습니다.', 404));
        }

        const comments = await prisma.comment.findMany({
            where: { productId: productId },
            take: parsedLimit + 1, // 다음 페이지 존재 여부 확인을 위해 limit보다 1개 더 가져옴
            ...(cursor && { // cursor가 존재할 경우에만 skip과 cursor 옵션 추가
                skip: 1, // 커서 레코드 자신은 건너뛰고 다음 레코드부터 가져옴
                cursor: { createdAt: comments[0]?.createdAt },
                }),
            orderBy: {
                createdAt: 'desc', // 최신순 정렬
            },
            select: { // 필요한 필드만 선택적으로 반환
                id: true,
                content: true,
                createdAt: true,
            },
        });

        let nextCursor = null;
        let hasNextPage = false;

        if (comments.length > parsedLimit) {
            hasNextPage = true;
            comments.pop(); // 초과로 가져온 1개 제거
            nextCursor = comments.length > 0 ? comments[comments.length - 1].id : null
        }

        res.status(200).json({
            data: comments,
            pagination: {
                next_cursor: nextCursor,
                has_next_page: hasNextPage,
                limit: parsedLimit
            }
        });

    } catch (err) {
        next(err);
    }
});

export default router;