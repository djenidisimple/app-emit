import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  primary:
    'bg-[#0052FF] text-white hover:bg-blue-700',
  secondary:
    'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
  outline:
    'bg-transparent text-[#0052FF] border border-[#0052FF] hover:bg-blue-50',
  ghost:
    'bg-transparent text-blue-500 border border-transparent hover:bg-blue-50',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}
