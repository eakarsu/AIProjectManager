const express = require('express');
const router = express.Router();

// Get all milestones
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT m.*, p.name as project_name
      FROM milestones m
      LEFT JOIN projects p ON m.project_id = p.id
      ORDER BY m.target_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single milestone
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT m.*, p.name as project_name
      FROM milestones m
      LEFT JOIN projects p ON m.project_id = p.id
      WHERE m.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Milestone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create milestone
router.post('/', async (req, res) => {
  try {
    const { name, description, project_id, target_date, status, progress } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO milestones (name, description, project_id, target_date, status, progress)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, project_id || null, target_date || null, status || 'in_progress', progress || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update milestone
router.put('/:id', async (req, res) => {
  try {
    const { name, description, project_id, target_date, status, progress } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE milestones SET name=$1, description=$2, project_id=$3, target_date=$4, status=$5, progress=$6
       WHERE id=$7 RETURNING *`,
      [name, description, project_id || null, target_date || null, status, progress || 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Milestone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete milestone
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM milestones WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Milestone not found' });
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
