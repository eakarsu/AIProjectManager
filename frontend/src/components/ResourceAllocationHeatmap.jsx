import React, { useEffect, useState } from 'react';

function cellColor(pct) {
  if (pct > 85) return '#ef4444';
  if (pct > 60) return '#f59e0b';
  if (pct > 30) return '#10b981';
  return '#475569';
}

export default function ResourceAllocationHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/heatmap', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load heatmap'))))
      .then(setData)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading heatmap...</div>;
  if (err) return <div style={{ padding: 16, color: '#ef4444' }}>{err}</div>;
  if (!data) return null;

  const { resources, sprints, cells } = data;
  const cellMap = {};
  cells.forEach((c) => { cellMap[`${c.resourceId}|${c.sprintId}`] = c; });

  return (
    <div data-testid="resource-heatmap" style={{ background: '#1e1f3a', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 8 }}>Resource Allocation Heatmap</h3>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
        {resources.length} resources x {sprints.length} sprints
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ color: '#94a3b8', fontSize: 12, textAlign: 'left', padding: 6 }}>Resource</th>
              {sprints.map((s) => (
                <th key={s.id} style={{ color: '#94a3b8', fontSize: 12, padding: 6 }}>{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td style={{ color: '#e2e8f0', fontSize: 13, padding: 6, whiteSpace: 'nowrap' }}>{r.name}</td>
                {sprints.map((s) => {
                  const c = cellMap[`${r.id}|${s.id}`] || { allocationPct: 0, status: 'available' };
                  return (
                    <td key={s.id} style={{ padding: 0 }}>
                      <div
                        style={{
                          width: 70,
                          height: 40,
                          background: cellColor(c.allocationPct),
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        title={`${r.name} / ${s.name}: ${c.allocationPct}% (${c.status})`}
                      >
                        {c.allocationPct}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, fontSize: 11, color: '#cbd5e1' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#475569', marginRight: 4, verticalAlign: 'middle' }} />Available</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#10b981', marginRight: 4, verticalAlign: 'middle' }} />Normal</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', marginRight: 4, verticalAlign: 'middle' }} />Busy</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', marginRight: 4, verticalAlign: 'middle' }} />Overloaded</span>
      </div>
    </div>
  );
}
