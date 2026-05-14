import React, { useState, useEffect } from 'react';
import { FiHeart, FiZap } from 'react-icons/fi';

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

export default function SentimentSprintReview() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [retroText, setRetroText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API('/projects').then(({ data }) => setProjects(Array.isArray(data) ? data : data.data || [])).catch(() => {});
    API('/sprints').then(({ data }) => setSprints(Array.isArray(data) ? data : data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {};
      if (projectId) payload.project_id = Number(projectId);
      if (sprintId) payload.sprint_id = Number(sprintId);
      if (retroText.trim()) payload.retro_text = retroText.trim();
      const { status, data } = await API('/ai/sentiment-sprint-review', 'POST', payload);
      if (status === 503) {
        setError(data.error || 'AI service unavailable: API key not configured.');
      } else if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Review failed');
    }
    setLoading(false);
  };

  const parsed = result?.parsed || result;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiHeart /> Sentiment Sprint Review
          </h1>
          <p>AI-extracted themes, sentiment, blockers, and actions from retrospective feedback</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="data-table-container" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 15, fontWeight: 600 }}>Inputs</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project (optional)</label>
              <select className="form-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sprint (optional)</label>
              <select className="form-input" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
                <option value="">Select sprint...</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || `Sprint ${s.id}`}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Retrospective notes (optional, free text)</label>
              <textarea
                className="form-input"
                style={{ minHeight: 160, resize: 'vertical' }}
                value={retroText}
                onChange={(e) => setRetroText(e.target.value)}
                placeholder="Paste raw retro notes, survey responses, or stand-up summaries..."
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={loading}
            >
              <FiZap /> {loading ? 'Analyzing...' : 'Analyze Sprint Sentiment'}
            </button>
          </form>
          {error && (
            <div style={{ marginTop: 16, padding: 12, background: '#7f1d1d', color: '#fecaca', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        <div className="data-table-container" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Result</h3>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              AI is analysing sprint feedback...
            </div>
          ) : parsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {parsed.overall_sentiment && (
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Overall Sentiment</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{parsed.overall_sentiment}</div>
                </div>
              )}
              {parsed.themes?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Themes</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {parsed.themes.map((t, i) => (
                      <li key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>
                        <strong>{t.theme}</strong> ({t.sentiment}, {t.frequency_pct}%): {t.summary}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.top_blockers?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#fca5a5', textTransform: 'uppercase', marginBottom: 6 }}>Top Blockers</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {parsed.top_blockers.map((b, i) => (
                      <li key={i} style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4 }}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.recommended_actions?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#86efac', textTransform: 'uppercase', marginBottom: 6 }}>Recommended Actions</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {parsed.recommended_actions.map((a, i) => (
                      <li key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 4 }}>
                        [{a.priority}] {a.action} {a.owner_hint ? `(owner: ${a.owner_hint})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.summary && (
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Summary</div>
                  <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{parsed.summary}</p>
                </div>
              )}
              {!parsed.overall_sentiment && parsed.result && (
                <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: 13 }}>{parsed.result}</pre>
              )}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: 14 }}>Run an analysis to see results.</div>
          )}
        </div>
      </div>
    </div>
  );
}
