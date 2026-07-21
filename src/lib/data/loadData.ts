import fs from "node:fs";
import path from "node:path";
import type { CatalogDataset, PromptDataset } from "@/types";

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
