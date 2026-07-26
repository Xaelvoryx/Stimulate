'use client';

import { useState, useMemo } from 'react';
import { RESOURCES_CONFIG } from '@/lib/constants/resources';
import { StatisticsHeader } from './StatisticsHeader';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { CategoryCard } from './CategoryCard';

export function DirectTakeaways() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['mcp', 'ai-agents']));

  const filteredCategories = useMemo(() => {
    if (activeFilter === 'all') {
      return RESOURCES_CONFIG;
    }
    return RESOURCES_CONFIG.filter((cat) => cat.id === activeFilter);
  }, [activeFilter]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    // Expand first category when filter changes
    if (filterId !== 'all') {
      setExpandedCategories(new Set([filterId]));
    } else {
      setExpandedCategories(new Set(['mcp', 'ai-agents']));
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--ink)] mb-3 font-mono">
          Direct Takeaways
        </h2>
        <p className="text-base text-[var(--muted)] max-w-3xl mx-auto leading-relaxed">
          Discover the world's best AI resources, repositories, tools, learning platforms, prompt libraries, and agent ecosystems—all in one place.
        </p>
      </div>

      {/* Statistics */}
      <StatisticsHeader />

      {/* Search */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Filters */}
      <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            searchQuery={searchQuery}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => toggleCategory(category.id)}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-[var(--ink)] mb-2 font-mono">No results found</h3>
          <p className="text-[var(--muted)] font-mono text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </section>
  );
}
