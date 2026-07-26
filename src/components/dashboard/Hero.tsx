import type { CatalogDataset, PromptItem } from "@/types";
import { formatCount } from "@/lib/data/cleanedData";
import { LiveTerminal } from "./LiveTerminal";

const PLATFORMS = [
  "Claude Code",
  "OpenAI Codex",
  "Cursor",
  "Gemini CLI",
  "GitHub Copilot",
  "Windsurf",
];

export function Hero({ dataset, prompts }: { dataset: CatalogDataset; prompts: PromptItem[] }) {
  const { totals } = dataset;

  return (
    <header className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="hero-pill">
              <span className="dot-live" />
              {formatCount(totals.all)} curated entries · always growing
            </span>
            <h1>
              Discover the Best <span className="grad">AI Agent Skills</span> &amp; MCP Servers
            </h1>
            <p className="lead">
              A curated directory of skills, MCP servers, and agents
              for Claude Code, Codex, Cursor, Gemini CLI, and more. Find, compare,
              and open the building blocks that supercharge your workflow.
            </p>

            <div className="hero-cta">
              <a className="btn btn-primary" href="#explore">Browse Catalog</a>
              <a className="btn btn-ghost" href="#categories">Explore Categories</a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <b>{formatCount(totals.skills)}</b>
                <span>Skills</span>
              </div>
              <div className="hero-stat">
                <b>{formatCount(totals.mcps)}</b>
                <span>MCP Servers</span>
              </div>
              <div className="hero-stat">
                <b>{formatCount(totals.agents)}</b>
                <span>Agents</span>
              </div>
              {totals.prompts !== undefined && (
                <div className="hero-stat">
                  <b>{formatCount(totals.prompts)}</b>
                  <span>Prompts</span>
                </div>
              )}
            </div>
          </div>

          <LiveTerminal items={dataset.items} prompts={prompts} totals={totals} />
        </div>

        <div className="platforms-strip">
          <p>Works across 18+ agent platforms</p>
          <div className="platforms-row">
            {PLATFORMS.map((name) => (
              <span className="platform-chip" key={name}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
