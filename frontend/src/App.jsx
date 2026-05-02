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
import Navbar from './components/Navbar';

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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
