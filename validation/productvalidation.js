import { body, validationResult } from 'express-validator';

const validateProduct = [
    // 'name' 필드가 비어있지 않고, 최소 2글자 이상인지 검증
    body('name')
        .trim() // 앞뒤 공백 제거
        .notEmpty().withMessage('상품 이름은 필수입니다.')
        .isLength({ min: 2 }).withMessage('상품 이름은 최소 2글자 이상이어야 합니다.'),

    // 'description' 필드가 비어있지 않고, 최소 10글자 이상인지 검증
    body('description')
        .trim()
        .notEmpty().withMessage('상품 설명은 필수입니다.')
        .isLength({ min: 10 }).withMessage('상품 설명은 최소 10글자 이상이어야 합니다.'),

    // 'price' 필드가 숫자인지, 비어있지 않고, 0보다 큰지 검증
    body('price')
        .notEmpty().withMessage('가격은 필수입니다.')
        .isNumeric().withMessage('가격은 숫자여야 합니다.')
        .custom(value => value > 0).withMessage('가격은 0보다 커야 합니다.'),

    // 실제 유효성 검증 결과 처리
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // 유효성 검증 실패 시 400 Bad Request와 함께 오류 메시지 반환
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // 유효성 검증 성공 시 다음 미들웨어로 넘어감
    }
];

export default validateProduct;