import React from 'react';

export const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-200 focus:border-brand-500'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default Select;
