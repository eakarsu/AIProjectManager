import React, { useEffect, useState } from 'react';

const emptyForm = { name: '', milestone: '', dependency: '', gateType: 'approval', enabled: true };

export default function ProjectRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const load = () => {
    setLoading(true);
    fetch('/api/custom-views/rules', { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load rules'))))
      .then((d) => setRules(d.rules || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const url = editingId ? `/api/custom-views/rules/${editingId}` : '/api/custom-views/rules';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const editRule = (r) => {
    setEditingId(r.id);
    setForm({ name: r.name, milestone: r.milestone, dependency: r.dependency, gateType: r.gateType, enabled: r.enabled });
  };

  const deleteRule = async (id) => {
    setErr('');
    try {
      const res = await fetch(`/api/custom-views/rules/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div data-testid="rules-editor" style={{ background: '#1e1f3a', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>Project Rules Editor (Milestone Gates & Dependencies)</h3>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 8, marginBottom: 16 }}>
        <input placeholder="Rule name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 10px', borderRadius: 6 }} />
        <input placeholder="Milestone" value={form.milestone} onChange={(e) => setForm({ ...form, milestone: e.target.value })} required
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 10px', borderRadius: 6 }} />
        <input placeholder="Dependency" value={form.dependency} onChange={(e) => setForm({ ...form, dependency: e.target.value })}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 10px', borderRadius: 6 }} />
        <select value={form.gateType} onChange={(e) => setForm({ ...form, gateType: e.target.value })}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 10px', borderRadius: 6 }}>
          <option value="approval">Approval</option>
          <option value="quality">Quality</option>
          <option value="compliance">Compliance</option>
        </select>
        <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}>
          {editingId ? 'Update' : 'Add'} Rule
        </button>
      </form>
      {err && <div style={{ color: '#ef4444', marginBottom: 12 }}>{err}</div>}
      {loading ? <div style={{ color: '#cbd5e1' }}>Loading rules...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Milestone</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Dependency</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Gate</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: 8 }}>{r.name}</td>
                <td style={{ padding: 8 }}>{r.milestone}</td>
                <td style={{ padding: 8 }}>{r.dependency}</td>
                <td style={{ padding: 8 }}>{r.gateType}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <button onClick={() => editRule(r)} style={{ marginRight: 6, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteRule(r.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
