const express = require('express');
const router = express.Router();

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

async function callOpenRouter(prompt, systemPrompt) {
  const response = await fetch(process.env.OPENROUTER_BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Project Manager',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Get all sprints (with pagination)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // If no pagination params, return all for backward compat
    if (!req.query.page && !req.query.limit) {
      const result = await pool.query(`
        SELECT s.*, p.name as project_name,
          (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id) as task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id AND t.status = 'done') as completed_tasks
        FROM sprints s
        LEFT JOIN projects p ON s.project_id = p.id
        ORDER BY s.created_at DESC
      `);
      return res.json(result.rows);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT s.*, p.name as project_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id AND t.status = 'done') as completed_tasks
      FROM sprints s
      LEFT JOIN projects p ON s.project_id = p.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM sprints');

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

// GET /api/sprints/:id/velocity - auto-velocity computation
router.get('/:id/velocity', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const sprintId = req.params.id;

    // Get sprint info
    const sprintResult = await pool.query('SELECT * FROM sprints WHERE id = $1', [sprintId]);
    if (sprintResult.rows.length === 0) return res.status(404).json({ error: 'Sprint not found' });
    const sprint = sprintResult.rows[0];

    // Get completed tasks with story points
    const completedResult = await pool.query(
      `SELECT SUM(story_points) as completed_points
       FROM tasks
       WHERE sprint_id = $1 AND status = 'done'`,
      [sprintId]
    );

    // Get total planned points
    const plannedResult = await pool.query(
      `SELECT SUM(story_points) as planned_points
       FROM tasks
       WHERE sprint_id = $1`,
      [sprintId]
    );

    const completedPoints = parseInt(completedResult.rows[0].completed_points) || 0;
    const plannedPoints = parseInt(plannedResult.rows[0].planned_points) || 0;
    const velocityRatio = plannedPoints > 0 ? (completedPoints / plannedPoints) : 0;

    // AI forecast
    let aiForecast = '';
    try {
      aiForecast = await callOpenRouter(
        `Given sprint "${sprint.name}" completed ${completedPoints} out of ${plannedPoints} planned story points (${Math.round(velocityRatio * 100)}% completion rate), forecast completion date for remaining backlog of approximately ${Math.max(0, plannedPoints - completedPoints)} points. Be concise (2-3 sentences).`,
        'You are an Agile velocity and forecasting expert. Provide brief, actionable forecasts.'
      );
    } catch (aiErr) {
      aiForecast = 'AI forecast unavailable';
    }

    res.json({
      sprint_id: sprintId,
      sprint_name: sprint.name,
      completed_points: completedPoints,
      planned_points: plannedPoints,
      velocity_ratio: Math.round(velocityRatio * 100) / 100,
      completion_percentage: Math.round(velocityRatio * 100),
      ai_forecast: aiForecast,
    });
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
