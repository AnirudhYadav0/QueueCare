import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import Loader from '../common/Loader';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <Loader fullScreen message="Loading QueueCare workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to user's appropriate home
    const fallback = user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : '/patient';
    return <Navigate to={fallback} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 hidden sm:inline">
                QueueCare
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-sm font-medium text-slate-500 capitalize">
                {user?.role} Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Socket Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={connected ? 'Live queue sync connected' : 'Connecting real-time sync...'}
            >
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              <span className="hidden sm:inline">{connected ? 'Live Sync' : 'Connecting'}</span>
            </div>

            {/* In-app Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* Quick check-in link */}
            <Link
              to="/checkin"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors"
            >
              QR Check-In
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
