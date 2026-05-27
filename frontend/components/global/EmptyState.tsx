import React from "react";

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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#E8EEF8] rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#1B3A6B]/40" />
      </div>
      <p className="text-[#212529] font-semibold text-base mb-1">{title}</p>
      <p className="text-[#6C757D] text-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
