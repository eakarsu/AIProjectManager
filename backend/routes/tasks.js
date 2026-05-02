const express = require('express');
const router = express.Router();

// Get all tasks (with pagination)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // If no pagination params, return all for backward compat
    if (!req.query.page && !req.query.limit) {
      const result = await pool.query(`
        SELECT t.*, u.name as assignee_name, p.name as project_name, s.name as sprint_name
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN sprints s ON t.sprint_id = s.id
        ORDER BY t.created_at DESC
      `);
      return res.json(result.rows);
    }

    const result = await pool.query(`
      SELECT t.*, u.name as assignee_name, p.name as project_name, s.name as sprint_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN sprints s ON t.sprint_id = s.id
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM tasks');

    res.json({
      data: result.rows,
      page,
      limit,
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT t.*, u.name as assignee_name, p.name as project_name, s.name as sprint_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN sprints s ON t.sprint_id = s.id
      WHERE t.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, assignee_id, project_id, sprint_id, story_points, due_date, task_type, ai_breakdown } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, sprint_id, story_points, due_date, task_type, ai_breakdown)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, description, status || 'todo', priority || 'medium', assignee_id || null, project_id || null, sprint_id || null, story_points || 1, due_date || null, task_type || 'feature', ai_breakdown || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task (with activity log auto-write)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assignee_id, project_id, sprint_id, story_points, due_date, task_type, ai_breakdown } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4, assignee_id=$5, project_id=$6, sprint_id=$7, story_points=$8, due_date=$9, task_type=$10, ai_breakdown=$11
       WHERE id=$12 RETURNING *`,
      [title, description, status, priority, assignee_id || null, project_id || null, sprint_id || null, story_points || 1, due_date || null, task_type || 'feature', ai_breakdown || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const updatedTask = result.rows[0];
    const userId = req.user?.id;

    // Auto-write activity log
    try {
      await pool.query(
        `INSERT INTO activities (project_id, task_id, user_id, action, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          updatedTask.project_id,
          updatedTask.id,
          userId || null,
          'task_updated',
          `Task "${updatedTask.title}" updated`,
        ]
      );
    } catch (actErr) {
      console.error('Activity log insert failed:', actErr.message);
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
