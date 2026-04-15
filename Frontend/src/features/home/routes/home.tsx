import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckCircle,
  Lightbulb,
  Users,
  ArrowRight,
  Clock,
  Folder,
  GitBranch,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

// Updated Mock Data values to suit the PPM Database
const quickStats = [
  { id: 1, label: 'Active Projects', value: 12, icon: <Folder size={20} />, href: '/projects' },
  { id: 2, label: 'Tasks in Progress', value: 38, icon: <GitBranch size={20} />, href: '/tasks' },
  { id: 3, label: 'New Ideas', value: 8, icon: <Lightbulb size={20} />, href: '/ideas' },
  { id: 4, label: 'High Risks', value: 4, icon: <AlertTriangle size={20} />, href: '/risks' }
];

const recentActivity = [
  { id: 1, type: 'Issue', title: 'Azure Subscription Limit', action: 'flagged as High', date: '10 mins ago' },
  { id: 2, type: 'Project', title: 'APAC Growth Strategy', action: 'moved to On-Hold', date: '2 hours ago' },
  { id: 3, type: 'Idea', title: 'Self-Healing Infrastructure', action: 'submitted', date: '5 hours ago' },
  { id: 4, type: 'KPI', title: 'Cloud Spend Efficiency', action: 'updated to At Risk', date: '1 day ago' },
];

const quickLinks = [
  { id: 1, title: 'Go to Projects', description: 'View Multi-Cloud and Zero-Trust progress', href: '/projects', icon: <Folder size={20} /> },
  { id: 2, title: 'Go to Ideas', description: 'Explore AI Reviewer and Mobile v2.0', href: '/ideas', icon: <Lightbulb size={20} /> },
  { id: 3, title: 'Go to Tasks', description: 'Update your sustainability integration tasks', href: '/MyTasks', icon: <CheckCircle size={20} /> },
  { id: 4, title: 'Portfolio Risks', description: 'Manage technical and financial blockers', href: '/risks', icon: <AlertTriangle size={20} /> },
];

const tasksOverTime = [
  { name: 'Mon', tasks: 12 }, { name: 'Tue', tasks: 18 }, { name: 'Wed', tasks: 24 }, { name: 'Thu', tasks: 20 }, { name: 'Fri', tasks: 15 }, { name: 'Sat', tasks: 5 }, { name: 'Sun', tasks: 8 }
];

const projectsByCategory = [
  { category: 'Engineering', count: 5 }, { category: 'Cybersec', count: 3 }, { category: 'Marketing', count: 2 }, { category: 'Finance', count: 2 }
];


export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // simulation of fetch logic
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
      <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        {/* Welcome */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome Back!
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
            Here's a quick overview of your PPM portfolio.
          </p>
        </div>

        {/* Quick Stats (clickable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {quickStats.map(stat => (
            <Link
              key={stat.id}
              to={stat.href}
              className="p-6 rounded-2xl shadow-sm border flex flex-col items-start hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              style={{
                backgroundColor: 'var(--topbar-bg)',
                borderColor: 'var(--border)'
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--sidebar-bg)' }}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {stat.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Tasks Over Time Chart */}
          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              Task Completion Velocity
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tasksOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-primary)" />
                <YAxis stroke="var(--text-primary)" />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" stroke="var(--accent-color)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Projects by Category Chart */}
          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              Portfolio Split by Department
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--text-primary)" />
                <YAxis stroke="var(--text-primary)" />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="var(--accent-color)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock size={20} /> Investment Lifecycle Activity
            </h2>
            <ul className="space-y-4">
              {recentActivity.map(activity => (
                <li key={activity.id} className="flex items-center space-x-4">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                  <div className="flex-1" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-semibold">{activity.title}</span> was {activity.action}.
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{activity.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <LayoutDashboard size={20} /> PPM Actions
            </h2>
            <div className="space-y-4">
              {quickLinks.map(link => (
                <Link
                  key={link.id}
                  to={link.href}
                  className="flex items-center p-4 rounded-lg border hover:border-indigo-500 transition-colors duration-200 group"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="p-3 rounded-full mr-4" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--sidebar-bg)' }}>
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {link.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{link.description}</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}