import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiFlag } from 'react-icons/fi';
import DatePickerInput from '../components/DatePickerInput';

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', project_id: '', target_date: '', status: 'in_progress', progress: 0 });

  const loadData = () => {
    fetch('/api/milestones').then(r => r.json()).then(setMilestones);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/milestones/${editing.id}` : '/api/milestones';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', project_id: '', target_date: '', status: 'in_progress', progress: 0 });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this milestone?')) return;
    await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (m) => {
    setForm({ name: m.name, description: m.description || '', project_id: m.project_id || '', target_date: m.target_date?.split('T')[0] || '', status: m.status, progress: m.progress || 0 });
    setEditing(m);
    setShowForm(true);
  };

  const statusIcon = (status) => {
    if (status === 'completed') return '&#x2705;';
    if (status === 'in_progress') return '&#x1F7E1;';
    return '&#x26AA;';
  };

  const daysUntil = (date) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Milestones</h1>
          <p>{milestones.length} milestones across all projects</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '', project_id: '', target_date: '', status: 'in_progress', progress: 0 }); setShowForm(true); }}>
            <FiPlus /> New Milestone
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Milestone</th><th>Project</th><th>Target Date</th><th>Days Left</th><th>Status</th><th>Progress</th></tr>
          </thead>
          <tbody>
            {milestones.map(m => {
              const days = daysUntil(m.target_date);
              return (
                <tr key={m.id} onClick={() => setSelected(m)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiFlag style={{ color: m.status === 'completed' ? '#10b981' : m.status === 'in_progress' ? '#f59e0b' : '#64748b' }} />
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#94a3b8' }}>{m.project_name || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{m.target_date?.split('T')[0] || '-'}</td>
                  <td>
                    {days !== null && (
                      <span style={{ color: days < 0 ? '#ef4444' : days < 14 ? '#f59e0b' : '#10b981', fontWeight: 600, fontSize: '13px' }}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                      </span>
                    )}
                  </td>
                  <td><span className={`badge badge-${m.status}`}>{m.status.replace('_', ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar" style={{ width: '100px' }}><div className="progress-fill" style={{ width: `${m.progress}%` }} /></div>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{m.progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Target Date</label><span>{selected.target_date?.split('T')[0] || '-'}</span></div>
                <div className="detail-item"><label>Progress</label><span>{selected.progress}%</span></div>
                <div className="detail-item detail-full"><label>Description</label><p>{selected.description || 'No description'}</p></div>
              </div>
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
              <h2>{editing ? 'Edit Milestone' : 'New Milestone'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Milestone name" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Milestone description" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>
                <div className="form-group"><label>Target Date</label><DatePickerInput value={form.target_date} onChange={v => setForm({ ...form, target_date: v })} placeholder="Pick target date..." /></div>
                <div className="form-group"><label>Progress (%)</label><input type="number" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Milestone</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
