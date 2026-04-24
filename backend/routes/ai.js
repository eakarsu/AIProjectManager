const express = require('express');
const router = express.Router();

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
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// AI Task Breakdown
router.post('/task-breakdown', async (req, res) => {
  try {
    const { title, description } = req.body;
    const systemPrompt = `You are an expert project manager AI. Break down tasks into actionable subtasks.
    Return your response in this exact format:

    **Task Analysis**
    [Brief analysis of the task complexity and scope]

    **Subtasks**
    1. [Subtask title] - [Estimated hours] hours
       - [Detail about what needs to be done]
    2. [Continue numbering...]

    **Estimated Total Effort**: [X] hours
    **Recommended Priority**: [Critical/High/Medium/Low]
    **Suggested Story Points**: [1-13]
    **Dependencies**: [List any dependencies or prerequisites]
    **Risks**: [Any risks associated with this task]`;

    const prompt = `Break down this task into detailed subtasks:\n\nTask: ${title}\nDescription: ${description || 'No additional description provided'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    // Save to task if task_id provided
    if (req.body.task_id) {
      const pool = req.app.locals.pool;
      await pool.query('UPDATE tasks SET ai_breakdown = $1 WHERE id = $2', [aiResponse, req.body.task_id]);
    }

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Sprint Planning
router.post('/sprint-planning', async (req, res) => {
  try {
    const { sprint_name, goal, team_capacity, velocity, backlog_items } = req.body;
    const systemPrompt = `You are an expert Agile coach and sprint planning AI assistant.
    Provide sprint planning recommendations in this format:

    **Sprint Overview**
    [Analysis of the sprint goal and capacity]

    **Recommended Task Allocation**
    | Task | Assignee Suggestion | Story Points | Priority |
    |------|-------------------|-------------|----------|
    [Table rows]

    **Velocity Forecast**: [Predicted velocity based on history]
    **Capacity Utilization**: [Percentage of capacity used]
    **Sprint Risks**:
    - [Risk 1]
    - [Risk 2]

    **Recommendations**:
    1. [Recommendation 1]
    2. [Recommendation 2]

    **Success Metrics**:
    - [Metric 1]
    - [Metric 2]`;

    const prompt = `Plan this sprint:\n\nSprint: ${sprint_name}\nGoal: ${goal}\nTeam Capacity: ${team_capacity || 40} story points\nPrevious Velocity: ${velocity || 'Unknown'}\nBacklog Items: ${backlog_items || 'General backlog items available'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    if (req.body.sprint_id) {
      const pool = req.app.locals.pool;
      await pool.query('UPDATE sprints SET ai_suggestions = $1 WHERE id = $2', [aiResponse, req.body.sprint_id]);
    }

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Risk Prediction
router.post('/risk-prediction', async (req, res) => {
  try {
    const { project_name, project_description, current_risks, team_size, timeline } = req.body;
    const systemPrompt = `You are an expert risk assessment AI for software projects.
    Analyze and predict risks in this format:

    **Risk Assessment Summary**
    [Overall risk level and brief assessment]

    **Identified Risks**

    🔴 **Critical Risks**
    - [Risk]: Impact [High/Critical], Probability [%]
      - Mitigation: [Strategy]

    🟡 **Moderate Risks**
    - [Risk]: Impact [Medium], Probability [%]
      - Mitigation: [Strategy]

    🟢 **Low Risks**
    - [Risk]: Impact [Low], Probability [%]
      - Mitigation: [Strategy]

    **Predicted Issues (Next 30 Days)**:
    1. [Predicted issue and likelihood]

    **Risk Score**: [1-10]
    **Recommended Actions**:
    1. [Action item with priority]

    **Risk Trend**: [Increasing/Stable/Decreasing]`;

    const prompt = `Analyze risks for this project:\n\nProject: ${project_name}\nDescription: ${project_description || 'Software development project'}\nCurrent Known Risks: ${current_risks || 'None specified'}\nTeam Size: ${team_size || 'Not specified'}\nTimeline: ${timeline || 'Not specified'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

    if (req.body.risk_id) {
      const pool = req.app.locals.pool;
      await pool.query('UPDATE risks SET ai_prediction = $1 WHERE id = $2', [aiResponse, req.body.risk_id]);
    }

    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Standup Summary
router.post('/standup-summary', async (req, res) => {
  try {
    const { standups, project_name } = req.body;
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
    - [Work item 2] - [Owner]

    **Blockers & Concerns** ⚠️
    - [Blocker 1] - Suggested Resolution: [suggestion]

    **Team Mood**: [Overall team sentiment]
    **Velocity Indicator**: [On track / Behind / Ahead]

    **Action Items**:
    1. [Action item with owner]

    **Tomorrow's Focus**:
    - [Priority item 1]`;

    const prompt = `Generate a standup summary:\n\nProject: ${project_name || 'Team Project'}\nStandup Updates:\n${standups || 'No standup data provided'}`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);

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
    const { sprint_name, went_well, to_improve, action_items, mood_score } = req.body;
    const systemPrompt = `You are an expert Agile coach specializing in sprint retrospectives.
    Analyze the retrospective data and provide insights in this format:

    **Retrospective Analysis**

    **Team Health Score**: [1-10] based on mood and feedback

    **Positive Patterns** ✅
    - [Pattern identified from what went well]
    - [Strength to continue leveraging]

    **Areas of Concern** ⚠️
    - [Issue identified with suggested improvement]
    - [Recurring problem and root cause analysis]

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

    if (req.body.retro_id) {
      const pool = req.app.locals.pool;
      await pool.query('UPDATE retrospectives SET ai_analysis = $1 WHERE id = $2', [aiResponse, req.body.retro_id]);
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

    **Overloaded Members** 🔴
    - [Member]: [Current tasks] tasks, [Suggestion to rebalance]

    **Underutilized Members** 🟢
    - [Member]: [Available capacity], [Tasks they could take on]

    **Recommended Reassignments**:
    1. Move [task] from [person A] to [person B] - Reason: [why]

    **Bottleneck Detection**:
    - [Identified bottleneck and impact]

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
    3. [Main point 3]

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

module.exports = router;
