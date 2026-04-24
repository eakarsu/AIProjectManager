const express = require('express');
const router = express.Router();

// Get all retrospectives
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT r.*, s.name as sprint_name, s.project_id, p.name as project_name, u.name as conducted_by_name
      FROM retrospectives r
      LEFT JOIN sprints s ON r.sprint_id = s.id
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN users u ON r.conducted_by = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single retrospective
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT r.*, s.name as sprint_name, s.project_id, p.name as project_name, u.name as conducted_by_name
      FROM retrospectives r
      LEFT JOIN sprints s ON r.sprint_id = s.id
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN users u ON r.conducted_by = u.id
      WHERE r.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Retrospective not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create retrospective
router.post('/', async (req, res) => {
  try {
    const { sprint_id, went_well, to_improve, action_items, mood_score, conducted_by } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO retrospectives (sprint_id, went_well, to_improve, action_items, mood_score, conducted_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [sprint_id, went_well, to_improve, action_items, mood_score || 3, conducted_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update retrospective
router.put('/:id', async (req, res) => {
  try {
    const { sprint_id, went_well, to_improve, action_items, mood_score, conducted_by, ai_analysis } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE retrospectives SET sprint_id=$1, went_well=$2, to_improve=$3, action_items=$4, mood_score=$5, conducted_by=$6, ai_analysis=$7
       WHERE id=$8 RETURNING *`,
      [sprint_id, went_well, to_improve, action_items, mood_score, conducted_by, ai_analysis, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Retrospective not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete retrospective
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM retrospectives WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Retrospective not found' });
    res.json({ message: 'Retrospective deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
