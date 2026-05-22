import React, { useEffect, useState } from 'react';

const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#6366f1', done: '#10b981', blocked: '#ef4444' };

export default function ProjectGanttTimeline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/gantt', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load Gantt data'))))
      .then(setData)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading Gantt timeline...</div>;
  if (err) return <div style={{ padding: 16, color: '#ef4444' }}>{err}</div>;
  if (!data || !data.bars?.length) return <div style={{ padding: 16 }}>No timeline data.</div>;

  return (
    <div data-testid="gantt-timeline" style={{ background: '#1e1f3a', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 8 }}>Project Gantt Timeline</h3>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
        Range: {data.rangeStart} to {data.rangeEnd} ({data.totalDays} days, {data.bars.length} tasks)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.bars.map((b) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'center' }}>
            <div style={{ color: '#cbd5e1', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.title}>
              {b.title}
            </div>
            <div style={{ position: 'relative', height: 22, background: '#0f172a', borderRadius: 4 }}>
              <div
                style={{
                  position: 'absolute',
                  left: `${b.offsetPct}%`,
                  width: `${b.widthPct}%`,
                  top: 2,
                  bottom: 2,
                  background: STATUS_COLORS[b.status] || '#6366f1',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 6px',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 600,
                }}
                title={`${b.startISO} -> ${b.endISO}`}
              >
                {b.startISO}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
