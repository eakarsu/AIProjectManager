require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { Pool } = require('pg');
const { authenticateToken } = require('./middleware/auth');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');
const governanceRouter = require('./governance/router');
const { jwtSecret } = require('./config/security');

validateRuntime();

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

// Security middleware
app.use(helmet());
const allowedOrigins=String(process.env.CORS_ORIGINS||process.env.CLIENT_URL||'http://localhost:3000').split(',').map(v=>v.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>!origin||allowedOrigins.includes(origin)?cb(null,true):cb(new Error('Origin not allowed by CORS')),credentials:true}));
app.use(express.json());
app.use(createProviderGate(['/api/gap']));

// AI rate limiter: 20 requests per hour per user
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret());
        return `user_${decoded.id}`;
      } catch {}
    }
    return ipKeyGenerator(req.ip);
  },
  message: { error: 'Too many AI requests. Limit is 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no auth)
app.use('/api/auth', require('./routes/auth'));

// Apply global auth to all /api routes except /api/auth and /api/health
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/auth')) return next();
  authenticateToken(req, res, next);
});

// Apply AI rate limiter to project AI endpoints (must be before route registration)
app.use(/^\/api\/projects\/\d+\/ai-/, aiRateLimiter);

// Protected routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/standups', require('./routes/standups'));
app.use('/api/team', require('./routes/team'));
app.use('/api/ai', aiRateLimiter, require('./routes/ai'));
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
app.use('/api/governed-project-baselines', governanceRouter);

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

// Custom Views (mount BEFORE 404/listen)
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// AI feature mount: burnout-detection
app.use('/api/ai/burnout-detection', require('./routes/ai-burnout-detection'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-ai-timeline-estimation-under-velocitydepe', require('./routes/gap-no-ai-timeline-estimation-under-velocitydepe'));
app.use('/api/gap-no-ai-autoassignment-by-skills-and-workload', require('./routes/gap-no-ai-autoassignment-by-skills-and-workload'));
app.use('/api/gap-no-documenttotask-ingestion-requirements-pdf', require('./routes/gap-no-documenttotask-ingestion-requirements-pdf'));
app.use('/api/gap-no-ai-meeting-transcript-summarization-to-ta', require('./routes/gap-no-ai-meeting-transcript-summarization-to-ta'));
app.use('/api/gap-no-ai-burnoutsentiment-detection-across-stan', require('./routes/gap-no-ai-burnoutsentiment-detection-across-stan'));
app.use('/api/gap-no-public-webhook-system-or-outbound-integra', require('./routes/gap-no-public-webhook-system-or-outbound-integra'));
app.use('/api/gap-no-native-jiragithublinearslack-connectors', require('./routes/gap-no-native-jiragithublinearslack-connectors'));
app.use('/api/gap-no-formal-rbac-matrix-granular-permission-ro', require('./routes/gap-no-formal-rbac-matrix-granular-permission-ro'));
app.use('/api/gap-no-fileupload-route-attachments-rely-on-docu', require('./routes/gap-no-fileupload-route-attachments-rely-on-docu'));
app.use('/api/gap-no-ssooauth-provider-hookups', require('./routes/gap-no-ssooauth-provider-hookups'));
// === End Batch 07 ===
