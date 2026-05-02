const express = require('express');
const router = express.Router();

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

async function callOpenRouter(prompt, systemPrompt, opts = {}) {
  const response = await fetch(process.env.OPENROUTER_BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Project Manager',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: opts.max_tokens || 2000,
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseAIJson(text) {
  try { return JSON.parse(text); } catch {}
  const block = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (block) { try { return JSON.parse(block[1].trim()); } catch {} }
  const s = text.search(/[{[]/);
  if (s !== -1) {
    const e = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (e !== -1) { try { return JSON.parse(text.slice(s, e + 1)); } catch {} }
  }
  return null;
}

async function persistAiResult(pool, { user_id, endpoint, project_id, result, result_json }) {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY, user_id INTEGER, endpoint VARCHAR(100),
      project_id INTEGER, task_id INTEGER, result TEXT, result_json JSONB,
      created_at TIMESTAMP DEFAULT NOW())`);
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, project_id, result, result_json) VALUES ($1,$2,$3,$4,$5)`,
      [user_id, endpoint, project_id || null, result, result_json ? JSON.stringify(result_json) : null]
    );
  } catch {}
}

// Get all projects (with pagination and user_id filter)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    let query, params;
    if (userId) {
      query = `
        SELECT p.*, u.name as owner_name
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id = $1 OR p.owner_id IS NULL
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [userId, limit, offset];
    } else {
      query = `
        SELECT p.*, u.name as owner_name
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      params = [limit, offset];
    }

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM projects');

    // If no pagination params provided, return all for backward compat
    if (!req.query.page && !req.query.limit) {
      const allResult = await pool.query(`
        SELECT p.*, u.name as owner_name
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
      `);
      return res.json(allResult.rows);
    }

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

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT p.*, u.name as owner_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, status, priority, start_date, end_date, owner_id, progress } = req.body;
    const pool = req.app.locals.pool;
    const effectiveOwnerId = owner_id || req.user?.id || null;
    const result = await pool.query(
      `INSERT INTO projects (name, description, status, priority, start_date, end_date, owner_id, progress)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, status || 'active', priority || 'medium', start_date || null, end_date || null, effectiveOwnerId, progress || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, status, priority, start_date, end_date, owner_id, progress } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE projects SET name=$1, description=$2, status=$3, priority=$4, start_date=$5, end_date=$6, owner_id=$7, progress=$8
       WHERE id=$9 RETURNING *`,
      [name, description, status, priority, start_date || null, end_date || null, owner_id || null, progress || 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/velocity-chart - velocity history for recharts
router.get('/:id/velocity-chart', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const projectId = req.params.id;

    // Ensure velocity column exists
    await pool.query(`ALTER TABLE sprints ADD COLUMN IF NOT EXISTS velocity INTEGER DEFAULT 0`);

    // Compute velocity for completed sprints (auto-update)
    const completedSprints = await pool.query(
      `SELECT id FROM sprints WHERE project_id = $1 AND status = 'completed'`,
      [projectId]
    );
    for (const sprint of completedSprints.rows) {
      const vResult = await pool.query(
        `SELECT COALESCE(SUM(story_points),0) as v FROM tasks WHERE sprint_id=$1 AND status='done'`,
        [sprint.id]
      );
      await pool.query(`UPDATE sprints SET velocity=$1 WHERE id=$2`, [parseInt(vResult.rows[0].v), sprint.id]);
    }

    const result = await pool.query(
      `SELECT id, name, velocity, start_date, end_date, status,
        (SELECT COALESCE(SUM(story_points),0) FROM tasks WHERE sprint_id=sprints.id) as planned_points,
        (SELECT COALESCE(SUM(story_points),0) FROM tasks WHERE sprint_id=sprints.id AND status='done') as completed_points
       FROM sprints WHERE project_id=$1 ORDER BY end_date ASC`,
      [projectId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/ai-risk-assess
router.post('/:id/ai-risk-assess', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const projectId = req.params.id;

    const [project, tasks, team, risks] = await Promise.all([
      pool.query(`SELECT * FROM projects WHERE id=$1`, [projectId]),
      pool.query(`SELECT title,status,due_date,story_points,priority FROM tasks WHERE project_id=$1 ORDER BY due_date ASC`, [projectId]),
      pool.query(`SELECT u.name,tm.role,tm.availability,tm.skills FROM team_members tm JOIN users u ON tm.user_id=u.id WHERE tm.project_id=$1`, [projectId]),
      pool.query(`SELECT title,probability,impact,risk_score,status,category FROM risks WHERE project_id=$1 AND status='open'`, [projectId]),
    ]);

    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const p = project.rows[0];

    const systemPrompt = `You are a project risk analyst. Return ONLY valid JSON:
{"risks":[{"risk":"string","probability":"low|medium|high","impact":"low|medium|high","mitigation":"string","category":"string"}],"overall_risk_score":7,"summary":"string","critical_risks":["string"]}`;

    const prompt = `Assess risks for:
Project: ${p.name} (${p.status}, ${p.progress}% complete)
Timeline: ${p.start_date} to ${p.end_date}
Incomplete tasks: ${tasks.rows.filter(t=>t.status!=='done').length} of ${tasks.rows.length}
Overdue tasks: ${tasks.rows.filter(t=>t.due_date && new Date(t.due_date)<new Date() && t.status!=='done').length}
Team size: ${team.rows.length}, avg availability: ${team.rows.length ? Math.round(team.rows.reduce((s,m)=>s+(m.availability||100),0)/team.rows.length) : 100}%
Open risks: ${risks.rows.length}
High priority incomplete tasks: ${tasks.rows.filter(t=>t.priority==='high'&&t.status!=='done').length}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    await persistAiResult(pool, { user_id: req.user?.id, endpoint: 'ai-risk-assess', project_id: projectId, result: aiResponse, result_json: parsed });
    res.json({ result: aiResponse, parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/ai-resource-balance
router.post('/:id/ai-resource-balance', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const projectId = req.params.id;

    const [team, tasks] = await Promise.all([
      pool.query(`SELECT u.id,u.name,tm.role,tm.availability,tm.skills FROM team_members tm JOIN users u ON tm.user_id=u.id WHERE tm.project_id=$1`, [projectId]),
      pool.query(`SELECT t.id,t.title,t.assignee_id,t.story_points,t.priority,t.status,u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id WHERE t.project_id=$1 AND t.status!='done'`, [projectId]),
    ]);

    const memberLoad = team.rows.map(m => ({
      ...m,
      tasks: tasks.rows.filter(t=>t.assignee_id===m.id),
      total_points: tasks.rows.filter(t=>t.assignee_id===m.id).reduce((s,t)=>s+(t.story_points||0),0),
    }));

    const systemPrompt = `You are a resource balancing AI. Return ONLY valid JSON:
{"reassignments":[{"task_id":1,"task_title":"string","from_member":"string","to_member":"string","reason":"string"}],"workload_summary":[{"member":"string","current_points":5,"recommended_points":5,"status":"overloaded|balanced|underloaded"}],"optimization_score":75,"notes":"string"}`;

    const prompt = `Balance workload for this team:
${memberLoad.map(m=>`${m.name} (${m.role}, ${m.availability}% available, ${m.total_points} story points): ${m.tasks.map(t=>t.title).join(', ')||'no tasks'}`).join('\n')}

Unassigned tasks: ${tasks.rows.filter(t=>!t.assignee_id).map(t=>t.title).join(', ')||'none'}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    await persistAiResult(pool, { user_id: req.user?.id, endpoint: 'ai-resource-balance', project_id: projectId, result: aiResponse, result_json: parsed });
    res.json({ result: aiResponse, parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/ai-critical-path
router.post('/:id/ai-critical-path', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const projectId = req.params.id;

    const [project, tasks] = await Promise.all([
      pool.query(`SELECT * FROM projects WHERE id=$1`, [projectId]),
      pool.query(`SELECT id,title,status,priority,story_points,due_date,assignee_id FROM tasks WHERE project_id=$1 ORDER BY due_date ASC`, [projectId]),
    ]);

    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const systemPrompt = `You are a critical path analysis expert. Return ONLY valid JSON:
{"critical_path":["task title 1","task title 2"],"delay_risks":[{"task":"string","delay_days":5,"reason":"string","mitigation":"string"}],"estimated_delay_days":0,"on_track":true,"recommendations":["string"]}`;

    const overdue = tasks.rows.filter(t=>t.due_date&&new Date(t.due_date)<new Date()&&t.status!=='done');
    const prompt = `Identify critical path for project "${project.rows[0].name}" (deadline: ${project.rows[0].end_date}, ${project.rows[0].progress}% complete):
Total tasks: ${tasks.rows.length}, Completed: ${tasks.rows.filter(t=>t.status==='done').length}, In progress: ${tasks.rows.filter(t=>t.status==='in_progress').length}, Overdue: ${overdue.length}
High-priority incomplete tasks: ${tasks.rows.filter(t=>t.priority==='high'&&t.status!=='done').map(t=>`${t.title} (due:${t.due_date||'none'})`).join(', ')||'none'}
Overdue tasks: ${overdue.map(t=>t.title).join(', ')||'none'}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    await persistAiResult(pool, { user_id: req.user?.id, endpoint: 'ai-critical-path', project_id: projectId, result: aiResponse, result_json: parsed });
    res.json({ result: aiResponse, parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/health
router.get('/:id/health', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const projectId = req.params.id;

    const [project, tasks, sprints] = await Promise.all([
      pool.query(`SELECT * FROM projects WHERE id=$1`, [projectId]),
      pool.query(`SELECT status,story_points,due_date FROM tasks WHERE project_id=$1`, [projectId]),
      pool.query(`SELECT velocity,status,start_date,end_date FROM sprints WHERE project_id=$1 ORDER BY end_date DESC LIMIT 5`, [projectId]),
    ]);

    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const p = project.rows[0];
    const allTasks = tasks.rows;
    const completedTasks = allTasks.filter(t=>t.status==='done');
    const now = new Date();

    const taskCompletionRate = allTasks.length > 0 ? Math.round(completedTasks.length / allTasks.length * 100) : 0;
    const totalPoints = allTasks.reduce((s,t)=>s+(t.story_points||0),0);
    const completedPoints = completedTasks.reduce((s,t)=>s+(t.story_points||0),0);
    const overdueTasks = allTasks.filter(t=>t.due_date&&new Date(t.due_date)<now&&t.status!=='done').length;

    let scheduleAdherence = 100;
    if (p.start_date && p.end_date) {
      const totalDays = (new Date(p.end_date)-new Date(p.start_date))/(1000*60*60*24);
      const elapsedDays = (now-new Date(p.start_date))/(1000*60*60*24);
      const expectedProgress = Math.min(100, Math.round(elapsedDays/totalDays*100));
      scheduleAdherence = expectedProgress > 0 ? Math.round(p.progress/expectedProgress*100) : 100;
    }

    const completedSprints = sprints.rows.filter(s=>s.status==='completed'&&s.velocity>0);
    const velocityTrend = completedSprints.map(s=>s.velocity);

    res.json({
      project_id: projectId,
      schedule_adherence_pct: Math.min(scheduleAdherence, 150),
      task_completion_rate: taskCompletionRate,
      overdue_tasks: overdueTasks,
      total_tasks: allTasks.length,
      completed_tasks: completedTasks.length,
      story_points_completed: completedPoints,
      story_points_total: totalPoints,
      velocity_trend: velocityTrend,
      avg_velocity: velocityTrend.length > 0 ? Math.round(velocityTrend.reduce((s,v)=>s+v,0)/velocityTrend.length) : 0,
      health_score: Math.round((taskCompletionRate + Math.min(scheduleAdherence, 100)) / 2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/ai-health-summary
router.post('/:id/ai-health-summary', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const projectId = req.params.id;

    // Gather health metrics
    const [project, tasks, sprints, risks] = await Promise.all([
      pool.query(`SELECT * FROM projects WHERE id=$1`, [projectId]),
      pool.query(`SELECT status,story_points,due_date,priority FROM tasks WHERE project_id=$1`, [projectId]),
      pool.query(`SELECT velocity,status FROM sprints WHERE project_id=$1 ORDER BY end_date DESC LIMIT 5`, [projectId]),
      pool.query(`SELECT status FROM risks WHERE project_id=$1`, [projectId]),
    ]);

    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const p = project.rows[0];
    const allTasks = tasks.rows;
    const completedTasks = allTasks.filter(t=>t.status==='done');
    const overdueTasks = allTasks.filter(t=>t.due_date&&new Date(t.due_date)<new Date()&&t.status!=='done');
    const openRisks = risks.rows.filter(r=>r.status==='open').length;
    const completedSprints = sprints.rows.filter(s=>s.status==='completed');
    const avgVelocity = completedSprints.length > 0 ? Math.round(completedSprints.reduce((s,sp)=>s+(sp.velocity||0),0)/completedSprints.length) : 0;

    const systemPrompt = `You are a senior project health analyst. Provide a concise narrative health report (2-3 paragraphs) assessing the project's health, highlighting key risks, and giving 3 actionable recommendations.`;

    const prompt = `Generate a health report for:
Project: ${p.name}
Progress: ${p.progress}%, Status: ${p.status}
Tasks: ${completedTasks.length}/${allTasks.length} complete (${Math.round(completedTasks.length/Math.max(allTasks.length,1)*100)}%)
Overdue tasks: ${overdueTasks.length}
High-priority incomplete: ${allTasks.filter(t=>t.priority==='high'&&t.status!=='done').length}
Open risks: ${openRisks}
Average sprint velocity: ${avgVelocity} points
Timeline: ${p.start_date} to ${p.end_date}`;

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    await persistAiResult(pool, { user_id: req.user?.id, endpoint: 'ai-health-summary', project_id: projectId, result: aiResponse, result_json: null });
    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
