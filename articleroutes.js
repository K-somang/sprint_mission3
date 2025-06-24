import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// 게시글 등록
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    const article = await prisma.article.create({
      data: { title, content },
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 목록 조회
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort } = req.query;
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy = sort === 'recent' ? { createdAt: 'desc' } : {};
    const articles = await prisma.article.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy,
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id: Number(id) },
    });
    if (!article) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 수정
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedArticle = await prisma.article.update({
      where: { id: Number(id) },
      data,
    });
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
