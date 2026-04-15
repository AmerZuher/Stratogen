-- ==========================================================
-- TECHCORP COMPREHENSIVE SEED DATA
-- Version: 2.0
-- Reference Date: 2026-04-15
-- ==========================================================

-- 1. INFRASTRUCTURE: DEPARTMENTS & ROLES
-- ==========================================================

INSERT INTO departments (id, name) VALUES
(1, 'Engineering'),
(2, 'Product Management'),
(3, 'Human Resources'),
(4, 'Finance'),
(5, 'Marketing'),
(6, 'Cybersecurity'),
(7, 'Data Science'),
(8, 'Legal & Compliance'),
(9, 'Operations'),
(10, 'Sales');

INSERT INTO roles (id, name) VALUES
(1, 'Administrator'),
(2, 'Project Manager'),
(3, 'Developer'),
(4, 'Stakeholder'),
(5, 'Financial Controller'),
(6, 'QA Engineer'),
(7, 'Architect'),
(8, 'Data Scientist'),
(9, 'Security Analyst'),
(10, 'Legal Counsel');

-- 2. CORE USERS
-- ==========================================================
-- Standard Hashed Password used for all: 'password123' -> $2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC
INSERT INTO users (id, email, username, hashed_password, is_active, is_superuser, department_id) VALUES
(1, 'admin@techcorp.com', 'admin', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, true, 1),
(2, 'kadir.pm@techcorp.com', 'kadir', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 2),
(3, 'amer.dev@techcorp.com', 'amer', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 1),
(4, 'ferhat.analyst@techcorp.com', 'ferhat', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 7),
(5, 'sara.sec@techcorp.com', 'sara', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 6),
(6, 'leila.mark@techcorp.com', 'leila', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 5),
(7, 'marcus.fin@techcorp.com', 'marcus', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 4),
(8, 'elena.legal@techcorp.com', 'elena', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 8),
(9, 'david.ops@techcorp.com', 'david', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 9),
(10, 'nina.qa@techcorp.com', 'nina', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 1),
(11, 'oscar.dev@techcorp.com', 'oscar', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 1),
(12, 'pete.pm@techcorp.com', 'pete', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', true, false, 2);

-- Assigning User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3), (3, 7), (4, 8), (5, 9), (6, 4), (7, 5), (8, 10), (9, 2), (10, 6), (11, 3), (12, 2);

-- 3. INVESTMENTS (PARENT)
-- ==========================================================
INSERT INTO investments (id, name, type, created_by_id, created_date, last_modified) VALUES
(1, 'AI Code Reviewer', 'IDEA', 3, '2026-01-10', '2026-04-15 09:00:00'),
(2, 'Multi-Cloud Gateway', 'PROJECT', 1, '2025-12-01', '2026-04-15 10:30:00'),
(3, 'Customer Retention Rate', 'KPI', 2, '2026-01-01', '2026-04-15 08:00:00'),
(4, 'Cyber-Security Mesh', 'PROJECT', 5, '2026-02-15', '2026-04-15 11:00:00'),
(5, 'Green-Tech Dashboard', 'PROJECT', 7, '2026-03-01', '2026-04-15 12:00:00'),
(6, 'Mobile App v2.0', 'IDEA', 2, '2026-04-05', '2026-04-15 13:00:00'),
(7, 'Cloud Spend Efficiency', 'KPI', 7, '2026-01-15', '2026-04-15 09:15:00'),
(8, 'Self-Healing Infrastructure', 'IDEA', 11, '2026-04-10', '2026-04-15 14:00:00'),
(9, 'Market Expansion Asia', 'PROJECT', 12, '2026-01-20', '2026-04-14 17:00:00'),
(10, 'Employee Satisfaction Score', 'KPI', 1, '2026-01-01', '2026-04-01 10:00:00');
(11, 'Legacy DB Migration', 'PROJECT', 1, '2026-04-15', '2026-04-15 10:00:00'),
(12, 'Quantum Encryption Pilot', 'PROJECT', 4, '2026-04-15', '2026-04-15 10:00:00'),
(13, 'API Gateway Refactor', 'PROJECT', 2, '2026-04-15', '2026-04-15 10:00:00'),
(14, 'Customer Data Platform', 'PROJECT', 6, '2026-04-15', '2026-04-15 10:00:00'),
(15, 'Blockchain Ledger Sync', 'PROJECT', 8, '2026-04-15', '2026-04-15 10:00:00'),
(16, 'DevSecOps Pipeline', 'PROJECT', 3, '2026-04-15', '2026-04-15 10:00:00'),
(17, 'Global CDN Expansion', 'PROJECT', 5, '2026-04-15', '2026-04-15 10:00:00'),
(18, 'AI Chatbot v3', 'PROJECT', 9, '2026-04-15', '2026-04-15 10:00:00'),
(19, 'SaaS Billing Engine', 'PROJECT', 1, '2026-04-15', '2026-04-15 10:00:00'),
(20, 'Internal HR Portal', 'PROJECT', 11, '2026-04-15', '2026-04-15 10:00:00'),
(21, 'VR Training Modules', 'IDEA', 2, '2026-04-15', '2026-04-15 10:00:00'),
(22, 'Voice UI for Admin', 'IDEA', 5, '2026-04-15', '2026-04-15 10:00:00'),
(23, 'Predictive Maintenance', 'IDEA', 7, '2026-04-15', '2026-04-15 10:00:00'),
(24, 'Auto-Scaling 2.0', 'IDEA', 3, '2026-04-15', '2026-04-15 10:00:00'),
(25, 'Zero-Knowledge Auth', 'IDEA', 12, '2026-04-15', '2026-04-15 10:00:00'),
(26, 'Smart Office IoT', 'IDEA', 4, '2026-04-15', '2026-04-15 10:00:00'),
(27, 'Dynamic Pricing Engine', 'IDEA', 8, '2026-04-15', '2026-04-15 10:00:00'),
(28, 'Unified Search Index', 'IDEA', 10, '2026-04-15', '2026-04-15 10:00:00'),
(29, 'Biometric Login', 'IDEA', 1, '2026-04-15', '2026-04-15 10:00:00'),
(30, 'Edge Computing Node', 'IDEA', 6, '2026-04-15', '2026-04-15 10:00:00');

