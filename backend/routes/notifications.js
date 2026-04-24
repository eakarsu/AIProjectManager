const express = require('express');
const router = express.Router();

// Get all notifications (optionally filter by user)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    let query = `
      SELECT n.*, u.name as user_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/unread/count', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT COUNT(*) FROM notifications WHERE is_read = false');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single notification
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.patch('/read/all', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await pool.query('UPDATE notifications SET is_read = true WHERE is_read = false');
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { user_id, type, title, message, entity_type, entity_id } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, type, title, message, entity_type, entity_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
