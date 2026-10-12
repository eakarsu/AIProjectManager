import FormattedAIReport from '../components/FormattedAIReport';
import NativeAIControls from '../components/NativeAIControls.jsx';
import React, { useState, useEffect } from 'react';
import { FiClock, FiZap } from 'react-icons/fi';

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

export default function EstimateTimeline() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [scope, setScope] = useState('');
  const [velocity, setVelocity] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API('/projects')
      .then((d) => setProjects(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const presets = ['Planning example', 'Delivery example', 'Review example'].map((name, index) => ({ name, fill: () => { setProjectId(value => value || String(projects[index % Math.max(projects.length, 1)]?.id || '')); setScope(['Draft planning example: deliver an accessible customer portal with sign-in, project dashboard, and review workflow. Dependencies: design review and integration access.', 'Draft planning example: migrate reporting to a new dashboard, validate source data, test permissions, and schedule a staged release.', 'Draft planning example: add team scheduling, notifications, and an audit trail with human approval before release.'][index]); setVelocity([20, 25, 30][index]); setTeamSize([4, 5, 6][index]); return { filled: 4, manual: projects.length ? [] : ['an existing project when linking this example'] }; } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {};
      if (projectId) payload.project_id = projectId;
      if (scope.trim()) payload.scope = scope.trim();
      if (velocity) payload.velocity = Number(velocity);
      if (teamSize) payload.team_size = Number(teamSize);
      const r = await API('/ai/estimate-timeline', 'POST', payload);
      if (r.error) {
        setError(r.error);
      } else {
        setResult(r);
      }
    } catch (err) {
      setError(err.message || 'Estimation failed');
    }
    setLoading(false);
  };

  const parsed = result?.parsed || result;

  return (
    <NativeAIControls busy={loading} context="ProjectManager" presets={presets}><div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiClock /> Timeline Estimator
          </h1>
          <p>AI-estimated completion + milestones + critical path + risks + buffer</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="data-table-container" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 15, fontWeight: 600 }}>Inputs</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project (optional)</label>
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
              <label className="form-label">Scope (free text — optional)</label>
              <textarea
                className="form-input"
                style={{ minHeight: 120, resize: 'vertical' }}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Describe scope, key deliverables, dependencies..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Velocity (story pts/sprint)</label>
                <input
                  type="number"
                  className="form-input"
                  value={velocity}
                  onChange={(e) => setVelocity(e.target.value)}
                  placeholder="e.g., 25"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Team Size</label>
                <input
                  type="number"
                  className="form-input"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              disabled={loading}
            >
              <FiZap /> {loading ? 'Estimating...' : 'Estimate Timeline'}
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

        <div className="data-table-container" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Estimate</h3>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              AI is estimating timeline...
            </div>
          ) : parsed ? (
            <FormattedAIReport response={result} />
          ) : (
            <div style={{ color: '#64748b', fontSize: 14 }}>Run an estimate to see results.</div>
          )}
        </div>
      </div>
    </div></NativeAIControls>
  );
}
