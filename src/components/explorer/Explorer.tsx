"use client";

import { useMemo, useState } from "react";
import type { CatalogItem, CatalogDataset, ItemType } from "@/types";

type TabKey = "all" | "skill" | "mcp" | "agent" | "repository";

const PAGE_SIZE = 80;

const tabLabels: Record<TabKey, string> = {
  all: "All",
  skill: "Skills",
  mcp: "MCP",
  agent: "Agents",
  repository: "Repositories",
};

function sortItems(items: CatalogItem[]): CatalogItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function Explorer({ dataset }: { dataset: CatalogDataset }) {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [page, setPage] = useState(1);

  const sectionOptions = useMemo(() => {
    const names = [...new Set(dataset.items.map((item) => item.section).filter(Boolean))];
    return names.sort((a, b) => a!.localeCompare(b!));
  }, [dataset.items]);

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();

    const byTab = dataset.items.filter((item) => {
      if (tab === "all") return true;
      return item.type === tab;
    });

    const bySection = byTab.filter((item) => {
      if (section === "all") return true;
      return item.section === section;
    });

    const bySearch = bySection.filter((item) => {
      if (!lower) return true;
      const blob = `${item.name} ${item.description ?? ""} ${item.url} ${item.section ?? ""}`.toLowerCase();
      return blob.includes(lower);
    });

    return sortItems(bySearch);
  }, [dataset.items, search, section, tab]);

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

  const countByType: Record<ItemType | "all", number> = {
    all: dataset.items.length,
    skill: dataset.items.filter((item) => item.type === "skill").length,
    mcp: dataset.items.filter((item) => item.type === "mcp").length,
    agent: dataset.items.filter((item) => item.type === "agent").length,
    repository: dataset.items.filter((item) => item.type === "repository").length,
    other: dataset.items.filter((item) => item.type === "other").length,
  };

  return (
    <section className="panel explorer">
      <div className="panel-head">
        <h2>Explore the Catalog</h2>
        <p>
          Browse every entry by category, or use the section and search filters
          to drill down instantly.
        </p>
      </div>

      <div className="tab-row">
        {(Object.keys(tabLabels) as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={key === tab ? "tab active" : "tab"}
            onClick={() => onTabChange(key)}
          >
            {tabLabels[key]} ({countByType[key]})
          </button>
        ))}
      </div>

      <div className="filter-row">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, description, or URL"
        />
        <select value={section} onChange={(event) => onSectionChange(event.target.value)}>
          <option value="all">All Sections</option>
          {sectionOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Section</th>
              <th>Description</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.type.toUpperCase()}</td>
                <td>{item.section || "-"}</td>
                <td>{item.description || "-"}</td>
                <td>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Prev
        </button>
        <span>
          Page {safePage} / {pageCount} · {filtered.length} matches
        </span>
        <button
          type="button"
          disabled={safePage >= pageCount}
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
        >
          Next
        </button>
      </div>
    </section>
  );
}
