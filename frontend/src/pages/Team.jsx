import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ user_id: '', project_id: '', role: 'developer', availability: 100, skills: '' });

  const loadData = () => {
    fetch('/api/team').then(r => r.json()).then(setMembers);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/team/${editing.id}` : '/api/team';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ user_id: '', project_id: '', role: 'developer', availability: 100, skills: '' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (m) => {
    setForm({ user_id: m.user_id || '', project_id: m.project_id || '', role: m.role || 'developer', availability: m.availability || 100, skills: m.skills || '' });
    setEditing(m);
    setShowForm(true);
  };

  const availabilityColor = (val) => {
    if (val >= 80) return '#10b981';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <p>{members.length} team assignments</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ user_id: '', project_id: '', role: 'developer', availability: 100, skills: '' }); setShowForm(true); }}>
            <FiPlus /> Add Team Member
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Member</th><th>Email</th><th>Project</th><th>Role</th><th>Availability</th><th>Skills</th></tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} onClick={() => setSelected(m)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: m.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                      {m.user_name?.[0]}
                    </div>
                    <span style={{ fontWeight: 500 }}>{m.user_name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{m.email}</td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{m.project_name || '-'}</td>
                <td><span className="badge badge-active">{m.role}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="progress-bar" style={{ width: '60px' }}>
                      <div className="progress-fill" style={{ width: `${m.availability}%`, background: availabilityColor(m.availability) }} />
                    </div>
                    <span style={{ fontSize: '12px', color: availabilityColor(m.availability) }}>{m.availability}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {m.skills?.split(',').slice(0, 3).map((s, i) => (
                      <span key={i} style={{ background: '#2d2f45', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: selected.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'white' }}>
                  {selected.user_name?.[0]}
                </div>
                <h2>{selected.user_name}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Email</label><span>{selected.email}</span></div>
                <div className="detail-item"><label>User Role</label><span>{selected.user_role}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Team Role</label><span>{selected.role}</span></div>
                <div className="detail-item"><label>Availability</label><span style={{ color: availabilityColor(selected.availability), fontWeight: 600 }}>{selected.availability}%</span></div>
                <div className="detail-item"><label>Joined</label><span>{selected.joined_at?.split('T')[0] || '-'}</span></div>
                <div className="detail-item detail-full"><label>Skills</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {selected.skills?.split(',').map((s, i) => (
                      <span key={i} style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { handleEdit(selected); setSelected(null); }}><FiEdit2 /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}><FiTrash2 /> Remove</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>User</label><select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}><option value="">Select User</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="form-group"><label>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="developer">Developer</option><option value="Tech Lead">Tech Lead</option><option value="QA Engineer">QA Engineer</option><option value="Designer">Designer</option><option value="DevOps">DevOps</option><option value="Product Manager">Product Manager</option><option value="Project Manager">Project Manager</option></select></div>
                <div className="form-group"><label>Availability (%)</label><input type="number" min="0" max="100" value={form.availability} onChange={e => setForm({ ...form, availability: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="form-group"><label>Skills (comma separated)</label><input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Python, AWS" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Add'} Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
