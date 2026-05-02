import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCw } from 'react-icons/fi';

export default function AIHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const limit = 20;

  const loadHistory = async (p = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/history?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadHistory(page); }, [page]);

  const endpointColor = (endpoint) => {
    const map = {
      'task-breakdown': '#6366f1',
      'sprint-planning': '#10b981',
      'risk-prediction': '#ef4444',
      'standup-summary': '#f59e0b',
      'project-insights': '#3b82f6',
      'retrospective-analysis': '#8b5cf6',
      'workload-optimization': '#06b6d4',
      'document-summary': '#ec4899',
    };
    return map[endpoint] || '#94a3b8';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI History</h1>
          <p>{total} total AI analyses</p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadHistory(page)}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading AI history...</div>
      ) : history.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <FiClock size={48} style={{ opacity: 0.3, marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
          <p>No AI analyses yet. Run AI features to see history here.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#1e2332',
                  border: '1px solid #2d3548',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: expanded === item.id ? '12px' : '0' }}>
                  <span style={{
                    background: `${endpointColor(item.endpoint)}20`,
                    color: endpointColor(item.endpoint),
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {item.endpoint}
                  </span>
                  {item.task_id && <span style={{ fontSize: '12px', color: '#64748b' }}>Task #{item.task_id}</span>}
                  {item.project_id && <span style={{ fontSize: '12px', color: '#64748b' }}>Project #{item.project_id}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
                    <FiClock style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{expanded === item.id ? '▲' : '▼'}</span>
                </div>

                {expanded === item.id && item.result_json && (
                  <div style={{
                    background: '#0f1520',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#cbd5e1',
                    overflow: 'auto',
                    maxHeight: '400px',
                  }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(item.result_json, null, 2)}
                    </pre>
                  </div>
                )}

                {expanded === item.id && !item.result_json && (
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px', fontStyle: 'italic' }}>
                    No structured data available for this analysis.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
