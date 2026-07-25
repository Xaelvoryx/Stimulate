import type { CatalogDataset } from "@/types";
import Link from "next/link";

export function TopBar({ dataset }: { dataset?: CatalogDataset } = {}) {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="topbar-brand">
          <span className="dot-live" />
          Stimulate
        </Link>
        
        <nav className="topbar-nav" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, padding: "0.5rem 0.75rem", border: "1px solid transparent" }}>Home</Link>
          <Link href="/explore" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "0.9rem", padding: "0.5rem 0.75rem", border: "1px solid transparent" }}>Catalog</Link>
          <Link href="/prompt-vault" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "0.9rem", padding: "0.5rem 0.75rem", border: "1px solid transparent" }}>Prompt Vault</Link>
          <Link href="/publishers" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "0.9rem", padding: "0.5rem 0.75rem", border: "1px solid transparent" }}>Publishers</Link>
        </nav>

        <div className="topbar-meta">
          {dataset?.totals && (
            <>
              <span><b>{dataset.totals.skills.toLocaleString()}</b> SKILLS</span>
              <span><b>{dataset.totals.mcps.toLocaleString()}</b> MCP SERVERS</span>
              <span><b>{dataset.totals.agents.toLocaleString()}</b> AGENTS</span>
            </>
          )}
        </div>
        
        <Link className="topbar-search" href="/explore">
          Search catalog <kbd>/</kbd>
        </Link>
      </div>
    </div>
  );
}
