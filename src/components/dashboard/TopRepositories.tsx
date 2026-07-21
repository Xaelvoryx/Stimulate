import type { RepositoryRank } from "@/types";

export function TopRepositories({ repositories }: { repositories: RepositoryRank[] }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Featured Repositories</h2>
        <p>A handpicked selection of standout projects from the catalog.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Repository</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.url}>
                <td>{repo.rank}</td>
                <td>{repo.name}</td>
                <td>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
