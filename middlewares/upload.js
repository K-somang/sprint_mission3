const multer = require('multer');
const path = require('path'); // 파일 경로 처리를 위해

// 저장될 디스크 스토리지 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 이미지가 저장될 폴더 경로를 지정 (예: 프로젝트 루트/uploads)
        // uploads 폴더가 없으면 미리 만들어 두거나, fs 모듈로 생성하는 로직 추가
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // 파일 이름 설정: 고유한 이름 + 원본 확장자
        const ext = path.extname(file.originalname); // .jpg, .png 등 확장자
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
    }
});

// Multer 인스턴스 생성
// single('image'): 'image'라는 필드 이름으로 하나의 파일만 업로드 받겠다는 의미
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한 (예: 5MB)
    fileFilter: (req, file, cb) => {
        // 파일 타입 필터링 (이미지 파일만 허용)
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true); // 허용
        } else {
            cb(new Error('이미지 파일(jpeg, png, gif)만 업로드할 수 있습니다.'), false); // 거부
        }
    }
});

module.exports = upload;