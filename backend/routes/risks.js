const express = require('express');
const router = express.Router();

// Get all risks (with pagination)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // If no pagination params, return all for backward compat
    if (!req.query.page && !req.query.limit) {
      const result = await pool.query(`
        SELECT r.*, p.name as project_name, u.name as owner_name
        FROM risks r
        LEFT JOIN projects p ON r.project_id = p.id
        LEFT JOIN users u ON r.owner_id = u.id
        ORDER BY r.risk_score DESC, r.created_at DESC
      `);
      return res.json(result.rows);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT r.*, p.name as project_name, u.name as owner_name
      FROM risks r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN users u ON r.owner_id = u.id
      ORDER BY r.risk_score DESC, r.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM risks');

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

// Get single risk
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT r.*, p.name as project_name, u.name as owner_name
      FROM risks r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create risk
router.post('/', async (req, res) => {
  try {
    const { title, description, project_id, probability, impact, risk_score, status, category, mitigation, owner_id, ai_prediction } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO risks (title, description, project_id, probability, impact, risk_score, status, category, mitigation, owner_id, ai_prediction)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, description, project_id, probability || 'medium', impact || 'medium', risk_score || 5, status || 'open', category || 'technical', mitigation, owner_id, ai_prediction]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update risk
router.put('/:id', async (req, res) => {
  try {
    const { title, description, project_id, probability, impact, risk_score, status, category, mitigation, owner_id, ai_prediction } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE risks SET title=$1, description=$2, project_id=$3, probability=$4, impact=$5, risk_score=$6, status=$7, category=$8, mitigation=$9, owner_id=$10, ai_prediction=$11
       WHERE id=$12 RETURNING *`,
      [title, description, project_id, probability, impact, risk_score, status, category, mitigation, owner_id, ai_prediction, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete risk
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM risks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risk not found' });
    res.json({ message: 'Risk deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
