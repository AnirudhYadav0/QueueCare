import React from 'react';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-teal-100 border-b-teal-500 animate-spin" />
      </div>
      {message && <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
