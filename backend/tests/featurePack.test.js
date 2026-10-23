'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const express = require('express');
const { filterRecords, exportRecords } = require('../services/featurePack');
const createRouter = require('../routes/featurePack');
test('filter/csv preserve false/0/empty', () => {
  const rows = [{ title: 'Alpha task', status: 'todo', story_points: 0, flagged: false, description: '' }, { title: 'Beta', status: 'done', story_points: 3 }];
  assert.equal(filterRecords(rows, { search: 'alpha' })[0].flagged, false);
  assert.match(exportRecords(rows, 'csv').body, /false/);
});
test('export + AI fallback over injected own records', async () => {
  delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
  const app = express(); app.use(express.json());
  app.use((req, res, next) => { req.user = { id: 1 }; next(); });
  app.use('/fp', createRouter(null, { loadRecords: async () => [{ title: 'Alpha', status: 'blocked', story_points: 0, flagged: false }, { title: 'Beta', status: 'done', story_points: 3 }] }));
  const s = app.listen(0); const base = `http://127.0.0.1:${s.address().port}`;
  try {
    const csv = await fetch(`${base}/fp/export?format=csv`); assert.match(csv.headers.get('content-type'), /text\/csv/);
    const ai = await (await fetch(`${base}/fp/ai/task-risk-summary`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).json();
    assert.equal(ai.aiGenerated, false); assert.ok(ai.sections['Task risk summary']); assert.equal(ai.sections.Overview.totalRecords, 2);
  } finally { s.close(); }
});
