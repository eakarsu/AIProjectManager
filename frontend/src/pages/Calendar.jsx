import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks);
    fetch('/api/sprints').then(r => r.json()).then(setSprints);
    fetch('/api/milestones').then(r => r.json()).then(setMilestones);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = [];

    tasks.forEach(t => {
      if (t.due_date?.split('T')[0] === dateStr) {
        events.push({ type: 'task', title: t.title, color: '#3b82f6', status: t.status, data: t });
      }
    });
    sprints.forEach(s => {
      if (s.start_date?.split('T')[0] === dateStr) events.push({ type: 'sprint-start', title: `${s.name} starts`, color: '#10b981', data: s });
      if (s.end_date?.split('T')[0] === dateStr) events.push({ type: 'sprint-end', title: `${s.name} ends`, color: '#f59e0b', data: s });
    });
    milestones.forEach(m => {
      if (m.target_date?.split('T')[0] === dateStr) events.push({ type: 'milestone', title: m.name, color: '#8b5cf6', data: m });
    });

    return events;
  };

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>Task deadlines, sprint dates, and milestones</p>
        </div>
        <div className="header-actions">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button className="btn btn-ghost" onClick={prev}><FiChevronLeft /></button>
            <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '180px', textAlign: 'center' }}>{monthName}</span>
            <button className="btn btn-ghost" onClick={next}><FiChevronRight /></button>
            <button className="btn btn-secondary btn-sm" onClick={today} style={{ marginLeft: '8px' }}>Today</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {[{ label: 'Task Due', color: '#3b82f6' }, { label: 'Sprint Start', color: '#10b981' }, { label: 'Sprint End', color: '#f59e0b' }, { label: 'Milestone', color: '#8b5cf6' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <div style={{ background: '#1e2030', borderRadius: '16px', border: '1px solid #2d2f45', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #2d2f45' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            const events = day ? getEventsForDay(day) : [];
            return (
              <div key={i} style={{ minHeight: '100px', padding: '8px', borderRight: (i + 1) % 7 !== 0 ? '1px solid #2d2f45' : 'none', borderBottom: '1px solid #2d2f45', background: !day ? '#1a1c2e' : isToday(day) ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                {day && (
                  <>
                    <div style={{ fontSize: '13px', fontWeight: isToday(day) ? 700 : 400, color: isToday(day) ? '#a5b4fc' : '#94a3b8', marginBottom: '4px' }}>
                      {isToday(day) ? <span style={{ background: '#6366f1', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{day}</span> : day}
                    </div>
                    {events.slice(0, 3).map((e, j) => (
                      <div
                        key={j}
                        onClick={() => setSelected(e)}
                        style={{ fontSize: '10px', padding: '2px 6px', marginBottom: '2px', borderRadius: '4px', background: `${e.color}20`, color: e.color, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: `2px solid ${e.color}` }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {events.length > 3 && <div style={{ fontSize: '10px', color: '#64748b' }}>+{events.length - 3} more</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '450px' }}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Type</label><span style={{ color: selected.color, fontWeight: 600 }}>{selected.type.replace('-', ' ')}</span></div>
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selected.data?.status || 'active'}`}>{selected.data?.status || '-'}</span></div>
                {selected.data?.project_name && <div className="detail-item"><label>Project</label><span>{selected.data.project_name}</span></div>}
                {selected.data?.assignee_name && <div className="detail-item"><label>Assignee</label><span>{selected.data.assignee_name}</span></div>}
                {selected.data?.due_date && <div className="detail-item"><label>Due Date</label><span>{selected.data.due_date.split('T')[0]}</span></div>}
                {selected.data?.target_date && <div className="detail-item"><label>Target Date</label><span>{selected.data.target_date.split('T')[0]}</span></div>}
                {selected.data?.description && <div className="detail-item detail-full"><label>Description</label><p>{selected.data.description}</p></div>}
                {selected.data?.goal && <div className="detail-item detail-full"><label>Goal</label><p>{selected.data.goal}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
