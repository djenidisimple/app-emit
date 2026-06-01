'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  itemCount: number;
  totalCount?: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount?: number;
  sortLabel?: string;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: Array<{ value: string; label: string }>;
}

const FilterBar: React.FC<FilterBarProps> = ({
  itemCount,
  totalCount,
  showFilters,
  onToggleFilters,
  activeFiltersCount = 0,
  sortLabel = 'Date',
  sortValue,
  onSortChange,
  sortOptions = [
    { value: 'recent', label: 'Date - les plus récentes' },
    { value: 'oldest', label: 'Date - les plus anciennes' },
  ],
}) => {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Filtrage à gauche */}
      <button
        onClick={onToggleFilters}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
          showFilters || activeFiltersCount > 0
            ? 'bg-[#0052FF] text-white'
            : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
        }`}
      >
        <Filter size={14} />
        Filtres
        {activeFiltersCount > 0 && (
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
        )}
      </button>

      {/* Compteur au centre */}
      <div className="text-xs text-blue-500 font-medium">
        {itemCount} élément{itemCount !== 1 ? 's' : ''}
        {totalCount !== undefined && totalCount !== itemCount && ` / ${totalCount}`}
      </div>

      {/* Tri à droite */}
      {onSortChange && (
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs font-medium text-blue-500 bg-transparent border-none outline-none cursor-pointer hover:text-blue-700 pr-2"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FilterBar;