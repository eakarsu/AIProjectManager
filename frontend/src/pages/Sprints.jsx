import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiZap } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';
import DatePickerInput from '../components/DatePickerInput';

const token = () => localStorage.getItem('token');
const authFetch = (url, opts = {}) => fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers || {}) } });

export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', project_id: '', start_date: '', end_date: '', status: 'planning', velocity: 0, capacity: 40 });

  // Sprint plan generation
  const [planCapacity, setPlanCapacity] = useState(40);
  const [planLoading, setPlanLoading] = useState(false);

  // Velocity widget
  const [velocityData, setVelocityData] = useState(null);
  const [velocityLoading, setVelocityLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const loadData = async (p = 1) => {
    const [sprintsRes, projectsRes] = await Promise.all([
      authFetch(`/api/sprints?page=${p}&limit=${limit}`),
      authFetch('/api/projects'),
    ]);
    const sprintsData = await sprintsRes.json();
    const projectsData = await projectsRes.json();

    if (Array.isArray(sprintsData)) {
      setSprints(sprintsData);
    } else {
      setSprints(sprintsData.data || []);
      setTotalPages(sprintsData.totalPages || 1);
    }
    setProjects(Array.isArray(projectsData) ? projectsData : projectsData.data || []);
  };

  useEffect(() => { loadData(page); }, [page]);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/sprints/${editing.id}` : '/api/sprints';
    await authFetch(url, { method, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', goal: '', project_id: '', start_date: '', end_date: '', status: 'planning', velocity: 0, capacity: 40 });
    loadData(page);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sprint?')) return;
    await authFetch(`/api/sprints/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData(page);
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
      const res = await authFetch('/api/ai/sprint-planning', {
        method: 'POST',
        body: JSON.stringify({ sprint_name: s.name, goal: s.goal, team_capacity: s.capacity, velocity: s.velocity, sprint_id: s.id }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setAiLoading(false);
  };

  const handleGeneratePlan = async (s) => {
    setPlanLoading(true);
    setAiResult('');
    try {
      const res = await authFetch('/api/ai/sprint-planning', {
        method: 'POST',
        body: JSON.stringify({
          sprint_name: s.name,
          goal: s.goal,
          team_capacity: planCapacity,
          velocity: s.velocity,
          sprint_id: s.id,
          backlog_items: `Sprint has ${s.task_count} tasks, ${s.completed_tasks} completed`,
        }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setPlanLoading(false);
  };

  const loadVelocity = async (s) => {
    setVelocityLoading(true);
    setVelocityData(null);
    try {
      const res = await authFetch(`/api/sprints/${s.id}/velocity`);
      const data = await res.json();
      setVelocityData(data);
    } catch (err) {
      console.error(err);
    }
    setVelocityLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sprints</h1>
          <p>{sprints.length} sprints on this page</p>
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
              <tr key={s.id} onClick={() => { setSelected(s); setAiResult(s.ai_suggestions || ''); setVelocityData(null); }}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
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

              {/* Sprint Velocity Widget */}
              <div style={{ margin: '16px 0', padding: '16px', background: '#13172a', borderRadius: '10px', border: '1px solid #2d3548' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>Sprint Velocity</h4>
                  <button className="btn btn-secondary btn-sm" onClick={() => loadVelocity(selected)} disabled={velocityLoading}>
                    {velocityLoading ? 'Loading...' : 'Load Velocity'}
                  </button>
                </div>
                {velocityData ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'center', padding: '12px', background: '#1e2332', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{velocityData.completed_points}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Completed pts</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '12px', background: '#1e2332', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{velocityData.planned_points}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Planned pts</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '12px', background: '#1e2332', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: velocityData.completion_percentage >= 80 ? '#10b981' : velocityData.completion_percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {velocityData.completion_percentage}%
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Completion</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ background: '#2d3548', borderRadius: '4px', height: '8px', marginBottom: '12px' }}>
                      <div style={{
                        background: velocityData.completion_percentage >= 80 ? '#10b981' : velocityData.completion_percentage >= 50 ? '#f59e0b' : '#ef4444',
                        height: '8px',
                        borderRadius: '4px',
                        width: `${Math.min(100, velocityData.completion_percentage)}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    {velocityData.ai_forecast && (
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '8px', background: '#1e2332', borderRadius: '6px' }}>
                        <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '4px' }}>AI Forecast:</strong>
                        {velocityData.ai_forecast}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '13px' }}>Click "Load Velocity" to compute sprint velocity and get an AI forecast.</div>
                )}
              </div>

              {/* Generate Sprint Plan button with capacity input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>Capacity (pts):</label>
                  <input
                    type="number"
                    min="1"
                    value={planCapacity}
                    onChange={e => setPlanCapacity(parseInt(e.target.value) || 40)}
                    style={{ width: '80px', padding: '6px 10px', background: '#13172a', border: '1px solid #2d3548', borderRadius: '6px', color: '#e2e8f0', fontSize: '13px' }}
                  />
                </div>
                <button className="btn btn-ai btn-sm" onClick={() => handleGeneratePlan(selected)} disabled={planLoading}>
                  <FiZap /> {planLoading ? 'Generating...' : 'Generate Sprint Plan'}
                </button>
                <button className="btn btn-ai btn-sm" style={{ opacity: 0.7 }} onClick={() => handleAI(selected)} disabled={aiLoading}>
                  &#x2728; AI Sprint Planning
                </button>
              </div>
              <AIOutput content={aiResult} title="AI Sprint Planning Suggestions" loading={aiLoading || planLoading} />
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
