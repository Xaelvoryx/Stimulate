import { TopBar } from "@/components/layout/TopBar";
import { Hero } from "@/components/dashboard/Hero";
import { FeaturedSkills } from "@/components/dashboard/FeaturedSkills";
import { CategoryGrid } from "@/components/dashboard/CategoryGrid";
import { PublisherStrip } from "@/components/dashboard/PublisherStrip";
import { PromptsSection } from "@/components/dashboard/PromptsSection";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Explorer } from "@/components/explorer/Explorer";
import { loadDataset, loadPromptDataset } from "@/lib/data/loadData";
import type { ItemType } from "@/types";

const ALLOWED_TYPES = new Set<ItemType>(["skill", "mcp", "agent"]);
const ENDPOINT_LIKE = /^\/[a-z0-9][a-z0-9/_?=&.-]*$/i;
const HANDLE_LIKE = /^@[a-z0-9][a-z0-9._-]{1,}$/i;
const NUMERIC_HANDLE = /^@?[0-9]{5,}$/;
const NON_LATIN_CHARS = /[^\p{Script=Latin}\p{N}\p{P}\p{Zs}]/u;

function hasValidDestination(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;

    if (u.hostname === "github.com" || u.hostname === "www.github.com") {
      const segments = u.pathname.split("/").filter(Boolean);
      // Ignore plain GitHub profile links; keep only repo/deeper paths.
      return segments.length >= 2;
    }

    return true;
  } catch {
    return false;
  }
}

function hasUsefulName(name: string): boolean {
  const n = name.trim();
  if (!n) return false;
  if (ENDPOINT_LIKE.test(n)) return false;
  if (HANDLE_LIKE.test(n)) return false;
  if (NUMERIC_HANDLE.test(n)) return false;
  if (n.length < 3) return false;
  return true;
}

function hasUsefulDescription(value?: string): boolean {
  const v = (value ?? "").trim();
  return v.length >= 14;
}

function isEnglishLike(value?: string): boolean {
  if (!value) return true;

  const normalized = value
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return true;
  return !NON_LATIN_CHARS.test(normalized);
}

function englishNameOrFallback(name: string, type: ItemType): string {
  const cleaned = cleanText(name) ?? "";
  if (cleaned && isEnglishLike(cleaned)) return cleaned;

  if (type === "skill") return "Skill Entry";
  if (type === "mcp") return "MCP Server Entry";
  return "Agent Entry";
}

function englishDescriptionOrFallback(value?: string): string {
  const cleaned = cleanText(value) ?? "";
  if (cleaned && isEnglishLike(cleaned)) return cleaned;
  return "Translating to English...";
}

function cleanText(value?: string): string | undefined {
  if (!value) return value;
  return value
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Home() {
  const data = loadDataset();
  const promptData = loadPromptDataset();

  const filteredItems = data.items
    .filter(
      (item) =>
        ALLOWED_TYPES.has(item.type) &&
        hasUsefulName(item.name) &&
        hasUsefulDescription(item.description) &&
        hasValidDestination(item.url),
    )
    .map((item) => {
      const normalizedDescription = cleanText(item.description) ?? "";
      const needsTranslation = Boolean(normalizedDescription) && !isEnglishLike(normalizedDescription);

      return {
        ...item,
        name: englishNameOrFallback(item.name, item.type),
        description: needsTranslation
          ? "Translating to English..."
          : englishDescriptionOrFallback(item.description),
        originalDescription: needsTranslation ? normalizedDescription : undefined,
        needsTranslation,
        section: isEnglishLike(item.section) ? cleanText(item.section) : "General",
        publisher: isEnglishLike(item.publisher) ? cleanText(item.publisher) : undefined,
      };
    });

  const filteredTotals = {
    all: filteredItems.length,
    skills: filteredItems.filter((item) => item.type === "skill").length,
    mcps: filteredItems.filter((item) => item.type === "mcp").length,
    agents: filteredItems.filter((item) => item.type === "agent").length,
    repositories: 0,
  };

  const publisherCounts = new Map<string, number>();
  for (const item of filteredItems) {
    if (!item.publisher) continue;
    publisherCounts.set(item.publisher, (publisherCounts.get(item.publisher) ?? 0) + 1);
  }

  const filteredPublishers = [...publisherCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const pageData = {
    ...data,
    items: filteredItems,
    totals: filteredTotals,
    publishers: filteredPublishers,
  };

  // Slim projection keeps the client Explorer payload small (full dataset is ~5 MB).
  const explorerItems = pageData.items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    url: item.url,
    description: item.description,
    originalDescription: item.originalDescription,
    needsTranslation: item.needsTranslation,
    section: item.section,
    publisher: item.publisher,
  }));

  return (
    <div className="page-wrap" id="top">
      <TopBar dataset={pageData} />
      <Hero dataset={pageData} />

      <main>
        <FeaturedSkills dataset={pageData} />
        <CategoryGrid dataset={pageData} />
        <PublisherStrip dataset={pageData} />
        <PromptsSection totalPrompts={promptData.totalPrompts} />
        <Explorer items={explorerItems} publishers={pageData.publishers} />
        <HowItWorks />
      </main>

      <SiteFooter />
    </div>
  );
}
