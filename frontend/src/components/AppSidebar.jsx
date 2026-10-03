import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const LINKS = [
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/projects', label: 'Projects', group: 'Workspace' },
  { to: '/tasks', label: 'Tasks', group: 'Workspace' },
  { to: '/sprints', label: 'Sprints', group: 'Workspace' },
  { to: '/risks', label: 'Risks', group: 'Workspace' },
  { to: '/standups', label: 'Standups', group: 'Workspace' },
  { to: '/team', label: 'Team', group: 'Workspace' },
  { to: '/kanban', label: 'Kanban Board', group: 'Workspace' },
  { to: '/milestones', label: 'Milestones', group: 'Workspace' },
  { to: '/time-tracking', label: 'Time Tracking', group: 'Workspace' },
  { to: '/retrospectives', label: 'Retrospectives', group: 'Workspace' },
  { to: '/analytics', label: 'Analytics', group: 'Workspace' },
  { to: '/calendar', label: 'Calendar', group: 'Workspace' },
  { to: '/documents', label: 'Documents', group: 'Workspace' },
  { to: '/activity-log', label: 'Activity Log', group: 'Workspace' },
  { to: '/notifications', label: 'Notifications', group: 'Workspace' },
  { to: '/ai-history', label: 'AI History', group: 'Workspace' },
  { to: '/project-health', label: 'Project Health', group: 'Workspace' },
  { to: '/standup-summary', label: 'Standup Summary', group: 'Workspace' },
  { to: '/estimate-timeline', label: 'Estimate Timeline', group: 'Workspace' },
  { to: '/smart-assign', label: 'Smart Assign', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
  { to: '/cf-agentic-sprint-planner', label: 'Cf Agentic Sprint Planner', group: 'Workspace' },
  { to: '/cf-realtime-burndown-streaming', label: 'Cf Realtime Burndown Streaming', group: 'Workspace' },
  { to: '/cf-crossteam-resource-optimization', label: 'Cf Crossteam Resource Optimization', group: 'Workspace' },
  { to: '/cf-document-backlog-ingestion', label: 'Cf Document Backlog Ingestion', group: 'Workspace' },
  { to: '/cf-meeting-recording-transcription', label: 'Cf Meeting Recording Transcription', group: 'Workspace' },
  { to: '/cf-sentimentdriven-sprint-review', label: 'Cf Sentimentdriven Sprint Review', group: 'Workspace' },
  { to: '/gap-no-ai-timeline-estimation-under-velocitydepe', label: 'Gap No Ai Timeline Estimation Under Velocitydepe', group: 'Workspace' },
  { to: '/gap-no-ai-autoassignment-by-skills-and-workload', label: 'Gap No Ai Autoassignment By Skills And Workload', group: 'Workspace' },
  { to: '/gap-no-documenttotask-ingestion-requirements-pdf', label: 'Gap No Documenttotask Ingestion Requirements Pdf', group: 'Workspace' },
  { to: '/gap-no-ai-meeting-transcript-summarization-to-ta', label: 'Gap No Ai Meeting Transcript Summarization To Ta', group: 'Workspace' },
  { to: '/gap-no-ai-burnoutsentiment-detection-across-stan', label: 'Gap No Ai Burnoutsentiment Detection Across Stan', group: 'Workspace' },
  { to: '/gap-no-public-webhook-system-or-outbound-integra', label: 'Gap No Public Webhook System Or Outbound Integra', group: 'Workspace' },
  { to: '/gap-no-native-jiragithublinearslack-connectors', label: 'Gap No Native Jiragithublinearslack Connectors', group: 'Workspace' },
  { to: '/gap-no-formal-rbac-matrix-granular-permission-ro', label: 'Gap No Formal Rbac Matrix Granular Permission Ro', group: 'Workspace' },
  { to: '/gap-no-fileupload-route-attachments-rely-on-docu', label: 'Gap No Fileupload Route Attachments Rely On Docu', group: 'Workspace' },
  { to: '/gap-no-ssooauth-provider-hookups', label: 'Gap No Ssooauth Provider Hookups', group: 'Workspace' },
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIProject Manager</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
