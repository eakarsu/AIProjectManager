-- Drop tables if they exist (reverse dependency order)
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS time_logs CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS retrospectives CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS standups CASCADE;
DROP TABLE IF EXISTS risks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'developer',
  avatar_color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  priority VARCHAR(50) DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sprints table
CREATE TABLE sprints (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planning',
  velocity INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 40,
  ai_suggestions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(50) DEFAULT 'medium',
  assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
  story_points INTEGER DEFAULT 1,
  due_date DATE,
  task_type VARCHAR(50) DEFAULT 'feature',
  ai_breakdown TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Risks table
CREATE TABLE risks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  probability VARCHAR(50) DEFAULT 'medium',
  impact VARCHAR(50) DEFAULT 'medium',
  risk_score INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'open',
  category VARCHAR(100) DEFAULT 'technical',
  mitigation TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ai_prediction TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Standups table
CREATE TABLE standups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  yesterday TEXT,
  today TEXT,
  blockers TEXT,
  mood VARCHAR(50) DEFAULT 'neutral',
  standup_date DATE DEFAULT CURRENT_DATE,
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Team Members table
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'developer',
  availability INTEGER DEFAULT 100,
  skills TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- =============================================
-- NEW FEATURE TABLES
-- =============================================

-- Comments table (for tasks, projects, risks)
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  entity_name VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Labels table
CREATE TABLE labels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task Labels junction table
CREATE TABLE task_labels (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
  UNIQUE(task_id, label_id)
);

-- Milestones table
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  target_date DATE,
  status VARCHAR(50) DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Time Logs table
CREATE TABLE time_logs (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  hours DECIMAL(5,2) NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  start_datetime TIMESTAMP,
  end_datetime TIMESTAMP,
  notes TEXT,
  billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Retrospectives table
CREATE TABLE retrospectives (
  id SERIAL PRIMARY KEY,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE CASCADE,
  went_well TEXT,
  to_improve TEXT,
  action_items TEXT,
  mood_score INTEGER DEFAULT 3,
  conducted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ai_analysis TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  doc_type VARCHAR(50) DEFAULT 'document',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
