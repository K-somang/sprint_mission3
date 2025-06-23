// routes/productRoutes.js
import express from 'express';
const router = express.Router(); // Express 라우터 인스턴스를 생성합니다.


/* // --- 데이터베이스 연결 풀(pool) ---
// 실제 프로젝트에서는 이 부분을 별도의 설정 파일에서 가져오는 것이 좋습니다.
// 예: const pool = require('../config/db');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'your_user',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
}); */

// 3.2 상품 등록 API
router.get('/', async (req, res) => {
    const { name, description, price, tags } = req.query;
        try {
        let sql = 'SELECT * FROM products';
        const conditions = [];
        const params = [];

        if (name) {
            params.push(`%${name}%`);
            conditions.push(`name ILIKE $${params.length}`);
        }
        if (description) {
            params.push(`%${description}%`);
            conditions.push(`description ILIKE $${params.length}`);
        }
        if (price) {
            params.push(price);
            conditions.push(`price <= $${params.length}`);
        }
        if (tags) {
            params.push(`%${tags}%`);
            conditions.push(`tags ILIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await pool.query(sql, params);
        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ error: '상품 조회 중 오류가 발생했습니다.' });
    }
});


// 3.3 상품 상세 조회 API
router.get('/:id', async (req, res) => {
    const { id } = req.params; // URL 파라미터에서 ID 추출
    try {
        const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // 첫 번째(유일한) 행을 JSON 형태로 응답
        } else {
            res.status(404).json({ message: 'Product not found' }); // 404 Not Found
        }
    } catch (err) {
        console.error(`Error fetching user with ID ${id}:`, err.message);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});


// 3.4 상품 수정 API
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock_quantity } = req.body;

    // ID 유효성 검사
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: 'Invalid product ID. ID must be a positive number.' });
    }

    // 최소 하나 이상의 필드가 제공되었는지 확인
    if (!name && !description && price === undefined && stock_quantity === undefined) {
        return res.status(400).json({ error: 'At least one field (name, description, price, stock_quantity) is required for update.' });
    }

    // 동적으로 SQL 쿼리 생성
    let queryParts = [];
    let queryValues = [];
    let paramIndex = 1;

    if (name !== undefined) { // undefined가 아닌 경우에만 포함
        queryParts.push(`name = $${paramIndex++}`);
        queryValues.push(name);
    }
    if (description !== undefined) {
        queryParts.push(`description = $${paramIndex++}`);
        queryValues.push(description);
    }
    if (price !== undefined) {
        if (isNaN(price)) {
            return res.status(400).json({ error: 'Price must be a valid number.' });
        }
        queryParts.push(`price = $${paramIndex++}`);
        queryValues.push(price);
    }
    if (stock_quantity !== undefined) {
        if (isNaN(stock_quantity) || !Number.isInteger(stock_quantity)) {
            return res.status(400).json({ error: 'Stock quantity must be a valid integer.' });
        }
        queryParts.push(`stock_quantity = $${paramIndex++}`);
        queryValues.push(stock_quantity);
    }

    // 업데이트할 필드가 없는 경우 (이미 위에서 체크했지만, 안전망)
    if (queryParts.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    // SQL 쿼리 조합
    const queryText = `UPDATE products SET ${queryParts.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description, price, stock_quantity, created_at`;
    queryValues.push(id); // 마지막 파라미터는 ID

    try {
        const result = await pool.query(queryText, queryValues);

        if (result.rows.length > 0) {
            res.json({
                message: 'Product updated successfully!',
                product: result.rows[0] // 업데이트된 상품 정보 반환
            });
        } else {
            res.status(404).json({ message: 'Product not found.' });
        }
    } catch (err) {
        console.error(`Error updating product with ID ${id}:`, err.message);
        res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
});


// 3.5 상품 삭제 API
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    // ID 유효성 검사
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: 'Invalid product ID. ID must be a positive number.' });
    }

    try {
        // SQL 쿼리를 사용하여 상품 삭제
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length > 0) {
            res.json({ message: 'Product deleted successfully!', id: id });
        } else {
            res.status(404).json({ message: 'Product not found.' });
        }
    } catch (err) {
        console.error(`Error deleting product with ID ${id}:`, err.message);
        res.status(500).json({ error: 'An error occurred while deleting the product.' });
    }
});

// 3.6 상품 목록 조회 API
router.get('/list', async (req, res) => {
    // 쿼리 파라미터 추출
    const page = parseInt(req.query.page) || 1; // 기본 페이지는 1
    const limit = parseInt(req.query.limit) || 10; // 기본 페이지당 10개
    const offset = (page - 1) * limit; // OFFSET 계산
    const sortBy = req.query.sortBy; // 정렬 기준 (예: 'recent')
    const search = req.query.search; // 검색어

    let queryText = 'SELECT id, name, price, created_at FROM products';
    let countQueryText = 'SELECT COUNT(*) FROM products'; // 전체 개수 조회를 위한 쿼리
    let queryValues = []; // SQL 쿼리 파라미터 배열
    let conditions = []; // WHERE 절 조건들
    let paramIndex = 1;

    // 1) 검색어 조건 추가
    if (search) {
        // name 또는 description에 검색어가 포함된 경우
        conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        queryValues.push(`%${search}%`); // ILIKE는 대소문자 구분 없이 검색
        paramIndex++;
    }

    // WHERE 절 조립
    if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
        countQueryText += ' WHERE ' + conditions.join(' AND ');
    }

    // 2) 정렬 조건 추가
    if (sortBy === 'recent') {
        queryText += ' ORDER BY created_at DESC'; // 최신순 (생성일 내림차순)
    } else {
        queryText += ' ORDER BY id ASC'; // 기본 정렬 (ID 오름차순)
    }

    // 3) 페이지네이션 (LIMIT, OFFSET) 추가
    queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryValues.push(limit);
    queryValues.push(offset);

    let totalCount = 0;

    try {
        // 4) 전체 상품 개수 조회 (페이지네이션 메타데이터를 위해)
        const countResult = await pool.query(countQueryText, queryValues.slice(0, queryValues.length - 2)); // LIMIT, OFFSET 제외
        totalCount = parseInt(countResult.rows[0].count);

        // 5) 실제 상품 데이터 조회
        const productsResult = await pool.query(queryText, queryValues);

        // 결과 가공
        const productsList = productsResult.rows.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            createdAt: product.created_at // PostgreSQL의 timestamp는 JS Date 객체로 변환됨
        }));

        res.json({
            data: productsList,
            pagination: {
                total_count: totalCount,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
});

module.exports = router;