-- 4. IDEAS (EXTENDED)
-- ==========================================================
INSERT INTO ideas (
    id, status, demand_type, fast_track, fast_track_reason, start_date, end_date, description, responsible_unit, assessment_notes, owner_department, document_path) VALUES
(1, 'ASSESMENT', 'PROJECT', true, 'Critical Productivity',  '2026-01-15', '2026-06-01', 'Automate PR reviews using LLM agents.', 'Engineering',  'Feasibility high.', 'Engineering', '/docs/ai_review_v1.pdf'),
(6, 'ASSESMENT', 'PROJECT', false, NULL,  '2026-05-01', '2026-08-01', 'Flutter rewrite for mobile.', 'Product',  'Pending research.', 'Engineering', NULL),
(8, 'ASSESMENT', 'SME', false, NULL,  '2026-04-20', '2026-05-20', 'Auto-remediation of cloud alerts.', 'Engineering',  'Exploring eBPF.', 'Engineering', NULL);
(21, 'DMNDSBMSN', 'PROJECT', false, 'Safety training in MetaQuest.', 'Training', 'Operations'),
(22, 'LINEMNGAPPR', 'SME', true, 'Hands-free admin commands.', 'Innovation', 'IT'),
(23, 'ASSESMENT', 'PROJECT', false, 'Sensor-based failure alerts.', 'Facilities', 'Maintenance'),
(24, 'REVISION', 'PROJECT', true, 'Improving K8s pod efficiency.', 'DevOps', 'Engineering'),
(25, 'DMNDSBMSN', 'RFP', false, 'Privacy-first user login.', 'Security', 'Legal'),
(26, 'ASSESMENT', 'PROJECT', false, 'HVAC automation for savings.', 'Operations', 'Finance'),
(27, 'PROJMNGAPR', 'PROJECT', true, 'Real-time price adjustments.', 'Marketing', 'Sales'),
(28, 'DMNDSBMSN', 'PROJECT', false, 'Internal tool for file discovery.', 'Data Science', 'Engineering'),
(29, 'LINEMNGAPPR', 'PROJECT', false, 'Replacing passwords with face ID.', 'Security', 'IT'),
(30, 'ASSESMENT', 'SME', true, 'Decentralized server processing.', 'Architecture', 'Engineering');
-- 5. PROJECTS (EXTENDED)
-- ==========================================================
INSERT INTO projects (id, manager_id, start_date, end_date, objective, status, planned_cost, actual_cost, planned_effort, actual_effort, baseline_start, baseline_finish, progress) VALUES
(2, 2, '2026-01-01', '2026-12-31', 'AWS-Azure gateway.', 'Active', 500000.00, 125000.00, 1200, 350, '2026-01-15', '2026-12-15', 25),
(4, 5, '2026-03-01', '2027-01-15', 'Zero-trust architecture.', 'Active', 250000.00, 45000.00, 800, 120, '2026-03-01', '2027-01-01', 18),
(5, 7, '2026-04-01', '2026-09-30', 'Carbon monitoring.', 'Active', 180000.00, 20000.00, 600, 50, '2026-04-01', '2026-10-15', 8),
(9, 12, '2026-02-01', '2026-11-30', 'Sales in Singapore/Tokyo.', 'On Hold', 1200000.00, 400000.00, 2500, 900, '2026-02-01', '2026-12-01', 35);
(11, 1, '2026-05-01', '2026-11-01', 'Moving On-Prem to Postgres.', 'Active', 150000.00, 0.00, 0),
(12, 4, '2026-06-15', '2027-02-01', 'Post-quantum security layers.', 'Active', 300000.00, 10000.00, 5),
(13, 2, '2026-04-20', '2026-08-15', 'Modernizing legacy API entry.', 'Active', 85000.00, 5000.00, 10),
(14, 6, '2026-07-01', '2027-06-01', 'Centralizing customer records.', 'Active', 450000.00, 0.00, 0),
(15, 8, '2026-05-15', '2026-10-15', 'Immutable audit logs.', 'On Hold', 120000.00, 20000.00, 15),
(16, 3, '2026-04-15', '2026-12-01', 'Automated security scanning.', 'Active', 200000.00, 45000.00, 25),
(17, 5, '2026-08-01', '2027-03-01', 'Low latency in LATAM regions.', 'Active', 600000.00, 0.00, 0),
(18, 9, '2026-05-01', '2026-09-01', 'Natural language processing update.', 'Active', 95000.00, 12000.00, 12),
(19, 1, '2026-06-01', '2026-12-31', 'Subscription management overhaul.', 'Active', 175000.00, 0.00, 0),
(20, 11, '2026-04-01', '2026-07-30', 'Consolidated employee portal.', 'Completed', 50000.00, 48500.00, 100);
-- 6. KPIs (EXTENDED)
-- ==========================================================
INSERT INTO kpi (id, name, target_value, actual_value, unit, measured_at, status) VALUES
(3, 'Retention Target', 9.50, 9.6, 'Percentage', '2026-04-01', 'Active'),
(7, 'Cloud Waste', 1.5, 1.82, 'Percentage', '2026-04-10', 'Active'),
(10, 'eNPS', 7.0, 6.8, 'Score', '2026-03-31', 'Active');

