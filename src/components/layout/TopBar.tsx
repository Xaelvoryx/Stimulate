import type { CatalogDataset } from "@/types";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export function TopBar({ dataset }: { dataset: CatalogDataset }) {
  const d = new Date(dataset.generatedAt);
  const stamp = Number.isNaN(d.getTime())
    ? ""
    : `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")} ${d.getUTCFullYear()}`;

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <span className="topbar-brand">
          <span className="dot-live" />
          Stimulate
        </span>
        <div className="topbar-meta">
          <span>INDEX LIVE{stamp ? ` · ${stamp}` : ""}</span>
          <span><b>{dataset.totals.skills.toLocaleString()}</b> SKILLS</span>
          <span><b>{dataset.totals.mcps.toLocaleString()}</b> MCP SERVERS</span>
          <span><b>{dataset.totals.agents.toLocaleString()}</b> AGENTS</span>
        </div>
        <a className="topbar-search" href="#explore">
          Search catalog <kbd>/</kbd>
        </a>
      </div>
    </div>
  );
}
