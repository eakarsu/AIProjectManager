const express = require('express');
const router = express.Router();

// Global search
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) return res.json({ results: [] });

    const pool = req.app.locals.pool;
    const searchTerm = `%${q.toLowerCase()}%`;

    const [projects, tasks, sprints, risks, team, milestones, documents] = await Promise.all([
      pool.query(`SELECT id, name as title, description, 'project' as type, status FROM projects WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 10`, [searchTerm]),
      pool.query(`SELECT id, title, description, 'task' as type, status FROM tasks WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 10`, [searchTerm]),
      pool.query(`SELECT id, name as title, goal as description, 'sprint' as type, status FROM sprints WHERE LOWER(name) LIKE $1 OR LOWER(goal) LIKE $1 LIMIT 10`, [searchTerm]),
      pool.query(`SELECT id, title, description, 'risk' as type, status FROM risks WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 10`, [searchTerm]),
      pool.query(`SELECT tm.id, u.name as title, u.email as description, 'team' as type, tm.role as status FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE LOWER(u.name) LIKE $1 OR LOWER(u.email) LIKE $1 LIMIT 10`, [searchTerm]),
      pool.query(`SELECT id, name as title, description, 'milestone' as type, status FROM milestones WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 10`, [searchTerm]),
      pool.query(`SELECT id, title, content as description, 'document' as type, doc_type as status FROM documents WHERE LOWER(title) LIKE $1 OR LOWER(content) LIKE $1 LIMIT 10`, [searchTerm]),
    ]);

    const results = [
      ...projects.rows,
      ...tasks.rows,
      ...sprints.rows,
      ...risks.rows,
      ...team.rows,
      ...milestones.rows,
      ...documents.rows,
    ];

    res.json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
