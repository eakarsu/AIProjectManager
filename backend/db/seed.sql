-- Seed Users (password is 'password123' hashed with bcrypt)
INSERT INTO users (name, email, password, role, avatar_color) VALUES
('Admin User', 'admin@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'admin', '#6366f1'),
('Sarah Chen', 'sarah@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'tech_lead', '#ec4899'),
('James Wilson', 'james@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'developer', '#f59e0b'),
('Emily Davis', 'emily@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'designer', '#10b981'),
('Michael Brown', 'michael@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'developer', '#3b82f6'),
('Lisa Taylor', 'lisa@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'qa_engineer', '#8b5cf6'),
('David Martinez', 'david@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'devops', '#ef4444'),
('Anna Johnson', 'anna@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'product_manager', '#06b6d4'),
('Robert Lee', 'robert@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'developer', '#84cc16'),
('Jessica Kim', 'jessica@aipm.com', '$2a$10$srzzTnGzBgE9hy6MEuuFBO/9denkWT8Ns5V4HxbbozY5zhtaCbgfq', 'developer', '#f97316');

-- Seed Projects (16 projects)
INSERT INTO projects (name, description, status, priority, start_date, end_date, owner_id, progress) VALUES
('E-Commerce Platform', 'Build a modern e-commerce platform with payment integration and inventory management', 'active', 'high', '2024-01-15', '2024-06-30', 1, 65),
('Mobile Banking App', 'Develop a secure mobile banking application with biometric authentication', 'active', 'critical', '2024-02-01', '2024-08-15', 2, 40),
('AI Chatbot Service', 'Create an AI-powered customer service chatbot with NLP capabilities', 'active', 'high', '2024-03-01', '2024-07-30', 3, 55),
('Healthcare Portal', 'Patient management system with appointment scheduling and telemedicine', 'active', 'high', '2024-01-20', '2024-09-01', 4, 30),
('Supply Chain Dashboard', 'Real-time supply chain monitoring and analytics dashboard', 'active', 'medium', '2024-04-01', '2024-10-15', 5, 20),
('Social Media Analytics', 'Social media monitoring and sentiment analysis platform', 'planning', 'medium', '2024-05-01', '2024-11-30', 6, 10),
('IoT Fleet Management', 'IoT-based fleet tracking and management system', 'active', 'high', '2024-02-15', '2024-08-30', 7, 45),
('Learning Management System', 'Online learning platform with video courses and assessments', 'active', 'medium', '2024-03-15', '2024-09-30', 8, 35),
('CRM Integration Suite', 'Customer relationship management with third-party integrations', 'completed', 'low', '2023-09-01', '2024-02-28', 9, 100),
('Data Pipeline Framework', 'Scalable ETL pipeline for big data processing', 'active', 'high', '2024-04-15', '2024-10-30', 10, 25),
('DevOps Automation Hub', 'CI/CD pipeline automation and infrastructure management', 'active', 'critical', '2024-01-10', '2024-07-15', 7, 70),
('Content Management System', 'Headless CMS with API-first architecture', 'planning', 'medium', '2024-06-01', '2024-12-31', 3, 5),
('Blockchain Voting System', 'Decentralized voting platform using blockchain technology', 'on_hold', 'low', '2024-03-01', '2024-12-01', 5, 15),
('AR Shopping Experience', 'Augmented reality product visualization for e-commerce', 'active', 'high', '2024-05-15', '2024-11-30', 4, 18),
('Microservices Migration', 'Migrate monolithic application to microservices architecture', 'active', 'critical', '2024-02-01', '2024-10-01', 2, 50),
('Real-time Collaboration Tool', 'Google Docs-like real-time document collaboration platform', 'active', 'high', '2024-04-01', '2024-09-30', 1, 38);

-- Seed Sprints (16 sprints)
INSERT INTO sprints (name, goal, project_id, start_date, end_date, status, velocity, capacity) VALUES
('Sprint 1 - Foundation', 'Set up project architecture and core authentication', 1, '2024-01-15', '2024-01-29', 'completed', 32, 40),
('Sprint 2 - Product Catalog', 'Implement product listing, search, and filtering', 1, '2024-01-30', '2024-02-12', 'completed', 28, 40),
('Sprint 3 - Shopping Cart', 'Build shopping cart and checkout flow', 1, '2024-02-13', '2024-02-26', 'active', 35, 40),
('Sprint 4 - Payment Integration', 'Integrate Stripe and PayPal payment gateways', 1, '2024-02-27', '2024-03-11', 'planning', 0, 40),
('Sprint 1 - Security Core', 'Implement core security features and biometric auth', 2, '2024-02-01', '2024-02-14', 'completed', 25, 35),
('Sprint 2 - Account Management', 'Build account management and transaction history', 2, '2024-02-15', '2024-02-28', 'active', 30, 35),
('Sprint 1 - NLP Engine', 'Build natural language processing engine', 3, '2024-03-01', '2024-03-14', 'completed', 22, 30),
('Sprint 2 - Chat Interface', 'Create chat UI and conversation management', 3, '2024-03-15', '2024-03-28', 'active', 27, 30),
('Sprint 1 - Patient Records', 'Implement patient registration and records system', 4, '2024-01-20', '2024-02-02', 'completed', 20, 35),
('Sprint 2 - Appointments', 'Build appointment scheduling system', 4, '2024-02-03', '2024-02-16', 'active', 18, 35),
('Sprint 1 - Data Collection', 'Set up IoT data collection pipeline', 7, '2024-02-15', '2024-02-28', 'completed', 30, 40),
('Sprint 2 - Fleet Dashboard', 'Build real-time fleet monitoring dashboard', 7, '2024-03-01', '2024-03-14', 'active', 33, 40),
('Sprint 1 - CI Pipeline', 'Set up continuous integration pipeline', 11, '2024-01-10', '2024-01-23', 'completed', 38, 45),
('Sprint 2 - CD Automation', 'Implement continuous deployment automation', 11, '2024-01-24', '2024-02-06', 'completed', 40, 45),
('Sprint 3 - Monitoring', 'Add monitoring, alerting, and logging', 11, '2024-02-07', '2024-02-20', 'active', 36, 45),
('Sprint 1 - Migration Planning', 'Plan and design microservices architecture', 15, '2024-02-01', '2024-02-14', 'completed', 24, 35);

-- Seed Tasks (18 tasks)
INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, sprint_id, story_points, due_date, task_type) VALUES
('Implement user authentication', 'Set up JWT-based authentication with refresh tokens', 'done', 'critical', 2, 1, 1, 8, '2024-01-25', 'feature'),
('Design product catalog UI', 'Create responsive product listing with grid/list views', 'done', 'high', 4, 1, 2, 5, '2024-02-08', 'feature'),
('Build shopping cart API', 'REST API for cart operations (add, remove, update quantity)', 'in_progress', 'high', 3, 1, 3, 8, '2024-02-22', 'feature'),
('Implement payment gateway', 'Integrate Stripe for payment processing', 'todo', 'critical', 5, 1, 4, 13, '2024-03-08', 'feature'),
('Set up biometric authentication', 'Implement fingerprint and face ID for mobile app', 'done', 'critical', 2, 2, 5, 8, '2024-02-10', 'feature'),
('Build transaction history', 'Display transaction list with filters and search', 'in_progress', 'high', 9, 2, 6, 5, '2024-02-25', 'feature'),
('Train NLP model', 'Fine-tune language model for customer service domain', 'done', 'critical', 3, 3, 7, 13, '2024-03-12', 'feature'),
('Create chat widget', 'Embeddable chat widget for customer websites', 'in_progress', 'high', 5, 3, 8, 8, '2024-03-25', 'feature'),
('Patient registration form', 'Multi-step patient registration with validation', 'done', 'high', 4, 4, 9, 5, '2024-01-30', 'feature'),
('Appointment calendar', 'Interactive calendar for booking appointments', 'in_progress', 'high', 10, 4, 10, 8, '2024-02-14', 'feature'),
('GPS tracking integration', 'Integrate GPS devices for real-time location tracking', 'done', 'critical', 7, 7, 11, 8, '2024-02-26', 'feature'),
('Fleet dashboard map', 'Real-time map showing fleet vehicle locations', 'in_progress', 'high', 5, 7, 12, 8, '2024-03-12', 'feature'),
('Jenkins pipeline setup', 'Configure Jenkins for automated builds and tests', 'done', 'critical', 7, 11, 13, 5, '2024-01-20', 'devops'),
('Docker containerization', 'Containerize all services with Docker Compose', 'done', 'high', 7, 11, 14, 8, '2024-02-04', 'devops'),
('Set up Prometheus monitoring', 'Configure Prometheus and Grafana for monitoring', 'in_progress', 'high', 7, 11, 15, 8, '2024-02-18', 'devops'),
('Fix login session timeout', 'Users getting logged out after 5 minutes', 'in_progress', 'critical', 2, 1, 3, 3, '2024-02-20', 'bug'),
('Optimize database queries', 'Slow queries on product search - add indexing', 'todo', 'high', 3, 1, 3, 5, '2024-02-24', 'improvement'),
('Write API documentation', 'Document all REST endpoints with Swagger', 'todo', 'medium', 8, 1, 4, 5, '2024-03-05', 'documentation');

-- Seed Risks (16 risks)
INSERT INTO risks (title, description, project_id, probability, impact, risk_score, status, category, mitigation, owner_id) VALUES
('Payment data breach', 'Risk of exposing customer payment information during transactions', 1, 'low', 'critical', 8, 'mitigated', 'security', 'Implement PCI DSS compliance, use tokenization, regular security audits', 2),
('Third-party API downtime', 'Stripe or PayPal API outages affecting checkout', 1, 'medium', 'high', 7, 'open', 'technical', 'Implement fallback payment provider, add circuit breaker pattern', 3),
('Mobile app performance', 'Banking app may have slow load times on older devices', 2, 'high', 'medium', 6, 'open', 'technical', 'Performance profiling, lazy loading, optimize bundle size', 5),
('Regulatory compliance gap', 'May not meet all banking regulatory requirements', 2, 'medium', 'critical', 9, 'monitoring', 'compliance', 'Engage compliance consultant, regular audits, stay updated on regulations', 8),
('NLP accuracy issues', 'Chatbot may provide incorrect responses to complex queries', 3, 'high', 'high', 8, 'open', 'technical', 'Human escalation path, continuous training, feedback loop', 3),
('Data privacy violation', 'Risk of HIPAA violation with patient data', 4, 'low', 'critical', 8, 'mitigated', 'compliance', 'Encryption at rest and in transit, access controls, audit logging', 4),
('Scope creep', 'Feature requests expanding beyond original project scope', 5, 'high', 'medium', 6, 'open', 'management', 'Strict change management process, regular scope reviews', 8),
('Key personnel departure', 'Risk of losing critical team members mid-project', 1, 'medium', 'high', 7, 'open', 'resource', 'Cross-training, documentation, competitive retention packages', 1),
('Integration failures', 'CRM third-party integrations may have compatibility issues', 9, 'medium', 'medium', 5, 'closed', 'technical', 'Thorough API testing, version pinning, integration test suite', 9),
('IoT device connectivity', 'GPS devices may lose connectivity in remote areas', 7, 'high', 'high', 8, 'open', 'technical', 'Offline data caching, satellite backup, reconnection logic', 7),
('Budget overrun', 'Project costs exceeding allocated budget by 20%+', 15, 'medium', 'high', 7, 'monitoring', 'financial', 'Monthly budget reviews, phased spending, contingency fund', 1),
('Technology obsolescence', 'Chosen tech stack may become outdated during development', 12, 'low', 'medium', 4, 'open', 'technical', 'Use widely-adopted technologies, modular architecture', 3),
('Vendor lock-in', 'Heavy dependency on specific cloud provider', 10, 'medium', 'medium', 5, 'open', 'strategic', 'Multi-cloud strategy, containerization, abstract cloud services', 7),
('User adoption resistance', 'End users may resist switching to new system', 8, 'high', 'medium', 6, 'open', 'business', 'Training programs, gradual rollout, feedback sessions', 8),
('Deployment failure risk', 'CI/CD pipeline may cause production outages', 11, 'medium', 'critical', 8, 'monitoring', 'technical', 'Blue-green deployment, rollback procedures, staging environment', 7),
('Data migration errors', 'Data loss or corruption during migration from monolith', 15, 'high', 'critical', 9, 'open', 'technical', 'Incremental migration, data validation, rollback plan', 2);

-- Seed Standups (18 standups)
INSERT INTO standups (user_id, project_id, yesterday, today, blockers, mood, standup_date) VALUES
(2, 1, 'Completed JWT authentication flow with refresh tokens', 'Working on role-based access control implementation', 'None', 'productive', '2024-02-20'),
(3, 1, 'Fixed shopping cart quantity update bug', 'Implementing cart persistence across sessions', 'Waiting for Redis setup', 'focused', '2024-02-20'),
(4, 1, 'Finished product detail page responsive design', 'Starting checkout flow UI mockups', 'Need design review from product team', 'creative', '2024-02-20'),
(5, 1, 'Reviewed Stripe API documentation', 'Setting up Stripe sandbox environment', 'API key approval pending', 'neutral', '2024-02-20'),
(2, 2, 'Implemented biometric fallback to PIN', 'Testing biometric auth on different devices', 'Need test devices for older Android versions', 'challenged', '2024-02-19'),
(9, 2, 'Built transaction list component', 'Adding date range filters to transaction history', 'None', 'productive', '2024-02-20'),
(3, 3, 'Fine-tuned NLP model with new training data', 'Evaluating model accuracy on test dataset', 'GPU resources limited for training', 'focused', '2024-02-20'),
(5, 3, 'Created base chat widget structure', 'Implementing real-time message streaming', 'WebSocket server configuration needed', 'energized', '2024-02-20'),
(4, 4, 'Completed patient form validation rules', 'Starting appointment booking calendar', 'Calendar library has accessibility issues', 'concerned', '2024-02-20'),
(10, 4, 'Researched HIPAA-compliant data storage', 'Implementing encrypted patient data at rest', 'Need compliance team review', 'cautious', '2024-02-20'),
(7, 7, 'Set up MQTT broker for IoT devices', 'Building real-time data ingestion pipeline', 'High message throughput causing delays', 'challenged', '2024-02-20'),
(5, 7, 'Started fleet dashboard with Leaflet maps', 'Adding vehicle marker clustering for performance', 'None', 'productive', '2024-02-20'),
(7, 11, 'Configured Prometheus with custom metrics', 'Setting up Grafana dashboards for services', 'Some services missing health endpoints', 'focused', '2024-02-20'),
(2, 15, 'Documented service boundaries for migration', 'Extracting user service from monolith', 'Database shared tables need careful splitting', 'analytical', '2024-02-20'),
(8, 1, 'Reviewed product backlog and prioritized features', 'Preparing sprint 4 planning meeting', 'Stakeholder availability for review', 'organized', '2024-02-20'),
(6, 1, 'Wrote integration tests for product search', 'Testing cart edge cases and error handling', 'Test environment database needs refresh', 'methodical', '2024-02-20'),
(3, 10, 'Set up Apache Airflow for pipeline orchestration', 'Creating data transformation DAGs', 'Source database credentials pending', 'productive', '2024-02-20'),
(1, 1, 'Reviewed team progress and updated roadmap', 'Meeting with stakeholders about Q2 priorities', 'Budget approval for additional resources', 'strategic', '2024-02-20');

-- Seed Team Members (16 team members)
INSERT INTO team_members (user_id, project_id, role, availability, skills) VALUES
(1, 1, 'Project Manager', 50, 'Leadership, Agile, Strategic Planning'),
(2, 1, 'Tech Lead', 100, 'Node.js, React, System Design, Security'),
(3, 1, 'Senior Developer', 100, 'Node.js, PostgreSQL, Redis, API Design'),
(4, 1, 'UI/UX Designer', 80, 'Figma, CSS, Responsive Design, Accessibility'),
(5, 1, 'Full Stack Developer', 100, 'React, Node.js, TypeScript, AWS'),
(6, 1, 'QA Engineer', 100, 'Selenium, Jest, Cypress, Test Planning'),
(8, 1, 'Product Manager', 60, 'Product Strategy, User Research, Analytics'),
(2, 2, 'Tech Lead', 50, 'Mobile Security, React Native, Biometrics'),
(9, 2, 'Developer', 100, 'React Native, TypeScript, Mobile UI'),
(3, 3, 'AI Engineer', 100, 'Python, NLP, TensorFlow, Machine Learning'),
(5, 3, 'Frontend Developer', 50, 'React, WebSocket, Chat UI'),
(4, 4, 'Lead Designer', 100, 'Healthcare UX, Accessibility, WCAG'),
(10, 4, 'Developer', 100, 'Node.js, HIPAA Compliance, Encryption'),
(7, 7, 'DevOps Lead', 100, 'IoT, MQTT, Docker, Kubernetes'),
(7, 11, 'DevOps Engineer', 100, 'Jenkins, Docker, Kubernetes, Terraform'),
(2, 15, 'Architecture Lead', 50, 'Microservices, DDD, Event Sourcing');

-- =============================================
-- NEW FEATURE SEED DATA
-- =============================================

-- Seed Comments (18 comments)
INSERT INTO comments (entity_type, entity_id, user_id, content, created_at) VALUES
('task', 1, 2, 'JWT implementation is complete. Using RS256 for token signing. Refresh token rotation is also in place.', '2024-01-24 10:30:00'),
('task', 1, 3, 'Great work! Can we also add rate limiting on the auth endpoints?', '2024-01-24 11:15:00'),
('task', 3, 3, 'Cart API is progressing well. Need to decide on session-based vs token-based cart storage.', '2024-02-18 09:00:00'),
('task', 3, 5, 'I recommend token-based with Redis backing. We already have Redis in the stack.', '2024-02-18 09:45:00'),
('task', 4, 8, 'Stripe integration should support both one-time and subscription payments. Adding this to requirements.', '2024-02-25 14:00:00'),
('task', 7, 3, 'NLP model accuracy hit 94% on test set. Ready for production deployment.', '2024-03-11 16:00:00'),
('task', 7, 1, 'Excellent! Schedule the deployment for next Monday after the team review.', '2024-03-11 16:30:00'),
('task', 10, 10, 'Calendar component has timezone handling issues. Working on a fix using date-fns-tz.', '2024-02-12 11:00:00'),
('task', 10, 4, 'Make sure the calendar follows WCAG 2.1 guidelines for keyboard navigation.', '2024-02-12 11:30:00'),
('task', 16, 2, 'Session timeout issue traced to incorrect token expiry calculation. Fix incoming.', '2024-02-19 10:00:00'),
('project', 1, 1, 'Q1 review: E-Commerce platform is on track. Sprint 3 completion will be a major milestone.', '2024-02-15 09:00:00'),
('project', 1, 8, 'Stakeholders are happy with the demo. Requesting additional payment methods for Q2.', '2024-02-15 10:00:00'),
('project', 2, 2, 'Security audit completed. Two medium-severity findings to address before launch.', '2024-02-20 14:00:00'),
('project', 11, 7, 'CI/CD pipeline is 70% complete. Monitoring stack is the final piece.', '2024-02-10 09:00:00'),
('risk', 1, 2, 'PCI DSS Level 1 compliance audit scheduled for March 15th.', '2024-02-18 11:00:00'),
('risk', 5, 3, 'Added fallback to rule-based responses when NLP confidence is below 60%.', '2024-03-10 14:00:00'),
('task', 12, 5, 'Leaflet map performance is good with up to 500 markers. Need clustering above that.', '2024-03-08 15:00:00'),
('task', 15, 7, 'Prometheus exporters configured for all 12 services. Grafana dashboards next.', '2024-02-16 10:00:00');

-- Seed Activity Logs (20 logs)
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_name, details, created_at) VALUES
(2, 'created', 'task', 1, 'Implement user authentication', 'Created task with priority critical, 8 story points', '2024-01-15 09:00:00'),
(2, 'completed', 'task', 1, 'Implement user authentication', 'Task marked as done', '2024-01-25 17:00:00'),
(4, 'created', 'task', 2, 'Design product catalog UI', 'Created task assigned to Emily Davis', '2024-01-30 09:00:00'),
(1, 'updated', 'project', 1, 'E-Commerce Platform', 'Progress updated from 50% to 65%', '2024-02-15 10:00:00'),
(3, 'started', 'task', 3, 'Build shopping cart API', 'Task moved to in_progress', '2024-02-14 08:30:00'),
(7, 'completed', 'sprint', 1, 'Sprint 1 - Foundation', 'Sprint completed with velocity 32', '2024-01-29 17:00:00'),
(2, 'created', 'risk', 1, 'Payment data breach', 'New risk identified with score 8', '2024-01-20 11:00:00'),
(8, 'updated', 'sprint', 3, 'Sprint 3 - Shopping Cart', 'Sprint started, 5 tasks assigned', '2024-02-13 09:00:00'),
(3, 'completed', 'task', 7, 'Train NLP model', 'Model achieved 94% accuracy', '2024-03-12 16:00:00'),
(5, 'started', 'task', 8, 'Create chat widget', 'Task moved to in_progress', '2024-03-16 09:00:00'),
(7, 'completed', 'task', 13, 'Jenkins pipeline setup', 'CI pipeline fully operational', '2024-01-20 18:00:00'),
(7, 'completed', 'task', 14, 'Docker containerization', 'All services containerized', '2024-02-04 17:00:00'),
(1, 'created', 'project', 16, 'Real-time Collaboration Tool', 'New project created with high priority', '2024-04-01 09:00:00'),
(2, 'assigned', 'task', 16, 'Fix login session timeout', 'Task assigned to Sarah Chen', '2024-02-19 08:00:00'),
(6, 'commented', 'task', 17, 'Optimize database queries', 'Added performance benchmarks to description', '2024-02-22 10:00:00'),
(8, 'updated', 'project', 1, 'E-Commerce Platform', 'End date extended to June 30', '2024-02-10 14:00:00'),
(4, 'completed', 'task', 9, 'Patient registration form', 'Form with full validation complete', '2024-01-30 17:00:00'),
(7, 'started', 'task', 15, 'Set up Prometheus monitoring', 'Task moved to in_progress', '2024-02-08 09:00:00'),
(9, 'started', 'task', 6, 'Build transaction history', 'Task moved to in_progress', '2024-02-16 08:30:00'),
(1, 'updated', 'risk', 8, 'Key personnel departure', 'Mitigation plan updated with retention strategy', '2024-02-18 15:00:00');

-- Seed Notifications (18 notifications)
INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read, created_at) VALUES
(2, 'assignment', 'Task Assigned', 'You have been assigned to "Fix login session timeout"', 'task', 16, false, '2024-02-19 08:00:00'),
(3, 'deadline', 'Deadline Approaching', 'Task "Build shopping cart API" is due in 2 days', 'task', 3, false, '2024-02-20 09:00:00'),
(5, 'comment', 'New Comment', 'Michael Brown commented on "Create chat widget"', 'task', 8, true, '2024-03-18 10:00:00'),
(1, 'status_change', 'Sprint Completed', 'Sprint 1 - Foundation has been completed', 'sprint', 1, true, '2024-01-29 17:00:00'),
(8, 'mention', 'You were mentioned', 'Sarah Chen mentioned you in a comment on E-Commerce Platform', 'project', 1, false, '2024-02-15 10:30:00'),
(7, 'assignment', 'Task Assigned', 'You have been assigned to "Set up Prometheus monitoring"', 'task', 15, true, '2024-02-07 09:00:00'),
(4, 'deadline', 'Deadline Tomorrow', 'Task "Appointment calendar" is due tomorrow', 'task', 10, false, '2024-02-13 09:00:00'),
(2, 'risk', 'High Risk Alert', 'Risk "Data migration errors" score increased to 9', 'risk', 16, false, '2024-02-20 11:00:00'),
(9, 'status_change', 'Task Updated', 'Task "Build transaction history" moved to in_progress', 'task', 6, true, '2024-02-16 08:30:00'),
(3, 'comment', 'New Comment', 'Admin User commented on "Train NLP model"', 'task', 7, true, '2024-03-11 16:30:00'),
(6, 'assignment', 'Task Assigned', 'You have been assigned to QA testing sprint 3', 'sprint', 3, false, '2024-02-13 09:30:00'),
(5, 'deadline', 'Deadline Approaching', 'Task "Create chat widget" is due in 5 days', 'task', 8, false, '2024-03-20 09:00:00'),
(10, 'comment', 'New Comment', 'Emily Davis commented on "Appointment calendar"', 'task', 10, true, '2024-02-12 11:30:00'),
(1, 'status_change', 'Project Updated', 'E-Commerce Platform progress updated to 65%', 'project', 1, true, '2024-02-15 10:00:00'),
(7, 'risk', 'Risk Mitigated', 'Risk "Deployment failure risk" status changed to monitoring', 'risk', 15, true, '2024-02-18 14:00:00'),
(2, 'mention', 'You were mentioned', 'James Wilson mentioned you in Build shopping cart API', 'task', 3, false, '2024-02-18 09:50:00'),
(8, 'deadline', 'Sprint Ending', 'Sprint 3 - Shopping Cart ends in 3 days', 'sprint', 3, false, '2024-02-23 09:00:00'),
(3, 'assignment', 'New Project', 'You have been added to Data Pipeline Framework', 'project', 10, true, '2024-04-15 09:00:00');

-- Seed Labels (16 labels)
INSERT INTO labels (name, color, project_id) VALUES
('frontend', '#3b82f6', 1),
('backend', '#10b981', 1),
('bug', '#ef4444', 1),
('urgent', '#f97316', 1),
('documentation', '#8b5cf6', 1),
('security', '#ec4899', 2),
('mobile', '#06b6d4', 2),
('api', '#84cc16', 2),
('ai/ml', '#a855f7', 3),
('nlp', '#6366f1', 3),
('hipaa', '#ef4444', 4),
('ux', '#f59e0b', 4),
('devops', '#64748b', 11),
('infrastructure', '#0ea5e9', 11),
('performance', '#f97316', 1),
('testing', '#14b8a6', 1);

-- Seed Task Labels (18 associations)
INSERT INTO task_labels (task_id, label_id) VALUES
(1, 2), (1, 4),
(2, 1), (2, 12),
(3, 2), (3, 1),
(4, 2), (4, 4),
(5, 6), (5, 7),
(6, 1), (6, 8),
(7, 9), (7, 10),
(8, 1), (8, 9),
(13, 13), (14, 13);

-- Seed Milestones (16 milestones)
INSERT INTO milestones (name, description, project_id, target_date, status, progress) VALUES
('MVP Launch', 'Launch minimum viable product with core shopping features', 1, '2024-03-31', 'in_progress', 60),
('Payment Integration Complete', 'Stripe and PayPal fully integrated and tested', 1, '2024-04-15', 'in_progress', 25),
('Beta Release', 'Public beta with full product catalog and checkout', 1, '2024-05-30', 'pending', 0),
('Security Certification', 'Pass all security audits and certifications', 2, '2024-04-30', 'in_progress', 40),
('App Store Submission', 'Submit mobile banking app to App Store and Play Store', 2, '2024-07-01', 'pending', 0),
('Chatbot v1.0', 'First production release of AI chatbot', 3, '2024-04-30', 'in_progress', 55),
('Multi-language Support', 'Support for English, Spanish, French, German', 3, '2024-06-30', 'pending', 0),
('HIPAA Compliance', 'Full HIPAA compliance certification', 4, '2024-05-15', 'in_progress', 30),
('Telemedicine Launch', 'Video consultation feature live', 4, '2024-07-30', 'pending', 0),
('Fleet Tracking Live', 'Real-time tracking for 1000+ vehicles', 7, '2024-05-31', 'in_progress', 45),
('CI/CD Pipeline Complete', 'Full automation of build, test, deploy pipeline', 11, '2024-03-15', 'in_progress', 70),
('Infrastructure as Code', 'All infrastructure managed via Terraform', 11, '2024-05-30', 'pending', 10),
('Data Warehouse Setup', 'Central data warehouse operational', 10, '2024-06-30', 'in_progress', 25),
('Service Extraction Phase 1', 'Extract 3 core services from monolith', 15, '2024-05-01', 'in_progress', 50),
('Full Migration Complete', 'All services migrated to microservices', 15, '2024-09-30', 'pending', 0),
('Collaboration Beta', 'Beta release of real-time collaboration features', 16, '2024-07-15', 'in_progress', 38);

-- Seed Time Logs (20 time logs)
INSERT INTO time_logs (task_id, user_id, hours, log_date, start_datetime, end_datetime, notes, billable) VALUES
(1, 2, 4.5, '2024-01-16', '2024-01-16 09:00:00', '2024-01-16 13:30:00', 'Set up JWT library and token generation', true),
(1, 2, 6.0, '2024-01-17', '2024-01-17 08:30:00', '2024-01-17 14:30:00', 'Implemented refresh token rotation', true),
(1, 2, 3.5, '2024-01-18', '2024-01-18 10:00:00', '2024-01-18 13:30:00', 'Added role-based middleware', true),
(1, 2, 2.0, '2024-01-24', '2024-01-24 14:00:00', '2024-01-24 16:00:00', 'Code review fixes and testing', true),
(2, 4, 5.0, '2024-01-31', '2024-01-31 09:00:00', '2024-01-31 14:00:00', 'Wireframing product catalog layouts', true),
(2, 4, 7.0, '2024-02-01', '2024-02-01 08:00:00', '2024-02-01 15:00:00', 'Implemented grid and list view components', true),
(2, 4, 4.0, '2024-02-05', '2024-02-05 10:00:00', '2024-02-05 14:00:00', 'Responsive design and cross-browser testing', true),
(3, 3, 6.0, '2024-02-14', '2024-02-14 09:00:00', '2024-02-14 15:00:00', 'Cart data model and REST API design', true),
(3, 3, 5.5, '2024-02-15', '2024-02-15 08:30:00', '2024-02-15 14:00:00', 'Implementing add/remove/update cart operations', true),
(3, 3, 4.0, '2024-02-18', '2024-02-18 11:00:00', '2024-02-18 15:00:00', 'Redis session storage for cart persistence', true),
(7, 3, 8.0, '2024-03-05', '2024-03-05 08:00:00', '2024-03-05 16:00:00', 'Model training with custom dataset', true),
(7, 3, 6.0, '2024-03-08', '2024-03-08 09:00:00', '2024-03-08 15:00:00', 'Hyperparameter tuning and evaluation', true),
(7, 3, 4.0, '2024-03-11', '2024-03-11 10:00:00', '2024-03-11 14:00:00', 'Production deployment preparation', true),
(11, 7, 5.0, '2024-02-16', '2024-02-16 09:30:00', '2024-02-16 14:30:00', 'GPS device protocol integration', true),
(11, 7, 6.5, '2024-02-20', '2024-02-20 08:00:00', '2024-02-20 14:30:00', 'Real-time position streaming pipeline', true),
(13, 7, 4.0, '2024-01-11', '2024-01-11 10:00:00', '2024-01-11 14:00:00', 'Jenkins server setup and configuration', true),
(13, 7, 5.5, '2024-01-15', '2024-01-15 09:00:00', '2024-01-15 14:30:00', 'Pipeline scripts and build automation', true),
(14, 7, 7.0, '2024-01-25', '2024-01-25 08:00:00', '2024-01-25 15:00:00', 'Dockerfiles for all services', true),
(14, 7, 5.0, '2024-01-30', '2024-01-30 09:00:00', '2024-01-30 14:00:00', 'Docker Compose orchestration and testing', true),
(15, 7, 6.0, '2024-02-08', '2024-02-08 08:30:00', '2024-02-08 14:30:00', 'Prometheus exporters and Grafana setup', true);

-- Seed Retrospectives (16 retrospectives)
INSERT INTO retrospectives (sprint_id, went_well, to_improve, action_items, mood_score, conducted_by) VALUES
(1, 'Team collaboration was excellent. Architecture decisions were made quickly. Auth implementation was solid.', 'Initial setup took longer than expected. Need better onboarding docs for new stack.', 'Create developer setup guide. Set up code review checklist. Implement automated testing pipeline.', 4, 2),
(2, 'Product catalog delivered on time. Design system accelerated UI development. Great cross-team communication.', 'Search performance needs optimization. Some accessibility issues found late.', 'Add performance benchmarks to CI. Include accessibility checks in PR template. Schedule design review earlier.', 4, 4),
(5, 'Biometric auth passed security review first try. Mobile testing coverage was comprehensive.', 'Limited Android test devices. Some edge cases missed in PIN fallback.', 'Procure additional test devices. Create edge case testing checklist. Pair programming for security features.', 3, 2),
(7, 'NLP model exceeded accuracy targets. Training pipeline is reproducible and documented.', 'GPU resource bottleneck slowed training. Need better experiment tracking.', 'Request additional GPU quota. Set up MLflow for experiment tracking. Document model versioning strategy.', 4, 3),
(9, 'Patient registration form has 98% completion rate. HIPAA review passed.', 'Form validation error messages were confusing. Accessibility audit revealed issues.', 'Rewrite error messages with UX writer. Fix WCAG violations. Add screen reader testing to QA.', 3, 4),
(11, 'IoT data pipeline handles 10K messages/sec. Zero data loss in testing.', 'MQTT broker needed manual restart twice. Monitoring gaps for edge devices.', 'Implement MQTT broker auto-recovery. Add device health monitoring. Create runbook for common issues.', 4, 7),
(13, 'Jenkins pipeline reduced build time by 60%. Automated test coverage at 85%.', 'Flaky tests causing false failures. Docker build cache not optimized.', 'Fix top 10 flaky tests. Implement multi-stage Docker builds. Add build time tracking dashboard.', 5, 7),
(14, 'Deployment automation working flawlessly. Zero-downtime deployments achieved.', 'Rollback procedure not tested enough. Some services missing health checks.', 'Schedule monthly disaster recovery drill. Add health check endpoints to all services. Document rollback procedure.', 5, 7),
(1, 'Sprint velocity exceeded target by 10%. Team morale was high throughout.', 'Too many meetings disrupted deep work time. Sprint planning took too long.', 'Block focus time on calendar. Timebox sprint planning to 2 hours. Async standups on Fridays.', 4, 1),
(2, 'Customer feedback was incorporated quickly. Zero critical bugs in production.', 'Technical debt accumulating in search module. Need better monitoring.', 'Allocate 20% of next sprint for tech debt. Set up error tracking with Sentry. Add search performance alerts.', 3, 8),
(5, 'Security team praised the authentication implementation. Code quality metrics improved.', 'Documentation lagging behind code changes. Integration tests were fragile.', 'Mandate docs update with each PR. Rewrite integration tests with test containers. Weekly doc review.', 3, 8),
(7, 'Chatbot handles 85% of queries without escalation. User satisfaction score is 4.2/5.', 'Response time degrades under load. Some edge case queries produce incorrect responses.', 'Implement response caching. Add load testing to CI. Create quarterly model retraining schedule.', 4, 8),
(9, 'Telemedicine prototype was well received. Patient data encryption meets all standards.', 'UI for elderly patients needs simplification. Loading times on mobile are high.', 'Conduct usability testing with elderly users. Optimize image compression. Add progressive loading.', 3, 8),
(11, 'Fleet tracking accuracy at 99.2%. Real-time updates within 2-second latency.', 'Battery drain on GPS devices is higher than expected. Map rendering slows with 500+ vehicles.', 'Research low-power GPS modes. Implement map marker clustering. Test with 2000+ vehicle load.', 4, 8),
(13, 'Build pipeline is the fastest across all teams. Great template for other projects.', 'Secret management could be more secure. Build artifacts not consistently versioned.', 'Migrate to HashiCorp Vault for secrets. Implement semantic versioning for artifacts. Share pipeline template.', 5, 1),
(16, 'Architecture design approved by all stakeholders. Clear service boundary definitions.', 'Data migration strategy needs more testing. Team unfamiliar with event sourcing patterns.', 'Conduct event sourcing workshop. Run migration dry run on staging. Create service communication diagram.', 3, 2);

-- Seed Documents (16 documents)
INSERT INTO documents (title, content, project_id, uploaded_by, doc_type, version) VALUES
('E-Commerce Architecture Overview', 'System architecture document covering microservices layout, database schema, API gateway configuration, and deployment topology for the e-commerce platform.', 1, 2, 'spec', 3),
('Product Catalog API Specification', 'OpenAPI 3.0 specification for product catalog endpoints including listing, search, filtering, and category management.', 1, 3, 'spec', 2),
('Payment Integration Guide', 'Step-by-step guide for integrating Stripe and PayPal payment gateways with our checkout flow. Includes webhook handling and error scenarios.', 1, 5, 'document', 1),
('Mobile Banking Security Whitepaper', 'Comprehensive security analysis covering biometric authentication, encryption standards, and threat modeling for the mobile banking application.', 2, 2, 'spec', 2),
('Biometric Auth Test Plan', 'Test plan covering fingerprint and face ID authentication across iOS and Android devices. Includes edge cases and fallback scenarios.', 2, 6, 'document', 1),
('NLP Model Training Documentation', 'Documentation for the customer service NLP model including training data preparation, hyperparameters, evaluation metrics, and deployment procedures.', 3, 3, 'spec', 4),
('Chatbot Conversation Flow Design', 'Design document for chatbot conversation flows including greeting, FAQ handling, escalation paths, and multi-turn dialog management.', 3, 4, 'design', 2),
('HIPAA Compliance Checklist', 'Detailed checklist of all HIPAA requirements applicable to the healthcare portal, with current compliance status and remediation plans.', 4, 8, 'document', 3),
('Patient Data Schema Design', 'Database schema design for patient records including encryption strategy, access control, and audit trail implementation.', 4, 10, 'spec', 2),
('IoT Protocol Specification', 'Technical specification for IoT device communication protocol including MQTT topic structure, message formats, and QoS levels.', 7, 7, 'spec', 2),
('Fleet Dashboard Wireframes', 'UI wireframes and interaction design for the fleet monitoring dashboard including map view, vehicle details, and alert management.', 7, 4, 'design', 3),
('CI/CD Pipeline Architecture', 'Architecture document for the continuous integration and deployment pipeline including Jenkins configuration, Docker builds, and deployment strategies.', 11, 7, 'spec', 2),
('Monitoring and Alerting Runbook', 'Operational runbook for Prometheus and Grafana monitoring setup including alert rules, escalation procedures, and troubleshooting guides.', 11, 7, 'document', 1),
('Microservices Migration Plan', 'Phased migration plan from monolith to microservices including service extraction order, data migration strategy, and rollback procedures.', 15, 2, 'spec', 3),
('API Gateway Configuration', 'Configuration guide for the API gateway including routing rules, rate limiting, authentication, and service discovery integration.', 15, 2, 'document', 1),
('Sprint Retrospective Template', 'Standard template for sprint retrospectives including facilitation guide, question prompts, and action item tracking format.', 1, 8, 'document', 2);
