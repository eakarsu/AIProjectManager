import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';

const moodLabels = { 1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Excellent' };
const moodColors = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#10b981', 5: '#22c55e' };

export default function Retrospectives() {
  const [retros, setRetros] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ sprint_id: '', went_well: '', to_improve: '', action_items: '', mood_score: 3, conducted_by: '' });

  const loadData = () => {
    fetch('/api/retrospectives').then(r => r.json()).then(setRetros);
    fetch('/api/sprints').then(r => r.json()).then(setSprints);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/retrospectives/${editing.id}` : '/api/retrospectives';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ sprint_id: '', went_well: '', to_improve: '', action_items: '', mood_score: 3, conducted_by: '' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this retrospective?')) return;
    await fetch(`/api/retrospectives/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (r) => {
    setForm({ sprint_id: r.sprint_id || '', went_well: r.went_well || '', to_improve: r.to_improve || '', action_items: r.action_items || '', mood_score: r.mood_score || 3, conducted_by: r.conducted_by || '' });
    setEditing(r);
    setShowForm(true);
  };

  const handleAI = async (r) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/retrospective-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprint_name: r.sprint_name, went_well: r.went_well, to_improve: r.to_improve, action_items: r.action_items, mood_score: r.mood_score, retro_id: r.id }),
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
          <h1>Retrospectives</h1>
          <p>{retros.length} sprint retrospectives</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ sprint_id: '', went_well: '', to_improve: '', action_items: '', mood_score: 3, conducted_by: '' }); setShowForm(true); }}>
            <FiPlus /> New Retrospective
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Sprint</th><th>Project</th><th>Conducted By</th><th>Mood</th><th>Date</th></tr>
          </thead>
          <tbody>
            {retros.map(r => (
              <tr key={r.id} onClick={() => { setSelected(r); setAiResult(r.ai_analysis || ''); }}>
                <td style={{ fontWeight: 500 }}>{r.sprint_name || '-'}</td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{r.project_name || '-'}</td>
                <td>{r.conducted_by_name || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= r.mood_score ? moodColors[r.mood_score] : '#2d2f45' }} />
                    ))}
                    <span style={{ fontSize: '12px', color: moodColors[r.mood_score], marginLeft: '4px' }}>{moodLabels[r.mood_score]}</span>
                  </div>
                </td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{r.created_at?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Retrospective - {selected.sprint_name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Sprint</label><span>{selected.sprint_name || '-'}</span></div>
                <div className="detail-item"><label>Conducted By</label><span>{selected.conducted_by_name || '-'}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Team Mood</label><span style={{ color: moodColors[selected.mood_score], fontWeight: 600 }}>{moodLabels[selected.mood_score]} ({selected.mood_score}/5)</span></div>
                <div className="detail-item detail-full" style={{ background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981' }}>
                  <label>What Went Well</label><p>{selected.went_well || '-'}</p>
                </div>
                <div className="detail-item detail-full" style={{ background: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #ef4444' }}>
                  <label>What To Improve</label><p>{selected.to_improve || '-'}</p>
                </div>
                <div className="detail-item detail-full" style={{ background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid #3b82f6' }}>
                  <label>Action Items</label><p>{selected.action_items || '-'}</p>
                </div>
              </div>
              <button className="btn btn-ai btn-sm" onClick={() => handleAI(selected)}>
                &#x2728; AI Retrospective Analysis
              </button>
              <AIOutput content={aiResult} title="AI Retrospective Analysis" loading={aiLoading} />
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
              <h2>{editing ? 'Edit Retrospective' : 'New Retrospective'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Sprint</label><select value={form.sprint_id} onChange={e => setForm({ ...form, sprint_id: e.target.value })}><option value="">Select Sprint</option>{sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div className="form-group"><label>Conducted By</label><select value={form.conducted_by} onChange={e => setForm({ ...form, conducted_by: e.target.value })}><option value="">Select Facilitator</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <div className="form-group"><label>What Went Well</label><textarea value={form.went_well} onChange={e => setForm({ ...form, went_well: e.target.value })} placeholder="What worked great this sprint?" rows={3} /></div>
              <div className="form-group"><label>What To Improve</label><textarea value={form.to_improve} onChange={e => setForm({ ...form, to_improve: e.target.value })} placeholder="What could be better?" rows={3} /></div>
              <div className="form-group"><label>Action Items</label><textarea value={form.action_items} onChange={e => setForm({ ...form, action_items: e.target.value })} placeholder="Concrete action items for next sprint" rows={3} /></div>
              <div className="form-group">
                <label>Team Mood Score: {form.mood_score}/5 - {moodLabels[form.mood_score]}</label>
                <input type="range" min="1" max="5" value={form.mood_score} onChange={e => setForm({ ...form, mood_score: parseInt(e.target.value) })} style={{ width: '100%', accentColor: moodColors[form.mood_score] }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Retrospective</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
