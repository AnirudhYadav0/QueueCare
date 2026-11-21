import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates regarding your appointments, queue position, and calls.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 text-brand-600" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card padding="p-0" className="divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            You have no notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-brand-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    !n.isRead
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm ${
                        !n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                    {n.message}
                  </p>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      Open view <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(n.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default PatientNotifications;
