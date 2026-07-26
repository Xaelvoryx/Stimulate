'use client';

import { ExternalLink } from 'lucide-react';

interface ResourceItemProps {
  name: string;
  url: string;
}

export function ResourceItem({ name, url }: ResourceItemProps) {
  const handleClick = () => {
    window.open(url, '_blank');
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-full text-left p-4 bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--brand)] transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="text-[var(--ink)] font-medium truncate group-hover:text-[var(--brand)] transition-colors font-mono text-sm">
              {name}
            </div>
            <div className="text-xs text-[var(--faint)] truncate mt-0.5 font-mono">
              {getDomain(url)}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <ExternalLink className="w-4 h-4 text-[var(--faint)] group-hover:text-[var(--brand)] transition-colors" />
        </div>
      </div>
    </button>
  );
}
