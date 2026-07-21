"use client";

import { useMemo, useState } from "react";
import type { ExplorerItem, Publisher, ItemType } from "@/types";

type TabKey = "all" | "skill" | "mcp" | "agent" | "repository";

const PAGE_SIZE = 80;

const tabLabels: Record<TabKey, string> = {
  all: "All",
  skill: "Skills",
  mcp: "MCP",
  agent: "Agents",
  repository: "Repositories",
};

function sortItems(items: ExplorerItem[]): ExplorerItem[] {
  return [...items].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

export function Explorer({ items, publishers }: { items: ExplorerItem[]; publishers: Publisher[] }) {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [publisher, setPublisher] = useState("all");
  const [page, setPage] = useState(1);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const visibleItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

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

  const countByType: Record<ItemType | "all", number> = {
    all: items.length,
    skill: items.filter((item) => item.type === "skill").length,
    mcp: items.filter((item) => item.type === "mcp").length,
    agent: items.filter((item) => item.type === "agent").length,
    repository: items.filter((item) => item.type === "repository").length,
    other: items.filter((item) => item.type === "other").length,
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
            />
            <select value={section} onChange={(event) => onSectionChange(event.target.value)}>
              <option value="all">All Categories</option>
              {sectionOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select value={publisher} onChange={(event) => onPublisherChange(event.target.value)}>
              <option value="all">All Publishers</option>
              {publisherOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visibleItems.length === 0 ? (
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
                <p className="card-desc">{item.description || "Open to explore this entry."}</p>
                <div className="card-foot">
                  <span className="tag">{item.section || "General"}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Open →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

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
      </div>
    </section>
  );
}
