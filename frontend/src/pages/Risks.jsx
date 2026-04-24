import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';

export default function Risks() {
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project_id: '', probability: 'medium', impact: 'medium', risk_score: 5, status: 'open', category: 'technical', mitigation: '', owner_id: '' });

  const loadData = () => {
    fetch('/api/risks').then(r => r.json()).then(setRisks);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/risks/${editing.id}` : '/api/risks';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', description: '', project_id: '', probability: 'medium', impact: 'medium', risk_score: 5, status: 'open', category: 'technical', mitigation: '', owner_id: '' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this risk?')) return;
    await fetch(`/api/risks/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (r) => {
    setForm({ title: r.title, description: r.description || '', project_id: r.project_id || '', probability: r.probability, impact: r.impact, risk_score: r.risk_score || 5, status: r.status, category: r.category || 'technical', mitigation: r.mitigation || '', owner_id: r.owner_id || '' });
    setEditing(r);
    setShowForm(true);
  };

  const handleAI = async (r) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const project = projects.find(p => p.id === r.project_id);
      const res = await fetch('/api/ai/risk-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: project?.name || 'Project',
          project_description: project?.description || '',
          current_risks: r.title + ': ' + r.description,
          risk_id: r.id,
        }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setAiLoading(false);
  };

  const scoreColor = (score) => {
    if (score >= 8) return '#ef4444';
    if (score >= 5) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Risks</h1>
          <p>{risks.length} total risks</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ title: '', description: '', project_id: '', probability: 'medium', impact: 'medium', risk_score: 5, status: 'open', category: 'technical', mitigation: '', owner_id: '' }); setShowForm(true); }}>
            <FiPlus /> New Risk
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Risk</th><th>Project</th><th>Probability</th><th>Impact</th><th>Score</th><th>Status</th><th>Category</th><th>Owner</th></tr>
          </thead>
          <tbody>
            {risks.map(r => (
              <tr key={r.id} onClick={() => { setSelected(r); setAiResult(r.ai_prediction || ''); }}>
                <td style={{ fontWeight: 500 }}>{r.title}</td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{r.project_name || '-'}</td>
                <td><span className={`badge badge-${r.probability}`}>{r.probability}</span></td>
                <td><span className={`badge badge-${r.impact}`}>{r.impact}</span></td>
                <td>
                  <span style={{ background: `${scoreColor(r.risk_score)}20`, color: scoreColor(r.risk_score), padding: '2px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                    {r.risk_score}
                  </span>
                </td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{r.category}</td>
                <td>{r.owner_name || '-'}</td>
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
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selected.status}`}>{selected.status}</span></div>
                <div className="detail-item"><label>Category</label><span>{selected.category}</span></div>
                <div className="detail-item"><label>Probability</label><span className={`badge badge-${selected.probability}`}>{selected.probability}</span></div>
                <div className="detail-item"><label>Impact</label><span className={`badge badge-${selected.impact}`}>{selected.impact}</span></div>
                <div className="detail-item"><label>Risk Score</label><span style={{ color: scoreColor(selected.risk_score), fontWeight: 700, fontSize: '18px' }}>{selected.risk_score}/10</span></div>
                <div className="detail-item"><label>Owner</label><span>{selected.owner_name || 'Unassigned'}</span></div>
                <div className="detail-item detail-full"><label>Description</label><p>{selected.description || 'No description'}</p></div>
                <div className="detail-item detail-full"><label>Mitigation Strategy</label><p>{selected.mitigation || 'No mitigation plan'}</p></div>
              </div>
              <button className="btn btn-ai btn-sm" onClick={() => handleAI(selected)}>
                &#x2728; AI Risk Prediction
              </button>
              <AIOutput content={aiResult} title="AI Risk Prediction & Analysis" loading={aiLoading} />
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
              <h2>{editing ? 'Edit Risk' : 'New Risk'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Risk title" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Risk description" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="open">Open</option><option value="monitoring">Monitoring</option><option value="mitigated">Mitigated</option><option value="closed">Closed</option></select></div>
                <div className="form-group"><label>Probability</label><select value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                <div className="form-group"><label>Impact</label><select value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                <div className="form-group"><label>Risk Score (1-10)</label><input type="number" min="1" max="10" value={form.risk_score} onChange={e => setForm({ ...form, risk_score: parseInt(e.target.value) || 5 })} /></div>
                <div className="form-group"><label>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="technical">Technical</option><option value="security">Security</option><option value="compliance">Compliance</option><option value="management">Management</option><option value="resource">Resource</option><option value="financial">Financial</option><option value="business">Business</option><option value="strategic">Strategic</option></select></div>
                <div className="form-group detail-full"><label>Owner</label><select value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}><option value="">Unassigned</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Mitigation Strategy</label><textarea value={form.mitigation} onChange={e => setForm({ ...form, mitigation: e.target.value })} placeholder="Mitigation plan" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Risk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
