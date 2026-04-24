const express = require('express');
const router = express.Router();

// Get overview analytics
router.get('/overview', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const [tasksByStatus, tasksByPriority, projectProgress, sprintVelocity, risksByCategory, timeByUser, tasksByType] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) as count FROM tasks GROUP BY status ORDER BY count DESC`),
      pool.query(`SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority ORDER BY count DESC`),
      pool.query(`SELECT name, progress FROM projects WHERE status = 'active' ORDER BY progress DESC LIMIT 10`),
      pool.query(`SELECT name, velocity, capacity FROM sprints WHERE velocity > 0 ORDER BY start_date ASC LIMIT 10`),
      pool.query(`SELECT category, COUNT(*) as count, AVG(risk_score) as avg_score FROM risks WHERE status != 'closed' GROUP BY category ORDER BY count DESC`),
      pool.query(`SELECT u.name, COALESCE(SUM(tl.hours), 0) as total_hours FROM users u LEFT JOIN time_logs tl ON u.id = tl.user_id GROUP BY u.id, u.name HAVING SUM(tl.hours) > 0 ORDER BY total_hours DESC`),
      pool.query(`SELECT task_type, COUNT(*) as count FROM tasks GROUP BY task_type ORDER BY count DESC`),
    ]);

    res.json({
      tasksByStatus: tasksByStatus.rows,
      tasksByPriority: tasksByPriority.rows,
      projectProgress: projectProgress.rows,
      sprintVelocity: sprintVelocity.rows,
      risksByCategory: risksByCategory.rows,
      timeByUser: timeByUser.rows,
      tasksByType: tasksByType.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get burndown data for a sprint
router.get('/burndown/:sprintId', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const sprint = await pool.query('SELECT * FROM sprints WHERE id = $1', [req.params.sprintId]);
    if (sprint.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });

    const tasks = await pool.query(`
      SELECT status, story_points, created_at
      FROM tasks WHERE sprint_id = $1
      ORDER BY created_at ASC
    `, [req.params.sprintId]);

    const totalPoints = tasks.rows.reduce((sum, t) => sum + (t.story_points || 0), 0);
    const completedPoints = tasks.rows.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.story_points || 0), 0);

    res.json({
      sprint: sprint.rows[0],
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      tasks: tasks.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get team workload
router.get('/workload', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT u.id, u.name, u.avatar_color,
        COUNT(t.id) as assigned_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(t.id) FILTER (WHERE t.status = 'todo') as todo,
        COUNT(t.id) FILTER (WHERE t.status = 'done') as done,
        COALESCE(SUM(t.story_points), 0) as total_points,
        COALESCE(SUM(tl_hours.total), 0) as logged_hours
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assignee_id
      LEFT JOIN (
        SELECT user_id, SUM(hours) as total FROM time_logs GROUP BY user_id
      ) tl_hours ON u.id = tl_hours.user_id
      GROUP BY u.id, u.name, u.avatar_color
      HAVING COUNT(t.id) > 0
      ORDER BY assigned_tasks DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
