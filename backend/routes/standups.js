const express = require('express');
const router = express.Router();

// Get all standups
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT s.*, u.name as user_name, u.avatar_color, p.name as project_name
      FROM standups s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN projects p ON s.project_id = p.id
      ORDER BY s.standup_date DESC, s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single standup
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT s.*, u.name as user_name, u.avatar_color, p.name as project_name
      FROM standups s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN projects p ON s.project_id = p.id
      WHERE s.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Standup not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create standup
router.post('/', async (req, res) => {
  try {
    const { user_id, project_id, yesterday, today, blockers, mood, standup_date, ai_summary } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO standups (user_id, project_id, yesterday, today, blockers, mood, standup_date, ai_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id || null, project_id || null, yesterday, today, blockers, mood || 'neutral', standup_date || new Date().toISOString().split('T')[0], ai_summary || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update standup
router.put('/:id', async (req, res) => {
  try {
    const { user_id, project_id, yesterday, today, blockers, mood, standup_date, ai_summary } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE standups SET user_id=$1, project_id=$2, yesterday=$3, today=$4, blockers=$5, mood=$6, standup_date=$7, ai_summary=$8
       WHERE id=$9 RETURNING *`,
      [user_id || null, project_id || null, yesterday, today, blockers, mood || 'neutral', standup_date || null, ai_summary || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Standup not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete standup
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM standups WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Standup not found' });
    res.json({ message: 'Standup deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
