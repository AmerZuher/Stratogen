// In src/routes/index.tsx
import { createBrowserRouter, RouterProvider, useMatches } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Import all your page components
import LoginPage from '@/features/login/routes/Login';
import NotFoundPage from '@/features/notFound/routes/not-found';
import HomePage from '@/features/home/routes/home';
import ProjectsPage from '@/features/projects/routes/ProjectsPage';
import ProjectDetailsPage from '@/features/projects/routes/project-details';
import IdeasPage from '@/features/ideas/routes/ideasPage';
import IdeaDetailsPage from '@/features/ideas/routes/idea-details';
import MyTasks from '@/features/tasks/routes/tasks';
import TaskDetailsPage from '@/features/tasks/routes/task-details'
import KpiPage from '@/features/kpi/routes/KPIsPage';
import ChatPage from '@/features/chat/routes/chat';
import SettingsPage from '@/features/settings/routes/settings';
import ProfilePage from '@/features/profile/routes/profile';
import NotificationCenter from '@/features/notificationCenter/routes/notificationCenter';

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <HomePage />, handle: { title: 'Home' } },
      { path: 'projects', element: <ProjectsPage />, handle: { title: 'Projects' } },
      { path: 'projects/:id', element: <ProjectDetailsPage />, handle: { title: 'Project Details' } },
      { path: 'ideas', element: <IdeasPage />, handle: { title: 'Ideas' } },
      { path: 'ideas/:id', element: <IdeaDetailsPage />, handle: { title: 'Idea Details' } },
      { path: 'tasks', element: <MyTasks />, handle: { title: 'My Tasks' } },
      { path: 'tasks/:id', element: <TaskDetailsPage />, handle: { title: 'Task Details' } },
      { path: 'kpi', element: <KpiPage />, handle: { title: 'KPIs' } },
      { path: 'chat', element: <ChatPage />, handle: { title: 'Chat' } },
      { path: 'profile', element: <ProfilePage />, handle: { title: 'My Profile' } },
      { path: 'notifications', element: <NotificationCenter />, handle: { title: 'Notifications' } },
      { path: 'settings', element: <SettingsPage />, handle: { title: 'Settings' } },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
    handle: { title: 'Login' },
  },
  {
    path: '*',
    element: <NotFoundPage />,
    handle: { title: 'Not Found' },
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}