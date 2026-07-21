import type { CatalogDataset, CatalogItem } from "@/types";

const TYPE_LABEL: Record<string, string> = {
  skill: "Skill",
  mcp: "MCP Server",
  agent: "Agent",
  repository: "Repository",
  other: "Entry",
};

function isCleanTitle(item: CatalogItem): boolean {
  const n = item.name;
  return (
    n.length >= 4 &&
    n.length <= 60 &&
    /[a-z]/i.test(n) &&
    !n.includes("http") &&
    (item.description ?? "").length >= 20
  );
}

function pickFeatured(items: CatalogItem[]): CatalogItem[] {
  const wanted = ["skill", "mcp", "agent"];
  const picked: CatalogItem[] = [];
  const seenNames = new Set<string>();

  for (const type of wanted) {
    const pool = items.filter(
      (i) => i.type === type && isCleanTitle(i) && i.url.includes("github.com"),
    );
    for (const item of pool) {
      const key = item.name.toLowerCase();
      if (seenNames.has(key)) continue;
      seenNames.add(key);
      picked.push(item);
      if (picked.filter((p) => p.type === type).length >= 3) break;
    }
  }

  return picked.slice(0, 9);
}

export function FeaturedSkills({ dataset }: { dataset: CatalogDataset }) {
  const featured = pickFeatured(dataset.items);
  if (featured.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Editor&apos;s Picks</p>
          <h2>Featured in the Catalog</h2>
          <p>
            A handpicked look at standout skills, MCP servers, and agents from the
            {" "}{dataset.totals.all.toLocaleString()}-entry index.
          </p>
        </div>

        <div className="card-grid">
          {featured.map((item) => (
            <article className="card" key={item.id}>
              <div className="card-top">
                <span className="badge badge-featured">Featured</span>
                <span className="badge badge-type">{TYPE_LABEL[item.type] ?? "Entry"}</span>
              </div>
              <h3>{item.name}</h3>
              <p className="card-desc">{item.description || "Open to explore this entry."}</p>
              <div className="card-foot">
                <span className="tag">{item.section || "General"}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Open →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
