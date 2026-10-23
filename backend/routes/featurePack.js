'use strict';
const express = require('express');
const { filterRecords, exportRecords, resolveAi } = require('../services/featurePack');
const AI_DEFS = [
  { key: 'task-risk-summary', title: 'Task risk summary', compute: (r) => { const now=new Date().toISOString(); return {label:'Task risk summary', blockedRecords:r.filter(x=>x.status==='blocked').length, highPriorityOpen:r.filter(x=>x.priority==='high'&&x.status!=='done'&&x.status!=='completed').length, overdueRecords:r.filter(x=>x.due_date&&String(x.due_date)<now&&x.status!=='done').length}; } },
  { key: 'sprint-load', title: 'Sprint load', compute: (r) => { const by={}; for(const x of r) by[String(x.status??'')]=(by[String(x.status??'')]||0)+1; return {label:'Sprint load', totalStoryPoints:r.reduce((a,x)=>a+(Number(x.story_points)||0),0), tasksWithZeroPoints:r.filter(x=>Number(x.story_points||0)===0).length, byStatus:by}; } },
  { key: 'overdue-triage', title: 'Overdue triage', compute: (r) => { const now=new Date().toISOString(); const o=r.filter(x=>x.due_date&&String(x.due_date)<now&&x.status!=='done'&&x.status!=='completed'); return {label:'Overdue triage', overdueRecords:o.length, overdueTitles:o.map(x=>x.title||''), hasOverdue:o.length>0}; } },
];
module.exports = function createFeaturePackRouter(authenticate, options = {}) {
  const router = express.Router();
  if (authenticate) router.use(authenticate);
  const load = options.loadRecords || (async () => []);
  router.get('/records', async (req, res) => res.json({ items: filterRecords(await load(req), req.query) }));
  router.get('/export', async (req, res) => { const out = exportRecords(filterRecords(await load(req), req.query), req.query.format); res.setHeader('Content-Type', out.contentType); res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`); return res.send(out.body); });
  router.get('/tasks/export', async (req, res) => { const out = exportRecords(filterRecords(await load(req), req.query), req.query.format); res.setHeader('Content-Type', out.contentType); return res.send(out.body); });
  router.post('/ai/:kind', async (req, res) => { const records = Array.isArray(req.body?.records) ? req.body.records : await load(req); const result = await resolveAi(req.params.kind, AI_DEFS, records); return result ? res.json(result) : res.status(404).json({ error: 'Unknown AI feature' }); });
  return router;
};
module.exports.AI_DEFS = AI_DEFS;
