import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
}

export default function Input({ label, error, icon: Icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-blue-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none"
          />
        )}
        <input
          className={`w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2.5 bg-white rounded-xl text-sm text-blue-900 placeholder:text-blue-400 outline-none transition-colors ${
            error
              ? 'border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border border-blue-200 focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
