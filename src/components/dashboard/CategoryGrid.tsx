import type { CatalogDataset, CatalogItem } from "@/types";

interface Category {
  name: string;
  count: number;
  examples: string[];
}

const SKIP = new Set(["general", "links", "other", "misc", "miscellaneous"]);

function buildCategories(items: CatalogItem[]): Category[] {
  const groups = new Map<string, CatalogItem[]>();

  for (const item of items) {
    const section = (item.section || "").trim();
    if (!section || SKIP.has(section.toLowerCase())) continue;
    // Keep readable, mostly-latin section labels for the category tiles.
    if (!/^[\x20-\x7E]+$/.test(section)) continue;
    const list = groups.get(section) ?? [];
    list.push(item);
    groups.set(section, list);
  }

  return [...groups.entries()]
    .map(([name, list]) => ({
      name,
      count: list.length,
      examples: list
        .slice(0, 3)
        .map((i) => i.name)
        .filter((n) => n.length <= 26),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export function CategoryGrid({ dataset }: { dataset: CatalogDataset }) {
  const categories = buildCategories(dataset.items);
  if (categories.length === 0) return null;

  return (
    <section className="section" id="categories">
      <div className="container">
        <div className="section-head">
          <p className="kicker">By Discipline</p>
          <h2>Browse by Category</h2>
          <p>The most active categories across the catalog, from developer tools to security and knowledge.</p>
        </div>

        <div className="cat-grid">
          {categories.map((cat) => (
            <a className="cat-card" href="#explore" key={cat.name}>
              <h3>
                {cat.name}
                <span>{cat.count.toLocaleString()}</span>
              </h3>
              {cat.examples.length > 0 && (
                <div className="examples">
                  {cat.examples.map((ex, i) => (
                    <span key={`${cat.name}-${i}`}>{ex}</span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
