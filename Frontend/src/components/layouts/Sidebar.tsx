import {
  Home,
  FolderOpen,
  Lightbulb,
  CheckSquare,
  MessageCircle,
  Menu,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import env from '@/config/env';
import { useAuth } from '@/providers/AuthContext';
import appLogoPng from '/logo.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { path: '/', label: 'Home', icon: Home, testId: 'link-home' },
  { path: '/projects', label: 'Projects', icon: FolderOpen, testId: 'link-projects' },
  { path: '/ideas', label: 'Ideas', icon: Lightbulb, testId: 'link-ideas' },
  { path: '/tasks', label: 'MyTasks', icon: CheckSquare, testId: 'link-tasks' },
  { path: '/kpi', label: 'KPI', icon: BarChart3, testId: 'link-kpis' },
  { path: '/chat', label: 'Chat', icon: MessageCircle, testId: 'link-chat' },

];

const settingsNavItem = {
  url: env.ADMIN_DASHBOARD_URL,
  label: 'Admin Dashboard',
  icon: ShieldCheck,
  testId: 'link-Dashboard',
  external: true,
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user: currentUser, token } = useAuth() as { user: { id: number; is_superuser: boolean; } | null, token: string | null };

  const renderNavItem = (item: any) => {
    const IconComponent = item.icon;
    const isActive = item.path && location.pathname === item.path;

    const baseClasses = `nav-item flex items-center px-3 py-2 rounded-lg font-medium transition-colors`;
    const colorStyle = { color: isActive ? 'var(--accent-color)' : 'var(--text-primary)' };
    const iconColor = { color: isActive ? 'var(--accent-color)' : 'var(--text-primary)', marginRight: collapsed ? 0 : '12px' };

    if (item.external && item.url) {
      return (
        <a
          key={item.label}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          style={{ color: 'var(--text-primary)' }}
          data-testid={item.testId}
        >
          <IconComponent size={20} className="flex-shrink-0" style={iconColor} />
          <span className={`${collapsed ? 'hidden' : ''}`}>{item.label}</span>
        </a>
      );
    } else {
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`${baseClasses} ${isActive ? 'active' : ''}`}
          style={colorStyle}
          data-testid={item.testId}
        >
          <IconComponent size={20} className="flex-shrink-0" style={iconColor} />
          <span className={`${collapsed ? 'hidden' : ''}`}>{item.label}</span>
        </Link>
      );
    }
  };

  return (
    <div
      className={`sidebar-transition border-r flex-shrink-0 flex flex-col justify-between ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
    >
      {/* Sidebar Header */}
      <div>
        <div
          className="flex items-center justify-center px-6 py-4"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          {collapsed ? (
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-[var(--sidebar-accent)] transition-colors"
              data-testid="button-sidebar-toggle"
            >
              <Menu size={20} style={{ color: 'var(--text-primary)' }} />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src={appLogoPng} alt="stratogen" className="block w-8 h-8 object-contain" />
                </div>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  stratogen
                </span>
              </div>

              <button
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-[var(--sidebar-accent)] transition-colors"
                data-testid="button-sidebar-toggle"
              >
                <Menu size={20} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-2 space-y-1">
          {mainNavItems.map(renderNavItem)}
        </nav>
      </div>



      {/* Settings / External Dashboard */}
      <nav className="px-2 mb-4">
        {currentUser && currentUser.is_superuser && (
          renderNavItem(settingsNavItem)
        )}
      </nav>
    </div>
  );
}
