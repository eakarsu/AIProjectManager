import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolder, FiCheckSquare, FiRepeat, FiAlertTriangle, FiMessageCircle, FiUsers, FiColumns, FiFlag, FiClock, FiRotateCcw, FiBarChart2, FiCalendar, FiFileText, FiActivity, FiBell, FiTrendingUp } from 'react-icons/fi';

const featureCards = [
  { key: 'projects', label: 'Projects', icon: <FiFolder />, color: '#6366f1', path: '/projects', desc: 'Manage all projects' },
  { key: 'tasks', label: 'Tasks', icon: <FiCheckSquare />, color: '#10b981', path: '/tasks', desc: 'Track task progress' },
  { key: 'activeSprints', label: 'Active Sprints', icon: <FiRepeat />, color: '#f59e0b', path: '/sprints', desc: 'Sprint planning & tracking' },
  { key: 'openRisks', label: 'Open Risks', icon: <FiAlertTriangle />, color: '#ef4444', path: '/risks', desc: 'Risk prediction & mitigation' },
  { key: 'todayStandups', label: "Today's Standups", icon: <FiMessageCircle />, color: '#8b5cf6', path: '/standups', desc: 'AI standup summaries' },
  { key: 'teamMembers', label: 'Team Members', icon: <FiUsers />, color: '#06b6d4', path: '/team', desc: 'Team management' },
  { key: 'milestones', label: 'Milestones', icon: <FiFlag />, color: '#ec4899', path: '/milestones', desc: 'Track project milestones' },
  { key: 'documents', label: 'Documents', icon: <FiFileText />, color: '#84cc16', path: '/documents', desc: 'Project documentation' },
  { key: 'timelogs', label: 'Time Logs', icon: <FiClock />, color: '#f97316', path: '/time-tracking', desc: 'Track hours & effort' },
  { key: 'retrospectives', label: 'Retrospectives', icon: <FiRotateCcw />, color: '#14b8a6', path: '/retrospectives', desc: 'Sprint retros & AI analysis' },
  { key: 'unreadNotifications', label: 'Notifications', icon: <FiBell />, color: '#ef4444', path: '/notifications', desc: 'Alerts & updates' },
  { key: 'comments', label: 'Comments', icon: <FiMessageCircle />, color: '#0ea5e9', path: '/tasks', desc: 'Discussion threads' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ]).then(([statsData, projectsData]) => {
      setStats(statsData);
      setRecentProjects(projectsData.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your project overview.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/kanban')}><FiColumns /> Kanban Board</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/analytics')}><FiBarChart2 /> Analytics</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calendar')}><FiCalendar /> Calendar</button>
        </div>
      </div>

      <div className="dashboard-grid">
        {featureCards.map(card => (
          <div key={card.key} className="dash-card" style={{ '--card-color': card.color }} onClick={() => navigate(card.path)}>
            <div className="dash-card-icon" style={{ background: `${card.color}20`, color: card.color }}>{card.icon}</div>
            <div className="card-count">{stats[card.key] ?? 0}</div>
            <h3>{card.label}</h3>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="data-table-container">
          <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiTrendingUp style={{ color: '#6366f1' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Projects</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Project</th><th>Status</th><th>Progress</th></tr></thead>
            <tbody>
              {recentProjects.map(p => (
                <tr key={p.id} onClick={() => navigate('/projects')}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar" style={{ width: '80px' }}><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{p.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="data-table-container">
          <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiActivity style={{ color: '#8b5cf6' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>AI Features (8 Integrations)</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {[
              { name: 'Auto Task Breakdown', desc: 'AI breaks tasks into actionable subtasks', color: '#10b981' },
              { name: 'Sprint Planning AI', desc: 'Intelligent sprint planning recommendations', color: '#f59e0b' },
              { name: 'Risk Prediction', desc: 'Predict and mitigate project risks', color: '#ef4444' },
              { name: 'Standup Summaries', desc: 'AI-generated team standup summaries', color: '#8b5cf6' },
              { name: 'Project Insights', desc: 'AI-powered project health analysis', color: '#6366f1' },
              { name: 'Retrospective Analysis', desc: 'AI sprint retro insights & patterns', color: '#14b8a6' },
              { name: 'Workload Optimizer', desc: 'AI team workload balancing', color: '#ec4899' },
              { name: 'Document Summary', desc: 'AI document analysis & key points', color: '#84cc16' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 7 ? '1px solid #2d2f45' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
