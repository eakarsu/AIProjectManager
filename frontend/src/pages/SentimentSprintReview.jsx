import FormattedAIReport from '../components/FormattedAIReport';
import NativeAIControls from "../components/NativeAIControls.jsx";
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

  const presets = ['Planning example', 'Delivery example', 'Review example'].map((name, index) => ({ name, fill: () => { setProjectId(value => value || String(projects[index % Math.max(projects.length, 1)]?.id || '')); setSprintId(value => value || String(sprints[index % Math.max(sprints.length, 1)]?.id || '')); setRetroText(['Illustrative retrospective: reviews completed on time, but context switches interrupted focus. Ask the team to confirm themes and propose protected focus hours.', 'Illustrative retrospective: test feedback arrived late and requirements changed twice. Confirm root causes and establish a shared readiness checklist.', 'Illustrative retrospective: onboarding helped collaboration, while support work reduced delivery time. Identify assumptions and review capacity with the team.'][index]); return { filled: 3, manual: projects.length ? [] : ['an existing project when linking this example'] }; } }));

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
    <NativeAIControls busy={loading} context="ProjectManager" presets={presets}><div>
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
              <select data-ai-field={"projectId"} className="form-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sprint (optional)</label>
              <select data-ai-field={"sprintId"} className="form-input" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
                <option value="">Select sprint...</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || `Sprint ${s.id}`}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Retrospective notes (optional, free text)</label>
              <textarea data-ai-field={"retroText"}
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
            <FormattedAIReport response={result} />
          ) : (
            <div style={{ color: '#64748b', fontSize: 14 }}>Run an analysis to see results.</div>
          )}
        </div>
      </div>
    </div></NativeAIControls>
  );
}
