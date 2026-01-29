export default function DesignSystem() {
  return (
    <div className="rr-page rr-container rr-stack rr-catalog">
      <section className="rr-surface rr-stack rr-catalog__hero">
        <p className="rr-label">Design System</p>
        <h1 className="rr-title">RocketRide UI Catalog</h1>
        <p className="rr-subtitle">
          A modular, production-aligned UI kit for AI workflow experiences.
          Use these foundations, components, and patterns as a reusable contract.
        </p>
        <div className="rr-row">
          <button className="rr-button rr-button--primary">Open Builder</button>
          <button className="rr-button rr-button--ghost">View Guidelines</button>
        </div>
      </section>

      <nav className="rr-catalog__nav">
        <a className="rr-catalog__nav-item" href="#foundations">
          Foundations
        </a>
        <a className="rr-catalog__nav-item" href="#components">
          Components
        </a>
        <a className="rr-catalog__nav-item" href="#patterns">
          Patterns
        </a>
        <a className="rr-catalog__nav-item" href="#usage">
          Usage
        </a>
      </nav>

      <section id="foundations" className="rr-stack rr-catalog__section">
        <div className="rr-catalog__section-head">
          <h2 className="rr-subtitle">Foundations</h2>
          <span className="rr-pill">Tokens</span>
        </div>
        <div className="rr-catalog__grid rr-catalog__grid--three">
          <div className="rr-swatch">
            <div
              className="rr-swatch__chip"
              style={{ background: "var(--color-bg-primary)" }}
            />
            <div className="rr-swatch__label">Background / Primary</div>
          </div>
          <div className="rr-swatch">
            <div
              className="rr-swatch__chip"
              style={{ background: "var(--color-bg-secondary)" }}
            />
            <div className="rr-swatch__label">Background / Secondary</div>
          </div>
          <div className="rr-swatch">
            <div
              className="rr-swatch__chip"
              style={{ background: "var(--gradient-accent)" }}
            />
            <div className="rr-swatch__label">Accent / Gradient</div>
          </div>
        </div>

        <div className="rr-catalog__grid rr-catalog__grid--three">
          <div className="rr-type-card">
            <div className="rr-type-meta">Title</div>
            <p className="rr-title">Momentum Forward</p>
          </div>
          <div className="rr-type-card">
            <div className="rr-type-meta">Subtitle</div>
            <p className="rr-subtitle">Readable, steady hierarchy</p>
          </div>
          <div className="rr-type-card">
            <div className="rr-type-meta">Body</div>
            <p className="rr-body">Warm, legible body text.</p>
            <p className="rr-caption">Muted captions for secondary cues.</p>
          </div>
        </div>

        <div className="rr-space-scale">
          {[
            { token: "space-2", value: "8px" },
            { token: "space-3", value: "12px" },
            { token: "space-4", value: "16px" },
            { token: "space-6", value: "24px" },
            { token: "space-8", value: "40px" },
          ].map((item) => (
            <div key={item.token} className="rr-space-token">
              <span>{item.token}</span>
              <div
                className="rr-space-bar"
                style={{ width: item.value }}
              />
            </div>
          ))}
        </div>
      </section>

      <section id="components" className="rr-stack rr-catalog__section">
        <div className="rr-catalog__section-head">
          <h2 className="rr-subtitle">Components</h2>
          <span className="rr-pill">Core</span>
        </div>
        <div className="rr-component-stack">
          <div className="rr-component-row">
            <button className="rr-button rr-button--primary">
              Primary Action
            </button>
            <button className="rr-button rr-button--ghost">Secondary</button>
            <button className="rr-icon-button">
              <span className="rr-icon__initials">RR</span>
            </button>
          </div>
          <div className="rr-component-row">
            <input className="rr-input" placeholder="Search pipeline" />
            <div className="rr-select-wrapper" style={{ minWidth: 220 }}>
              <select className="rr-select">
                <option>Adaptive (recommended)</option>
                <option>Fixed 1k rows</option>
              </select>
            </div>
          </div>
          <div className="rr-component-row">
            <label className="rr-checkbox">
              <input type="checkbox" defaultChecked />
              Schema checks
            </label>
            <label className="rr-toggle">
              <input type="checkbox" defaultChecked />
              Enabled
            </label>
            <div className="rr-tabs">
              <span className="rr-tab is-active">Overview</span>
              <span className="rr-tab">Runs</span>
              <span className="rr-tab">Logs</span>
            </div>
          </div>
        </div>
      </section>

      <section id="patterns" className="rr-stack rr-catalog__section">
        <div className="rr-catalog__section-head">
          <h2 className="rr-subtitle">Patterns</h2>
          <span className="rr-pill">Reusable</span>
        </div>
        <div className="rr-catalog__grid rr-catalog__grid--two">
          <article className="rr-card">
            <p className="rr-card-title">Summary Card</p>
            <p className="rr-body">
              Use for short, high-signal summaries with a clear action.
            </p>
            <div className="rr-divider"></div>
            <button className="rr-button rr-button--ghost">View Detail</button>
          </article>
          <article className="rr-config-card">
            <div className="rr-config-card__header">
              <div>
                <p className="rr-card-title">Data Source</p>
                <p className="rr-card-meta">Define inputs and schema rules.</p>
              </div>
              <button className="rr-button rr-button--ghost">Edit</button>
            </div>
            <div className="rr-divider"></div>
            <div className="rr-config-card__content">
              <div className="rr-config-row">
                <div className="rr-config-row__label">
                  <p className="rr-config-row__title">Dataset</p>
                  <p className="rr-helper">Choose ingestion source.</p>
                </div>
                <div className="rr-select-wrapper">
                  <select className="rr-select">
                    <option>Customer Events</option>
                    <option>Product Inventory</option>
                  </select>
                </div>
              </div>
              <div className="rr-config-row">
                <div className="rr-config-row__label">
                  <p className="rr-config-row__title">Validation</p>
                  <p className="rr-helper">Guardrails before running.</p>
                </div>
                <label className="rr-checkbox">
                  <input type="checkbox" defaultChecked />
                  Schema checks
                </label>
              </div>
            </div>
          </article>
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
            </tbody>
          </table>
        </div>

        <div className="rr-catalog__grid rr-catalog__grid--two">
          <div className="rr-empty">
            <p className="rr-empty-title">No scheduled runs yet</p>
            <p className="rr-body">
              Create a schedule to automate your pipeline.
            </p>
            <div className="rr-row" style={{ justifyContent: "center" }}>
              <button className="rr-button rr-button--primary">
                Create Schedule
              </button>
            </div>
          </div>
          <div className="rr-drawer">
            <p className="rr-card-title">Inspector Panel</p>
            <p className="rr-body">
              Inspect logs, node metadata, and outputs without leaving the flow.
            </p>
            <button className="rr-button rr-button--ghost">Open Logs</button>
          </div>
        </div>
      </section>

      <section id="usage" className="rr-stack rr-catalog__section">
        <div className="rr-catalog__section-head">
          <h2 className="rr-subtitle">Usage</h2>
          <span className="rr-pill">Guidelines</span>
        </div>
        <p className="rr-guideline">
          Build new UI by composing tokens + components. If a new pattern emerges
          from production, extract it into the system first, then reuse it
          across pages.
        </p>
        <pre className="rr-code">
          <code>{`<!-- Buttons -->\n<button class=\"rr-button rr-button--primary\">Run pipeline</button>\n<button class=\"rr-button rr-button--ghost\">View logs</button>\n\n<!-- Inputs -->\n<input class=\"rr-input\" placeholder=\"Search projects\" />`}</code>
        </pre>
      </section>
    </div>
  );
}
