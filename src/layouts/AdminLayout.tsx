import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Smartphone,
  Image,
  Star,
  Shield,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { getAdminSession, logoutAdmin, AdminUser } from '../services/authService';

export const AdminLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const session = await getAdminSession();
      if (!session) {
        navigate('/admin/login', { replace: true, state: { from: location } });
      } else {
        setCurrentUser(session);
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [navigate, location]);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-play-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/apps', label: 'App Generator (PWAs)', icon: Layers },
    { to: '/admin/content', label: 'App Information & Content', icon: FileText },
    { to: '/admin/install', label: 'Install Settings', icon: Smartphone },
    { to: '/admin/media', label: 'Media & Screenshots', icon: Image },
    { to: '/admin/reviews', label: 'Reviews & Replies', icon: Star },
    { to: '/admin/settings', label: 'Appearance & SEO', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-play-green text-white flex items-center justify-center font-bold text-sm">
            AP
          </div>
          <span className="font-bold text-gray-900 text-sm">Admin CMS</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-xs font-semibold text-play-green bg-emerald-50 rounded-lg flex items-center gap-1"
          >
            <span>Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-play-green to-emerald-400 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-tight">Admin Console</div>
              <div className="text-[10px] text-slate-400 font-mono">v2.4 CMS Engine</div>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-play-green text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Link: Preview Public Page */}
        <div className="p-3 border-t border-slate-800">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Landing Page</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <div className="font-semibold text-white truncate">{currentUser?.email || 'admin@example.com'}</div>
            <div className="text-[10px] text-slate-400 capitalize">Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Application Management Portal</h2>
            <p className="text-xs text-gray-500">Manage public content, install settings, media, and reviews</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-play-green font-semibold text-xs rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200/60"
            >
              <span>Preview Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="h-5 w-[1px] bg-gray-200"></div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-600 hover:text-red-600 font-medium flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
