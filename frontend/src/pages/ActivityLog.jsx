import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const actionIcons = {
  created: { icon: '+', color: '#10b981' },
  completed: { icon: '&#x2713;', color: '#22c55e' },
  updated: { icon: '&#x270E;', color: '#3b82f6' },
  started: { icon: '&#x25B6;', color: '#f59e0b' },
  assigned: { icon: '&#x1F464;', color: '#8b5cf6' },
  commented: { icon: '&#x1F4AC;', color: '#06b6d4' },
  deleted: { icon: '&#x2717;', color: '#ef4444' },
};

const entityColors = {
  task: '#3b82f6', project: '#6366f1', sprint: '#10b981', risk: '#ef4444', team: '#8b5cf6',
};

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/activities').then(r => r.json()).then(setActivities);
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.entity_type === filter);

  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Activity Log</h1>
          <p>{activities.length} recorded activities</p>
        </div>
        <div className="header-actions">
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '10px 14px', background: '#1e2030', border: '1px solid #2d2f45', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px' }}>
            <option value="all">All Types</option>
            <option value="task">Tasks</option>
            <option value="project">Projects</option>
            <option value="sprint">Sprints</option>
            <option value="risk">Risks</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#1e2030', borderRadius: '16px', border: '1px solid #2d2f45', padding: '8px 0' }}>
        {filtered.map((a, i) => {
          const ai = actionIcons[a.action] || { icon: '?', color: '#94a3b8' };
          return (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 24px', cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid #2d2f45' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                  {a.user_name?.[0] || '?'}
                </div>
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderRadius: '50%', background: ai.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', border: '2px solid #1e2030' }} dangerouslySetInnerHTML={{ __html: ai.icon }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.user_name}</span>
                  <span style={{ color: '#94a3b8' }}> {a.action} </span>
                  <span style={{ color: entityColors[a.entity_type] || '#6366f1' }}>{a.entity_type}</span>
                  <span style={{ color: '#94a3b8' }}> </span>
                  <span style={{ fontWeight: 500, color: '#e2e8f0' }}>"{a.entity_name}"</span>
                </div>
                {a.details && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{a.details}</div>}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatTimeAgo(a.created_at)}</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state"><h3>No activities found</h3><p>Activities will appear here as actions are taken.</p></div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
            <div className="modal-header">
              <h2>Activity Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>User</label><span>{selected.user_name}</span></div>
                <div className="detail-item"><label>Action</label><span style={{ color: actionIcons[selected.action]?.color, fontWeight: 600 }}>{selected.action}</span></div>
                <div className="detail-item"><label>Entity Type</label><span>{selected.entity_type}</span></div>
                <div className="detail-item"><label>Entity ID</label><span>#{selected.entity_id}</span></div>
                <div className="detail-item detail-full"><label>Entity Name</label><span>{selected.entity_name}</span></div>
                <div className="detail-item detail-full"><label>Details</label><p>{selected.details || 'No additional details'}</p></div>
                <div className="detail-item detail-full"><label>Timestamp</label><span>{new Date(selected.created_at).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
