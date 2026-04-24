import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';
import DatePickerInput from '../components/DatePickerInput';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'active', priority: 'medium', start_date: '', end_date: '', owner_id: '', progress: 0 });

  const loadData = () => {
    fetch('/api/projects').then(r => r.json()).then(setProjects);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/projects/${editing.id}` : '/api/projects';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', status: 'active', priority: 'medium', start_date: '', end_date: '', owner_id: '', progress: 0 });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', status: p.status, priority: p.priority, start_date: p.start_date?.split('T')[0] || '', end_date: p.end_date?.split('T')[0] || '', owner_id: p.owner_id || '', progress: p.progress || 0 });
    setEditing(p);
    setShowForm(true);
  };

  const handleAI = async (p) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/project-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: p.name, description: p.description, progress: p.progress, team_size: '5-10' }),
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
          <h1>Projects</h1>
          <p>{projects.length} total projects</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '', status: 'active', priority: 'medium', start_date: '', end_date: '', owner_id: '', progress: 0 }); setShowForm(true); }}>
            <FiPlus /> New Project
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Project</th><th>Status</th><th>Priority</th><th>Owner</th><th>Progress</th><th>Timeline</th></tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} onClick={() => { setSelected(p); setAiResult(''); }}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                <td><span className={`badge badge-${p.priority}`}>{p.priority}</span></td>
                <td>{p.owner_name || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '80px' }}><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{p.progress}%</span>
                  </div>
                </td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{p.start_date?.split('T')[0]} - {p.end_date?.split('T')[0]}</td>
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
                <div className="detail-item"><label>Priority</label><span className={`badge badge-${selected.priority}`}>{selected.priority}</span></div>
                <div className="detail-item"><label>Owner</label><span>{selected.owner_name || 'Unassigned'}</span></div>
                <div className="detail-item"><label>Progress</label><span>{selected.progress}%</span></div>
                <div className="detail-item"><label>Start Date</label><span>{selected.start_date?.split('T')[0] || '-'}</span></div>
                <div className="detail-item"><label>End Date</label><span>{selected.end_date?.split('T')[0] || '-'}</span></div>
                <div className="detail-item detail-full"><label>Description</label><p>{selected.description || 'No description'}</p></div>
              </div>
              <button className="btn btn-ai btn-sm" onClick={() => handleAI(selected)}>
                &#x2728; Get AI Project Insights
              </button>
              <AIOutput content={aiResult} title="AI Project Insights" loading={aiLoading} />
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
              <h2>{editing ? 'Edit Project' : 'New Project'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Project description" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="planning">Planning</option><option value="completed">Completed</option><option value="on_hold">On Hold</option></select></div>
                <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                <div className="form-group"><label>Start Date</label><DatePickerInput value={form.start_date} onChange={v => setForm({ ...form, start_date: v })} placeholder="Pick start date..." /></div>
                <div className="form-group"><label>End Date</label><DatePickerInput value={form.end_date} onChange={v => setForm({ ...form, end_date: v })} minDate={form.start_date} placeholder="Pick end date..." /></div>
                <div className="form-group"><label>Owner</label><select value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}><option value="">Select Owner</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="form-group"><label>Progress (%)</label><input type="number" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
