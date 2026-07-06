'use client';

import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { css } from 'styled-system/css';

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
  sortValue,
  onSortChange,
  sortOptions = [
    { value: 'recent', label: 'Date - les plus récentes' },
    { value: 'oldest', label: 'Date - les plus anciennes' },
  ],
}) => {
  const isActive = showFilters || activeFiltersCount > 0;

  const bar = css({
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    rounded: 'xl',
    shadow: 'sm',
    px: '4',
    py: '2.5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const filterBtn = css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '3',
    py: '1.5',
    fontSize: 'xs',
    fontWeight: 'medium',
    rounded: 'lg',
    transition: 'colors',
    bg: isActive ? 'accent.default' : 'bg.muted',
    color: isActive ? 'white' : 'fg.muted',
    _hover: isActive ? {} : { bg: 'bg.elevated' },
    ...(isActive ? { shadow: 'sm' } : {}),
  });

  const selectCls = css({
    fontSize: 'xs',
    fontWeight: 'medium',
    color: 'fg.muted',
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    rounded: 'lg',
    py: '1.5',
    pl: '2.5',
    pr: '7',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    _hover: { borderColor: 'fg.subtle' },
    _focus: { borderColor: 'accent.default', boxShadow: '0 0 0 2px rgba(79,94,255,0.15)' },
  });

  return (
    <div className={bar}>
      <button onClick={onToggleFilters} className={filterBtn}>
        <Filter size={13} />
        Filtres
        {activeFiltersCount > 0 && (
          <span className={css({ w: '1.5', h: '1.5', bg: '#f59e0b', rounded: 'full' })} />
        )}
      </button>

      <div className={css({ fontSize: 'xs', color: 'fg.muted', fontWeight: 'medium' })}>
        {itemCount} élément{itemCount !== 1 ? 's' : ''}
        {totalCount !== undefined && totalCount !== itemCount && ` / ${totalCount}`}
      </div>

      {onSortChange && (
        <div className={css({ position: 'relative' })}>
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className={selectCls}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className={css({ position: 'absolute', right: '2', top: '50%', transform: 'translateY(-50%)', color: 'fg.subtle', pointerEvents: 'none' })} />
        </div>
      )}
    </div>
  );
};

export default FilterBar;
