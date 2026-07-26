'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-[var(--faint)]" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search across all resources..."
        className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none focus:border-[var(--brand)] transition-all font-mono text-sm"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          className="absolute inset-y-0 right-4 flex items-center text-[var(--faint)] hover:text-[var(--ink)] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
