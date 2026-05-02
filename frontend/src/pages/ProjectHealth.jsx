import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { FiActivity, FiRefreshCw, FiAlertTriangle, FiUsers, FiTrendingUp, FiTarget } from 'react-icons/fi';

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

const scoreColor = (score) => {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#fbbf24';
  return '#f87171';
};

export default function ProjectHealth() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [health, setHealth] = useState(null);
  const [velocityData, setVelocityData] = useState([]);
  const [healthSummary, setHealthSummary] = useState('');
  const [riskAssess, setRiskAssess] = useState(null);
  const [resourceBalance, setResourceBalance] = useState(null);
  const [criticalPath, setCriticalPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [activeTab, setActiveTab] = useState('health');

  useEffect(() => {
    API('/projects').then(d => {
      const list = Array.isArray(d) ? d : d.data || [];
      setProjects(list);
      if (list.length > 0) setSelectedProject(list[0].id);
    });
  }, []);

  const loadProjectData = useCallback(async (pid) => {
    if (!pid) return;
    setLoading(true);
    try {
      const [h, v] = await Promise.all([
        API(`/projects/${pid}/health`),
        API(`/projects/${pid}/velocity-chart`),
      ]);
      setHealth(h.error ? null : h);
      setVelocityData((v.data || []).map(s => ({
        name: s.name?.slice(0, 12) || `Sprint ${s.id}`,
        velocity: s.velocity || 0,
        planned: parseInt(s.planned_points) || 0,
        completed: parseInt(s.completed_points) || 0,
      })));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    setHealth(null);
    setVelocityData([]);
    setHealthSummary('');
    setRiskAssess(null);
    setResourceBalance(null);
    setCriticalPath(null);
    loadProjectData(selectedProject);
  }, [selectedProject, loadProjectData]);

  const runAI = async (type) => {
    setAiLoading(l => ({ ...l, [type]: true }));
    try {
      const r = await API(`/projects/${selectedProject}/${type}`, 'POST', {});
      if (type === 'ai-health-summary') setHealthSummary(r.result || '');
      if (type === 'ai-risk-assess') setRiskAssess(r.parsed || null);
      if (type === 'ai-resource-balance') setResourceBalance(r.parsed || null);
      if (type === 'ai-critical-path') setCriticalPath(r.parsed || null);
    } catch (e) {
      console.error(e);
    }
    setAiLoading(l => ({ ...l, [type]: false }));
  };

  const selectedProj = projects.find(p => p.id === selectedProject);

  const tabs = [
    { key: 'health', label: 'Health Dashboard', icon: <FiActivity /> },
    { key: 'velocity', label: 'Velocity Chart', icon: <FiTrendingUp /> },
    { key: 'risk', label: 'Risk Assessment', icon: <FiAlertTriangle /> },
    { key: 'resource', label: 'Resource Balance', icon: <FiUsers /> },
    { key: 'critical', label: 'Critical Path', icon: <FiTarget /> },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Project Health & AI Insights</h1>
          <p>Velocity charts, risk assessment, resource balancing, and critical path analysis</p>
        </div>
      </div>

      {/* Project selector */}
      <div style={{ marginBottom: 20 }}>
        <select
          value={selectedProject || ''}
          onChange={e => setSelectedProject(parseInt(e.target.value))}
          className="form-input"
          style={{ maxWidth: 360 }}
        >
          <option value="">Select a project...</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #2d2f45', paddingBottom: 12 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="loading-spinner"><div className="spinner" /></div>}

      {!loading && selectedProject && (
        <>
          {/* HEALTH DASHBOARD */}
          {activeTab === 'health' && (
            <div>
              {health ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {[
                      { label: 'Health Score', value: `${health.health_score}%`, color: scoreColor(health.health_score) },
                      { label: 'Task Completion', value: `${health.task_completion_rate}%`, color: scoreColor(health.task_completion_rate) },
                      { label: 'Schedule Adherence', value: `${health.schedule_adherence_pct}%`, color: scoreColor(health.schedule_adherence_pct) },
                      { label: 'Overdue Tasks', value: health.overdue_tasks, color: health.overdue_tasks > 5 ? '#f87171' : health.overdue_tasks > 0 ? '#fbbf24' : '#4ade80' },
                      { label: 'Avg Velocity', value: `${health.avg_velocity} pts`, color: '#a5b4fc' },
                      { label: 'Points Done', value: `${health.story_points_completed}/${health.story_points_total}`, color: '#22d3ee' },
                    ].map((m, i) => (
                      <div key={i} className="data-table-container" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="data-table-container" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>AI Health Narrative</h3>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => runAI('ai-health-summary')}
                        disabled={aiLoading['ai-health-summary']}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <FiRefreshCw style={{ animation: aiLoading['ai-health-summary'] ? 'spin 1s linear infinite' : 'none' }} />
                        {aiLoading['ai-health-summary'] ? 'Analyzing...' : 'Generate AI Report'}
                      </button>
                    </div>
                    {healthSummary ? (
                      <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>{healthSummary}</div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: 14 }}>Click "Generate AI Report" to get a narrative health summary powered by AI.</div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Select a project to view health metrics.</div>
              )}
            </div>
          )}

          {/* VELOCITY CHART */}
          {activeTab === 'velocity' && (
            <div className="data-table-container" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Sprint Velocity History — {selectedProj?.name}
              </h3>
              {velocityData.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>
                  No completed sprints with velocity data yet. Close sprints to see velocity trends.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={velocityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2f45" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ background: '#1e2035', border: '1px solid #2d2f45', borderRadius: 8 }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <Bar dataKey="planned" name="Planned Points" fill="#6366f1" opacity={0.6} radius={[4,4,0,0]} />
                      <Bar dataKey="completed" name="Completed Points" fill="#4ade80" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 24 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={velocityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2f45" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#1e2035', border: '1px solid #2d2f45', borderRadius: 8 }} />
                        <Legend />
                        <Line type="monotone" dataKey="velocity" name="Velocity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {/* RISK ASSESSMENT */}
          {activeTab === 'risk' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => runAI('ai-risk-assess')}
                  disabled={aiLoading['ai-risk-assess']}
                >
                  {aiLoading['ai-risk-assess'] ? 'Assessing Risks...' : 'Run AI Risk Assessment'}
                </button>
              </div>
              {riskAssess ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div className="data-table-container" style={{ padding: 20 }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>OVERALL RISK SCORE</div>
                      <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor(100 - (riskAssess.overall_risk_score || 5) * 10) }}>
                        {riskAssess.overall_risk_score}/10
                      </div>
                    </div>
                    <div className="data-table-container" style={{ padding: 20 }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>SUMMARY</div>
                      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{riskAssess.summary || 'No summary available.'}</div>
                    </div>
                  </div>
                  {riskAssess.critical_risks?.length > 0 && (
                    <div className="data-table-container" style={{ padding: 20, marginBottom: 16 }}>
                      <h4 style={{ color: '#f87171', marginBottom: 12 }}>Critical Risks</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {riskAssess.critical_risks.map((r, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                            <span style={{ color: '#f87171', marginTop: 2 }}>⚠</span>
                            <span style={{ color: '#cbd5e1', fontSize: 14 }}>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Risk</th><th>Probability</th><th>Impact</th><th>Category</th><th>Mitigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(riskAssess.risks || []).map((r, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{r.risk}</td>
                            <td><span className={`badge badge-${r.probability === 'high' ? 'critical' : r.probability}`}>{r.probability}</span></td>
                            <td><span className={`badge badge-${r.impact === 'high' ? 'critical' : r.impact}`}>{r.impact}</span></td>
                            <td><span className="badge badge-active">{r.category}</span></td>
                            <td style={{ fontSize: 12, color: '#94a3b8', maxWidth: 200 }}>{r.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="data-table-container" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Click "Run AI Risk Assessment" to analyze project risks with AI.
                </div>
              )}
            </div>
          )}

          {/* RESOURCE BALANCE */}
          {activeTab === 'resource' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => runAI('ai-resource-balance')}
                  disabled={aiLoading['ai-resource-balance']}
                >
                  {aiLoading['ai-resource-balance'] ? 'Analyzing Workload...' : 'Run Resource Balancer'}
                </button>
              </div>
              {resourceBalance ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div className="data-table-container" style={{ padding: 20 }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>OPTIMIZATION SCORE</div>
                      <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor(resourceBalance.optimization_score || 0) }}>
                        {resourceBalance.optimization_score || 0}%
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>{resourceBalance.notes}</div>
                    </div>
                    <div className="data-table-container" style={{ padding: 20 }}>
                      <h4 style={{ marginBottom: 12 }}>Workload Summary</h4>
                      {(resourceBalance.workload_summary || []).map((m, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                          <span style={{ color: '#e2e8f0' }}>{m.member}</span>
                          <span style={{ color: m.status === 'overloaded' ? '#f87171' : m.status === 'underloaded' ? '#fbbf24' : '#4ade80' }}>
                            {m.current_points} pts ({m.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(resourceBalance.reassignments || []).length > 0 && (
                    <div className="data-table-container">
                      <div style={{ padding: '20px 20px 0' }}><h4>Recommended Reassignments</h4></div>
                      <table className="data-table">
                        <thead>
                          <tr><th>Task</th><th>From</th><th>To</th><th>Reason</th></tr>
                        </thead>
                        <tbody>
                          {resourceBalance.reassignments.map((r, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 500 }}>{r.task_title}</td>
                              <td style={{ color: '#f87171' }}>{r.from_member}</td>
                              <td style={{ color: '#4ade80' }}>{r.to_member}</td>
                              <td style={{ fontSize: 12, color: '#94a3b8' }}>{r.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="data-table-container" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Click "Run Resource Balancer" to get AI-powered workload balancing recommendations.
                </div>
              )}
            </div>
          )}

          {/* CRITICAL PATH */}
          {activeTab === 'critical' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => runAI('ai-critical-path')}
                  disabled={aiLoading['ai-critical-path']}
                >
                  {aiLoading['ai-critical-path'] ? 'Analyzing...' : 'Analyze Critical Path'}
                </button>
              </div>
              {criticalPath ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div className="data-table-container" style={{ padding: 20, marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>ON TRACK</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: criticalPath.on_track ? '#4ade80' : '#f87171' }}>
                            {criticalPath.on_track ? 'YES' : 'NO'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>EST. DELAY</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: criticalPath.estimated_delay_days > 0 ? '#f87171' : '#4ade80' }}>
                            {criticalPath.estimated_delay_days || 0} days
                          </div>
                        </div>
                      </div>
                      <h4 style={{ marginBottom: 12 }}>Critical Path Tasks</h4>
                      {(criticalPath.critical_path || []).map((task, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                          borderBottom: i < criticalPath.critical_path.length - 1 ? '1px solid #2d2f45' : 'none'
                        }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', background: '#6366f1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0
                          }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: '#e2e8f0' }}>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    {(criticalPath.delay_risks || []).length > 0 && (
                      <div className="data-table-container" style={{ padding: 20, marginBottom: 16 }}>
                        <h4 style={{ marginBottom: 12, color: '#fbbf24' }}>Delay Risks</h4>
                        {criticalPath.delay_risks.map((r, i) => (
                          <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < criticalPath.delay_risks.length - 1 ? '1px solid #2d2f45' : 'none' }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{r.task}</div>
                            <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>+{r.delay_days} days: {r.reason}</div>
                            <div style={{ fontSize: 12, color: '#4ade80', marginTop: 4 }}>Mitigation: {r.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {(criticalPath.recommendations || []).length > 0 && (
                      <div className="data-table-container" style={{ padding: 20 }}>
                        <h4 style={{ marginBottom: 12 }}>Recommendations</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {criticalPath.recommendations.map((r, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                              <span style={{ color: '#6366f1' }}>→</span>
                              <span style={{ fontSize: 13, color: '#cbd5e1' }}>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="data-table-container" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Click "Analyze Critical Path" to identify tasks most likely to delay your project.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
