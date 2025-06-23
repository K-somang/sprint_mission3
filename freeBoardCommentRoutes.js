// routes/freeBoardCommentRoutes.js
import express from 'express';
const router = express.Router();
 // 데이터베이스 연결 풀
import pool from './config/db.js';


// --- 자유게시판 댓글 등록 API (POST /free-board-comments/:articleId) ---
router.post('/:articleId', async (req, res) => {
    const { articleId } = req.params;
    const { content } = req.body;

    if (isNaN(articleId) || parseInt(articleId) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
    }
    if (!content) {
        return res.status(400).json({ error: '댓글 내용은 필수 입력 항목입니다.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO free_board_comments (article_id, content) VALUES ($1, $2) RETURNING id, article_id, content, created_at, updated_at',
            [articleId, content]
        );
        res.status(201).json({
            message: '자유게시판 댓글이 성공적으로 등록되었습니다!',
            comment: result.rows[0]
        });
    } catch (err) {
        console.error('자유게시판 댓글 등록 오류:', err.message);
        res.status(500).json({ error: '자유게시판 댓글 등록 중 오류가 발생했습니다.' });
    }
});

// --- 자유게시판 댓글 수정 API (PATCH /free-board-comments/:id) ---
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
            'UPDATE free_board_comments SET content = $1 WHERE id = $2 RETURNING id, article_id, content, created_at, updated_at',
            [content, id]
        );
        if (result.rows.length > 0) {
            res.json({
                message: '자유게시판 댓글이 성공적으로 수정되었습니다!',
                comment: result.rows[0]
            });
        } else {
            res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 자유게시판 댓글 수정 오류:`, err.message);
        res.status(500).json({ error: '자유게시판 댓글 수정 중 오류가 발생했습니다.' });
    }
});

// --- 자유게시판 댓글 삭제 API (DELETE /free-board-comments/:id) ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 댓글 ID입니다.' });
    }

    try {
        const result = await pool.query('DELETE FROM free_board_comments WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length > 0) {
            res.json({ message: '자유게시판 댓글이 성공적으로 삭제되었습니다!', id: id });
        } else {
            res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(`ID ${id} 자유게시판 댓글 삭제 오류:`, err.message);
        res.status(500).json({ error: '자유게시판 댓글 삭제 중 오류가 발생했습니다.' });
    }
});

// --- 자유게시판 댓글 목록 조회 API (GET /free-board-comments/:articleId) - Cursor Pagination ---
router.get('/:articleId', async (req, res) => {
    const { articleId } = req.params;
    const { cursor, limit = 10 } = req.query;
    const parsedLimit = parseInt(limit);

    if (isNaN(articleId) || parseInt(articleId) <= 0) {
        return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
    }
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
        return res.status(400).json({ error: 'limit은 1에서 100 사이의 유효한 숫자여야 합니다.' });
    }

    let queryText = 'SELECT id, content, created_at FROM free_board_comments WHERE article_id = $1';
    let queryValues = [articleId];
    let paramIndex = 2;

    if (cursor) {
        queryText += ` AND created_at < $${paramIndex++}`;
        queryValues.push(cursor);
    }

    queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${paramIndex++}`;
    queryValues.push(parsedLimit + 1);

    try {
        const result = await pool.query(queryText, queryValues);
        const comments = result.rows;

        let nextCursor = null;
        let hasNextPage = false;

        if (comments.length > parsedLimit) {
            hasNextPage = true;
            comments.pop();
            nextCursor = comments[comments.length - 1].created_at;
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
        console.error('자유게시판 댓글 목록 조회 오류:', err.message);
        res.status(500).json({ error: '자유게시판 댓글 목록 조회 중 오류가 발생했습니다.' });
    }
});

export default router;