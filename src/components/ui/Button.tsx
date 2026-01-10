
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'obsidian';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border-2 border-slate-200 bg-transparent text-slate-900 hover:border-blue-200 hover:text-blue-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900",
    obsidian: "bg-slate-950 text-white hover:bg-black"
  };

  const sizes = {
    sm: "px-4 py-2 text-[9px] rounded-lg",
    md: "px-6 py-3.5 text-[10px] rounded-xl",
    lg: "px-8 py-5 text-[11px] rounded-2xl"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
