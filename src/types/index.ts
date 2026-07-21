export type ItemType = "skill" | "mcp" | "agent" | "repository" | "other";

export interface CatalogItem {
  id: string;
  name: string;
  type: ItemType;
  sourceId: string;
  sourceName: string;
  publisher?: string;
  section?: string;
  url: string;
  description?: string;
  tags?: string[];
  discoveredOn?: string;
}

// Slim projection sent to the client-side Explorer to keep the HTML payload small.
export type ExplorerItem = Pick<
  CatalogItem,
  "id" | "name" | "type" | "url" | "description" | "section" | "publisher"
> & {
  originalDescription?: string;
  needsTranslation?: boolean;
};

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

export interface Publisher {
  name: string;
  count: number;
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
  publishers: Publisher[];
  items: CatalogItem[];
}

export interface PromptItem {
  id: string;
  title: string;
  summary: string;
  prompt: string;
  repo: string;
  repoUrl: string;
  sourcePath: string;
  tier: string;
  tags: string[];
}

export interface PromptSourceReport {
  repo: string;
  tier: string;
  ok: boolean;
  filesScanned: number;
  extracted: number;
  error?: string;
}

export interface PromptDataset {
  generatedAt: string;
  totalRepos: number;
  extractedRaw: number;
  totalPrompts: number;
  sourceReports: PromptSourceReport[];
  items: PromptItem[];
}

export interface PromptQueryResponse {
  generatedAt: string;
  totalPrompts: number;
  totalMatches: number;
  page: number;
  pageSize: number;
  tiers: string[];
  items: PromptItem[];
}
