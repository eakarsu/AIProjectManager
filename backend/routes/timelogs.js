const express = require('express');
const router = express.Router();

// Get summary stats - MUST be before /:id to avoid matching "stats" as id
router.get('/stats/summary', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const total = await pool.query('SELECT COALESCE(SUM(hours), 0) as total FROM time_logs');
    const billable = await pool.query('SELECT COALESCE(SUM(hours), 0) as total FROM time_logs WHERE billable = true');
    const byUser = await pool.query(`
      SELECT u.name, u.avatar_color, COALESCE(SUM(tl.hours), 0) as total_hours
      FROM time_logs tl
      LEFT JOIN users u ON tl.user_id = u.id
      GROUP BY u.id, u.name, u.avatar_color
      ORDER BY total_hours DESC
    `);
    const byProject = await pool.query(`
      SELECT p.name, COALESCE(SUM(tl.hours), 0) as total_hours
      FROM time_logs tl
      LEFT JOIN tasks t ON tl.task_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE p.name IS NOT NULL
      GROUP BY p.id, p.name
      ORDER BY total_hours DESC
    `);
    const avgPerDay = await pool.query(`
      SELECT COALESCE(AVG(daily_total), 0) as avg FROM (
        SELECT log_date, SUM(hours) as daily_total FROM time_logs GROUP BY log_date
      ) sub
    `);
    res.json({
      totalHours: parseFloat(total.rows[0].total),
      billableHours: parseFloat(billable.rows[0].total),
      avgPerDay: parseFloat(avgPerDay.rows[0].avg),
      byUser: byUser.rows,
      byProject: byProject.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all time logs
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT tl.*, t.title as task_title, u.name as user_name, u.avatar_color, p.name as project_name
      FROM time_logs tl
      LEFT JOIN tasks t ON tl.task_id = t.id
      LEFT JOIN users u ON tl.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY tl.log_date DESC, tl.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single time log
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT tl.*, t.title as task_title, u.name as user_name, u.avatar_color, p.name as project_name
      FROM time_logs tl
      LEFT JOIN tasks t ON tl.task_id = t.id
      LEFT JOIN users u ON tl.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE tl.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Time log not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create time log
router.post('/', async (req, res) => {
  try {
    const { task_id, user_id, hours, log_date, start_datetime, end_datetime, notes, billable } = req.body;
    const pool = req.app.locals.pool;

    // Auto-calculate hours from start/end if provided
    let finalHours = hours;
    if (start_datetime && end_datetime) {
      const diff = (new Date(end_datetime) - new Date(start_datetime)) / (1000 * 60 * 60);
      if (diff > 0) finalHours = Math.round(diff * 100) / 100;
    }

    // Derive log_date from start_datetime if not provided
    const finalDate = log_date || (start_datetime ? start_datetime.split('T')[0] : new Date().toISOString().split('T')[0]);

    const result = await pool.query(
      `INSERT INTO time_logs (task_id, user_id, hours, log_date, start_datetime, end_datetime, notes, billable)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [task_id, user_id, finalHours, finalDate, start_datetime || null, end_datetime || null, notes, billable !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update time log
router.put('/:id', async (req, res) => {
  try {
    const { task_id, user_id, hours, log_date, start_datetime, end_datetime, notes, billable } = req.body;
    const pool = req.app.locals.pool;

    // Auto-calculate hours from start/end if provided
    let finalHours = hours;
    if (start_datetime && end_datetime) {
      const diff = (new Date(end_datetime) - new Date(start_datetime)) / (1000 * 60 * 60);
      if (diff > 0) finalHours = Math.round(diff * 100) / 100;
    }

    const finalDate = log_date || (start_datetime ? start_datetime.split('T')[0] : null);

    const result = await pool.query(
      `UPDATE time_logs SET task_id=$1, user_id=$2, hours=$3, log_date=$4, start_datetime=$5, end_datetime=$6, notes=$7, billable=$8
       WHERE id=$9 RETURNING *`,
      [task_id, user_id, finalHours, finalDate, start_datetime || null, end_datetime || null, notes, billable, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Time log not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete time log
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM time_logs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Time log not found' });
    res.json({ message: 'Time log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
