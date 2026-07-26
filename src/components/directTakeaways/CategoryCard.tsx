'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Category, Resource } from '@/lib/constants/resources';
import { ResourceItem } from './ResourceItem';

interface CategoryCardProps {
  category: Category;
  searchQuery: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CategoryCard({ category, searchQuery, isExpanded, onToggle }: CategoryCardProps) {
  const [localSearch, setLocalSearch] = useState('');

  const filteredResources = category.resources.filter((resource) =>
    resource.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    resource.url.toLowerCase().includes(localSearch.toLowerCase())
  );

  const globalFilteredResources = category.resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayResources = searchQuery ? globalFilteredResources : filteredResources;
  const showCard = searchQuery ? globalFilteredResources.length > 0 : true;

  if (!showCard) return null;

  return (
    <div
      className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-2)] transition-all duration-300"
      style={{
        animation: `fadeInUp 0.5s ease-out ${category.id === 'mcp' ? 0 : category.id === 'ai-agents' ? 0.1 : category.id === 'agentic-skills' ? 0.2 : category.id === 'mcp-skills' ? 0.3 : category.id === 'prompt-libraries' ? 0.4 : 0.5}s both`,
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-xl font-mono font-bold text-[var(--brand)]">
            {category.title.charAt(0)}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-[var(--ink)] font-mono">{category.title}</h3>
            <p className="text-xs text-[var(--muted)] mt-1">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono text-[var(--brand)]">
            {category.resources.length} resources
          </span>
          <div className="w-8 h-8 bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-3)] transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
            )}
          </div>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[var(--line)]">
          {/* Local Search */}
          {!searchQuery && (
            <div className="mt-4 mb-4 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-3 h-3 text-[var(--faint)]" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={`Search ${category.title}...`}
                className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none focus:border-[var(--brand)] transition-all font-mono"
              />
            </div>
          )}

          {/* Resources Grid */}
          <div className="space-y-2">
            {displayResources.length > 0 ? (
              displayResources.map((resource, index) => (
                <div
                  key={resource.url}
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <ResourceItem {...resource} />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[var(--faint)] font-mono text-sm">
                No resources found matching your search
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
