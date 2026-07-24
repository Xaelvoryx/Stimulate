import fs from "node:fs";
import path from "node:path";
import type { CatalogDataset, PromptDataset, PromptVaultDataset, PromptVaultItem } from "@/types";

const fallbackData: CatalogDataset = {
  generatedAt: new Date(0).toISOString(),
  requestedSources: [],
  totals: {
    all: 0,
    skills: 0,
    mcps: 0,
    agents: 0,
    repositories: 0,
  },
  sourceReports: [],
  topRepositories: [],
  publishers: [],
  items: [],
};

const DATASET_PATH = path.join(process.cwd(), "data", "aggregated.json");
const PROMPTS_PATH = path.join(process.cwd(), "data", "prompts.json");
const PROMPT_VAULT_PATH = path.join(process.cwd(), "data", "prompts.json");

const fallbackPrompts: PromptDataset = {
  generatedAt: new Date(0).toISOString(),
  totalRepos: 0,
  extractedRaw: 0,
  totalPrompts: 0,
  sourceReports: [],
  items: [],
};

export function loadDataset(): CatalogDataset {
  if (!fs.existsSync(DATASET_PATH)) {
    return fallbackData;
  }

  try {
    const raw = fs.readFileSync(DATASET_PATH, "utf8");
    const parsed = JSON.parse(raw) as CatalogDataset;
    return { ...parsed, publishers: parsed.publishers ?? [] };
  } catch {
    return fallbackData;
  }
}

export function loadPromptDataset(): PromptDataset {
  if (!fs.existsSync(PROMPTS_PATH)) {
    return fallbackPrompts;
  }

  try {
    const raw = fs.readFileSync(PROMPTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as PromptDataset;
    return {
      ...parsed,
      sourceReports: parsed.sourceReports ?? [],
      items: parsed.items ?? [],
    };
  } catch {
    return fallbackPrompts;
  }
}

export function loadPromptVaultDataset(): PromptVaultDataset {
  if (!fs.existsSync(PROMPT_VAULT_PATH)) {
    return {
      items: [],
      categories: {},
      tags: {},
      difficulties: {},
      qualityDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      averageQuality: 0,
      averagePopularity: 0,
      totalStars: 0,
      totalForks: 0,
    };
  }

  try {
    const raw = fs.readFileSync(PROMPT_VAULT_PATH, "utf8");
    const items = JSON.parse(raw) as PromptVaultItem[];
    
    // Build categories, tags, and difficulties counts
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    const difficulties: Record<string, number> = {};
    
    items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
      item.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
      difficulties[item.difficulty] = (difficulties[item.difficulty] || 0) + 1;
    });
    
    return {
      items,
      categories,
      tags,
      difficulties,
      qualityDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      averageQuality: 0,
      averagePopularity: 0,
      totalStars: 0,
      totalForks: 0,
    };
  } catch {
    return {
      items: [],
      categories: {},
      tags: {},
      difficulties: {},
      qualityDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      averageQuality: 0,
      averagePopularity: 0,
      totalStars: 0,
      totalForks: 0,
    };
  }
}
