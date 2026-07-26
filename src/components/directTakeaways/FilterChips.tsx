'use client';

import { FILTER_OPTIONS } from '@/lib/constants/resources';

interface FilterChipsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTER_OPTIONS.map((option, index) => (
        <button
          key={option.id}
          onClick={() => onFilterChange(option.id)}
          className={`px-4 py-2 text-sm font-mono transition-all ${
            activeFilter === option.id
              ? 'bg-[var(--brand)] text-[#04120c] border border-[var(--brand)]'
              : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--line-2)] hover:text-[var(--ink)]'
          }`}
          style={{
            animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
          }}
        >
          {option.label}
        </button>
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
