import React, { useState, useEffect } from 'react';
import { FiGrid, FiZap } from 'react-icons/fi';

const API = (path, method = 'GET', body) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`/api${path}`, opts).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  });
};

export default function CrossTeamOptimize() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [constraints, setConstraints] = useState('');
  const [priorities, setPriorities] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API('/projects')
      .then(({ data }) => setProjects(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
  }, []);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = { project_ids: selected.map(Number) };
      if (constraints.trim()) {
        try { payload.constraints = JSON.parse(constraints); } catch { payload.constraints = { notes: constraints.trim() }; }
      }
      if (priorities.trim()) {
        try { payload.priorities = JSON.parse(priorities); } catch { payload.priorities = { notes: priorities.trim() }; }
      }
      const { status, data } = await API('/ai/cross-team-optimize', 'POST', payload);
      if (status === 503) {
        setError(data.error || 'AI service unavailable: API key not configured.');
      } else if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Optimization failed');
    }
    setLoading(false);
  };

  const parsed = result?.parsed || result;
  const realloc = parsed?.reallocations || [];
  const reassign = parsed?.task_reassignments || [];
  const under = parsed?.underutilised_members || [];
  const over = parsed?.overloaded_members || [];
  const warnings = parsed?.warnings || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiGrid /> Cross-Team Resource Optimizer
          </h1>
          <p>AI-driven cross-project reallocation, task reassignments, throughput uplift</p>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Projects (multi-select)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {projects.map((p) => (
                <label
                  key={p.id}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: selected.includes(p.id) ? '1px solid #6366f1' : '1px solid #334155',
                    background: selected.includes(p.id) ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: '#cbd5e1',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    style={{ marginRight: 6 }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Constraints (JSON or free text)</label>
              <textarea className="form-input" rows={4} value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder='{"max_hours_per_member": 40}' />
            </div>
            <div className="form-group">
              <label className="form-label">Priorities (JSON or free text)</label>
              <textarea className="form-input" rows={4} value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder='{"project_1": "highest"}' />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}
            disabled={loading || selected.length === 0}
          >
            <FiZap /> {loading ? 'Optimizing...' : 'Optimize Resources'}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: 16, padding: 12, background: '#7f1d1d', color: '#fecaca', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>

      {parsed && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="data-table-container" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Reallocations ({realloc.length})</h3>
            {realloc.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>No reallocations recommended.</div>
            ) : (
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {realloc.map((r, i) => (
                  <li key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 8 }}>
                    Member {r.member_id}: {r.from_project_id} → {r.to_project_id} ({r.hours_per_week}h/wk) — {r.rationale}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="data-table-container" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Task Reassignments ({reassign.length})</h3>
            {reassign.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>No reassignments recommended.</div>
            ) : (
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {reassign.map((r, i) => (
                  <li key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 8 }}>
                    Task {r.task_id} → Member {r.new_assignee_id} [{r.confidence}]: {r.rationale}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="data-table-container" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#86efac' }}>Underutilised</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {under.map((m, i) => (
                <li key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 4 }}>Member {m.member_id}: {m.free_hours}h free</li>
              ))}
              {under.length === 0 && <li style={{ color: '#64748b', fontSize: 13 }}>None</li>}
            </ul>
          </div>
          <div className="data-table-container" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#fca5a5' }}>Overloaded</h3>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {over.map((m, i) => (
                <li key={i} style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4 }}>Member {m.member_id}: {m.overload_hours}h overload</li>
              ))}
              {over.length === 0 && <li style={{ color: '#64748b', fontSize: 13 }}>None</li>}
            </ul>
          </div>
          {parsed.expected_throughput_lift_pct != null && (
            <div className="data-table-container" style={{ padding: 24, gridColumn: 'span 2' }}>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Expected Throughput Lift</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#86efac' }}>+{parsed.expected_throughput_lift_pct}%</div>
              {parsed.summary && <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 12 }}>{parsed.summary}</p>}
              {warnings.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 6 }}>Warnings</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {warnings.map((w, i) => (
                      <li key={i} style={{ color: '#fde68a', fontSize: 13 }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
