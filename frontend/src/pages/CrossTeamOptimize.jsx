import FormattedAIReport from '../components/FormattedAIReport';
import NativeAIControls from "../components/NativeAIControls.jsx";
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

  const presets = ['Planning example', 'Delivery example', 'Review example'].map((name, index) => ({ name, fill: () => { const ids = selected.length ? selected : projects.slice(0, 2).map(p => p.id); setSelected(ids); setConstraints(JSON.stringify({ max_hours_per_member: [32, 36, 40][index], reserve_capacity_percent: [20, 15, 25][index], human_review_required: true }, null, 2)); setPriorities(JSON.stringify(Object.fromEntries(ids.map((id,i) => [String(id), i ? 'medium' : 'high'])), null, 2)); return { filled: 3, manual: projects.length ? [] : ['an existing project when linking this example'] }; } }));

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
    <NativeAIControls busy={loading} context="ProjectManager" presets={presets}><div>
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
              <textarea data-ai-field={"constraints"} className="form-input" rows={4} value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder='{"max_hours_per_member": 40}' />
            </div>
            <div className="form-group">
              <label className="form-label">Priorities (JSON or free text)</label>
              <textarea data-ai-field={"priorities"} className="form-input" rows={4} value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder='{"project_1": "highest"}' />
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

      {result && <FormattedAIReport response={result} />}
    </div></NativeAIControls>
  );
}
