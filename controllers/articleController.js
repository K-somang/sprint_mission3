// controllers/articlesController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 게시글 등록
export const createArticle = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const article = await prisma.article.create({
      data: { title, content },
    });
    res.status(201).json({ message: '게시글 등록 완료', article });
  } catch (err) {
    next(err);
  }
};

// 게시글 상세 조회
export const getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id: Number(id) } });
    if (!article) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

// 게시글 목록 조회 (페이지네이션, 검색, 정렬)
export const getArticles = async (req, res, next) => {
  try {
    const { offset = 0, limit = 10, search = '', order = 'desc' } = req.query;
    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        }
      : {};
    const articles = await prisma.article.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: order },
      select: { id: true, title: true, content: true, createdAt: true },
    });
    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
};

// 게시글 수정
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const article = await prisma.article.update({
      where: { id: Number(id) },
      data: { title, content },
    });
    res.status(200).json({ message: '게시글 수정 완료', article });
  } catch (err) {
    next(err);
  }
};

// 게시글 삭제
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: '게시글 삭제 완료' });
  } catch (err) {
    next(err);
  }
};
