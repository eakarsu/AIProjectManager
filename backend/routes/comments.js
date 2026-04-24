const express = require('express');
const router = express.Router();

// Get comments for an entity
router.get('/:entityType/:entityId', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT c.*, u.name as user_name, u.avatar_color
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.entity_type = $1 AND c.entity_id = $2
      ORDER BY c.created_at ASC
    `, [req.params.entityType, req.params.entityId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT c.*, u.name as user_name, u.avatar_color
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create comment
router.post('/', async (req, res) => {
  try {
    const { entity_type, entity_id, user_id, content } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO comments (entity_type, entity_id, user_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [entity_type, entity_id, user_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
