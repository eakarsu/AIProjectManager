const express = require('express');
const router = express.Router();

// Model
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

async function callOpenRouter(prompt, systemPrompt, opts = {}) {
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
      max_tokens: opts.max_tokens || 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 3-strategy JSON parser
function parseAIJson(text) {
  // Strategy 1: direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Strategy 2: extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // Strategy 3: find first { or [ and parse from there
  const jsonStart = text.search(/[{[]/);
  if (jsonStart !== -1) {
    const jsonEnd = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (jsonEnd !== -1) {
      try {
        return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      } catch {}
    }
  }

  return null;
}

// Persist to ai_results table
async function persistAiResult(pool, { user_id, endpoint, project_id, task_id, result, result_json }) {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        project_id INTEGER,
        task_id INTEGER,
        result TEXT,
        result_json JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    );
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, project_id, task_id, result, result_json)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, endpoint, project_id || null, task_id || null, result, result_json ? JSON.stringify(result_json) : null]
    );
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

// AI Task Breakdown
router.post('/task-breakdown', async (req, res) => {
  try {
    const { title, description, task_id } = req.body;
    const pool = req.app.locals.pool;

    const systemPrompt = `You are an expert project manager AI. Break down tasks into actionable subtasks.
Return ONLY valid JSON in this exact structure:
{
  "tasks": [
    {
      "title": "subtask title",
      "description": "what needs to be done",
      "story_points": 3,
      "assignee_type": "frontend|backend|fullstack|devops|qa|design",
      "priority": "critical|high|medium|low",
      "dependencies": []
    }
  ],
  "total_effort_hours": 20,
  "recommended_priority": "high",
  "suggested_story_points": 8,
  "risks": ["risk description"]
}`;

    const prompt = `Break down this task into detailed subtasks:\n\nTask: ${title}\nDescription: ${description || 'No additional description provided'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    if (task_id) {
      await pool.query('UPDATE tasks SET ai_breakdown = $1 WHERE id = $2', [aiResponse, task_id]);
    }

    const userId = req.user?.id;
    await persistAiResult(pool, { user_id: userId, endpoint: 'task-breakdown', task_id, result: aiResponse, result_json: parsed });

    res.json({ result: aiResponse, parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Sprint Planning
router.post('/sprint-planning', async (req, res) => {
  try {
    const { sprint_name, goal, team_capacity, velocity, backlog_items, sprint_id } = req.body;
    const pool = req.app.locals.pool;

    const systemPrompt = `You are an expert Agile coach and sprint planning AI assistant.
Return ONLY valid JSON in this exact structure:
{
  "recommended_stories": [
    {
      "id": "story-1",
      "title": "story title",
      "points": 5,
      "rationale": "why this story fits the sprint",
      "priority": "high"
    }
  ],
  "total_points": 40,
  "sprint_goal": "clear sprint goal statement",
  "risks": ["potential risk 1", "potential risk 2"],
  "capacity_utilization": 95,
  "velocity_forecast": "forecast statement",
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const prompt = `Plan this sprint:\n\nSprint: ${sprint_name}\nGoal: ${goal}\nTeam Capacity: ${team_capacity || 40} story points\nPrevious Velocity: ${velocity || 'Unknown'}\nBacklog Items: ${backlog_items || 'General backlog items available'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    if (sprint_id) {
      await pool.query('UPDATE sprints SET ai_suggestions = $1 WHERE id = $2', [aiResponse, sprint_id]);
    }

    const userId = req.user?.id;
    await persistAiResult(pool, { user_id: userId, endpoint: 'sprint-planning', result: aiResponse, result_json: parsed });

    res.json({ result: aiResponse, parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Risk Prediction
router.post('/risk-prediction', async (req, res) => {
  try {
    const { project_name, project_description, current_risks, team_size, timeline, risk_id } = req.body;
    const pool = req.app.locals.pool;

    const systemPrompt = `You are an expert risk assessment AI for software projects.
Return ONLY valid JSON in this exact structure:
{
  "risks": [
    {
      "title": "risk name",
      "probability": 4,
      "impact": 5,
      "score": 20,
      "mitigation_strategy": "how to mitigate",
      "timeline": "when this risk could materialize",
      "category": "technical|resource|financial|strategic|security"
    }
  ],
  "overall_risk_level": "low|medium|high|critical",
  "risk_score": 7,
  "risk_trend": "increasing|stable|decreasing",
  "recommended_actions": ["action 1", "action 2"],
  "predicted_issues_next_30_days": ["predicted issue 1"]
}`;

    const prompt = `Analyze risks for this project:\n\nProject: ${project_name}\nDescription: ${project_description || 'Software development project'}\nCurrent Known Risks: ${current_risks || 'None specified'}\nTeam Size: ${team_size || 'Not specified'}\nTimeline: ${timeline || 'Not specified'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);

    if (risk_id) {
      await pool.query('UPDATE risks SET ai_prediction = $1 WHERE id = $2', [aiResponse, risk_id]);
    }

    const userId = req.user?.id;
    await persistAiResult(pool, { user_id: userId, endpoint: 'risk-prediction', result: aiResponse, result_json: parsed });

    res.json({ result: aiResponse, parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Standup Summary (enhanced: fetch tasks by team + date)
router.post('/standup-summary', async (req, res) => {
  try {
    const { standups, project_name, team_ids, date } = req.body;
    const pool = req.app.locals.pool;

    let contextData = standups || '';

    // If team_ids provided, fetch task context from DB
    if (team_ids && Array.isArray(team_ids) && team_ids.length > 0) {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const yesterday = new Date(new Date(targetDate).getTime() - 86400000).toISOString().split('T')[0];

      const [completedYesterday, todayTasks, standupRows] = await Promise.all([
        pool.query(
          `SELECT t.title, u.name as assignee FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id
           WHERE t.assignee_id = ANY($1) AND t.status='done' AND DATE(t.due_date)=$2`,
          [team_ids, yesterday]
        ),
        pool.query(
          `SELECT t.title, u.name as assignee, t.status FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id
           WHERE t.assignee_id = ANY($1) AND t.status!='done' ORDER BY t.priority DESC LIMIT 20`,
          [team_ids]
        ),
        pool.query(
          `SELECT s.yesterday, s.today, s.blockers, s.mood, u.name FROM standups s JOIN users u ON s.user_id=u.id
           WHERE s.user_id = ANY($1) AND s.standup_date=$2`,
          [team_ids, targetDate]
        ),
      ]);

      if (standupRows.rows.length > 0) {
        contextData = standupRows.rows.map(s =>
          `${s.name}: Yesterday: ${s.yesterday || 'N/A'} | Today: ${s.today || 'N/A'} | Blockers: ${s.blockers || 'none'} | Mood: ${s.mood}`
        ).join('\n');
      }
      if (completedYesterday.rows.length > 0) {
        contextData += `\n\nCompleted yesterday: ${completedYesterday.rows.map(t=>`${t.title} (${t.assignee})`).join(', ')}`;
      }
      if (todayTasks.rows.length > 0) {
        contextData += `\n\nToday's tasks in progress: ${todayTasks.rows.slice(0,10).map(t=>`${t.title} (${t.assignee})`).join(', ')}`;
      }
    }

    const systemPrompt = `You are an expert Scrum Master AI that creates comprehensive standup summaries.
    Generate a team standup summary in this format:

    **Daily Standup Summary** - [Date]
    **Project**: [Project Name]

    **Team Progress Overview**
    [2-3 sentence summary of overall team progress]

    **Key Accomplishments** ✅
    - [Achievement 1]
    - [Achievement 2]

    **In Progress** 🔄
    - [Work item 1] - [Owner]

    **Blockers & Concerns** ⚠️
    - [Blocker 1] - Suggested Resolution: [suggestion]

    **Team Mood**: [Overall team sentiment]
    **Velocity Indicator**: [On track / Behind / Ahead]

    **Action Items**:
    1. [Action item with owner]

    **Tomorrow's Focus**:
    - [Priority item 1]`;

    const prompt = `Generate a standup summary:\n\nProject: ${project_name || 'Team Project'}\nDate: ${date || new Date().toISOString().split('T')[0]}\nStandup Updates:\n${contextData || 'No standup data provided'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    const userId = req.user?.id;
    await persistAiResult(pool, { user_id: userId, endpoint: 'standup-summary', result: aiResponse, result_json: null });

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Project Insights
router.post('/project-insights', async (req, res) => {
  try {
    const { project_name, description, progress, tasks_summary, team_size } = req.body;
    const systemPrompt = `You are a senior project management AI consultant.
    Provide project insights in this format:

    **Project Health Report**

    **Overall Status**: [🟢 Healthy / 🟡 At Risk / 🔴 Critical]
    **Health Score**: [1-100]

    **Key Insights**
    1. [Insight about progress]
    2. [Insight about team performance]
    3. [Insight about timeline]

    **Recommendations**
    - [Actionable recommendation 1]
    - [Actionable recommendation 2]

    **Predicted Completion**: [Date estimate]
    **Confidence Level**: [High/Medium/Low]`;

    const prompt = `Provide insights for this project:\n\nProject: ${project_name}\nDescription: ${description}\nProgress: ${progress}%\nTasks: ${tasks_summary || 'Various tasks in progress'}\nTeam Size: ${team_size || 'Not specified'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Retrospective Analysis
router.post('/retrospective-analysis', async (req, res) => {
  try {
    const { sprint_name, went_well, to_improve, action_items, mood_score, retro_id } = req.body;
    const pool = req.app.locals.pool;

    const systemPrompt = `You are an expert Agile coach specializing in sprint retrospectives.
    Analyze the retrospective data and provide insights in this format:

    **Retrospective Analysis**

    **Team Health Score**: [1-10] based on mood and feedback

    **Positive Patterns** ✅
    - [Pattern identified from what went well]

    **Areas of Concern** ⚠️
    - [Issue identified with suggested improvement]

    **Action Item Assessment**:
    | Action Item | Priority | Expected Impact | Owner Suggestion |
    |-------------|----------|-----------------|------------------|
    [Table rows]

    **Team Dynamics Insight**: [Analysis of team morale and collaboration]

    **Sprint-over-Sprint Trend**: [Improving/Stable/Declining]

    **Top 3 Recommendations**:
    1. [Highest impact improvement]
    2. [Quick win]
    3. [Long-term strategy]`;

    const prompt = `Analyze this sprint retrospective:\n\nSprint: ${sprint_name}\nWhat Went Well: ${went_well}\nWhat To Improve: ${to_improve}\nAction Items: ${action_items}\nTeam Mood Score: ${mood_score}/5`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    if (retro_id) {
      await pool.query('UPDATE retrospectives SET ai_analysis = $1 WHERE id = $2', [aiResponse, retro_id]);
    }

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Workload Optimization
router.post('/workload-optimization', async (req, res) => {
  try {
    const { team_data, tasks_data } = req.body;
    const systemPrompt = `You are an AI workload optimization specialist for software teams.
    Analyze the team workload and provide recommendations in this format:

    **Workload Analysis Report**

    **Overall Balance**: [Balanced / Imbalanced / Critical]

    **Team Utilization**
    | Team Member | Current Load | Capacity | Status |
    |-------------|-------------|----------|--------|
    [Table rows]

    **Recommended Reassignments**:
    1. Move [task] from [person A] to [person B] - Reason: [why]

    **Optimization Score**: [1-100]
    **Projected Improvement**: [X]% better throughput with recommended changes`;

    const prompt = `Optimize this team's workload:\n\nTeam Members:\n${team_data || 'Various team members with different capacities'}\n\nCurrent Tasks:\n${tasks_data || 'Multiple tasks across different priorities and projects'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Document Summary
router.post('/document-summary', async (req, res) => {
  try {
    const { title, content } = req.body;
    const systemPrompt = `You are a technical documentation specialist AI.
    Summarize the document in this format:

    **Document Summary**

    **Key Points**:
    1. [Main point 1]
    2. [Main point 2]

    **Technical Details**: [Brief technical summary]
    **Action Items**: [Any action items found in the document]
    **Dependencies**: [Any dependencies or prerequisites mentioned]
    **Recommendations**: [Suggestions for improvement]`;

    const prompt = `Summarize this document:\n\nTitle: ${title}\nContent: ${content || 'No content provided'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/history - paginated ai_results for logged-in user
router.get('/history', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Ensure table exists
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        project_id INTEGER,
        task_id INTEGER,
        result TEXT,
        result_json JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    );

    const result = await pool.query(
      `SELECT id, endpoint, project_id, task_id, result_json, created_at
       FROM ai_results
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_results WHERE user_id = $1',
      [userId]
    );

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

module.exports = router;
