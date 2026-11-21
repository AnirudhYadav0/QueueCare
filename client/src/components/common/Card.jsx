import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-subtle ${
        hover ? 'hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-slate-100 ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
};

export default Card;
