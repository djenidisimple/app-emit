export function LoadingSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-bg-muted rounded-md animate-pulse"
          style={{ width: i === 0 ? '75%' : i === lines - 1 ? '50%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-5 bg-bg-muted rounded-md" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-lg border border-border p-5 animate-pulse">
          <div className="bg-bg-muted rounded-md animate-pulse" style={{ height: '20px', width: '66%', marginBottom: '16px' }} />
          <div className="bg-bg-muted rounded-md animate-pulse" style={{ height: '16px', width: '50%', marginBottom: '8px' }} />
          <div className="bg-bg-muted rounded-md animate-pulse" style={{ height: '16px', width: '75%' }} />
        </div>
      ))}
    </div>
  );
}
