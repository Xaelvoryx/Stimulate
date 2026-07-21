const STEPS = [
  {
    num: "01",
    title: "Discover",
    body: "Browse the curated directory across skills, MCP servers, agents, and repositories. Filter by type, category, and keyword.",
    code: "search \"code review\"",
  },
  {
    num: "02",
    title: "Compare",
    body: "Scan clean cards with descriptions and categories. Open any entry to view its source repository or documentation.",
    code: "open author/skill-name",
  },
  {
    num: "03",
    title: "Supercharge",
    body: "Drop the skill or MCP server into your agent and instantly gain new capabilities. Works across Claude Code, Codex, Cursor, and more.",
    code: "works everywhere",
  },
];

export function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Three Steps</p>
          <h2>How It Works</h2>
          <p>From discovery to deployment in under a minute.</p>
        </div>

        <div className="steps">
          {STEPS.map((step) => (
            <article className="step" key={step.num}>
              <span className="num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <code>{step.code}</code>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
