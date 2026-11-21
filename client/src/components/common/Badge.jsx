import React from 'react';

const statusStyles = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  checked_in: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  waiting: 'bg-amber-50 text-amber-700 border-amber-200 animate-soft-pulse',
  calling: 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-400',
  in_consultation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  skipped: 'bg-slate-100 text-slate-700 border-slate-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const labels = {
  scheduled: 'Scheduled',
  checked_in: 'Checked In',
  waiting: 'In Queue',
  calling: 'Now Calling',
  in_consultation: 'In Consultation',
  completed: 'Completed',
  cancelled: 'Cancelled',
  skipped: 'Skipped',
  active: 'Active',
  closed: 'Closed',
};

export const Badge = ({ status, text, variant, size = 'sm', className = '' }) => {
  const normalizedKey = status ? String(status).toLowerCase().replace(' ', '_') : 'scheduled';
  const style = variant
    ? variant
    : statusStyles[normalizedKey] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClass} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {text || labels[normalizedKey] || status}
    </span>
  );
};

export default Badge;
