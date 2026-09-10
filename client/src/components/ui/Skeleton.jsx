import React from 'react';

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Skeleton = ({ variant = 'text', className }) => {
  const baseClass = 'animate-pulse bg-white/[0.06] skeleton';

  if (variant === 'card') {
    return (
      <div
        className={clsx(
          'w-full flex flex-col gap-4 p-4 rounded-2xl bg-surface-900 border border-white/[0.06]',
          className
        )}
      >
        <div className={clsx(baseClass, 'aspect-square w-full rounded-xl')} />
        <div className="flex flex-col gap-2 mt-2">
          <div className={clsx(baseClass, 'h-5 w-3/4 rounded')} />
          <div className={clsx(baseClass, 'h-4 w-full rounded')} />
          <div className={clsx(baseClass, 'h-4 w-5/6 rounded')} />
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className={clsx(baseClass, 'h-6 w-1/3 rounded')} />
          <div className={clsx(baseClass, 'h-8 w-24 rounded-lg')} />
        </div>
      </div>
    );
  }

  const variants = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded',
    image: 'aspect-square w-full rounded-xl',
  };

  return <div className={clsx(baseClass, variants[variant], className)} />;
};

export default Skeleton;
