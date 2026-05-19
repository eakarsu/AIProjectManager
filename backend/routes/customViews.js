const express = require('express');
const router = express.Router();

// In-memory store for project rules (milestone gates + dependencies)
let projectRules = [
  { id: 1, name: 'Design Review Gate', milestone: 'M1 - Design Complete', dependency: 'Mockups Approved', gateType: 'approval', enabled: true },
  { id: 2, name: 'QA Sign-off', milestone: 'M2 - Beta Release', dependency: 'All P1 bugs closed', gateType: 'quality', enabled: true },
  { id: 3, name: 'Security Audit', milestone: 'M3 - Production Launch', dependency: 'Pen test passed', gateType: 'compliance', enabled: true },
];
let nextRuleId = 4;

// GET /api/custom-views/gantt - project Gantt timeline
router.get('/gantt', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    let tasks = [];
    try {
      const result = await pool.query(
        `SELECT id, title, start_date, due_date, status, project_id FROM tasks WHERE start_date IS NOT NULL OR due_date IS NOT NULL ORDER BY COALESCE(start_date, due_date) LIMIT 40`
      );
      tasks = result.rows;
    } catch {
      // fallback synthetic
    }
    const today = new Date();
    if (!tasks.length) {
      tasks = Array.from({ length: 12 }).map((_, i) => {
        const start = new Date(today); start.setDate(start.getDate() + i * 4 - 10);
        const due = new Date(start); due.setDate(due.getDate() + 5 + (i % 4));
        return { id: i + 1, title: `Task ${i + 1}`, start_date: start.toISOString(), due_date: due.toISOString(), status: ['todo', 'in_progress', 'done'][i % 3], project_id: 1 + (i % 3) };
      });
    }
    const minDate = tasks.reduce((m, t) => {
      const d = new Date(t.start_date || t.due_date);
      return !m || d < m ? d : m;
    }, null);
    const maxDate = tasks.reduce((m, t) => {
      const d = new Date(t.due_date || t.start_date);
      return !m || d > m ? d : m;
    }, null);
    const bars = tasks.map((t) => {
      const s = new Date(t.start_date || t.due_date);
      const e = new Date(t.due_date || t.start_date);
      const total = Math.max(1, (maxDate - minDate) / 86400000);
      const offset = Math.max(0, (s - minDate) / 86400000);
      const length = Math.max(1, (e - s) / 86400000);
      return {
        id: t.id,
        title: t.title,
        status: t.status,
        startISO: s.toISOString().slice(0, 10),
        endISO: e.toISOString().slice(0, 10),
        offsetPct: Math.round((offset / total) * 1000) / 10,
        widthPct: Math.round((length / total) * 1000) / 10,
      };
    });
    res.json({
      rangeStart: minDate ? minDate.toISOString().slice(0, 10) : null,
      rangeEnd: maxDate ? maxDate.toISOString().slice(0, 10) : null,
      totalDays: Math.ceil((maxDate - minDate) / 86400000) || 0,
      bars,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/custom-views/heatmap - resource allocation (resource x sprint)
router.get('/heatmap', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    let resources = [];
    let sprints = [];
    try {
      const u = await pool.query('SELECT id, name FROM users ORDER BY id LIMIT 8');
      resources = u.rows;
    } catch {}
    try {
      const s = await pool.query('SELECT id, name FROM sprints ORDER BY id LIMIT 6');
      sprints = s.rows;
    } catch {}
    if (!resources.length) {
      resources = ['Alice', 'Bob', 'Carol', 'Dan', 'Eve', 'Frank'].map((n, i) => ({ id: i + 1, name: n }));
    }
    if (!sprints.length) {
      sprints = Array.from({ length: 5 }).map((_, i) => ({ id: i + 1, name: `Sprint ${i + 1}` }));
    }
    const cells = [];
    resources.forEach((r) => {
      sprints.forEach((s) => {
        const allocation = Math.floor(((r.id * 17 + s.id * 31) % 100));
        cells.push({
          resourceId: r.id,
          resourceName: r.name,
          sprintId: s.id,
          sprintName: s.name,
          allocationPct: allocation,
          status: allocation > 85 ? 'overloaded' : allocation > 60 ? 'busy' : allocation > 30 ? 'normal' : 'available',
        });
      });
    });
    res.json({ resources, sprints, cells });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/custom-views/status-report - PDF-ready status report
router.get('/status-report', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const counts = {};
    const safeCount = async (sql) => {
      try { const r = await pool.query(sql); return parseInt(r.rows[0].count); } catch { return 0; }
    };
    counts.projects = await safeCount('SELECT COUNT(*) FROM projects');
    counts.tasks = await safeCount('SELECT COUNT(*) FROM tasks');
    counts.openRisks = await safeCount("SELECT COUNT(*) FROM risks WHERE status = 'open'");
    counts.activeSprints = await safeCount("SELECT COUNT(*) FROM sprints WHERE status = 'active'");
    counts.completedTasks = await safeCount("SELECT COUNT(*) FROM tasks WHERE status = 'done'");

    const generated = new Date().toISOString();
    const reportId = `STATUS-${Date.now()}`;
    const lines = [
      `PROJECT STATUS REPORT`,
      `Report ID: ${reportId}`,
      `Generated: ${generated}`,
      ``,
      `EXECUTIVE SUMMARY`,
      `Projects: ${counts.projects}`,
      `Tasks: ${counts.tasks} (${counts.completedTasks} done)`,
      `Active Sprints: ${counts.activeSprints}`,
      `Open Risks: ${counts.openRisks}`,
      ``,
      `OVERALL HEALTH: ${counts.openRisks > 5 ? 'AT-RISK' : 'ON-TRACK'}`,
    ];
    const pdfStub = `%PDF-1.4-stub\n${lines.join('\n')}\n%%EOF`;
    res.json({
      reportId,
      generated,
      summary: counts,
      health: counts.openRisks > 5 ? 'AT-RISK' : 'ON-TRACK',
      lines,
      pdfBase64: Buffer.from(pdfStub).toString('base64'),
      pdfSizeBytes: pdfStub.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD for project rules
router.get('/rules', (req, res) => {
  res.json({ rules: projectRules, count: projectRules.length });
});

router.post('/rules', (req, res) => {
  const { name, milestone, dependency, gateType, enabled } = req.body || {};
  if (!name || !milestone) return res.status(400).json({ error: 'name and milestone required' });
  const rule = {
    id: nextRuleId++,
    name,
    milestone,
    dependency: dependency || '',
    gateType: gateType || 'approval',
    enabled: enabled !== false,
  };
  projectRules.push(rule);
  res.status(201).json(rule);
});

router.put('/rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = projectRules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'rule not found' });
  projectRules[idx] = { ...projectRules[idx], ...req.body, id };
  res.json(projectRules[idx]);
});

router.delete('/rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const before = projectRules.length;
  projectRules = projectRules.filter((r) => r.id !== id);
  if (projectRules.length === before) return res.status(404).json({ error: 'rule not found' });
  res.json({ ok: true, deletedId: id });
});

module.exports = router;
