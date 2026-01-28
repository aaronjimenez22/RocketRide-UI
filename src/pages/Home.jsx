export default function Home() {
  return (
    <div className="rr-page rr-container rr-stack">
      <section className="rr-surface rr-stack rr-hero">
        <p className="rr-label">Welcome</p>
        <h1 className="rr-title">RocketRide Projects</h1>
        <p className="rr-subtitle">
          Build AI data pipelines with a calm, focused canvas and modular steps.
        </p>
        <div className="rr-row">
          <button className="rr-button rr-button--primary">
            Create Project
          </button>
          <button className="rr-button rr-button--ghost">
            View Documentation
          </button>
        </div>
      </section>

      <section className="rr-row">
        <article className="rr-card" style={{ flex: 1, minWidth: 220 }}>
          <p className="rr-card-title">Quick Start</p>
          <p className="rr-body">
            Spin up a new pipeline with starter nodes and sample data.
          </p>
        </article>
        <article className="rr-card" style={{ flex: 1, minWidth: 220 }}>
          <p className="rr-card-title">Recent Runs</p>
          <p className="rr-body">
            Track performance and iterate on your latest workflows.
          </p>
        </article>
        <article className="rr-card" style={{ flex: 1, minWidth: 220 }}>
          <p className="rr-card-title">Templates</p>
          <p className="rr-body">
            Use curated templates to accelerate setup.
          </p>
        </article>
      </section>
    </div>
  );
}
