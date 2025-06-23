// routes/usedMarketCommentRoutes.js
const express = require('express');
const router = express.Router();
// 데이터베이스 연결 풀
import pool from './config/db';

// --- 중고마켓 댓글 등록 API (POST /used-market-comments/:productId) ---
router.post('/:productId', async (req, res) => {
    const { productId } = req.params;
    const { content } = req.body;

    if (isNaN(productId) || parseInt(productId) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 상품 ID입니다.' });
    }
    if (!content) {
        return res.status(400).json({ error: '댓글 내용은 필수 입력 항목입니다.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO used_market_comments (product_id, content) VALUES ($1, $2) RETURNING id, product_id, content, created_at, updated_at',
            [productId, content]
        );
        res.status(201).json({
            message: '중고마켓 댓글이 성공적으로 등록되었습니다!',
            comment: result.rows[0]
        });
    } catch (err) {
        console.error('중고마켓 댓글 등록 오류:', err.message);
        res.status(500).json({ error: '중고마켓 댓글 등록 중 오류가 발생했습니다.' });
    }
});

// --- 중고마켓 댓글 수정 API (PATCH /used-market-comments/:id) ---
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 댓글 ID입니다.' });
    }
    if (!content) {
        return res.status(400).json({ error: '수정할 댓글 내용은 필수 입력 항목입니다.' });
    }

    try {
        const result = await pool.query(
            'UPDATE used_market_comments SET content = $1 WHERE id = $2 RETURNING id, product_id, content, created_at, updated_at',
            [content, id]
        );
        if (result.rows.length > 0) {
            res.json({
                message: '중고마켓 댓글이 성공적으로 수정되었습니다!',
                comment: result.rows[0]
            });
        } else {
            res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 중고마켓 댓글 수정 오류:`, err.message);
        res.status(500).json({ error: '중고마켓 댓글 수정 중 오류가 발생했습니다.' });
    }
});

// --- 중고마켓 댓글 삭제 API (DELETE /used-market-comments/:id) ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 댓글 ID입니다.' });
    }

    try {
        const result = await pool.query('DELETE FROM used_market_comments WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length > 0) {
            res.json({ message: '중고마켓 댓글이 성공적으로 삭제되었습니다!', id: id });
        } else {
            res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 중고마켓 댓글 삭제 오류:`, err.message);
        res.status(500).json({ error: '중고마켓 댓글 삭제 중 오류가 발생했습니다.' });
    }
});

// --- 중고마켓 댓글 목록 조회 API (GET /used-market-comments/:productId) - Cursor Pagination ---
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    const { cursor, limit = 10 } = req.query; // cursor는 마지막으로 조회된 댓글의 created_at 값 또는 ID
    const parsedLimit = parseInt(limit);

    if (isNaN(productId) || parseInt(productId) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 상품 ID입니다.' });
    }
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
        return res.status(400).json({ error: 'limit은 1에서 100 사이의 유효한 숫자여야 합니다.' });
    }

    let queryText = 'SELECT id, content, created_at FROM used_market_comments WHERE product_id = $1';
    let queryValues = [productId];
    let paramIndex = 2; // product_id가 $1이므로 그 다음 파라미터부터 시작

    // cursor가 있는 경우 (다음 페이지 조회)
    if (cursor) {
        // created_at 기준으로 cursor를 사용하는 경우 (예: '2024-06-22T12:00:00.000Z' 또는 '1719028800000' 같은 타임스탬프)
        // created_at이 동일한 경우 id로 다음을 찾기 위해 복합 인덱싱을 고려할 수 있습니다.
        queryText += ` AND created_at < $${paramIndex++}`;
        queryValues.push(cursor); // cursor는 created_at 값이라고 가정

        // created_at이 동일한 경우를 대비하여 id로 한 번 더 필터링 (선택적)
        // 이 부분은 프론트엔드에서 lastId도 함께 넘겨줘야 함
        // if (lastId) {
        //     queryText += ` AND (created_at < $${paramIndex++} OR (created_at = $${paramIndex-1} AND id < $${paramIndex++}))`;
        //     queryValues.push(cursor);
        //     queryValues.push(lastId);
        // } else {
        //    queryText += ` AND created_at < $${paramIndex++}`;
        //    queryValues.push(cursor);
        // }
    }

    // 항상 최신순으로 정렬 (cursor pagination의 핵심)
    queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${paramIndex++}`;
    queryValues.push(parsedLimit + 1); // 다음 페이지 존재 여부 확인을 위해 +1

    try {
        const result = await pool.query(queryText, queryValues);
        const comments = result.rows;

        let nextCursor = null;
        let hasNextPage = false;

        // limit+1 만큼 가져왔으면 다음 페이지가 있다는 의미
        if (comments.length > parsedLimit) {
            hasNextPage = true;
            comments.pop(); // 마지막 요소 (다음 페이지 존재 여부 확인용) 제거
            nextCursor = comments[comments.length - 1].created_at; // 마지막 댓글의 created_at을 다음 커서로 사용
            // 만약 id로도 구분해야 한다면 nextCursor = { created_at: comments[comments.length - 1].created_at, id: comments[comments.length - 1].id };
        }

        res.json({
            data: comments,
            pagination: {
                next_cursor: nextCursor,
                has_next_page: hasNextPage,
                limit: parsedLimit
            }
        });

    } catch (err) {
        console.error('중고마켓 댓글 목록 조회 오류:', err.message);
        res.status(500).json({ error: '중고마켓 댓글 목록 조회 중 오류가 발생했습니다.' });
    }
});

module.exports = router;