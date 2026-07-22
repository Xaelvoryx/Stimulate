import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Stimulate</h3>
            <p>
              The curated directory for AI agent skills, MCP servers, agents, and
              prompts. Find, compare, and use the building blocks that
              supercharge your workflow.
            </p>
          </div>

          <div className="footer-col">
            <h4>Catalog</h4>
            <Link href="/explore">Browse All</Link>
            <Link href="/explore?tab=skill">Skills</Link>
            <Link href="/explore?tab=mcp">MCP Servers</Link>
            <Link href="/explore?tab=agent">Agents</Link>
          </div>

          <div className="footer-col">
            <h4>Discover</h4>
            <Link href="/explore">Categories</Link>
            <Link href="/publishers">Publishers</Link>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <Link href="/">Overview</Link>
            <Link href="/explore">How It Works</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Stimulate · The Complete AI Builder Catalog</span>
          <span>Skills · MCP Servers · Agents · Prompts</span>
        </div>
      </div>
    </footer>
  );
}
