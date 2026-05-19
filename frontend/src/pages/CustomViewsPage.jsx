import React from 'react';
import ProjectGanttTimeline from '../components/ProjectGanttTimeline';
import ResourceAllocationHeatmap from '../components/ResourceAllocationHeatmap';
import StatusReportPDF from '../components/StatusReportPDF';
import ProjectRulesEditor from '../components/ProjectRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1 style={{ color: '#e2e8f0', marginBottom: 4 }}>PM Custom Views</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Gantt timelines, resource heatmaps, status PDFs, and milestone rule gates.</p>
      </header>
      <ProjectGanttTimeline />
      <ResourceAllocationHeatmap />
      <StatusReportPDF />
      <ProjectRulesEditor />
    </div>
  );
}
