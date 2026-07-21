import type { CatalogDataset } from "@/types";

export function PublisherStrip({ dataset }: { dataset: CatalogDataset }) {
  const publishers = dataset.publishers.slice(0, 28);
  if (publishers.length === 0) return null;

  return (
    <section className="section publisher-strip" id="publishers">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Straight From The Source</p>
          <h2>Skills by dev teams of</h2>
          <p>
            Curated, first-party skills published by the teams behind the tools
            you already use — {dataset.publishers.length.toLocaleString()} publishers in total.
          </p>
        </div>

        <div className="pub-chips">
          {publishers.map((publisher) => (
            <a className="pub-chip" href="#explore" key={publisher.name}>
              <span className="pub-name">{publisher.name}</span>
              <span className="pub-count">{publisher.count.toLocaleString()}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
