import FormattedAIReport from '../components/FormattedAIReport';
import NativeAIControls from '../components/NativeAIControls.jsx';
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

  const presets = ['Planning example', 'Delivery example', 'Review example'].map((name, index) => ({ name, fill: () => { setProjectId(value => value || String(projects[index % Math.max(projects.length, 1)]?.id || '')); setConstraints(['Keep assignments within 32 hours per week; match skills; obtain team lead approval.', 'Reserve 20 percent capacity for support; distribute complex work fairly; flag missing skill evidence.', 'Prioritize urgent work, retain existing owners where feasible, and require review before changes.'][index]); return { filled: 2, manual: projects.length ? [] : ['an existing project when linking this example'] }; } }));

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
    <NativeAIControls busy={loading} context="ProjectManager" presets={presets}><div>
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

      {result && <FormattedAIReport response={result} />}
    </div></NativeAIControls>
  );
}
