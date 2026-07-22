import { TopBar } from "@/components/layout/TopBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getCleanedDataset } from "@/lib/data/cleanedData";
import Link from "next/link";

export default function PublishersPage() {
  const pageData = getCleanedDataset();

  return (
    <div className="page-wrap">
      <TopBar dataset={pageData} />
      <main style={{ padding: "3rem 0" }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: "3rem" }}>
            <p className="kicker">Ecosystem Creators</p>
            <h2>Publishers &amp; Contributor Organizations</h2>
            <p>
              Browse stand-out organizations and individuals contributing skills, 
              MCP tool servers, and agents to the AI ecosystem.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {pageData.publishers.map((pub) => (
              <div 
                key={pub.name} 
                className="card" 
                style={{ 
                  padding: "2rem", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  minHeight: "180px"
                }}
              >
                <div>
                  <span className="badge badge-pub" style={{ marginBottom: "1rem" }}>Publisher</span>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>{pub.name}</h3>
                  <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.9rem" }}>
                    Contributed {pub.count} cataloged tools and resources.
                  </p>
                </div>
                
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <Link 
                    href={`/explore?publisher=${encodeURIComponent(pub.name)}`} 
                    style={{ 
                      color: "#10b981", 
                      textDecoration: "none", 
                      fontSize: "0.9rem", 
                      fontWeight: 600 
                    }}
                  >
                    View Contributions →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
