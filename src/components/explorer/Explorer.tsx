"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ExplorerItem, Publisher, PromptItem, PromptQueryResponse } from "@/types";

type TabKey = "all" | "skill" | "mcp" | "agent" | "prompt";

const PAGE_SIZE = 80;

const tabLabels: Record<TabKey, string> = {
  all: "All",
  skill: "Skills",
  mcp: "MCP",
  agent: "Agents",
  prompt: "Prompts",
};

function sortItems(items: ExplorerItem[]): ExplorerItem[] {
  return [...items].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function fallbackSummary(item: ExplorerItem): string {
  const typeLabel = item.type === "mcp" ? "MCP server" : item.type === "agent" ? "Agent" : "Skill";
  const section = item.section ? ` in ${item.section}` : "";
  const publisher = item.publisher ? ` by ${item.publisher}` : "";
  return `${typeLabel}${publisher}${section}. Open to view full details on the source page.`;
}

function fallbackPromptSummary(item: PromptItem): string {
  return `${item.tier} prompt from ${item.repo}. Open to view the full prompt.`;
}

export function Explorer({ items, publishers }: { items: ExplorerItem[]; publishers: Publisher[] }) {
  const searchParams = useSearchParams();

  // Initialize state based on query parameters if present
  const initialTab = (searchParams.get("tab") as TabKey) || "all";
  const initialSection = searchParams.get("section") || "all";
  const initialPublisher = searchParams.get("publisher") || "all";

  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState(initialSection);
  const [publisher, setPublisher] = useState(initialPublisher);
  const [promptTier, setPromptTier] = useState("all");
  const [promptSearch, setPromptSearch] = useState("");
  const [promptPage, setPromptPage] = useState(1);
  const [promptQuery, setPromptQuery] = useState<PromptQueryResponse>({
    generatedAt: new Date(0).toISOString(),
    totalPrompts: 0,
    totalMatches: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    tiers: [],
    items: [],
  });
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [activePrompt, setActivePrompt] = useState<PromptItem | null>(null);
  const [page, setPage] = useState(1);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Sync tab state when query params change
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabKey;
    if (tabParam && tabParam !== tab) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setTab(tabParam), 0);
    }
  }, [searchParams, tab]);


  const sectionOptions = useMemo(() => {
    const names = [...new Set(items.map((item) => item.section).filter(Boolean))] as string[];
    return names.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }, [items]);

  const publisherOptions = useMemo(
    () => publishers.map((entry) => entry.name),
    [publishers],
  );

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();

    const byTab = items.filter((item) => {
      if (tab === "all") return true;
      return item.type === tab;
    });

    const bySection = byTab.filter((item) => {
      if (section === "all") return true;
      return item.section === section;
    });

    const byPublisher = bySection.filter((item) => {
      if (publisher === "all") return true;
      return item.publisher === publisher;
    });

    const bySearch = byPublisher.filter((item) => {
      if (!lower) return true;
      const blob = `${item.name} ${item.description ?? ""} ${item.url} ${item.section ?? ""} ${item.publisher ?? ""}`.toLowerCase();
      return blob.includes(lower);
    });

    return sortItems(bySearch);
  }, [items, search, section, publisher, tab]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPrompts() {
      // Only set loading spinners if the active tab is actually the prompt tab
      if (tab === "prompt") {
        setPromptLoading(true);
      }
      setPromptError("");

      try {
        const params = new URLSearchParams({
          page: String(promptPage),
          pageSize: String(PAGE_SIZE),
        });

        if (promptTier !== "all") {
          params.set("tier", promptTier);
        }

        if (promptSearch.trim()) {
          params.set("q", promptSearch.trim());
        }

        const response = await fetch(`/api/prompts?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          if (tab === "prompt") {
            setPromptError("Failed to load prompts. Please try again.");
          }
          return;
        }

        const body = (await response.json()) as PromptQueryResponse;
        setPromptQuery(body);
      } catch {
        if (!controller.signal.aborted && tab === "prompt") {
          setPromptError("Failed to load prompts. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted && tab === "prompt") {
          setPromptLoading(false);
        }
      }
    }

    void loadPrompts();

    return () => controller.abort();
  }, [promptPage, promptSearch, promptTier, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const visibleItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    const pending = visibleItems.filter(
      (item) => item.needsTranslation && item.originalDescription && !translations[item.id],
    );

    if (pending.length === 0) return;

    let cancelled = false;

    async function translateVisible() {
      const updates: Record<string, string> = {};

      await Promise.all(
        pending.map(async (item) => {
          try {
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: item.originalDescription }),
            });

            if (!res.ok) {
              updates[item.id] = fallbackSummary(item);
              return;
            }

            const body = (await res.json()) as { translation?: string };
            const translated = (body.translation ?? "").trim();
            updates[item.id] = translated || fallbackSummary(item);
          } catch {
            updates[item.id] = fallbackSummary(item);
          }
        }),
      );

      if (!cancelled && Object.keys(updates).length > 0) {
        setTranslations((prev) => ({ ...prev, ...updates }));
      }
    }

    void translateVisible();

    return () => {
      cancelled = true;
    };
  }, [translations, visibleItems]);

  const promptPageCount = Math.max(1, Math.ceil(promptQuery.totalMatches / Math.max(1, promptQuery.pageSize)));

  function onTabChange(nextTab: TabKey) {
    setTab(nextTab);
    setPage(1);
  }

  function onSearchChange(nextValue: string) {
    setSearch(nextValue);
    setPage(1);
  }

  function onSectionChange(nextSection: string) {
    setSection(nextSection);
    setPage(1);
  }

  function onPublisherChange(nextPublisher: string) {
    setPublisher(nextPublisher);
    setPage(1);
  }

  function onPromptSearchChange(nextValue: string) {
    setPromptSearch(nextValue);
    setPromptPage(1);
  }

  function onPromptTierChange(nextValue: string) {
    setPromptTier(nextValue);
    setPromptPage(1);
  }

  const countByType: Record<TabKey, number> = {
    all: items.length,
    skill: items.filter((item) => item.type === "skill").length,
    mcp: items.filter((item) => item.type === "mcp").length,
    agent: items.filter((item) => item.type === "agent").length,
    prompt: promptQuery.totalPrompts,
  };

  return (
    <section className="section explorer" id="explore">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Full Index</p>
          <h2>Explore the Catalog</h2>
          <p>
            Search every entry by name, description, or URL, and filter by type
            and category across all {items.length.toLocaleString()} entries.
          </p>
        </div>

        <div className="toolbar">
          <div className="tab-row">
            {(Object.keys(tabLabels) as TabKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={key === tab ? "tab active" : "tab"}
                onClick={() => onTabChange(key)}
              >
                {tabLabels[key]} ({countByType[key].toLocaleString()})
              </button>
            ))}
          </div>

          <div className="filter-row">
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name, description, or URL…"
              className="border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <select value={section} onChange={(event) => onSectionChange(event.target.value)} className="border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">All Categories</option>
              {sectionOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select value={publisher} onChange={(event) => onPublisherChange(event.target.value)} className="border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">All Publishers</option>
              {publisherOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {tab === "prompt" ? (
            <div className="filter-row filter-row-prompts-inline">
              <input
                value={promptSearch}
                onChange={(event) => onPromptSearchChange(event.target.value)}
                placeholder="Search prompt titles, summaries, text, or repo..."
                className="border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <select value={promptTier} onChange={(event) => onPromptTierChange(event.target.value)} className="border border-gray-300 bg-white text-gray-900 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="all">All Tiers</option>
                {promptQuery.tiers.map((entry) => (
                  <option value={entry} key={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {tab === "prompt" ? (
          <>
            {promptLoading ? <p className="empty">Loading prompts...</p> : null}
            {!promptLoading && promptError ? <p className="empty">{promptError}</p> : null}

            {!promptLoading && !promptError ? (
              <div className="card-grid prompt-grid">
                {promptQuery.items.length === 0 ? (
                  <p className="empty">No prompts match your filters.</p>
                ) : null}
                {promptQuery.items.map((item) => (
                  <article className="card prompt-card" key={item.id}>
                    <div className="card-top">
                      <span className="badge badge-featured">Prompt</span>
                      <span className="badge badge-type">{item.tier}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className="card-desc">{item.summary || fallbackPromptSummary(item)}</p>
                    <div className="card-foot">
                      <span className="tag">{item.repo}</span>
                      <button type="button" className="prompt-view-btn" onClick={() => setActivePrompt(item)}>
                        View Prompt
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="pagination">
              <button
                type="button"
                disabled={promptPage <= 1}
                onClick={() => setPromptPage((prev) => Math.max(1, prev - 1))}
              >
                ← Prev
              </button>
              <span>
                Prompt Page {promptPage} / {promptPageCount} · {promptQuery.items.length.toLocaleString()} shown
              </span>
              <button
                type="button"
                disabled={promptPage >= promptPageCount}
                onClick={() => setPromptPage((prev) => Math.min(promptPageCount, prev + 1))}
              >
                Next →
              </button>
            </div>
          </>
        ) : visibleItems.length === 0 ? (
          <p className="empty">No entries match your filters.</p>
        ) : (
          <div className="card-grid">
            {visibleItems.map((item) => (
              <article className="card" key={item.id}>
                <div className="card-top">
                  <span className="badge badge-type">{item.type.toUpperCase()}</span>
                  {item.publisher ? <span className="badge badge-pub">{item.publisher}</span> : null}
                </div>
                <h3>{item.name}</h3>
                <p className="card-desc">
                  {item.needsTranslation
                    ? (translations[item.id] ?? "Translating to English...")
                    : (item.description || "Open to explore this entry.")}
                </p>
                <div className="card-foot">
                  <span className="tag">{item.section || "General"}</span>
                  <Link href={`/item/${item.id}`}>
                    Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab !== "prompt" ? (
          <div className="pagination">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            ← Prev
          </button>
          <span>
            Page {safePage} / {pageCount} · {filtered.length.toLocaleString()} matches
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount}
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          >
            Next →
          </button>
          </div>
        ) : null}

        {activePrompt ? (
          <div className="prompt-modal" role="dialog" aria-modal="true" aria-label={activePrompt.title}>
            <button
              type="button"
              className="prompt-modal-backdrop"
              aria-label="Close prompt"
              onClick={() => setActivePrompt(null)}
            />
            <div className="prompt-modal-panel">
              <div className="prompt-modal-head">
                <div>
                  <span className="badge badge-featured">Prompt</span>
                  <span className="badge badge-type">{activePrompt.tier}</span>
                </div>
                <button type="button" className="prompt-close" onClick={() => setActivePrompt(null)}>
                  Close
                </button>
              </div>

              <h3>{activePrompt.title}</h3>
              <p className="card-desc">{activePrompt.summary}</p>

              <div className="prompt-modal-meta">
                <span>{activePrompt.repo}</span>
                <span>{activePrompt.sourcePath}</span>
              </div>

              <div className="prompt-modal-body">
                <pre>{activePrompt.prompt}</pre>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
