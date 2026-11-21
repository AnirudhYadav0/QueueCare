import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                    >
                      View details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
