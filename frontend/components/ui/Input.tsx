import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2.5 rounded-lg border border-[#E9ECEF] bg-white text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all duration-150 ${error ? 'border-[#C62828]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#C62828] font-medium mt-0.5">{error}</p>}
    </div>
  );
}
