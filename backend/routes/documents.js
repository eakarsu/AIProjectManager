const express = require('express');
const router = express.Router();

// Get all documents
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT d.*, p.name as project_name, u.name as uploaded_by_name, u.avatar_color
      FROM documents d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT d.*, p.name as project_name, u.name as uploaded_by_name, u.avatar_color
      FROM documents d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create document
router.post('/', async (req, res) => {
  try {
    const { title, content, project_id, uploaded_by, doc_type, version } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `INSERT INTO documents (title, content, project_id, uploaded_by, doc_type, version)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, project_id, uploaded_by, doc_type || 'document', version || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const { title, content, project_id, uploaded_by, doc_type, version } = req.body;
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `UPDATE documents SET title=$1, content=$2, project_id=$3, uploaded_by=$4, doc_type=$5, version=$6
       WHERE id=$7 RETURNING *`,
      [title, content, project_id, uploaded_by, doc_type, version, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
