const express = require('express');
const router = express.Router();

// Get all activity logs
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT a.*, u.name as user_name, u.avatar_color
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get activity for a specific entity
router.get('/:entityType/:entityId', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT a.*, u.name as user_name, u.avatar_color
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = $1 AND a.entity_id = $2
      ORDER BY a.created_at DESC
    `, [req.params.entityType, req.params.entityId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create activity log
router.post('/', async (req, res) => {
  try {
    const { user_id, action, entity_type, entity_id, entity_name, details } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_name, details)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, action, entity_type, entity_id, entity_name, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
