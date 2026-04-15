import { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { usePageTitle } from '@/hooks/usePageTitle';
import { User, Settings, Bell } from "lucide-react";

// Restored real imports for API and Authentication
import { useAuth } from '@/providers/AuthContext';
import { NotificationsService, Notification } from '@/api';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const { user: currentUser } = useAuth();
  const pageTitle = usePageTitle();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications to determine if the unread indicator should be shown
  useEffect(() => {
    if (currentUser) {
      const checkUnreadStatus = async () => {
        try {
          const notifications: Notification[] = await NotificationsService.readUserNotificationsApiNotificationsUserUserIdGet({
            userId: currentUser.id,
          });
          
          // Check if any notification has a target for the current user that is unread
          const anyUnread = notifications.some(n =>
            n.targets?.some(t => t.target_type === 'USER' && t.target_id === currentUser.id && t.read_at === null)
          );
          setHasUnread(anyUnread);
        } catch (error) {
          console.error("Failed to check for unread notifications:", error);
          setHasUnread(false); // Default to false on error
        }
      };
      checkUnreadStatus();
    }
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="border-b px-6 py-4"
          style={{
            backgroundColor: 'var(--topbar-bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between relative">
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
              data-testid="page-title"
            >
              {pageTitle}
            </h1>


            {/* Profile dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex focus:outline-none relative"
              >
                <img
                  src="/PP.JPG"
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover border"
                  style={{ borderColor: 'var(--border)' }}
                />
                {hasUnread && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-white" />
                )}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-4 w-64 shadow-xl animate-fade-in py-2 z-50"
                  style={{
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div className="flex flex-col space-y-1">
                    <Link
                      to="/notifications"
                      className="flex items-center gap-2 px-4 py-2 text-base rounded-md transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--accent)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                      onClick={() => {
                        setMenuOpen(false);
                        // Optimistically set to false, will be re-verified on next load
                        setHasUnread(false); 
                      }}
                    >
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                      {hasUnread && (
                        <span className="ml-auto text-xs font-bold text-destructive-foreground bg-destructive rounded-full px-2 py-0.5">New</span>
                      )}
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-base rounded-md transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--accent)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-base rounded-md transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--accent)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>


          </div>
        </header>

        <main
          className="flex-1 overflow-auto hide-scrollbar"
          style={{ backgroundColor: 'var(--topbar-bg)' }}
        >
          <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
