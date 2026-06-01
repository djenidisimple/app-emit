import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
      <p className="text-2xl font-bold text-blue-900 mb-1">{title}</p>
      <p className="text-blue-400 text-sm max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
