import React from 'react';

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Badge = ({ children, variant = 'default', size = 'md', className }) => {
  const variants = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    danger: 'bg-red-500/10 text-red-400',
    info: 'bg-primary-500/10 text-primary-400',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
