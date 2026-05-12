import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      <label className="text-sm font-semibold text-emit-blue ml-1">
        {label}
      </label>
      <input 
        className={`w-full px-4 py-2.5 bg-white border border-emit-border rounded-lg outline-none focus:ring-2 focus:ring-emit-orange/20 focus:border-emit-orange transition-all placeholder:text-emit-text/30 text-sm ${error ? 'border-red-500' : ''} ${className || ''}`} 
        {...props} 
      />
      {error && <p className="text-[11px] text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
};

export default Input;
