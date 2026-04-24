import React, { useState, useEffect } from 'react';
import AIOutput from '../components/AIOutput';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function SimpleBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <div style={{ width: '120px', fontSize: '13px', color: '#94a3b8', textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, height: '24px', background: '#141627', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: '6px', transition: 'width 0.5s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
          {pct > 15 && <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>{value}</span>}
        </div>
      </div>
      {pct <= 15 && <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', minWidth: '30px' }}>{value}</span>}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/overview').then(r => r.json()).then(setData);
    fetch('/api/analytics/workload').then(r => r.json()).then(setWorkload);
  }, []);

  const handleAIWorkload = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const teamData = workload.map(w => `${w.name}: ${w.assigned_tasks} tasks (${w.in_progress} active, ${w.todo} pending), ${w.total_points} story points, ${parseFloat(w.logged_hours).toFixed(1)}h logged`).join('\n');
      const res = await fetch('/api/ai/workload-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_data: teamData, tasks_data: `Total team members: ${workload.length}` }),
      });
      const d = await res.json();
      setAiResult(d.result || d.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setAiLoading(false);
  };

  if (!data) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const maxTaskCount = Math.max(...(data.tasksByStatus?.map(t => parseInt(t.count)) || [1]));
  const maxVelocity = Math.max(...(data.sprintVelocity?.map(s => s.velocity) || [1]));
  const maxHours = Math.max(...(data.timeByUser?.map(t => parseFloat(t.total_hours)) || [1]));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Project metrics, charts, and AI workload analysis</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ai" onClick={handleAIWorkload}>&#x2728; AI Workload Optimizer</button>
        </div>
      </div>

      {(aiResult || aiLoading) && (
        <div style={{ marginBottom: '24px' }}>
          <AIOutput content={aiResult} title="AI Workload Optimization" loading={aiLoading} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '24px', border: '1px solid #2d2f45' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Tasks by Status</h3>
          {data.tasksByStatus?.map((t, i) => (
            <SimpleBar key={t.status} label={t.status.replace('_', ' ')} value={parseInt(t.count)} max={maxTaskCount} color={COLORS[i % COLORS.length]} />
          ))}
        </div>

        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '24px', border: '1px solid #2d2f45' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Tasks by Priority</h3>
          {data.tasksByPriority?.map((t) => {
            const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };
            return <SimpleBar key={t.priority} label={t.priority} value={parseInt(t.count)} max={maxTaskCount} color={colors[t.priority] || '#6366f1'} />;
          })}
        </div>

        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '24px', border: '1px solid #2d2f45' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Sprint Velocity Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 10px' }}>
            {data.sprintVelocity?.map((s, i) => {
              const pct = maxVelocity > 0 ? (s.velocity / maxVelocity) * 100 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#a5b4fc' }}>{s.velocity}</span>
                  <div style={{ width: '100%', height: `${pct}%`, background: `linear-gradient(180deg, #6366f1, #8b5cf6)`, borderRadius: '6px 6px 0 0', minHeight: '4px' }} />
                  <span style={{ fontSize: '9px', color: '#64748b', writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: '60px', overflow: 'hidden' }}>{s.name.replace('Sprint ', 'S')}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '24px', border: '1px solid #2d2f45' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Hours by Team Member</h3>
          {data.timeByUser?.map((t, i) => (
            <SimpleBar key={t.name} label={t.name.split(' ')[0]} value={parseFloat(t.total_hours).toFixed(1)} max={maxHours} color={COLORS[i % COLORS.length]} />
          ))}
        </div>

        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '24px', border: '1px solid #2d2f45' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Project Progress</h3>
          {data.projectProgress?.map((p, i) => (
            <SimpleBar key={p.name} label={p.name.substring(0, 15)} value={p.progress} max={100} color={COLORS[i % COLORS.length]} />
          ))}
        </div>

        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '24px', border: '1px solid #2d2f45' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Team Workload</h3>
          {workload.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < workload.length - 1 ? '1px solid #2d2f45' : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: w.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>{w.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{w.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{w.assigned_tasks} tasks, {w.total_points} pts</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{w.in_progress} active</span>
                <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{w.todo} todo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