-- 7. TEAMS & MEMBERS
-- ==========================================================
INSERT INTO teams (id, investment_id, name) VALUES
(1, 2, 'Gateway Squad'),
(2, 4, 'Zero Trust Taskforce'),
(3, 5, 'Sustainability Squad'),
(4, 9, 'APAC Growth Team');

INSERT INTO team_members (team_id, user_id, role_id, allocation_percent) VALUES
(1, 2, 2, 100), (1, 3, 7, 50), (1, 11, 3, 100),
(2, 5, 9, 100), (2, 1, 1, 10), (2, 10, 6, 100),
(3, 7, 5, 40), (3, 4, 8, 80), (3, 3, 7, 20),
(4, 12, 2, 100), (4, 6, 4, 50), (4, 8, 10, 30), (4, 9, 2, 100);

-- 8. TASKS
-- ==========================================================
INSERT INTO tasks (id, investment_id, name, description, start_date, end_date, status, owner_id, created_at) VALUES
(1, 2, 'Connectivity Matrix', 'VPC peering.', '2026-01-10', '2026-02-10', 'Completed', 3, '2026-01-05 10:00:00'),
(2, 2, 'ExpressRoute Setup', 'Hardware config.', '2026-04-01', '2026-05-01', 'Completed', 3, '2026-03-25 14:00:00'),
(3, 5, 'API Integration', 'Carbon data pull.', '2026-04-10', '2026-05-15', 'Completed', 4, '2026-04-05 08:30:00'),
(4, 9, 'Legal Entity Setup', 'Singapore registration.', '2026-02-01', '2026-03-15', 'Completed', 8, '2026-01-15 09:00:00'),
(5, 9, 'Tokyo Office Search', 'Lease negotiation.', '2026-04-01', '2026-06-01', 'Completed', 9, '2026-03-20 11:00:00');

