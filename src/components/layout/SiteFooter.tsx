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
            <a href="#explore">Browse All</a>
            <a href="#explore">Skills</a>
            <a href="#explore">MCP Servers</a>
            <a href="#explore">Agents</a>
            <a href="#prompts">Prompts</a>
          </div>

          <div className="footer-col">
            <h4>Discover</h4>
            <a href="#categories">Categories</a>
            <a href="#prompts">Prompt Library</a>
            <a href="#top">Back to Top</a>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <a href="#top">Overview</a>
            <a href="#explore">How It Works</a>
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
