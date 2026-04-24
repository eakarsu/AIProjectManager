import React, { useState, useEffect } from 'react';
import { FiX, FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';

const typeIcons = {
  assignment: { icon: '&#x1F464;', color: '#6366f1' },
  comment: { icon: '&#x1F4AC;', color: '#06b6d4' },
  deadline: { icon: '&#x23F0;', color: '#ef4444' },
  mention: { icon: '@', color: '#8b5cf6' },
  status_change: { icon: '&#x1F504;', color: '#f59e0b' },
  risk: { icon: '&#x26A0;', color: '#ef4444' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const loadData = () => {
    fetch('/api/notifications').then(r => r.json()).then(setNotifications);
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    loadData();
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications/read/all', { method: 'PATCH' });
    loadData();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications.filter(n => n.type === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount} unread of {notifications.length} total</p>
        </div>
        <div className="header-actions">
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '10px 14px', background: '#1e2030', border: '1px solid #2d2f45', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px' }}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="assignment">Assignments</option>
            <option value="deadline">Deadlines</option>
            <option value="comment">Comments</option>
            <option value="mention">Mentions</option>
            <option value="status_change">Status Changes</option>
            <option value="risk">Risks</option>
          </select>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <FiCheckCircle /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div style={{ background: '#1e2030', borderRadius: '16px', border: '1px solid #2d2f45' }}>
        {filtered.map((n, i) => {
          const ti = typeIcons[n.type] || { icon: '&#x1F514;', color: '#94a3b8' };
          return (
            <div
              key={n.id}
              onClick={() => setSelected(n)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px',
                borderBottom: i < filtered.length - 1 ? '1px solid #2d2f45' : 'none',
                background: !n.is_read ? 'rgba(99,102,241,0.04)' : 'transparent',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = !n.is_read ? 'rgba(99,102,241,0.04)' : 'transparent'}
            >
              {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />}
              {n.is_read && <div style={{ width: '8px', height: '8px', flexShrink: 0 }} />}
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${ti.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: ti.color, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: ti.icon }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: n.is_read ? 400 : 600, color: n.is_read ? '#94a3b8' : '#e2e8f0' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                {!n.is_read && (
                  <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }} style={{ padding: '4px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }} title="Mark as read">
                    <FiCheck />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state"><h3>No notifications</h3><p>You're all caught up!</p></div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Type</label><span style={{ color: typeIcons[selected.type]?.color }}>{selected.type.replace('_', ' ')}</span></div>
                <div className="detail-item"><label>Status</label><span>{selected.is_read ? 'Read' : 'Unread'}</span></div>
                <div className="detail-item"><label>Related</label><span>{selected.entity_type} #{selected.entity_id}</span></div>
                <div className="detail-item"><label>Date</label><span>{new Date(selected.created_at).toLocaleString()}</span></div>
                <div className="detail-item detail-full"><label>Message</label><p>{selected.message || 'No details'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              {!selected.is_read && <button className="btn btn-secondary btn-sm" onClick={() => { handleMarkRead(selected.id); setSelected({ ...selected, is_read: true }); }}><FiCheck /> Mark Read</button>}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
