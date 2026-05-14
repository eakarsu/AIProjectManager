import React, { useState, useEffect } from 'react';
import { FiUsers, FiZap } from 'react-icons/fi';

const API = (path, method = 'GET', body) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`/api${path}`, opts).then((r) => r.json());
};

export default function SmartAssign() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API('/projects')
      .then((d) => setProjects(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {};
      if (projectId) payload.project_id = projectId;
      if (constraints.trim()) payload.constraints = constraints.trim();
      const r = await API('/ai/smart-assign', 'POST', payload);
      if (r.error) {
        setError(r.error);
      } else {
        setResult(r);
      }
    } catch (err) {
      setError(err.message || 'Assignment failed');
    }
    setLoading(false);
  };

  const parsed = result?.parsed || result;
  const assignments = parsed?.assignments || [];
  const unassigned = parsed?.unassigned || [];
  const loadAfter = parsed?.load_after || parsed?.team_load || [];
  const warnings = parsed?.warnings || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiUsers /> Smart Assign
          </h1>
          <p>AI-driven task → team-member assignments with rationale</p>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Project</label>
              <select
                className="form-input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Constraints (optional)</label>
              <input
                type="text"
                className="form-input"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g., balance load, prioritize critical path, avoid overload >85%"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            disabled={loading}
          >
            <FiZap /> {loading ? 'Assigning...' : 'Run Smart Assign'}
          </button>
        </form>
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#7f1d1d',
              color: '#fecaca',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="data-table-container" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            AI is computing assignments...
          </div>
        </div>
      )}

      {parsed && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assignments.length > 0 && (
            <div className="data-table-container" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Assignments</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: 8 }}>Task</th>
                    <th style={{ padding: 8 }}>Assignee</th>
                    <th style={{ padding: 8 }}>Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #2d2f45', color: '#cbd5e1' }}>
                      <td style={{ padding: 8 }}>{a.task || a.task_id || a.title || '-'}</td>
                      <td style={{ padding: 8 }}>{a.assignee || a.user || a.user_id || '-'}</td>
                      <td style={{ padding: 8 }}>{a.rationale || a.reason || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loadAfter.length > 0 && (
            <div className="data-table-container" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Load After</h3>
              {loadAfter.map((m, i) => (
                <div key={i} style={{ fontSize: 13, color: '#cbd5e1', padding: '4px 0' }}>
                  {typeof m === 'string'
                    ? m
                    : `${m.user || m.name || ''} — ${m.load ?? m.utilization ?? ''}`}
                </div>
              ))}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="data-table-container" style={{ padding: 24, background: '#3b1f1f' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#fca5a5' }}>
                Unassigned
              </h3>
              {unassigned.map((u, i) => (
                <div key={i} style={{ fontSize: 13, color: '#fca5a5', padding: '4px 0' }}>
                  {typeof u === 'string' ? u : `${u.task || u.id || ''}: ${u.reason || ''}`}
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="data-table-container" style={{ padding: 24, background: '#3b321f' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#fde68a' }}>
                Warnings
              </h3>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 13, color: '#fde68a', padding: '4px 0' }}>
                  {typeof w === 'string' ? w : JSON.stringify(w)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
