'use client';

import { useState, useMemo } from 'react';
import { RESOURCES_CONFIG, Category } from '@/lib/constants/resources';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { CategoryCard } from './CategoryCard';
import { ResourceModal } from './ResourceModal';

export function DirectTakeaways() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    if (activeFilter === 'all') {
      return RESOURCES_CONFIG;
    }
    return RESOURCES_CONFIG.filter((cat) => cat.id === activeFilter);
  }, [activeFilter]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedCategory(null);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--ink)] mb-3 font-mono">
          Direct Takeaways
        </h2>
      </div>

      {/* Search */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Filters */}
      <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => handleCategoryClick(category)}
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

      {/* Resource Modal */}
      {selectedCategory && (
        <ResourceModal
          category={selectedCategory}
          isOpen={!!selectedCategory}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
