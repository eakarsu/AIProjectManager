const express = require('express');
const router = express.Router();

// Get all sprints
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT s.*, p.name as project_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id AND t.status = 'done') as completed_tasks
      FROM sprints s
      LEFT JOIN projects p ON s.project_id = p.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single sprint
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT s.*, p.name as project_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id AND t.status = 'done') as completed_tasks
      FROM sprints s
      LEFT JOIN projects p ON s.project_id = p.id
      WHERE s.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sprint
router.post('/', async (req, res) => {
  try {
    const { name, goal, project_id, start_date, end_date, status, velocity, capacity, ai_suggestions } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO sprints (name, goal, project_id, start_date, end_date, status, velocity, capacity, ai_suggestions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, goal, project_id || null, start_date || null, end_date || null, status || 'planning', velocity || 0, capacity || 40, ai_suggestions || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update sprint
router.put('/:id', async (req, res) => {
  try {
    const { name, goal, project_id, start_date, end_date, status, velocity, capacity, ai_suggestions } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE sprints SET name=$1, goal=$2, project_id=$3, start_date=$4, end_date=$5, status=$6, velocity=$7, capacity=$8, ai_suggestions=$9
       WHERE id=$10 RETURNING *`,
      [name, goal, project_id || null, start_date || null, end_date || null, status, velocity || 0, capacity || 40, ai_suggestions || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete sprint
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM sprints WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    res.json({ message: 'Sprint deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
