import React from 'react';
import { Card } from '../../components/common/Card';
import {
  Smartphone,
  QrCode,
  Stethoscope,
  BarChart3,
  Bell,
  ShieldCheck,
  CalendarCheck,
  Layers,
  Zap,
} from 'lucide-react';

export const FeaturesPage = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Real-Time Dynamic Queue Tracking',
      desc: 'Socket.IO synchronized live token counter that reflects doctor calls, completed sessions, and dynamically calculates patients ahead and estimated minutes.',
      badge: 'Real-Time',
    },
    {
      icon: QrCode,
      title: 'Digital Token & QR Check-In',
      desc: 'Every appointment generates a unique QR code and 4-digit PIN. Patients scan on arrival to automatically enter their doctor’s active queue.',
      badge: 'Contactless',
    },
    {
      icon: Stethoscope,
      title: 'Physician Workstation Dashboard',
      desc: 'One-click patient calling, consultation timers, digital prescription entry, and skip buttons tailored for high-volume clinic productivity.',
      badge: 'Doctor First',
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Clinic Analytics',
      desc: 'Rich data visualizations for patient throughput, peak congestion hours, cancellation trends, and department efficiency.',
      badge: 'Actionable Data',
    },
    {
      icon: Bell,
      title: 'Multi-Channel Patient Alerts',
      desc: 'In-app toasts, sound chimes, and persistent notifications keep patients alert when their consultation turn is approaching.',
      badge: 'Automated',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      desc: 'Strict isolation of patient, doctor, and admin privileges with bcrypt password hashing and secure JSON Web Tokens.',
      badge: 'Security',
    },
  ];

  return (
    <div className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Features Matrix</span>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Everything Needed for Modern Clinic Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            A comprehensive suite of tools built for patients, doctors, and clinic administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} hover className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
