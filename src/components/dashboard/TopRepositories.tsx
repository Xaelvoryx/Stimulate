import type { RepositoryRank } from "@/types";

export function TopRepositories({ repositories }: { repositories: RepositoryRank[] }) {
  const top = repositories.slice(0, 9);
  if (top.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Standout Projects</p>
          <h2>Featured Repositories</h2>
          <p>A handpicked selection of notable projects referenced across the catalog.</p>
        </div>

        <div className="card-grid">
          {top.map((repo) => (
            <article className="card" key={repo.url}>
              <div className="card-top">
                <span className="badge badge-type">Repository</span>
                <span className="rank-tag">#{repo.rank}</span>
              </div>
              <h3>{repo.name}</h3>
              <p className="card-desc">{repo.reason}</p>
              <div className="card-foot">
                <span className="tag">github</span>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
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