-- 9. RISKS & ISSUES
-- ==========================================================
INSERT INTO risks_issues (id, investment_id, type, name, category, priority, impact, score, created_at) VALUES
(1, 2, 'RISK', 'Latency Jitter', 'Technical', 'Medium', 3, 9, '2026-02-01 12:00:00'),
(2, 2, 'ISSUE', 'Azure Sub Limit', 'Infra', 'High', 5, 25, '2026-04-10 16:30:00'),
(3, 5, 'RISK', 'API Data Lag', 'Technical', 'Low', 2, 4, '2026-04-12 10:00:00'),
(4, 9, 'ISSUE', 'Visa Processing Delay', 'Legal', 'High', 4, 16, '2026-03-25 09:00:00');

-- 10. DOCUMENTS & NOTIFICATIONS
-- ==========================================================
INSERT INTO documents (id, investment_id, name, location, uploaded_by_id, uploaded_at) VALUES
(1, 2, 'Arch Diagram', 's3://bucket/2/arch.png', 3, '2026-01-15 09:00:00'),
(2, 5, 'Sustainability Spec', 's3://bucket/5/spec.pdf', 7, '2026-03-10 11:00:00'),
(3, 9, 'Market Entry Plan', 's3://bucket/9/plan.docx', 12, '2026-01-25 14:00:00');

INSERT INTO notifications (id, investment_id, related_type, related_id, title, message, notification_type, status, created_at) VALUES
(1, 2, 'ISSUE', 2, 'Resource Limit', 'Azure limit reached.', 'ALERT', 'ACTIVE', '2026-04-10 16:35:00'),
(2, 7, 'ISSUE', 4, 'Budget Warning', 'Cloud spend high.', 'WARNING', 'ACTIVE', '2026-04-14 15:50:00'),
(3, 9, 'ISSUE', 4, 'Visa Alert', 'Relocation blocked.', 'ALERT', 'ACTIVE', '2026-03-25 10:00:00');
(4, 11, 'PROJECT', 11, 'Migration Kickoff', 'Legacy DB migration starts tomorrow.', 'REMINDER', 'ACTIVE', '2026-04-15 08:00:00'),
(5, 19, 'PROJECT', 19, 'Billing Engine Delay', 'Vendor API documentation is missing.', 'WARNING', 'ACTIVE', '2026-04-15 09:30:00'),
(6, 29, 'IDEA', 29, 'New Idea Assignment', 'You have been assigned as the reviewer for Biometric Login.', 'INFO', 'ACTIVE', '2026-04-15 10:15:00'),
(7, 2, 'PROJECT', 2, 'Gateway Security Patch', 'Critical patch required for Multi-Cloud Gateway.', 'ALERT', 'ACTIVE', '2026-04-15 11:00:00'),
(8, 20, 'PROJECT', 20, 'Project Completed', 'Internal HR Portal has been marked as Completed.', 'INFO', 'READ', '2026-04-14 17:00:00'),
(9, 11, 'PROJECT', 11, 'Storage Provisioned', 'Azure SQL instances are ready for migration.', 'INFO', 'ACTIVE', '2026-04-15 12:00:00'),
(10, 16, 'PROJECT', 16, 'Pipeline Failure', 'DevSecOps automated scan failed on master branch.', 'ALERT', 'ACTIVE', '2026-04-15 13:45:00');

INSERT INTO notification_targets (id, notification_id, target_type, target_id, delivered_at, read_at) VALUES
(1, 1, 'USER', 1, '2026-04-10 16:36:00', NULL),
(2, 1, 'USER', 2, '2026-04-10 16:36:00', '2026-04-10 17:00:00'),
(3, 2, 'USER', 7, '2026-04-14 15:51:00', '2026-04-14 16:00:00'),
(4, 3, 'USER', 12, '2026-03-25 10:05:00', '2026-03-25 11:00:00');
(5, 4, 'USER', 1, '2026-04-15 08:01:00', NULL),
(6, 5, 'USER', 1, '2026-04-15 09:31:00', NULL),
(7, 6, 'USER', 1, '2026-04-15 10:16:00', '2026-04-15 10:20:00'),
(8, 7, 'USER', 1, '2026-04-15 11:01:00', NULL),
(9, 8, 'USER', 1, '2026-04-14 17:05:00', '2026-04-14 18:30:00'),
(10, 9, 'USER', 1, '2026-04-15 12:05:00', NULL),
(11, 10, 'USER', 1, '2026-04-15 13:46:00', NULL);