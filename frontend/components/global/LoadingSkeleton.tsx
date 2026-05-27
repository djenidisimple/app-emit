export function LoadingSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse ${className ?? ""}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-[#E9ECEF] rounded mb-2 ${i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-[#E9ECEF] rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm p-5 animate-pulse">
          <div className="h-4 bg-[#E9ECEF] rounded w-2/3 mb-4" />
          <div className="h-4 bg-[#E9ECEF] rounded w-1/2 mb-2" />
          <div className="h-4 bg-[#E9ECEF] rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
