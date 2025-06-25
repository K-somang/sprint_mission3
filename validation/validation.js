// src/middlewares/validation.js

import { body, validationResult } from 'express-validator';
// ✅ CustomError 클래스 경로 수정: '../utils/errorHandler.js'
import { CustomError } from '../middlewares/errorHandler.js';

// 상품 유효성 검증 규칙
export const productSchema = [ // 'productSchema'는 이제 검증 체인 배열입니다.
    // 'name' 필드
    body('name')
        .trim() // 앞뒤 공백 제거
        .notEmpty().withMessage('상품 이름은 필수입니다.')
        .isLength({ min: 2, max: 100 }).withMessage('상품 이름은 2자에서 100자 사이여야 합니다.'),

    // 'description' 필드
    body('description')
        .trim()
        .optional({ checkFalsy: true }) // 비어있어도 되고, 있으면 검증
        .isLength({ min: 10, max: 1000 }).withMessage('상품 설명은 10자에서 1000자 사이여야 합니다.'),

    // 'price' 필드
    body('price')
        .notEmpty().withMessage('가격은 필수입니다.')
        .isNumeric().withMessage('가격은 숫자여야 합니다.')
        .custom(value => parseFloat(value) > 0).withMessage('가격은 0보다 커야 합니다.'),

    // 'tags' 필드 (선택적 배열 검증)
    body('tags')
        .optional()
        .isArray().withMessage('태그는 배열 형식이어야 합니다.')
        .custom((value) => { // 배열 내 각 항목이 문자열인지 검증
            if (!Array.isArray(value)) return false; // 이미 isArray로 걸러지지만, 안전을 위해
            for (const tag of value) {
                if (typeof tag !== 'string' || tag.trim() === '') {
                    throw new Error('태그는 비어있지 않은 문자열이어야 합니다.');
                }
            }
            return true;
        })
        .withMessage('각 태그는 비어있지 않은 문자열이어야 합니다.')
];

// 게시글 유효성 검증 규칙
export const articleSchema = [ // 'articleSchema'는 이제 검증 체인 배열입니다.
    // 'title' 필드
    body('title')
        .trim()
        .notEmpty().withMessage('게시글 제목은 필수입니다.')
        .isLength({ min: 5, max: 200 }).withMessage('게시글 제목은 5자에서 200자 사이여야 합니다.'),

    // 'content' 필드
    body('content')
        .trim()
        .notEmpty().withMessage('게시글 내용은 필수입니다.')
        .isLength({ min: 10, max: 5000 }).withMessage('게시글 내용은 10자에서 5000자 사이여야 합니다.')
];

// 댓글 유효성 검증 규칙
export const commentSchema = [ // 'commentSchema'는 이제 검증 체인 배열입니다.
    // 'content' 필드
    body('content')
        .trim()
        .notEmpty().withMessage('댓글 내용은 필수입니다.')
        .isLength({ min: 2, max: 500 }).withMessage('댓글 내용은 2자에서 500자 사이여야 합니다.')
];

// 유효성 검증 미들웨어 팩토리
// 이제 이 'validate' 함수는 express-validator 검증 체인 배열을 인자로 받습니다.
export const validate = (validations) => {
    return async (req, res, next) => {
        // 모든 검증 체인을 순회하며 실행
        for (const validation of validations) {
            const result = await validation.run(req);
            // 에러가 있다면 바로 다음 검증 체인 실행 중단
            // (isEmpty()가 false면 에러가 있다는 의미)
            if (!result.isEmpty()) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next(); // 유효성 검증 성공 시 다음 미들웨어로
        }

        // 유효성 검증 실패 시 CustomError 발생
        const extractedErrors = errors.array().map(err => err.msg);
        return next(new CustomError(`유효성 검증 실패: ${extractedErrors.join(', ')}`, 400));
    };
};

export default validate;