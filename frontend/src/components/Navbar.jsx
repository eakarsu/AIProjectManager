import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFolder, FiCheckSquare, FiRepeat, FiAlertTriangle, FiMessageCircle, FiUsers, FiLogOut, FiColumns, FiFlag, FiClock, FiRotateCcw, FiBarChart2, FiCalendar, FiFileText, FiActivity, FiBell } from 'react-icons/fi';

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/', icon: <FiGrid />, label: 'Dashboard' },
      { to: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
      { to: '/calendar', icon: <FiCalendar />, label: 'Calendar' },
    ],
  },
  {
    title: 'Work',
    items: [
      { to: '/projects', icon: <FiFolder />, label: 'Projects' },
      { to: '/tasks', icon: <FiCheckSquare />, label: 'Tasks' },
      { to: '/kanban', icon: <FiColumns />, label: 'Kanban Board' },
      { to: '/milestones', icon: <FiFlag />, label: 'Milestones' },
    ],
  },
  {
    title: 'Agile',
    items: [
      { to: '/sprints', icon: <FiRepeat />, label: 'Sprints' },
      { to: '/standups', icon: <FiMessageCircle />, label: 'Standups' },
      { to: '/retrospectives', icon: <FiRotateCcw />, label: 'Retrospectives' },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/risks', icon: <FiAlertTriangle />, label: 'Risks' },
      { to: '/team', icon: <FiUsers />, label: 'Team' },
      { to: '/time-tracking', icon: <FiClock />, label: 'Time Tracking' },
      { to: '/documents', icon: <FiFileText />, label: 'Documents' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/activity-log', icon: <FiActivity />, label: 'Activity Log' },
      { to: '/notifications', icon: <FiBell />, label: 'Notifications', showBadge: true },
    ],
  },
];

export default function Navbar({ user, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/notifications/unread/count')
      .then(r => r.json())
      .then(d => setUnreadCount(d.count || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/notifications/unread/count')
        .then(r => r.json())
        .then(d => setUnreadCount(d.count || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar" style={{ overflowY: 'auto' }}>
      <div className="navbar-logo">
        <h2>AI PM</h2>
        <span>Project Manager</span>
      </div>
      <div className="nav-links" style={{ gap: '2px' }}>
        {navSections.map((section) => (
          <div key={section.title}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#4a4d6a', textTransform: 'uppercase', letterSpacing: '1px', padding: '12px 16px 4px', marginTop: '4px' }}>
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
                style={{ padding: '9px 16px', fontSize: '13px' }}
              >
                {item.icon}
                {item.label}
                {item.showBadge && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '10px',
                    fontWeight: 700, padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      {user && (
        <div className="nav-user">
          <div className="nav-avatar" style={{ background: user.avatar_color || '#6366f1' }}>
            {user.name?.[0] || 'U'}
          </div>
          <div className="nav-user-info">
            <h4>{user.name}</h4>
            <p>{user.role}</p>
          </div>
          <button className="btn-ghost" onClick={onLogout} title="Logout" style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <FiLogOut />
          </button>
        </div>
      )}
    </nav>
  );
}
