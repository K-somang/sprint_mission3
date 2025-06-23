// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
// 데이터베이스 연결 풀을 가져옵니다.
import pool from './config/db';

// --- 게시글 등록 API (POST /articles) ---
router.post('/', async (req, res) => {
    const { title, content } = req.body;
    try {
        if (!title || !content) {
            return res.status(400).json({ error: '제목과 내용은 필수 입력 항목입니다.' });
        }

        const result = await pool.query(
            'INSERT INTO articles (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at, updated_at',
            [title, content]
        );
        res.status(201).json({
            message: '게시글이 성공적으로 등록되었습니다!',
            article: result.rows[0]
        });
    } catch (err) {
        console.error('게시글 등록 오류:', err.message);
        res.status(500).json({ error: '게시글 등록 중 오류가 발생했습니다.' });
    }
});

// --- 게시글 상세 조회 API (GET /articles/:id) ---
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // ID 유효성 검사 (숫자이고 양수인지)
        if (isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다. ID는 양수여야 합니다.' });
        }

        const result = await pool.query(
            'SELECT id, title, content, created_at FROM articles WHERE id = $1',
            [id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 게시글 상세 조회 오류:`, err.message);
        res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
});

// --- 게시글 수정 API (PATCH /articles/:id) ---
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // ID 유효성 검사
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다. ID는 양수여야 합니다.' });
    }

    // 최소 하나 이상의 필드가 제공되었는지 확인
    if (!title && !content) {
        return res.status(400).json({ error: '수정을 위해 제목 또는 내용 중 하나 이상이 필요합니다.' });
    }

    let queryParts = [];
    let queryValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
        queryParts.push(`title = $${paramIndex++}`);
        queryValues.push(title);
    }
    if (content !== undefined) {
        queryParts.push(`content = $${paramIndex++}`);
        queryValues.push(content);
    }

    // SQL 쿼리 조합 및 updated_at 자동 갱신 (DB 트리거가 있다면 필요 없음)
    // DB 트리거가 없는 경우: queryParts.push('updated_at = NOW()');
    const queryText = `UPDATE articles SET ${queryParts.join(', ')} WHERE id = $${paramIndex} RETURNING id, title, content, created_at, updated_at`;
    queryValues.push(id);

    try {
        const result = await pool.query(queryText, queryValues);

        if (result.rows.length > 0) {
            res.json({
                message: '게시글이 성공적으로 수정되었습니다!',
                article: result.rows[0]
            });
        } else {
            res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 게시글 수정 오류:`, err.message);
        res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.' });
    }
});

// --- 게시글 삭제 API (DELETE /articles/:id) ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    // ID 유효성 검사
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다. ID는 양수여야 합니다.' });
    }

    try {
        const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length > 0) {
            res.json({ message: '게시글이 성공적으로 삭제되었습니다!', id: id });
        } else {
            res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 게시글 삭제 오류:`, err.message);
        res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
    }
});

// --- 게시글 목록 조회 API (GET /articles) ---
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // 기본 페이지는 1
    const limit = parseInt(req.query.limit) || 10; // 기본 페이지당 10개
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy; // 'recent' 또는 기타 (기본은 id ASC)
    const search = req.query.search; // 검색어

    let queryText = 'SELECT id, title, content, created_at FROM articles';
    let countQueryText = 'SELECT COUNT(*) FROM articles';
    let queryValues = [];
    let conditions = [];
    let paramIndex = 1;

    // 검색어 조건 추가: title 또는 content에 검색어가 포함된 경우
    if (search) {
        conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
        queryValues.push(`%${search}%`);
        paramIndex++;
    }

    // WHERE 절 조립
    if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
        countQueryText += ' WHERE ' + conditions.join(' AND ');
    }

    // 정렬 조건 추가
    if (sortBy === 'recent') {
        queryText += ' ORDER BY created_at DESC'; // 최신순 (생성일 내림차순)
    } else {
        queryText += ' ORDER BY id ASC'; // 기본 정렬 (ID 오름차순)
    }

    // 페이지네이션 (LIMIT, OFFSET) 추가
    queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryValues.push(limit);
    queryValues.push(offset);

    let totalCount = 0;

    try {
        // 전체 게시글 개수 조회 (페이지네이션 메타데이터를 위해)
        // LIMIT, OFFSET 파라미터를 제외하고 COUNT 쿼리를 실행합니다.
        const countResult = await pool.query(countQueryText, queryValues.slice(0, queryValues.length - 2));
        totalCount = parseInt(countResult.rows[0].count);

        // 실제 게시글 데이터 조회
        const articlesResult = await pool.query(queryText, queryValues);

        res.json({
            data: articlesResult.rows,
            pagination: {
                total_count: totalCount,
                current_page: page,
                per_page: limit,
                total_pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (err) {
        console.error('게시글 목록 조회 오류:', err.message);
        res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
    }
});


module.exports = router; // router 객체를 모듈로 내보냅니다.