export type ItemType = "skill" | "mcp" | "agent" | "repository" | "other";

export interface CatalogItem {
  id: string;
  name: string;
  type: ItemType;
  sourceId: string;
  sourceName: string;
  section?: string;
  url: string;
  description?: string;
  tags?: string[];
  discoveredOn?: string;
}

export interface SourceMetric {
  label: string;
  value: string;
}

export interface SourceReport {
  id: string;
  name: string;
  url: string;
  pagesVisited: number;
  itemsExtracted: number;
  metrics: SourceMetric[];
  errors: string[];
}

export interface RepositoryRank {
  rank: number;
  name: string;
  url: string;
  reason: string;
  mentions: number;
}

export interface CatalogDataset {
  generatedAt: string;
  requestedSources: string[];
  totals: {
    all: number;
    skills: number;
    mcps: number;
    agents: number;
    repositories: number;
  };
  sourceReports: SourceReport[];
  topRepositories: RepositoryRank[];
  items: CatalogItem[];
}
