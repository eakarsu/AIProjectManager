import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Sprints from './pages/Sprints';
import Risks from './pages/Risks';
import Standups from './pages/Standups';
import Team from './pages/Team';
import KanbanBoard from './pages/KanbanBoard';
import Milestones from './pages/Milestones';
import TimeTracking from './pages/TimeTracking';
import Retrospectives from './pages/Retrospectives';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Documents from './pages/Documents';
import ActivityLog from './pages/ActivityLog';
import Notifications from './pages/Notifications';
import AIHistory from './pages/AIHistory';
import ProjectHealth from './pages/ProjectHealth';
import StandupSummary from './pages/StandupSummary';
import EstimateTimeline from './pages/EstimateTimeline';
import SmartAssign from './pages/SmartAssign';
import SentimentSprintReview from './pages/SentimentSprintReview';
import CrossTeamOptimize from './pages/CrossTeamOptimize';
import Navbar from './components/Navbar';

// === Batch 07 Gaps & Frontend Mounts ===
import CfAgenticSprintPlanner from './pages/CfAgenticSprintPlanner';
import CfRealtimeBurndownStreaming from './pages/CfRealtimeBurndownStreaming';
import CfCrossteamResourceOptimization from './pages/CfCrossteamResourceOptimization';
import CfDocumentBacklogIngestion from './pages/CfDocumentBacklogIngestion';
import CfMeetingRecordingTranscription from './pages/CfMeetingRecordingTranscription';
import CfSentimentdrivenSprintReview from './pages/CfSentimentdrivenSprintReview';
import GapNoAiTimelineEstimationUnderVelocitydepe from './pages/GapNoAiTimelineEstimationUnderVelocitydepe';
import GapNoAiAutoassignmentBySkillsAndWorkload from './pages/GapNoAiAutoassignmentBySkillsAndWorkload';
import GapNoDocumenttotaskIngestionRequirementsPdf from './pages/GapNoDocumenttotaskIngestionRequirementsPdf';
import GapNoAiMeetingTranscriptSummarizationToTa from './pages/GapNoAiMeetingTranscriptSummarizationToTa';
import GapNoAiBurnoutsentimentDetectionAcrossStan from './pages/GapNoAiBurnoutsentimentDetectionAcrossStan';
import GapNoPublicWebhookSystemOrOutboundIntegra from './pages/GapNoPublicWebhookSystemOrOutboundIntegra';
import GapNoNativeJiragithublinearslackConnectors from './pages/GapNoNativeJiragithublinearslackConnectors';
import GapNoFormalRbacMatrixGranularPermissionRo from './pages/GapNoFormalRbacMatrixGranularPermissionRo';
import GapNoFileuploadRouteAttachmentsRelyOnDocu from './pages/GapNoFileuploadRouteAttachmentsRelyOnDocu';
import GapNoSsooauthProviderHookups from './pages/GapNoSsooauthProviderHookups';
// === End Batch 07 ===


function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, [token]);

  const handleLogin = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/standups" element={<Standups />} />
          <Route path="/team" element={<Team />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/time-tracking" element={<TimeTracking />} />
          <Route path="/retrospectives" element={<Retrospectives />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ai-history" element={<AIHistory />} />
          <Route path="/project-health" element={<ProjectHealth />} />
          <Route path="/standup-summary" element={<StandupSummary />} />
          <Route path="/estimate-timeline" element={<EstimateTimeline />} />
          <Route path="/smart-assign" element={<SmartAssign />} />
          <Route path="*" element={<Navigate to="/" />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-agentic-sprint-planner' element={<CfAgenticSprintPlanner />} />
          <Route path='/cf-realtime-burndown-streaming' element={<CfRealtimeBurndownStreaming />} />
          <Route path='/cf-crossteam-resource-optimization' element={<CfCrossteamResourceOptimization />} />
          <Route path='/cf-document-backlog-ingestion' element={<CfDocumentBacklogIngestion />} />
          <Route path='/cf-meeting-recording-transcription' element={<CfMeetingRecordingTranscription />} />
          <Route path='/cf-sentimentdriven-sprint-review' element={<CfSentimentdrivenSprintReview />} />
          <Route path='/gap-no-ai-timeline-estimation-under-velocitydepe' element={<GapNoAiTimelineEstimationUnderVelocitydepe />} />
          <Route path='/gap-no-ai-autoassignment-by-skills-and-workload' element={<GapNoAiAutoassignmentBySkillsAndWorkload />} />
          <Route path='/gap-no-documenttotask-ingestion-requirements-pdf' element={<GapNoDocumenttotaskIngestionRequirementsPdf />} />
          <Route path='/gap-no-ai-meeting-transcript-summarization-to-ta' element={<GapNoAiMeetingTranscriptSummarizationToTa />} />
          <Route path='/gap-no-ai-burnoutsentiment-detection-across-stan' element={<GapNoAiBurnoutsentimentDetectionAcrossStan />} />
          <Route path='/gap-no-public-webhook-system-or-outbound-integra' element={<GapNoPublicWebhookSystemOrOutboundIntegra />} />
          <Route path='/gap-no-native-jiragithublinearslack-connectors' element={<GapNoNativeJiragithublinearslackConnectors />} />
          <Route path='/gap-no-formal-rbac-matrix-granular-permission-ro' element={<GapNoFormalRbacMatrixGranularPermissionRo />} />
          <Route path='/gap-no-fileupload-route-attachments-rely-on-docu' element={<GapNoFileuploadRouteAttachmentsRelyOnDocu />} />
          <Route path='/gap-no-ssooauth-provider-hookups' element={<GapNoSsooauthProviderHookups />} />
          // === End Batch 07 ===
        </Routes>
      </main>
    </div>
  );
}

export default App;
