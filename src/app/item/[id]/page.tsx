import { TopBar } from "@/components/layout/TopBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getCleanedDataset } from "@/lib/data/cleanedData";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageData = getCleanedDataset();

  const item = pageData.items.find((x) => x.id === id);

  if (!item) {
    return notFound();
  }

  // Find other items from the same publisher to show as recommendations
  const relatedItems = pageData.items
    .filter((x) => x.publisher === item.publisher && x.id !== item.id)
    .slice(0, 3);

  return (
    <div className="page-wrap">
      <TopBar dataset={pageData} />
      
      <main style={{ padding: "4rem 0", minHeight: "80vh" }}>
        <div className="container">
          <div style={{ marginBottom: "2rem" }}>
            <Link 
              href="/explore" 
              style={{ 
                color: "#10b981", 
                textDecoration: "none", 
                fontWeight: 600, 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem" 
              }}
            >
              ← Back to Catalog
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "3rem", alignItems: "start" }}>
            
            {/* Left Content Column */}
            <div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <span className="badge badge-type" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
                  {item.type.toUpperCase()}
                </span>
                {item.publisher ? (
                  <span className="badge badge-pub" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
                    {item.publisher}
                  </span>
                ) : null}
              </div>

              <h1 style={{ fontSize: "3rem", margin: "0 0 1.5rem 0", color: "#fff", fontWeight: 700, lineHeight: 1.1 }}>
                {item.name}
              </h1>

              <div 
                className="card" 
                style={{ 
                  padding: "2.5rem", 
                  backgroundColor: "#0d0d0e", 
                  border: "1px solid #1f1f22", 
                  borderRadius: "8px",
                  lineHeight: "1.7",
                  fontSize: "1.1rem",
                  color: "#e4e4e7"
                }}
              >
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {item.originalDescription || item.description}
                </p>
              </div>

              <div style={{ marginTop: "3rem" }}>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
                >
                  Visit Resource Source Website ↗
                </a>
              </div>
            </div>

            {/* Right Meta Column */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div 
                className="card" 
                style={{ 
                  padding: "2rem", 
                  backgroundColor: "#09090a", 
                  border: "1px solid #18181b", 
                  borderRadius: "8px" 
                }}
              >
                <h4 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", color: "#fff", borderBottom: "1px solid #18181b", paddingBottom: "0.75rem" }}>
                  Resource Details
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <span style={{ display: "block", color: "#71717a", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      Category / Section
                    </span>
                    <span style={{ color: "#e4e4e7", fontWeight: 500 }}>
                      {item.section || "General"}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: "block", color: "#71717a", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      Publisher Org
                    </span>
                    <span style={{ color: "#e4e4e7", fontWeight: 500 }}>
                      {item.publisher || "Independent Contributor"}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: "block", color: "#71717a", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      Identifier ID
                    </span>
                    <code style={{ color: "#10b981", fontSize: "0.9rem", backgroundColor: "#0c1a16", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                      {item.id}
                    </code>
                  </div>
                </div>
              </div>

              {/* Related Items List */}
              {relatedItems.length > 0 ? (
                <div>
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#fff" }}>
                    More by {item.publisher}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {relatedItems.map((rel) => (
                      <Link 
                        key={rel.id} 
                        href={`/item/${rel.id}`} 
                        className="card" 
                        style={{ 
                          padding: "1.25rem", 
                          display: "block", 
                          textDecoration: "none", 
                          backgroundColor: "#0d0d0e",
                          border: "1px solid #1f1f22"
                        }}
                      >
                        <h5 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontSize: "0.95rem" }}>{rel.name}</h5>
                        <span className="badge badge-type" style={{ fontSize: "0.7rem" }}>{rel.type.toUpperCase()}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
