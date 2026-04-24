const express = require('express');
const router = express.Router();

// Get all labels
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT l.*, p.name as project_name,
        (SELECT COUNT(*) FROM task_labels tl WHERE tl.label_id = l.id) as task_count
      FROM labels l
      LEFT JOIN projects p ON l.project_id = p.id
      ORDER BY l.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single label
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT l.*, p.name as project_name
      FROM labels l
      LEFT JOIN projects p ON l.project_id = p.id
      WHERE l.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Label not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create label
router.post('/', async (req, res) => {
  try {
    const { name, color, project_id } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      'INSERT INTO labels (name, color, project_id) VALUES ($1, $2, $3) RETURNING *',
      [name, color, project_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update label
router.put('/:id', async (req, res) => {
  try {
    const { name, color, project_id } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      'UPDATE labels SET name=$1, color=$2, project_id=$3 WHERE id=$4 RETURNING *',
      [name, color, project_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Label not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete label
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM labels WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Label not found' });
    res.json({ message: 'Label deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get labels for a task
router.get('/task/:taskId', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT l.* FROM labels l
      JOIN task_labels tl ON tl.label_id = l.id
      WHERE tl.task_id = $1
    `, [req.params.taskId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add label to task
router.post('/task/:taskId/:labelId', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await pool.query(
      'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.taskId, req.params.labelId]
    );
    res.json({ message: 'Label added to task' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove label from task
router.delete('/task/:taskId/:labelId', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await pool.query(
      'DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2',
      [req.params.taskId, req.params.labelId]
    );
    res.json({ message: 'Label removed from task' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
