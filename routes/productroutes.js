import express from 'express';
import { PrismaClient } from '@prisma/client';
import * as productsController from '../controllers/productsController.js';
const prisma = new PrismaClient();
const router = express.Router();

router.post('/', productsController.createProduct);

// 상품 등록
router.post('/', async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    if( !name || !description ) {
      return res.status(400).json ({
        error: '이름과 설명은 필수 입력 사항입니다.'
      });
    }
    if(price === undefined || price === null || price < 0) {
      return res.status(400).json({ error : '상품 가격은 0 이상이어야 합니다.' });
    }
    if (typeof price !== 'number') {
      return res.status(400).json({
        error: '가격은 숫자이어야 합니다.'
      });
    }
    const product = await prisma.product.create({
      data: { name, description, price, tags },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('상품 등록 오류:', error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
});

// 상품 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
    res.json(product);
  } catch (error) {
    console.error('상품 상세 조회 오류:', error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
});

// 상품 수정
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('상품 수정 오류:', error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
});

// 상품 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
});

// 상품 목록 조회
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (pageNumber - 1) * limitNumber;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy = sort === 'recent' ? { createdAt: 'desc' } : undefined;
    const products = await prisma.article.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true
      },
      where,
      skip,
      take: limitNumber,
      orderBy,
    });
    res.json(products);
  } catch (error) {
    console.error('목록 조회 오류:', error);
    res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
