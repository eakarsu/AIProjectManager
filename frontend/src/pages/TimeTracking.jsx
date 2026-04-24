import React, { useState, useEffect } from 'react';
import { FiX, FiTrash2, FiEdit2, FiClock, FiCheck, FiDollarSign, FiPlay, FiArrowRight } from 'react-icons/fi';
import DatePickerInput from '../components/DatePickerInput';

const nowDatetime = (hours, minutes) => {
  const d = new Date();
  if (hours !== undefined) { d.setHours(hours); d.setMinutes(minutes || 0); }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const calcHours = (startDt, endDt) => {
  if (!startDt || !endDt) return 0;
  const s = new Date(startDt);
  const e = new Date(endDt);
  const diff = (e - s) / (1000 * 60 * 60);
  return diff > 0 ? Math.round(diff * 100) / 100 : 0;
};

const formatHours = (h) => {
  if (!h || h <= 0) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

const formatDateNice = (d) => {
  if (!d) return '';
  const date = new Date(d.includes('T') ? d : d + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatLogTime = (log) => {
  if (log.start_datetime && log.end_datetime) {
    const s = new Date(log.start_datetime);
    const e = new Date(log.end_datetime);
    const fmt = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${fmt(s)} - ${fmt(e)}`;
  }
  return null;
};

const cardStyle = { background: '#1e2030', borderRadius: '12px', border: '1px solid #2d2f45' };

export default function TimeTracking() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);

  // Quick entry — combined datetime strings "YYYY-MM-DDTHH:MM"
  const [startDt, setStartDt] = useState(nowDatetime(9, 0));
  const [endDt, setEndDt] = useState(nowDatetime(17, 0));
  const [qTask, setQTask] = useState('');
  const [qUser, setQUser] = useState('');
  const [qNotes, setQNotes] = useState('');
  const [qBillable, setQBillable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Edit modal
  const [editForm, setEditForm] = useState(null);

  const calculatedHours = calcHours(startDt, endDt);

  const loadData = () => {
    fetch('/api/timelogs').then(r => r.json()).then(setLogs);
    fetch('/api/timelogs/stats/summary').then(r => r.json()).then(setStats);
    fetch('/api/tasks').then(r => r.json()).then(setTasks);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
  };

  useEffect(() => { loadData(); }, []);

  const handleQuickLog = async () => {
    if (calculatedHours <= 0) return;
    setSaving(true);
    await fetch('/api/timelogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: qTask || null, user_id: qUser || null,
        hours: calculatedHours, log_date: startDt.split('T')[0],
        start_datetime: startDt + ':00', end_datetime: endDt + ':00',
        notes: qNotes, billable: qBillable,
      }),
    });
    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setQNotes('');
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this time log?')) return;
    await fetch(`/api/timelogs/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const openEdit = (l) => {
    const toDtStr = (dt) => {
      if (!dt) return '';
      const d = new Date(dt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    setEditForm({
      id: l.id,
      task_id: l.task_id || '',
      user_id: l.user_id || '',
      startDt: toDtStr(l.start_datetime) || (l.log_date?.split('T')[0] + 'T09:00'),
      endDt: toDtStr(l.end_datetime) || (l.log_date?.split('T')[0] + 'T17:00'),
      notes: l.notes || '',
      billable: l.billable !== false,
    });
    setSelected(null);
  };

  const editCalcHours = editForm ? calcHours(editForm.startDt, editForm.endDt) : 0;

  const handleEditSave = async () => {
    if (!editForm) return;
    await fetch(`/api/timelogs/${editForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: editForm.task_id || null,
        user_id: editForm.user_id || null,
        hours: editCalcHours > 0 ? editCalcHours : 0,
        log_date: editForm.startDt.split('T')[0],
        start_datetime: editForm.startDt + ':00',
        end_datetime: editForm.endDt + ':00',
        notes: editForm.notes,
        billable: editForm.billable,
      }),
    });
    setEditForm(null);
    loadData();
  };

  const setQuickPreset = (key) => {
    const today = new Date();
    const base = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    if (key === 'morning')   { setStartDt(`${base}T09:00`); setEndDt(`${base}T12:00`); }
    if (key === 'afternoon') { setStartDt(`${base}T13:00`); setEndDt(`${base}T17:00`); }
    if (key === 'halfday')   { setStartDt(`${base}T09:00`); setEndDt(`${base}T13:00`); }
    if (key === 'fullday')   { setStartDt(`${base}T09:00`); setEndDt(`${base}T17:00`); }
  };

  const billablePercent = stats ? (stats.billableHours / (stats.totalHours || 1) * 100).toFixed(0) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Time Tracking</h1>
          <p>{logs.length} time entries</p>
        </div>
      </div>

      {/* ============ INLINE TIME ENTRY ============ */}
      <div style={{ ...cardStyle, padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
        {/* Header with presets */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #2d2f45', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiClock style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>Log Time</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { label: 'Morning', key: 'morning', hint: '9am-12pm' },
              { label: 'Afternoon', key: 'afternoon', hint: '1pm-5pm' },
              { label: 'Half Day', key: 'halfday', hint: '9am-1pm' },
              { label: 'Full Day', key: 'fullday', hint: '9am-5pm' },
            ].map(p => (
              <button key={p.key} onClick={() => setQuickPreset(p.key)} title={p.hint}
                style={{
                  padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                  border: '1px solid #2d2f45', background: '#161828', color: '#94a3b8',
                  cursor: 'pointer',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* START / END datetime pickers + duration */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
            <div style={{ flex: 2 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Start Date & Time</label>
                <DatePickerInput value={startDt} onChange={setStartDt} showTime placeholder="Pick start..." />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '12px' }}>
              <FiArrowRight style={{ color: '#6366f1', fontSize: '22px' }} />
            </div>

            <div style={{ flex: 2 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>End Date & Time</label>
                <DatePickerInput value={endDt} onChange={setEndDt} showTime minDate={startDt?.split('T')[0]} placeholder="Pick end..." />
              </div>
            </div>

            {/* Duration badge */}
            <div style={{ minWidth: '110px', textAlign: 'center', paddingBottom: '6px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Duration</div>
              <div style={{
                fontSize: '26px', fontWeight: 800, lineHeight: 1.2,
                color: calculatedHours > 0 ? '#10b981' : '#ef4444',
                background: calculatedHours > 0 ? '#10b98112' : '#ef444412',
                padding: '10px 14px', borderRadius: '14px',
              }}>
                {formatHours(calculatedHours)}
              </div>
            </div>
          </div>

          {/* Task / Member / Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Task</label>
              <select value={qTask} onChange={e => setQTask(e.target.value)}>
                <option value="">-- optional --</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Member</label>
              <select value={qUser} onChange={e => setQUser(e.target.value)}>
                <option value="">-- optional --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Notes</label>
              <input value={qNotes} onChange={e => setQNotes(e.target.value)} placeholder="What did you work on?" />
            </div>
          </div>

          {/* Billable + Log button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setQBillable(!qBillable)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: '10px',
                border: `1px solid ${qBillable ? '#10b98140' : '#2d2f45'}`,
                background: qBillable ? '#10b98110' : 'transparent',
                cursor: 'pointer',
              }}>
              <FiDollarSign style={{ color: qBillable ? '#10b981' : '#3d4055', fontSize: '14px' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: qBillable ? '#34d399' : '#64748b' }}>
                {qBillable ? 'Billable' : 'Non-billable'}
              </span>
            </button>

            <div style={{ flex: 1 }} />

            {showSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                <FiCheck /> Logged!
              </div>
            )}

            <button onClick={handleQuickLog} disabled={calculatedHours <= 0 || saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 32px', borderRadius: '12px',
                background: calculatedHours > 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#2d2f45',
                border: 'none', color: 'white',
                fontSize: '15px', fontWeight: 700,
                cursor: calculatedHours > 0 ? 'pointer' : 'not-allowed',
                opacity: calculatedHours > 0 ? 1 : 0.5,
                boxShadow: calculatedHours > 0 ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
              }}>
              <FiPlay size={15} />
              {saving ? 'Saving...' : `Log ${formatHours(calculatedHours)}`}
            </button>
          </div>
        </div>
      </div>

      {/* ============ STATS ============ */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ ...cardStyle, padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Total Hours</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#6366f1' }}>{stats.totalHours?.toFixed(1)}</div>
          </div>
          <div style={{ ...cardStyle, padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Billable</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#10b981' }}>{stats.billableHours?.toFixed(1)}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{billablePercent}% rate</div>
          </div>
          <div style={{ ...cardStyle, padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Avg / Day</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b' }}>{stats.avgPerDay?.toFixed(1)}</div>
          </div>
          {stats.byProject?.slice(0, 2).map((p, i) => (
            <div key={i} style={{ ...cardStyle, padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{p.name}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#ec4899' }}>{parseFloat(p.total_hours).toFixed(1)}h</div>
            </div>
          ))}
          {stats.byUser?.slice(0, 2).map((u, i) => (
            <div key={`u${i}`} style={{ ...cardStyle, padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{u.name}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: u.avatar_color || '#f59e0b' }}>{parseFloat(u.total_hours).toFixed(1)}h</div>
            </div>
          ))}
        </div>
      )}

      {/* ============ TABLE ============ */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Time</th><th>Member</th><th>Task</th><th>Project</th><th>Hours</th><th>Billable</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} onClick={() => setSelected(l)}>
                <td style={{ fontSize: '13px', fontWeight: 500 }}>{formatDateNice(l.log_date)}</td>
                <td style={{ fontSize: '12px', color: '#818cf8', fontFamily: 'monospace' }}>{formatLogTime(l) || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: l.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white' }}>{l.user_name?.[0]}</div>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{l.user_name}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 500, fontSize: '13px' }}>{l.task_title || '-'}</td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{l.project_name || '-'}</td>
                <td>
                  <span style={{ background: '#10b98118', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                    {formatHours(parseFloat(l.hours))}
                  </span>
                </td>
                <td>{l.billable ? <span style={{ color: '#10b981', fontSize: '13px' }}>Yes</span> : <span style={{ color: '#64748b', fontSize: '13px' }}>No</span>}</td>
                <td style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============ DETAIL MODAL ============ */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Time Log Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Team Member</label><span>{selected.user_name}</span></div>
                <div className="detail-item"><label>Date</label><span>{formatDateNice(selected.log_date)}</span></div>
                <div className="detail-item"><label>Time Range</label><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{formatLogTime(selected) || 'Not set'}</span></div>
                <div className="detail-item"><label>Duration</label><span style={{ fontWeight: 700, color: '#10b981', fontSize: '18px' }}>{formatHours(parseFloat(selected.hours))}</span></div>
                <div className="detail-item"><label>Task</label><span>{selected.task_title || '-'}</span></div>
                <div className="detail-item"><label>Billable</label><span>{selected.billable ? 'Yes' : 'No'}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item detail-full"><label>Notes</label><p>{selected.notes || 'No notes'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selected)}><FiEdit2 /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {editForm && (
        <div className="modal-overlay" onClick={() => setEditForm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Edit Time Log</h2>
              <button className="modal-close" onClick={() => setEditForm(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Start</label>
                  <DatePickerInput value={editForm.startDt} onChange={v => setEditForm({ ...editForm, startDt: v })} showTime placeholder="Start..." />
                </div>
                <div style={{ paddingBottom: '12px' }}><FiArrowRight style={{ color: '#6366f1' }} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>End</label>
                  <DatePickerInput value={editForm.endDt} onChange={v => setEditForm({ ...editForm, endDt: v })} showTime placeholder="End..." />
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '10px', marginBottom: '16px', borderRadius: '10px', background: editCalcHours > 0 ? '#10b98112' : '#ef444412' }}>
                <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>DURATION:</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: editCalcHours > 0 ? '#10b981' : '#ef4444' }}>{formatHours(editCalcHours)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Task</label><select value={editForm.task_id} onChange={e => setEditForm({ ...editForm, task_id: e.target.value })}><option value="">Select Task</option>{tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
                <div className="form-group"><label>Member</label><select value={editForm.user_id} onChange={e => setEditForm({ ...editForm, user_id: e.target.value })}><option value="">Select Member</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} placeholder="What did you work on?" rows={2} /></div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.billable} onChange={e => setEditForm({ ...editForm, billable: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                  Billable hours
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditForm(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSave}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
