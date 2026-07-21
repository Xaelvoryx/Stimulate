"use client";

import { useEffect, useMemo, useState } from "react";
import type { PromptItem, PromptQueryResponse } from "@/types";

const PAGE_SIZE = 12;

interface PromptsSectionProps {
  totalPrompts: number;
}

function shorten(value: string, max = 700): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n...`;
}

export function PromptsSection({ totalPrompts }: PromptsSectionProps) {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PromptQueryResponse>({
    generatedAt: new Date(0).toISOString(),
    totalPrompts,
    totalMatches: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    tiers: [],
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          tier,
        });

        if (search.trim()) {
          params.set("q", search.trim());
        }

        const response = await fetch(`/api/prompts?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          setError("Failed to load prompts. Please try again.");
          setLoading(false);
          return;
        }

        const body = (await response.json()) as PromptQueryResponse;
        setData(body);
      } catch {
        if (controller.signal.aborted) return;
        setError("Failed to load prompts. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [page, search, tier]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(data.totalMatches / Math.max(1, data.pageSize))),
    [data.pageSize, data.totalMatches],
  );

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function onTierChange(value: string) {
    setTier(value);
    setPage(1);
  }

  return (
    <section className="section" id="prompts">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Prompt Library</p>
          <h2>Prompts Inside The Site</h2>
          <p>
            Browse deduplicated prompts extracted from your listed repositories.
            Prompt content is shown directly here with search and tier filters across {totalPrompts.toLocaleString()} prompts.
          </p>
        </div>

        <div className="toolbar">
          <div className="filter-row filter-row-prompts">
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search prompt text, titles, tags, or repository..."
            />
            <select value={tier} onChange={(event) => onTierChange(event.target.value)}>
              <option value="all">All Tiers</option>
              {data.tiers.map((entry) => (
                <option value={entry} key={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <p className="empty">Loading prompts...</p> : null}
        {!loading && error ? <p className="empty">{error}</p> : null}

        {!loading && !error ? (
          <div className="card-grid prompt-grid">
            {data.items.map((item: PromptItem) => (
              <article className="card prompt-card" key={item.id}>
                <div className="card-top">
                  <span className="badge badge-featured">Prompt</span>
                  <span className="badge badge-type">{item.tier}</span>
                </div>

                <h3>{item.title}</h3>
                <p className="card-desc">{item.summary}</p>

                <div className="prompt-box">
                  <pre>{shorten(item.prompt)}</pre>
                </div>

                <div className="card-foot">
                  <span className="tag">{item.repo}</span>
                  <span className="tag">{item.sourcePath}</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="pagination">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            ← Prev
          </button>
          <span>
            Page {data.page} / {pageCount} · {data.totalMatches.toLocaleString()} matches
          </span>
          <button
            type="button"
            disabled={data.page >= pageCount}
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
