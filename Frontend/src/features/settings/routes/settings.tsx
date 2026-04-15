import React, { useState, useEffect } from 'react';
// Import the 'Theme' type directly from your context file
import { useTheme, Theme } from '@/providers/ThemeContext';
import { useNavigate } from 'react-router-dom';
// The AuthContext should provide the current user's data
import { useAuth } from '@/providers/AuthContext';
// The UserSummary type is useful for state typing
import { UserSummary } from '@/api';
import { Settings as SettingsIcon, Palette, Bell, Save, User, Mail, Smartphone, Lock, LogOut } from 'lucide-react';

// Define the type for a single theme option object
interface ThemeOption {
  id: Theme;
  name: string;
}

// This array now perfectly matches the themes defined in the context
const themes: ThemeOption[] = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark Mode' },
  { id: 'green', name: 'Nature Green' },
  { id: 'orange', name: 'Warm Orange' },
  { id: 'lavender', name: 'Lavender Dusk' },
  { id: 'ocean', name: 'Ocean Breeze' }
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  // 1. Destructure the 'user' object from the useAuth hook
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Initialize formData with empty values, matching the UserSummary type
  const [formData, setFormData] = useState<UserSummary>({ id: 0, username: '', email: '', is_superuser: false });
  const [loading, setLoading] = useState(true);

  // 2. Use useEffect to populate form data from the context
  useEffect(() => {
    // Check if the user object is available in the context
    if (user) {
      // Set the form data with the user's information
      setFormData({
        id: user.id,
        username: user.username,
        email: user.email,
        is_superuser: user.is_superuser
      });
      // Set loading to false since data is now available
      setLoading(false);
    }
  }, [user]); // This effect runs whenever the 'user' object changes

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const CheckIcon = (props: { size?: string | number; className?: string; style?: React.CSSProperties }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={props.style}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-4 sm:p-6">

      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--sidebar-bg)' }}>
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-primary)' }}>Manage your application preferences and personalize your experience.</h2>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4 mb-6">
          <User size={24} style={{ color: 'var(--text-primary)' }} />
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Account Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Username</label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="username"
                value={loading ? 'Loading...' : formData.username}
                onChange={handleChange}
                readOnly
                className="w-full pl-10 pr-4 py-2 rounded-xl text-base border focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', caretColor: 'var(--accent-color)', '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties} />
              <User size={20} className="absolute left-3" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                name="email"
                value={loading ? 'Loading...' : formData.email}
                onChange={handleChange}
                readOnly
                className="w-full pl-10 pr-4 py-2 rounded-xl text-base border focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', caretColor: 'var(--accent-color)', '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties} />
              <Mail size={20} className="absolute left-3" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end">

          </div>
        </div>
      </div>

      {/* Session Management Section */}
      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4 mb-6">
          <LogOut size={24} style={{ color: 'var(--text-primary)' }} />
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Session Management</h2>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--topbar-bg)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            End your current session. You will be required to log in again.
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-2 rounded-full font-semibold transition-all shadow-sm transform hover:scale-[1.02] bg-red-600 text-white hover:bg-red-700"
          >
            <LogOut size={20} className="mr-2" />
            Log Out
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4 mb-6">
          <Bell size={24} style={{ color: 'var(--text-primary)' }} />
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--topbar-bg)' }}>
            <div className="flex items-center gap-4">
              <Mail size={20} style={{ color: 'var(--text-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 rounded-full peer peer-focus:ring-2" style={{ backgroundColor: 'var(--border)', transition: 'all 0.3s ease', '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties}></div>
              <div className="absolute left-[2px] top-[2px] w-5 h-5 rounded-full shadow-md transition-all peer-checked:translate-x-full" style={{ backgroundColor: 'var(--text-primary)' }}></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--topbar-bg)' }}>
            <div className="flex items-center gap-4">
              <Smartphone size={20} style={{ color: 'var(--text-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 rounded-full peer peer-focus:ring-2" style={{ backgroundColor: 'var(--border)', transition: 'all 0.3s ease', '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties}></div>
              <div className="absolute left-[2px] top-[2px] w-5 h-5 rounded-full shadow-md transition-all peer-checked:translate-x-full" style={{ backgroundColor: 'var(--text-primary)' }}></div>
            </label>
          </div>
        </div>
      </div>

      {/* Theme Selection Section */}
      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4 mb-6">
          <Palette size={24} style={{ color: 'var(--text-primary)' }} />
          <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Theme Selection</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((themeOption) => {
            const themeClass = `theme-${themeOption.id}`;
            return (
              <div
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={`${themeClass} p-5 rounded-2xl cursor-pointer transition-all border-4 ${theme === themeOption.id ? '' : 'hover:scale-[1.02] transform'}`}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: theme === themeOption.id ? 'var(--border)' : 'transparent',
                  boxShadow: theme === themeOption.id ? `0 0 0 2px var(--accent-color), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` : ''
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{themeOption.name}</span>
                  {theme === themeOption.id && (<CheckIcon size={24} className="text-white"
                    style={{ backgroundColor: 'var(--accent-color)', borderRadius: '9999px', padding: '2px' }} />)}
                </div>
                <div className="flex h-32 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-1/4  p-3 " style={{ backgroundColor: 'var(--sidebar-bg)' }}>
                    <div className="h-2 w-full rounded-full mb-1" style={{ backgroundColor: 'var(--sidebar-primary)', opacity: 0.5 }}></div>
                    <div className="h-2 w-full rounded-full mb-1" style={{ backgroundColor: 'var(--text-primary)', opacity: 0.1 }}></div>
                    <div className="h-2 w-full rounded-full mb-1" style={{ backgroundColor: 'var(--text-primary)', opacity: 0.1 }}></div>

                  </div>
                  <div className="flex-1 p-3" style={{ backgroundColor: 'var(--background)' }}>
                    <div className="h-2 w-3/4 rounded-full mb-2" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                    <div className="h-2 w-full rounded-full mb-1" style={{ backgroundColor: 'var(--primary)', opacity: 0.5 }}></div>
                    <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.5 }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}