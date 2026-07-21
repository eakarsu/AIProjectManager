const express = require('express');
const router = express.Router();
const TEAM_ROLES = new Set(['developer', 'designer', 'qa', 'analyst', 'viewer']);
const requireManager = (req, res, next) => ['admin', 'project_manager', 'portfolio_manager'].includes(req.user?.role)
  ? next()
  : res.status(403).json({ error: 'Project manager role required' });

// Get all team members
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT tm.*, u.name as user_name, u.email, u.avatar_color, u.role as user_role, p.name as project_name
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      LEFT JOIN projects p ON tm.project_id = p.id
      ORDER BY tm.joined_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT tm.*, u.name as user_name, u.email, u.avatar_color, u.role as user_role, p.name as project_name
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      LEFT JOIN projects p ON tm.project_id = p.id
      WHERE tm.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Team member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for dropdowns)
router.get('/users/all', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT id, name, email, role, avatar_color FROM users ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create team member
router.post('/', requireManager, async (req, res) => {
  try {
    const { user_id, project_id, role, availability, skills } = req.body;
    if (role && !TEAM_ROLES.has(role)) return res.status(400).json({ error: 'Unsupported project role' });
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO team_members (user_id, project_id, role, availability, skills)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, project_id, role || 'developer', availability || 100, skills]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update team member
router.put('/:id', requireManager, async (req, res) => {
  try {
    const { user_id, project_id, role, availability, skills } = req.body;
    if (!TEAM_ROLES.has(role)) return res.status(400).json({ error: 'Unsupported project role' });
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE team_members SET user_id=$1, project_id=$2, role=$3, availability=$4, skills=$5
       WHERE id=$6 RETURNING *`,
      [user_id, project_id, role, availability, skills, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Team member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete team member
router.delete('/:id', requireManager, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Team member not found' });
    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
