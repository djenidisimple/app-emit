import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'orange' | 'glass' | 'danger';
  icon?: LucideIcon;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  isLoading, 
  className, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-poppins font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-emit-blue text-white rounded-md px-5 py-2 hover:bg-emit-blue/90 shadow-sm",
    orange: "bg-emit-orange text-white rounded-md px-5 py-2 hover:bg-emit-orange/90 shadow-sm",
    glass: "bg-white border border-emit-border text-emit-blue rounded-md px-5 py-2 hover:bg-gray-50",
    danger: "bg-red-600 text-white rounded-md px-5 py-2 hover:bg-red-700",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className || ''}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
