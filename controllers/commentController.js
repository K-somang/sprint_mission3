// controllers/commentsController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 중고마켓 댓글 등록
export const createProductComment = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: { content, productId: Number(productId) },
    });
    res.status(201).json({ message: '댓글 등록 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 자유게시판 댓글 등록
export const createArticleComment = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: { content, articleId: Number(articleId) },
    });
    res.status(201).json({ message: '댓글 등록 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 댓글 수정
export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { content },
    });
    res.status(200).json({ message: '댓글 수정 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 댓글 삭제
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: '댓글 삭제 완료' });
  } catch (err) {
    next(err);
  }
};

// 중고마켓 댓글 목록 조회 (커서 기반 페이지네이션)
export const getProductComments = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { cursor = 0, limit = 10 } = req.query;
    const comments = await prisma.comment.findMany({
      where: { productId: Number(productId) },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: { id: true, content: true, createdAt: true },
    });
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

// 자유게시판 댓글 목록 조회 (커서 기반 페이지네이션)
export const getArticleComments = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { cursor = 0, limit = 10 } = req.query;
    const comments = await prisma.comment.findMany({
      where: { articleId: Number(articleId) },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: { id: true, content: true, createdAt: true },
    });
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
