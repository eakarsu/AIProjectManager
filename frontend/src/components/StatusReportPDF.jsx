import React, { useState } from 'react';

export default function StatusReportPDF() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const generate = async () => {
    setLoading(true);
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/status-report', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setReport(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!report?.pdfBase64) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${report.pdfBase64}`;
    link.download = `${report.reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div data-testid="status-report" style={{ background: '#1e1f3a', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>Status Report (PDF)</h3>
      <button
        onClick={generate}
        disabled={loading}
        style={{ background: '#6366f1', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}
      >
        {loading ? 'Generating...' : 'Generate Status Report'}
      </button>
      {report && (
        <button
          onClick={download}
          style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Download PDF
        </button>
      )}
      {err && <div style={{ color: '#ef4444', marginTop: 12 }}>{err}</div>}
      {report && (
        <div style={{ marginTop: 16, background: '#0f172a', padding: 16, borderRadius: 8, color: '#cbd5e1', fontFamily: 'monospace', fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Report: {report.reportId}</span>
            <span style={{ color: report.health === 'AT-RISK' ? '#ef4444' : '#10b981', fontWeight: 700 }}>{report.health}</span>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{report.lines.join('\n')}</pre>
          <div style={{ marginTop: 8, color: '#94a3b8' }}>PDF size: {report.pdfSizeBytes} bytes</div>
        </div>
      )}
    </div>
  );
}
