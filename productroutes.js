import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// 상품 등록
router.post('/', async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    const product = await prisma.product.create({
      data: { name, description, price, tags },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 상품 목록 조회
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort } = req.query;
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy = sort === 'recent' ? { createdAt: 'desc' } : {};
    const products = await prisma.product.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

export default router;
