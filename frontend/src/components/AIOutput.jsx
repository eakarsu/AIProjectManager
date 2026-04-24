import React from 'react';

function formatAIContent(text) {
  if (!text) return '';

  // Convert markdown-style formatting to HTML
  let html = text
    // Headers
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Emoji indicators are kept as-is
    // Tables - convert markdown tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        return ''; // Skip separator rows
      }
      const isHeader = match.includes('---');
      const tag = isHeader ? 'th' : 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    })
    // Line breaks
    .replace(/\n/g, '<br/>');

  // Wrap table rows in a table
  if (html.includes('<tr>')) {
    html = html.replace(
      /(<tr>.*?<\/tr>(?:<br\/>)*)+/g,
      '<table>$&</table>'
    );
  }

  // Clean up excessive br tags
  html = html.replace(/(<br\/>){3,}/g, '<br/><br/>');

  return html;
}

export default function AIOutput({ content, title, loading }) {
  if (loading) {
    return (
      <div className="ai-output">
        <div className="ai-output-header">
          <div className="ai-icon">&#x2728;</div>
          <h4>AI is analyzing...</h4>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <div className="ai-icon">&#x2728;</div>
        <h4>{title || 'AI Analysis'}</h4>
      </div>
      <div
        className="ai-output-content"
        dangerouslySetInnerHTML={{ __html: formatAIContent(content) }}
      />
    </div>
  );
}
