import type { CatalogDataset } from "@/types";

const PLATFORMS = [
  "Claude Code",
  "OpenAI Codex",
  "Cursor",
  "Gemini CLI",
  "GitHub Copilot",
  "Windsurf",
];

export function Hero({ dataset }: { dataset: CatalogDataset }) {
  const { totals } = dataset;

  return (
    <header className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="hero-pill">
              <span className="dot-live" />
              {totals.all.toLocaleString()} curated entries · always growing
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
                <b>{totals.skills.toLocaleString()}</b>
                <span>Skills</span>
              </div>
              <div className="hero-stat">
                <b>{totals.mcps.toLocaleString()}</b>
                <span>MCP Servers</span>
              </div>
              <div className="hero-stat">
                <b>{totals.agents.toLocaleString()}</b>
                <span>Agents</span>
              </div>
            </div>
          </div>

          <div className="terminal">
            <div className="terminal-head">
              <i className="tl-r" />
              <i className="tl-y" />
              <i className="tl-g" />
              <span>stimulate — catalog</span>
            </div>
            <div className="terminal-body">
              <div className="cmd">stimulate search &quot;mcp server&quot;</div>
              <div className="ok">✓ {totals.mcps.toLocaleString()} MCP servers indexed</div>
              <div className="dim">filesystem · postgres · github · slack …</div>
              <br />
              <div className="cmd">stimulate list --type skill</div>
              <div className="ok">✓ {totals.skills.toLocaleString()} skills ready</div>
              <div className="dim">frontend-design · code-review · seo …</div>
              <br />
              <div className="cmd">open author/skill-name</div>
              <div className="ok">→ works across 18+ agent platforms</div>
            </div>
          </div>
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
