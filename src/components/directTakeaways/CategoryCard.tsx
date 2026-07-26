'use client';

import { ChevronDown } from 'lucide-react';
import { Category } from '@/lib/constants/resources';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {

  return (
    <div
      className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-2)] transition-all duration-300 cursor-pointer"
      onClick={onClick}
      style={{
        animation: `fadeInUp 0.5s ease-out ${category.id === 'mcp' ? 0 : category.id === 'ai-agents' ? 0.1 : category.id === 'agentic-skills' ? 0.2 : category.id === 'mcp-skills' ? 0.3 : category.id === 'prompt-libraries' ? 0.4 : 0.5}s both`,
      }}
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-xl font-mono font-bold text-[var(--brand)]">
            {category.title.charAt(0)}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-[var(--ink)] font-mono">{category.title}</h3>
          </div>
        </div>
        <div className="w-8 h-8 bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center">
          <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
        </div>
      </div>

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
      `}</style>
    </div>
  );
}
