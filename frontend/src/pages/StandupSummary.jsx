import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';

const API = (path, method = 'GET', body) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`/api${path}`, opts).then(r => r.json());
};

export default function StandupSummary() {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStandups, setManualStandups] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      API('/projects').then(d => Array.isArray(d) ? d : d.data || []),
      API('/team').then(d => Array.isArray(d) ? d : d.data || []),
    ]).then(([p, t]) => {
      setProjects(p);
      setTeamMembers(t);
    });
  }, []);

  const toggleMember = (id) => {
    setSelectedTeam(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    setLoading(true);
    setResult('');
    try {
      const projectName = projects.find(p => p.id === parseInt(selectedProject))?.name || 'Team Project';
      const payload = {
        project_name: projectName,
        date,
        standups: useManual ? manualStandups : null,
        team_ids: !useManual && selectedTeam.length > 0 ? selectedTeam : null,
      };
      const r = await API('/ai/standup-summary', 'POST', payload);
      setResult(r.result || r.error || 'No result');
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiMessageCircle /> AI Standup Summary Generator
          </h1>
          <p>Generate daily standup summaries from team data or manual input</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Config Panel */}
        <div className="data-table-container" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 15, fontWeight: 600 }}>Configuration</h3>

          <div className="form-group">
            <label className="form-label">Project</label>
            <select
              className="form-input"
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
            >
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Standup Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useManual}
                onChange={e => setUseManual(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              Use manual standup data
            </label>
          </div>

          {useManual ? (
            <div className="form-group">
              <label className="form-label">Manual Standup Data</label>
              <textarea
                className="form-input"
                style={{ minHeight: 180, resize: 'vertical' }}
                value={manualStandups}
                onChange={e => setManualStandups(e.target.value)}
                placeholder="Enter standup updates per person, e.g.:&#10;Alice: Yesterday: Finished login feature. Today: Working on dashboard. Blockers: None&#10;Bob: Yesterday: Reviewed PRs. Today: Fixing bug #123. Blockers: Need design specs"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Team Members (fetches their task data)</label>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #2d2f45', borderRadius: 8, padding: 12 }}>
                {teamMembers.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: 13 }}>No team members found. Add team members in the Team section.</div>
                ) : (
                  teamMembers.map(m => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={selectedTeam.includes(m.user_id || m.id)}
                        onChange={() => toggleMember(m.user_id || m.id)}
                        style={{ width: 14, height: 14 }}
                      />
                      <span
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: m.avatar_color || '#6366f1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#fff'
                        }}
                      >
                        {(m.user_name || m.name || '?')[0]}
                      </span>
                      <span style={{ color: '#e2e8f0' }}>{m.user_name || m.name}</span>
                      <span style={{ color: '#64748b', marginLeft: 'auto' }}>{m.role}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={loading || (!useManual && selectedTeam.length === 0 && !selectedProject)}
            style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Generating...' : 'Generate Standup Summary'}
          </button>
        </div>

        {/* Result Panel */}
        <div className="data-table-container" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Summary</h3>
            {result && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={copyToClipboard}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {copied ? <FiCheck style={{ color: '#4ade80' }} /> : <FiCopy />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              Generating AI standup summary...
            </div>
          ) : result ? (
            <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>{result}</div>
          ) : (
            <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>
              Configure options on the left and click "Generate Standup Summary" to create an AI-powered daily standup report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
