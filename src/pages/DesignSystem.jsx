export default function DesignSystem() {
  return (
    <div className="rr-page rr-container rr-stack">
      <section className="rr-surface rr-stack rr-hero">
        <p className="rr-label">Design System</p>
        <h1 className="rr-title">RocketRide AI Pipeline Builder</h1>
        <p className="rr-subtitle">
          A calm, cinematic foundation for building AI workflows with speed and
          clarity.
        </p>
        <div className="rr-row">
          <button className="rr-button rr-button--primary">Launch Builder</button>
          <button className="rr-button rr-button--ghost">
            Explore Components
          </button>
        </div>
      </section>

      <section className="rr-stack">
        <div className="rr-row" style={{ justifyContent: "space-between" }}>
          <h2 className="rr-subtitle">Core Components</h2>
          <span className="rr-pill">Lightweight</span>
        </div>
        <div className="rr-row">
          <article className="rr-card" style={{ flex: 1, minWidth: 240 }}>
            <p className="rr-card-title">Nodes + Steps</p>
            <p className="rr-body">
              Build pipelines with predictable spacing, clear labels, and a
              consistent color cadence.
            </p>
            <div className="rr-divider"></div>
            <div className="rr-row">
              <button className="rr-button rr-button--primary">Add Step</button>
              <button className="rr-button rr-button--ghost">Details</button>
            </div>
          </article>

          <article className="rr-card" style={{ flex: 1, minWidth: 240 }}>
            <p className="rr-card-title">Run State</p>
            <p className="rr-body">
              Text hierarchy stays calm while accent states guide attention to
              critical actions.
            </p>
            <label className="rr-label" style={{ marginTop: "var(--space-3)" }}>
              Pipeline Name
            </label>
            <input className="rr-input" placeholder="RocketRide flow" />
          </article>
        </div>
      </section>

      <section className="rr-stack">
        <div className="rr-row" style={{ justifyContent: "space-between" }}>
          <h2 className="rr-subtitle">Configuration Cards</h2>
          <span className="rr-pill">Data Ready</span>
        </div>
        <article className="rr-config-card">
          <div className="rr-config-card__header">
            <div>
              <p className="rr-card-title">Data Source</p>
              <p className="rr-card-meta">Define inputs and schema rules.</p>
            </div>
            <button className="rr-button rr-button--ghost">Edit Config</button>
          </div>
          <div className="rr-divider"></div>
          <div className="rr-config-card__content">
            <div className="rr-config-row">
              <div className="rr-config-row__label">
                <p className="rr-config-row__title">Dataset</p>
                <p className="rr-helper">Choose the ingestion source.</p>
              </div>
              <div className="rr-select-wrapper">
                <select className="rr-select">
                  <option>Customer Events</option>
                  <option>Product Inventory</option>
                  <option>Support Tickets</option>
                </select>
              </div>
            </div>
            <div className="rr-config-row">
              <div className="rr-config-row__label">
                <p className="rr-config-row__title">Sampling Mode</p>
                <p className="rr-helper">Keep datasets predictable.</p>
              </div>
              <div className="rr-select-wrapper">
                <select className="rr-select">
                  <option>Adaptive (recommended)</option>
                  <option>Fixed 1k rows</option>
                  <option>Full dataset</option>
                </select>
              </div>
            </div>
            <div className="rr-config-row">
              <div className="rr-config-row__label">
                <p className="rr-config-row__title">Validation</p>
                <p className="rr-helper">Guardrails before running.</p>
              </div>
              <div className="rr-row" style={{ justifyContent: "flex-end" }}>
                <label className="rr-checkbox">
                  <input type="checkbox" defaultChecked />
                  Schema checks
                </label>
                <label className="rr-checkbox">
                  <input type="checkbox" />
                  Auto retry
                </label>
              </div>
            </div>
            <div className="rr-config-row">
              <div className="rr-config-row__label">
                <p className="rr-config-row__title">Auto Sync</p>
                <p className="rr-helper">Sync every 30 minutes.</p>
              </div>
              <label className="rr-toggle">
                <input type="checkbox" defaultChecked />
                Enabled
              </label>
            </div>
          </div>
        </article>
      </section>

      <section className="rr-stack">
        <h2 className="rr-subtitle">Typography</h2>
        <p className="rr-title">Headlines emphasize momentum</p>
        <p className="rr-body">
          Body copy stays warm and readable, with muted captions for secondary
          details.
        </p>
        <p className="rr-caption">Caption text stays quiet and supportive.</p>
      </section>

      <section className="rr-stack">
        <h2 className="rr-subtitle">Additional Components</h2>
        <div className="rr-row" style={{ justifyContent: "space-between" }}>
          <div className="rr-tabs">
            <span className="rr-tab is-active">Overview</span>
            <span className="rr-tab">Nodes</span>
            <span className="rr-tab">Runs</span>
          </div>
          <div className="rr-row">
            <button className="rr-button rr-button--ghost">Filter</button>
            <button className="rr-button rr-button--primary">New Pipeline</button>
          </div>
        </div>

        <div className="rr-row">
          <div className="rr-node-card">
            <span className="rr-node-tag">Extractor</span>
            <p className="rr-card-title">Web Scraper</p>
            <p className="rr-helper">Pulls structured data from URLs.</p>
          </div>
          <div className="rr-node-card">
            <span className="rr-node-tag">Transform</span>
            <p className="rr-card-title">Clean + Normalize</p>
            <p className="rr-helper">Prepare data for embedding.</p>
          </div>
          <div className="rr-node-card">
            <span className="rr-node-tag">Model</span>
            <p className="rr-card-title">Summarize</p>
            <p className="rr-helper">Generate pipeline outputs.</p>
          </div>
        </div>

        <div className="rr-surface">
          <table className="rr-table">
            <thead>
              <tr>
                <th>Pipeline</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Last Run</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Launch Readiness</td>
                <td>Luis</td>
                <td>Active</td>
                <td>2 min ago</td>
              </tr>
              <tr>
                <td>Customer Signals</td>
                <td>Mira</td>
                <td>Paused</td>
                <td>1 hr ago</td>
              </tr>
              <tr>
                <td>Support Triage</td>
                <td>Nova</td>
                <td>Draft</td>
                <td>Yesterday</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rr-empty">
          <p className="rr-empty-title">No scheduled runs yet</p>
          <p className="rr-body">Create a schedule to automate your pipeline.</p>
          <div className="rr-row" style={{ justifyContent: "center" }}>
            <button className="rr-button rr-button--primary">
              Create Schedule
            </button>
          </div>
        </div>

        <div className="rr-row">
          <div className="rr-modal-backdrop" style={{ flex: 1, minWidth: 260 }}>
            <div className="rr-modal">
              <p className="rr-card-title">Run Configuration</p>
              <p className="rr-body">
                Confirm the environment before executing.
              </p>
              <div className="rr-row">
                <button className="rr-button rr-button--ghost">Cancel</button>
                <button className="rr-button rr-button--primary">Run Now</button>
              </div>
            </div>
          </div>
          <div className="rr-drawer" style={{ flex: 1, minWidth: 260 }}>
            <p className="rr-card-title">Inspector Panel</p>
            <p className="rr-body">
              Inspect logs, node metadata, and outputs without leaving the flow.
            </p>
            <button className="rr-button rr-button--ghost">Open Logs</button>
          </div>
        </div>
      </section>
    </div>
  );
}
