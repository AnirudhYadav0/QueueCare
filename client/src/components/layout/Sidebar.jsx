import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  ListOrdered,
  Bell,
  User,
  LogOut,
  Stethoscope,
  Users,
  Building2,
  BarChart3,
  Settings,
  Clock,
  QrCode,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ mobile = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientNav = [
    { label: 'Dashboard', path: '/patient', icon: LayoutDashboard },
    { label: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
    { label: 'My Appointments', path: '/patient/appointments', icon: CalendarCheck },
    { label: 'Live Queue Tracking', path: '/patient/queue', icon: ListOrdered },
    { label: 'Notifications', path: '/patient/notifications', icon: Bell },
    { label: 'Profile Settings', path: '/patient/profile', icon: User },
  ];

  const doctorNav = [
    { label: 'Doctor Dashboard', path: '/doctor', icon: LayoutDashboard },
    { label: "Today's Live Queue", path: '/doctor/queue', icon: ListOrdered },
    { label: 'Appointments', path: '/doctor/appointments', icon: CalendarCheck },
    { label: 'Schedule & Hours', path: '/doctor/schedule', icon: Clock },
    { label: 'Doctor Profile', path: '/doctor/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Doctor Management', path: '/admin/doctors', icon: Stethoscope },
    { label: 'Patient Directory', path: '/admin/patients', icon: Users },
    { label: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Queue Monitoring', path: '/admin/queues', icon: ListOrdered },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Clinic Settings', path: '/admin/settings', icon: Settings },
  ];

  let items = patientNav;
  if (user?.role === 'doctor') items = doctorNav;
  if (user?.role === 'admin') items = adminNav;

  const roleLabels = {
    patient: 'Patient Portal',
    doctor: 'Doctor Portal',
    admin: 'Administration',
  };

  return (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200/80 px-4 py-6">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">QueueCare</h1>
            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
              {roleLabels[user?.role] || 'Portal'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/patient' || item.path === '/doctor' || item.path === '/admin'}
                onClick={() => mobile && onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-slate-50 rounded-xl">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=0ea5e9&color=fff&size=128`
            }
            alt={user?.name}
            className="w-9 h-9 rounded-lg object-cover border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
