import multer from 'multer';

// ✅ CustomError 클래스를 이름을 가진 내보내기(named export)로 선언
export class CustomError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// ✅ errorHandler 함수도 이름을 가진 내보내기(named export)로 선언
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '파일 크기가 너무 큽니다. (최대 5MB)', statusCode: 400 });
    }
    return res.status(400).json({ message: `파일 업로드 오류: ${err.message}`, statusCode: 400 });
  }

  // ✅ CustomError 클래스 사용
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message, statusCode: err.statusCode });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.', statusCode: 404 });
    }
    return res.status(500).json({ message: '데이터베이스 작업 중 오류가 발생했습니다.', statusCode: 500 });
  }

  res.status(500).json({
    message: '서버 내부 오류가 발생했습니다.',
    statusCode: 500
  });
};

// ✅ notFoundHandler 함수도 이름을 가진 내보내기(named export)로 선언
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: `요청하신 경로를 찾을 수 없습니다: ${req.originalUrl}`,
    statusCode: 404
  });
};

