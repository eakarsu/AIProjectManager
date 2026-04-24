import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';
import DatePickerInput from '../components/DatePickerInput';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', project_id: '', sprint_id: '', story_points: 1, due_date: '', task_type: 'feature' });

  const loadData = () => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
    fetch('/api/sprints').then(r => r.json()).then(setSprints);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/tasks/${editing.id}` : '/api/tasks';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', project_id: '', sprint_id: '', story_points: 1, due_date: '', task_type: 'feature' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (t) => {
    setForm({ title: t.title, description: t.description || '', status: t.status, priority: t.priority, assignee_id: t.assignee_id || '', project_id: t.project_id || '', sprint_id: t.sprint_id || '', story_points: t.story_points || 1, due_date: t.due_date?.split('T')[0] || '', task_type: t.task_type || 'feature' });
    setEditing(t);
    setShowForm(true);
  };

  const handleAIBreakdown = async (t) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/task-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t.title, description: t.description, task_id: t.id }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setAiLoading(false);
  };

  const statusColors = { todo: '#fbbf24', in_progress: '#60a5fa', done: '#34d399' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>{tasks.length} total tasks</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', project_id: '', sprint_id: '', story_points: 1, due_date: '', task_type: 'feature' }); setShowForm(true); }}>
            <FiPlus /> New Task
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Project</th><th>Points</th><th>Type</th></tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} onClick={() => { setSelected(t); setAiResult(t.ai_breakdown || ''); }}>
                <td style={{ fontWeight: 500 }}>{t.title}</td>
                <td><span className={`badge badge-${t.status}`}>{t.status.replace('_', ' ')}</span></td>
                <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                <td>{t.assignee_name || '-'}</td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{t.project_name || '-'}</td>
                <td>
                  <span style={{ background: '#2d2f45', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{t.story_points}</span>
                </td>
                <td><span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.task_type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</span></div>
                <div className="detail-item"><label>Priority</label><span className={`badge badge-${selected.priority}`}>{selected.priority}</span></div>
                <div className="detail-item"><label>Assignee</label><span>{selected.assignee_name || 'Unassigned'}</span></div>
                <div className="detail-item"><label>Story Points</label><span>{selected.story_points}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Sprint</label><span>{selected.sprint_name || '-'}</span></div>
                <div className="detail-item"><label>Type</label><span>{selected.task_type}</span></div>
                <div className="detail-item"><label>Due Date</label><span>{selected.due_date?.split('T')[0] || '-'}</span></div>
                <div className="detail-item detail-full"><label>Description</label><p>{selected.description || 'No description'}</p></div>
              </div>
              <button className="btn btn-ai btn-sm" onClick={() => handleAIBreakdown(selected)}>
                &#x2728; AI Auto-Breakdown
              </button>
              <AIOutput content={aiResult} title="AI Task Breakdown" loading={aiLoading} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { handleEdit(selected); setSelected(null); }}><FiEdit2 /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Task description" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></div>
                <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                <div className="form-group"><label>Assignee</label><select value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: e.target.value })}><option value="">Unassigned</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="form-group"><label>Sprint</label><select value={form.sprint_id} onChange={e => setForm({ ...form, sprint_id: e.target.value })}><option value="">Select Sprint</option>{sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div className="form-group"><label>Story Points</label><input type="number" min="1" max="13" value={form.story_points} onChange={e => setForm({ ...form, story_points: parseInt(e.target.value) || 1 })} /></div>
                <div className="form-group"><label>Due Date</label><DatePickerInput value={form.due_date} onChange={v => setForm({ ...form, due_date: v })} placeholder="Pick due date..." /></div>
                <div className="form-group"><label>Type</label><select value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })}><option value="feature">Feature</option><option value="bug">Bug</option><option value="improvement">Improvement</option><option value="documentation">Documentation</option><option value="devops">DevOps</option></select></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
