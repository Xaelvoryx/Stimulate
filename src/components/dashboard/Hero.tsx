import type { CatalogDataset } from "@/types";

export function Hero({ dataset }: { dataset: CatalogDataset }) {
  return (
    <header className="hero">
      <div className="hero-blur hero-blur-a" />
      <div className="hero-blur hero-blur-b" />
      <div className="container">
        <p className="eyebrow">The Complete AI Builder Catalog</p>
        <h1>Skills, MCP Servers, Agents, and Repositories in One Place</h1>
        <p className="lead">
          A curated catalog of skills, MCP servers, agents, and repositories
          with instant search and category drill-down.
        </p>
        <div className="quick-meta">
          <span>{dataset.totals.all.toLocaleString()} curated entries</span>
          <span>{dataset.totals.skills.toLocaleString()} skills · {dataset.totals.mcps.toLocaleString()} MCP · {dataset.totals.agents.toLocaleString()} agents</span>
        </div>
      </div>
    </header>
  );
}
