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
    <div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {parsed.estimated_completion && (
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>
                    Completion
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
                    {parsed.estimated_completion}
                  </div>
                </div>
              )}
              {parsed.buffer_recommendation && (
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>
                    Buffer Recommendation
                  </div>
                  <div style={{ fontSize: 14, color: '#e2e8f0' }}>
                    {typeof parsed.buffer_recommendation === 'string'
                      ? parsed.buffer_recommendation
                      : JSON.stringify(parsed.buffer_recommendation)}
                  </div>
                </div>
              )}
              {parsed.milestones?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Milestones
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {parsed.milestones.map((m, i) => (
                      <li
                        key={i}
                        style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}
                      >
                        {typeof m === 'string' ? m : `${m.name || ''} — ${m.date || ''}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.critical_path?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Critical Path
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {parsed.critical_path.map((c, i) => (
                      <li
                        key={i}
                        style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}
                      >
                        {typeof c === 'string' ? c : JSON.stringify(c)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.risks?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#fca5a5',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}
                  >
                    Risks
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {parsed.risks.map((r, i) => (
                      <li
                        key={i}
                        style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}
                      >
                        {typeof r === 'string' ? r : JSON.stringify(r)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!parsed.estimated_completion && parsed.content && (
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    color: '#cbd5e1',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {parsed.content}
                </pre>
              )}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: 14 }}>Run an estimate to see results.</div>
          )}
        </div>
      </div>
    </div>
  );
}
