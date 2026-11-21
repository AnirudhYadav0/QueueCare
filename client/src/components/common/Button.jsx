import React from 'react';

const variants = {
  primary:
    'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-500 active:bg-brand-800',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-brand-500',
  teal:
    'bg-teal-600 hover:bg-teal-700 text-white shadow-sm focus:ring-teal-500',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-400',
  outline:
    'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-xl',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl',
  xl: 'px-6 py-3 text-lg font-semibold rounded-2xl',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
