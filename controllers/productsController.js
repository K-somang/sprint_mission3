// controllers/productsController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 상품 등록
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, tags } = req.body;
    const imageUrl = req.file ? `/images/${req.file.filename}` : null;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price, 10),
        tags,
        imageUrl,
      },
    });
    res.status(201).json({ message: '상품 등록 완료', product });
  } catch (err) {
    next(err);
  }
};

// 상품 상세 조회
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// 상품 목록 조회 (페이지네이션, 검색, 정렬)
export const getProducts = async (req, res, next) => {
  try {
    const { offset = 0, limit = 10, search = '', order = 'desc' } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};
    const products = await prisma.product.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: order },
      select: { id: true, name: true, price: true, createdAt: true },
    });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// 상품 수정
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, tags } = req.body;
    const updateData = { name, description, price: parseInt(price, 10), tags };
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.status(200).json({ message: '상품 수정 완료', product });
  } catch (err) {
    next(err);
  }
};

// 상품 삭제
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: '상품 삭제 완료' });
  } catch (err) {
    next(err);
  }
};
