require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_project_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Make pool available to routes
app.locals.pool = pool;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/standups', require('./routes/standups'));
app.use('/api/team', require('./routes/team'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/labels', require('./routes/labels'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/timelogs', require('./routes/timelogs'));
app.use('/api/retrospectives', require('./routes/retrospectives'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/search', require('./routes/search'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const projects = await pool.query('SELECT COUNT(*) FROM projects');
    const tasks = await pool.query('SELECT COUNT(*) FROM tasks');
    const activeSprints = await pool.query("SELECT COUNT(*) FROM sprints WHERE status = 'active'");
    const openRisks = await pool.query("SELECT COUNT(*) FROM risks WHERE status = 'open'");
    const teamMembers = await pool.query('SELECT COUNT(DISTINCT user_id) FROM team_members');
    const todayStandups = await pool.query("SELECT COUNT(*) FROM standups WHERE standup_date = CURRENT_DATE");
    const milestones = await pool.query('SELECT COUNT(*) FROM milestones');
    const documents = await pool.query('SELECT COUNT(*) FROM documents');
    const timelogs = await pool.query('SELECT COUNT(*) FROM time_logs');
    const retros = await pool.query('SELECT COUNT(*) FROM retrospectives');
    const unreadNotifs = await pool.query("SELECT COUNT(*) FROM notifications WHERE is_read = false");
    const comments = await pool.query('SELECT COUNT(*) FROM comments');
    const labels = await pool.query('SELECT COUNT(*) FROM labels');

    res.json({
      projects: parseInt(projects.rows[0].count),
      tasks: parseInt(tasks.rows[0].count),
      activeSprints: parseInt(activeSprints.rows[0].count),
      openRisks: parseInt(openRisks.rows[0].count),
      teamMembers: parseInt(teamMembers.rows[0].count),
      todayStandups: parseInt(todayStandups.rows[0].count),
      milestones: parseInt(milestones.rows[0].count),
      documents: parseInt(documents.rows[0].count),
      timelogs: parseInt(timelogs.rows[0].count),
      retrospectives: parseInt(retros.rows[0].count),
      unreadNotifications: parseInt(unreadNotifs.rows[0].count),
      comments: parseInt(comments.rows[0].count),
      labels: parseInt(labels.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
