import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-brand-600',
      pill: 'bg-blue-50 text-brand-700',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600',
      pill: 'bg-teal-50 text-teal-700',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      pill: 'bg-indigo-50 text-indigo-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      pill: 'bg-amber-50 text-amber-700',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      pill: 'bg-emerald-50 text-emerald-700',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      pill: 'bg-rose-50 text-rose-700',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
