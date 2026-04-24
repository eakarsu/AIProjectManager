import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiFileText, FiCode, FiLayout, FiBookOpen } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';

const docTypeIcons = { document: <FiFileText />, spec: <FiCode />, design: <FiLayout />, meeting_notes: <FiBookOpen /> };
const docTypeColors = { document: '#3b82f6', spec: '#10b981', design: '#f59e0b', meeting_notes: '#8b5cf6' };

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', project_id: '', uploaded_by: '', doc_type: 'document', version: 1 });

  const loadData = () => {
    fetch('/api/documents').then(r => r.json()).then(setDocs);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
    fetch('/api/team/users/all').then(r => r.json()).then(setUsers);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/documents/${editing.id}` : '/api/documents';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', content: '', project_id: '', uploaded_by: '', doc_type: 'document', version: 1 });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadData();
  };

  const handleEdit = (d) => {
    setForm({ title: d.title, content: d.content || '', project_id: d.project_id || '', uploaded_by: d.uploaded_by || '', doc_type: d.doc_type || 'document', version: d.version || 1 });
    setEditing(d);
    setShowForm(true);
  };

  const handleAI = async (d) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/document-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: d.title, content: d.content }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setAiLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p>{docs.length} documents across all projects</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ title: '', content: '', project_id: '', uploaded_by: '', doc_type: 'document', version: 1 }); setShowForm(true); }}>
            <FiPlus /> New Document
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Document</th><th>Type</th><th>Project</th><th>Author</th><th>Version</th><th>Created</th></tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} onClick={() => { setSelected(d); setAiResult(''); }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: docTypeColors[d.doc_type] || '#6366f1', fontSize: '18px' }}>{docTypeIcons[d.doc_type] || <FiFileText />}</div>
                    <span style={{ fontWeight: 500 }}>{d.title}</span>
                  </div>
                </td>
                <td><span style={{ background: `${docTypeColors[d.doc_type]}20`, color: docTypeColors[d.doc_type], padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>{d.doc_type}</span></td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{d.project_name || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: d.avatar_color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white' }}>{d.uploaded_by_name?.[0]}</div>
                    <span style={{ fontSize: '13px' }}>{d.uploaded_by_name || '-'}</span>
                  </div>
                </td>
                <td><span style={{ background: '#2d2f45', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>v{d.version}</span></td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{d.created_at?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '700px' }}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Type</label><span style={{ color: docTypeColors[selected.doc_type] }}>{selected.doc_type}</span></div>
                <div className="detail-item"><label>Version</label><span>v{selected.version}</span></div>
                <div className="detail-item"><label>Project</label><span>{selected.project_name || '-'}</span></div>
                <div className="detail-item"><label>Author</label><span>{selected.uploaded_by_name || '-'}</span></div>
                <div className="detail-item detail-full" style={{ background: '#141627', padding: '16px', borderRadius: '10px' }}>
                  <label>Content</label>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, marginTop: '8px' }}>{selected.content || 'No content'}</p>
                </div>
              </div>
              <button className="btn btn-ai btn-sm" onClick={() => handleAI(selected)}>
                &#x2728; AI Document Summary
              </button>
              <AIOutput content={aiResult} title="AI Document Summary" loading={aiLoading} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { handleEdit(selected); setSelected(null); }}><FiEdit2 /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '650px' }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Document' : 'New Document'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Document title" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label>Project</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}><option value="">Select Project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="form-group"><label>Type</label><select value={form.doc_type} onChange={e => setForm({ ...form, doc_type: e.target.value })}><option value="document">Document</option><option value="spec">Specification</option><option value="design">Design</option><option value="meeting_notes">Meeting Notes</option></select></div>
                <div className="form-group"><label>Author</label><select value={form.uploaded_by} onChange={e => setForm({ ...form, uploaded_by: e.target.value })}><option value="">Select Author</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="form-group"><label>Version</label><input type="number" min="1" value={form.version} onChange={e => setForm({ ...form, version: parseInt(e.target.value) || 1 })} /></div>
              </div>
              <div className="form-group"><label>Content</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Document content..." rows={8} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>{editing ? 'Update' : 'Create'} Document</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
