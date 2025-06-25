// controllers/uploadController.js
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
  }
  const imagePath = `/images/${req.file.filename}`;
  res.status(201).json({ message: '이미지 업로드 성공', imagePath });
};
