import React from 'react';
import type { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 bg-bg-muted rounded-lg border border-border flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-fg-subtle" />
      </div>
      <p className="text-lg font-semibold text-fg-default mb-1">{title}</p>
      <p className="text-fg-subtle text-sm max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
