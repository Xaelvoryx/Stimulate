'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/lib/constants/resources';
import { ResourceItem } from './ResourceItem';

interface ResourceModalProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

export function ResourceModal({ category, isOpen, onClose }: ResourceModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(0);
  }, [category.id]);

  const totalPages = Math.ceil(category.resources.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = category.resources.slice(startIndex, endIndex);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--surface)] border border-[var(--line)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-xl font-mono font-bold text-[var(--brand)]">
              {category.title.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--ink)] font-mono">{category.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-3)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>


        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2">
            {currentResources.map((resource, index) => (
              <div
                key={resource.url}
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <ResourceItem {...resource} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm font-mono text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <p className="text-xs text-[var(--muted)] font-mono">
            Page {currentPage + 1} of {totalPages}
          </p>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm font-mono text-[var(--ink)] hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
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
