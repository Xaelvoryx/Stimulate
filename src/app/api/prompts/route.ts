import { NextResponse } from "next/server";
import { loadPromptDataset } from "@/lib/data/loadData";
import type { PromptItem, PromptQueryResponse } from "@/types";

function toPositiveInt(value: string | null, fallbackValue: number): number {
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return fallbackValue;
  return n;
}

function sortPrompts(items: PromptItem[]): PromptItem[] {
  return [...items].sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0));
}

export async function GET(request: Request) {
  const dataset = loadPromptDataset();
  const url = new URL(request.url);

  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const tier = (url.searchParams.get("tier") ?? "all").trim();
  const page = toPositiveInt(url.searchParams.get("page"), 1);
  const pageSize = Math.min(40, toPositiveInt(url.searchParams.get("pageSize"), 12));

  const tiers = [...new Set(dataset.items.map((item) => item.tier).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

  const byTier = dataset.items.filter((item) => {
    if (tier === "all") return true;
    return item.tier === tier;
  });

  const bySearch = byTier.filter((item) => {
    if (!q) return true;
    const blob = `${item.title} ${item.summary} ${item.prompt} ${item.repo} ${item.tags.join(" ")}`.toLowerCase();
    return blob.includes(q);
  });

  const sorted = sortPrompts(bySearch);
  const totalMatches = sorted.length;
  const pageCount = Math.max(1, Math.ceil(totalMatches / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  const payload: PromptQueryResponse = {
    generatedAt: dataset.generatedAt,
    totalPrompts: dataset.totalPrompts,
    totalMatches,
    page: safePage,
    pageSize,
    tiers,
    items: pageItems,
  };

  return NextResponse.json(payload, { status: 200 });
}
