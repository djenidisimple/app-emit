'use client';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  icon?: React.ElementType;
}

const variantStyles = {
  default: { accent: 'accent.default' as string },
  danger:  { accent: '#ef4444' },
  success: { accent: '#10b981' },
  warning: { accent: '#f59e0b' },
};

export default function StatCard({ label, value, variant = 'default', icon: Icon }: StatCardProps) {
  const { accent } = variantStyles[variant];

  return (
    <div
      className="bg-surface border border-neutral-200 rounded-[8px] p-4"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold leading-none" style={{ color: accent }}>
            {value}
          </div>
          <div className="text-fg-muted text-xs font-medium mt-1">
            {label}
          </div>
        </div>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accent}15` }}
          >
            <Icon size={15} style={{ color: accent }} />
          </div>
        )}
      </div>
    </div>
  );
}
