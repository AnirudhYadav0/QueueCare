import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {actionText && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary" size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
