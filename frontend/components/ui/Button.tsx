import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  isLoading?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', isLoading, icon: Icon, children, className = '', ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-[#1B3A6B] hover:bg-[#122850] text-white',
    secondary: 'border border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#E8EEF8]',
    success: 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white',
    danger: 'bg-[#C62828] hover:bg-[#B71C1C] text-white',
    ghost: 'text-[#6C757D] hover:text-[#1B3A6B] hover:bg-[#E8EEF8]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {Icon && !isLoading && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
