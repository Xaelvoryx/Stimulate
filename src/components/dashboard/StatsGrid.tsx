import type { CatalogDataset } from "@/types";

export function StatsGrid({ totals }: { totals: CatalogDataset["totals"] }) {
  const cards = [
    { value: totals.all, label: "Total discovered entries" },
    { value: totals.skills, label: "Skills" },
    { value: totals.mcps, label: "MCP servers / MCP-related" },
    { value: totals.agents, label: "Agents" },
    { value: totals.repositories, label: "Repositories" },
  ];

  return (
    <section className="panel kpi-grid">
      {cards.map((card) => (
        <article className="kpi-card" key={card.label}>
          <h3>{card.value.toLocaleString()}</h3>
          <p>{card.label}</p>
        </article>
      ))}
    </section>
  );
}
