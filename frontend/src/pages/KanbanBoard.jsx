import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';

const columns = [
  { key: 'todo', label: 'To Do', color: '#f59e0b' },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [selected, setSelected] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const loadData = () => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  };

  useEffect(() => { loadData(); }, []);

  const filteredTasks = filterProject
    ? tasks.filter(t => String(t.project_id) === filterProject)
    : tasks;

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.key] = filteredTasks.filter(t => t.status === col.key);
    return acc;
  }, {});

  const handleDragStart = (task) => setDraggedTask(task);

  const handleDrop = async (newStatus) => {
    if (!draggedTask || draggedTask.status === newStatus) return;
    try {
      await fetch(`/api/tasks/${draggedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draggedTask, status: newStatus }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
    setDraggedTask(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const priorityColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Kanban Board</h1>
          <p>Drag and drop tasks between columns</p>
        </div>
        <div className="header-actions">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            style={{ padding: '10px 14px', background: '#1e2030', border: '1px solid #2d2f45', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px' }}
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', minHeight: '70vh' }}>
        {columns.map(col => (
          <div
            key={col.key}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
            style={{ background: '#1e2030', borderRadius: '16px', border: '1px solid #2d2f45', padding: '20px', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{col.label}</h3>
              </div>
              <span style={{ background: '#2d2f45', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                {tasksByStatus[col.key]?.length || 0}
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {tasksByStatus[col.key]?.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onClick={() => setSelected(task)}
                  style={{
                    background: '#141627', borderRadius: '12px', padding: '14px', border: '1px solid #2d2f45',
                    cursor: 'grab', transition: 'all 0.2s', borderLeft: `3px solid ${priorityColors[task.priority] || '#6366f1'}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d2f45'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>{task.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`badge badge-${task.priority}`} style={{ fontSize: '10px' }}>{task.priority}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: '#2d2f45', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>{task.story_points} pts</span>
                      {task.assignee_name && (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{task.assignee_name.split(' ')[0]}</span>
                      )}
                    </div>
                  </div>
                  {task.project_name && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{task.project_name}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Status</label><span className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</span></div>
                <div className="detail-item"><label>Priority</label><span className={`badge badge-${selected.priority}`}>{selected.priority}</span></div>
                <div className="detail-item"><label>Assignee</label><span>{selected.assignee_name || 'Unassigned'}</span></div>
                <div className="detail-item"><label>Story Points</label><span>{selected.story_points}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Sprint</label><span>{selected.sprint_name || '-'}</span></div>
                <div className="detail-item detail-full"><label>Description</label><p>{selected.description || 'No description'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
