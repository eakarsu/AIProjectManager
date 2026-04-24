import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';
import DatePickerInput from '../components/DatePickerInput';

export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', project_id: '', start_date: '', end_date: '', status: 'planning', velocity: 0, capacity: 40 });

  const loadData = () => {
    fetch('/api/sprints').then(r => r.json()).then(setSprints);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/sprints/${editing.id}` : '/api/sprints';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', goal: '', project_id: '', start_date: '', end_date: '', status: 'planning', velocity: 0, capacity: 40 });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sprint?')) return;
    await fetch(`/api/sprints/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, goal: s.goal || '', project_id: s.project_id || '', start_date: s.start_date?.split('T')[0] || '', end_date: s.end_date?.split('T')[0] || '', status: s.status, velocity: s.velocity || 0, capacity: s.capacity || 40 });
    setEditing(s);
    setShowForm(true);
  };

  const handleAI = async (s) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/sprint-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprint_name: s.name, goal: s.goal, team_capacity: s.capacity, velocity: s.velocity, sprint_id: s.id }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setAiLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sprints</h1>
          <p>{sprints.length} total sprints</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', goal: '', project_id: '', start_date: '', end_date: '', status: 'planning', velocity: 0, capacity: 40 }); setShowForm(true); }}>
            <FiPlus /> New Sprint
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Sprint</th><th>Project</th><th>Status</th><th>Velocity</th><th>Capacity</th><th>Tasks</th><th>Timeline</th></tr>
          </thead>
          <tbody>
            {sprints.map(s => (
              <tr key={s.id} onClick={() => { setSelected(s); setAiResult(s.ai_suggestions || ''); }}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{s.project_name || '-'}</td>
                <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                <td>
                  <span style={{ background: '#2d2f45', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{s.velocity}</span>
                </td>
                <td><span style={{ fontSize: '13px' }}>{s.capacity} pts</span></td>
                <td><span style={{ fontSize: '13px' }}>{s.completed_tasks}/{s.task_count}</span></td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{s.start_date?.split('T')[0]} - {s.end_date?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selected.status}`}>{selected.status}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Velocity</label><span>{selected.velocity} pts</span></div>
                <div className="detail-item"><label>Capacity</label><span>{selected.capacity} pts</span></div>
                <div className="detail-item"><label>Tasks Completed</label><span>{selected.completed_tasks}/{selected.task_count}</span></div>
                <div className="detail-item"><label>Timeline</label><span>{selected.start_date?.split('T')[0]} to {selected.end_date?.split('T')[0]}</span></div>
                <div className="detail-item detail-full"><label>Sprint Goal</label><p>{selected.goal || 'No goal set'}</p></div>
              </div>
              <button className="btn btn-ai btn-sm" onClick={() => handleAI(selected)}>
                &#x2728; AI Sprint Planning
              </button>
              <AIOutput content={aiResult} title="AI Sprint Planning Suggestions" loading={aiLoading} />
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
              <h2>{editing ? 'Edit Sprint' : 'New Sprint'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sprint name" /></div>
              <div className="form-group"><label>Goal</label><textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Sprint goal" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="planning">Planning</option><option value="active">Active</option><option value="completed">Completed</option></select></div>
                <div className="form-group"><label>Start Date</label><DatePickerInput value={form.start_date} onChange={v => setForm({ ...form, start_date: v })} placeholder="Pick start date..." /></div>
                <div className="form-group"><label>End Date</label><DatePickerInput value={form.end_date} onChange={v => setForm({ ...form, end_date: v })} minDate={form.start_date} placeholder="Pick end date..." /></div>
                <div className="form-group"><label>Velocity</label><input type="number" min="0" value={form.velocity} onChange={e => setForm({ ...form, velocity: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label>Capacity</label><input type="number" min="0" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 40 })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Sprint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
