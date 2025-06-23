const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // 개발 단계에서 오류 스택을 콘솔에 출력

    // 특정 오류 타입에 따른 상태 코드 및 메시지 설정
    if (err.status) { // 사용자 정의 오류 (예: 400, 404)
        return res.status(err.status).json({
            message: err.message,
            statusCode: err.status
        });
    }

    // Multer 오류 처리 (파일 업로드 관련)
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '파일 크기가 너무 큽니다.', statusCode: 400 });
        }
        // 다른 Multer 에러 코드 처리 가능
    }

    // 기타 예상치 못한 서버 오류
    res.status(500).json({
        message: '서버 내부 오류가 발생했습니다.',
        statusCode: 500
    });
};

// 404 Not Found 핸들러 (모든 라우트를 처리한 후에도 요청이 처리되지 않았을 때)
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: `경로를 찾을 수 없습니다: ${req.originalUrl}`,
        statusCode: 404
    });
};

module.exports = { errorHandler, notFoundHandler };