import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';
import DatePickerInput from '../components/DatePickerInput';

const moodEmojis = { productive: '🚀', focused: '🎯', creative: '🎨', energized: '⚡', neutral: '😐', concerned: '😟', challenged: '💪', cautious: '🛡️', analytical: '🔍', organized: '📋', methodical: '🔬', strategic: '♟️' };

export default function Standups() {
  const [standups, setStandups] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ user_id: '', project_id: '', yesterday: '', today: '', blockers: '', mood: 'neutral', standup_date: new Date().toISOString().split('T')[0] });

  const loadData = () => {
    fetch('/api/standups').then(r => r.json()).then(setStandups);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/standups/${editing.id}` : '/api/standups';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ user_id: '', project_id: '', yesterday: '', today: '', blockers: '', mood: 'neutral', standup_date: new Date().toISOString().split('T')[0] });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this standup?')) return;
    await fetch(`/api/standups/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (s) => {
    setForm({ user_id: s.user_id || '', project_id: s.project_id || '', yesterday: s.yesterday || '', today: s.today || '', blockers: s.blockers || '', mood: s.mood || 'neutral', standup_date: s.standup_date?.split('T')[0] || '' });
    setEditing(s);
    setShowForm(true);
  };

  const handleAISummary = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const standupText = standups.slice(0, 10).map(s =>
        `${s.user_name} (${s.project_name}): Yesterday: ${s.yesterday} | Today: ${s.today} | Blockers: ${s.blockers || 'None'} | Mood: ${s.mood}`
      ).join('\n');
      const res = await fetch('/api/ai/standup-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standups: standupText, project_name: 'All Projects' }),
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
          <h1>Standups</h1>
          <p>{standups.length} total standup entries</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ai" onClick={handleAISummary}>
            &#x2728; AI Team Summary
          </button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ user_id: '', project_id: '', yesterday: '', today: '', blockers: '', mood: 'neutral', standup_date: new Date().toISOString().split('T')[0] }); setShowForm(true); }}>
            <FiPlus /> New Standup
          </button>
        </div>
      </div>

      {aiResult && (
        <div style={{ marginBottom: '24px' }}>
          <AIOutput content={aiResult} title="AI Team Standup Summary" loading={aiLoading} />
        </div>
      )}
      {aiLoading && !aiResult && (
        <div style={{ marginBottom: '24px' }}>
          <AIOutput loading={true} />
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Member</th><th>Project</th><th>Yesterday</th><th>Today</th><th>Blockers</th><th>Mood</th><th>Date</th></tr>
          </thead>
          <tbody>
            {standups.map(s => (
              <tr key={s.id} onClick={() => { setSelected(s); }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: s.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                      {s.user_name?.[0]}
                    </div>
                    <span style={{ fontWeight: 500 }}>{s.user_name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{s.project_name || '-'}</td>
                <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.yesterday}</td>
                <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.today}</td>
                <td style={{ fontSize: '13px', color: s.blockers && s.blockers !== 'None' ? '#f87171' : '#64748b' }}>{s.blockers || 'None'}</td>
                <td>{moodEmojis[s.mood] || '😐'} {s.mood}</td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{s.standup_date?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Standup - {selected.user_name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Team Member</label><span>{selected.user_name}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Date</label><span>{selected.standup_date?.split('T')[0]}</span></div>
                <div className="detail-item"><label>Mood</label><span>{moodEmojis[selected.mood]} {selected.mood}</span></div>
                <div className="detail-item detail-full"><label>Yesterday</label><p>{selected.yesterday || '-'}</p></div>
                <div className="detail-item detail-full"><label>Today</label><p>{selected.today || '-'}</p></div>
                <div className="detail-item detail-full"><label>Blockers</label><p style={{ color: selected.blockers && selected.blockers !== 'None' ? '#f87171' : '#94a3b8' }}>{selected.blockers || 'None'}</p></div>
              </div>
              {selected.ai_summary && <AIOutput content={selected.ai_summary} title="AI Summary" />}
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
              <h2>{editing ? 'Edit Standup' : 'New Standup'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Team Member</label><select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}><option value="">Select Member</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Yesterday (What did you do?)</label><textarea value={form.yesterday} onChange={e => setForm({ ...form, yesterday: e.target.value })} placeholder="What did you accomplish yesterday?" /></div>
              <div className="form-group"><label>Today (What will you do?)</label><textarea value={form.today} onChange={e => setForm({ ...form, today: e.target.value })} placeholder="What will you work on today?" /></div>
              <div className="form-group"><label>Blockers</label><textarea value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} placeholder="Any blockers? (Leave empty for none)" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Mood</label><select value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}><option value="productive">🚀 Productive</option><option value="focused">🎯 Focused</option><option value="energized">⚡ Energized</option><option value="neutral">😐 Neutral</option><option value="concerned">😟 Concerned</option><option value="challenged">💪 Challenged</option></select></div>
                <div className="form-group"><label>Date</label><DatePickerInput value={form.standup_date} onChange={v => setForm({ ...form, standup_date: v })} placeholder="Pick date..." /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Submit'} Standup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
