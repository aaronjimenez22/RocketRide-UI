import { useEffect, useMemo, useRef, useState } from "react";
import {
  THEME_COLOR_TOKENS,
  THEME_TOKEN_KEYS,
  buildThemeTokens,
  buildThemeSwatch,
  getComputedTokenDefaults,
  normalizeThemeId,
} from "../utils/themeBuilder.js";

export default function ThemeBuilder({
  existingThemeIds = [],
  onSaveTheme,
  onNavigate,
}) {
  const [themeName, setThemeName] = useState("");
  const [themeMeta, setThemeMeta] = useState("Custom theme");
  const [tokens, setTokens] = useState(() => getComputedTokenDefaults());
  const previousStyles = useRef({});
  const shouldRestore = useRef(true);

  const derivedTokens = useMemo(() => buildThemeTokens(tokens), [tokens]);

  useEffect(() => {
    THEME_TOKEN_KEYS.forEach((key) => {
      previousStyles.current[key] =
        document.documentElement.style.getPropertyValue(key);
    });
    return () => {
      if (!shouldRestore.current) return;
      THEME_TOKEN_KEYS.forEach((key) => {
        const value = previousStyles.current[key];
        if (value) {
          document.documentElement.style.setProperty(key, value);
        } else {
          document.documentElement.style.removeProperty(key);
        }
      });
    };
  }, []);

  useEffect(() => {
    Object.entries(derivedTokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [derivedTokens]);

  const handleTokenChange = (key, value) => {
    setTokens((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const name = themeName.trim();
    if (!name) return;
    const id = normalizeThemeId(name, existingThemeIds);
    const themeTokens = buildThemeTokens(tokens);
    const newTheme = {
      id,
      label: name,
      meta: themeMeta.trim() || "Custom theme",
      tokens: themeTokens,
      swatch: buildThemeSwatch(themeTokens),
    };
    shouldRestore.current = false;
    onSaveTheme?.(newTheme);
  };

  return (
    <div className="rr-page rr-container rr-theme-builder">
      <section className="rr-theme-builder__panel rr-stack">
        <div className="rr-theme-builder__header">
          <div>
            <p className="rr-label">Theme Builder</p>
            <h1 className="rr-title">Create a custom theme</h1>
            <p className="rr-subtitle">
              Tune core color tokens and preview the system in real time.
            </p>
          </div>
          <button
            type="button"
            className="rr-button rr-button--ghost"
            onClick={() => onNavigate?.("projects")}
          >
            Back to Projects
          </button>
        </div>

        <div className="rr-theme-builder__form rr-stack">
          <label className="rr-input-group">
            <span className="rr-input-label">Theme name</span>
            <input
              className="rr-input"
              value={themeName}
              onChange={(event) => setThemeName(event.target.value)}
              placeholder="Nebula, Horizon, Atlas..."
            />
          </label>

          <label className="rr-input-group">
            <span className="rr-input-label">Description</span>
            <input
              className="rr-input"
              value={themeMeta}
              onChange={(event) => setThemeMeta(event.target.value)}
              placeholder="Short theme description"
            />
          </label>

          <div className="rr-theme-builder__grid">
            {THEME_COLOR_TOKENS.map((token) => (
              <label key={token.key} className="rr-theme-builder__token">
                <span className="rr-theme-builder__token-label">
                  {token.label}
                </span>
                <span className="rr-theme-builder__token-control">
                  <input
                    type="color"
                    value={tokens[token.key]}
                    onChange={(event) =>
                      handleTokenChange(token.key, event.target.value)
                    }
                  />
                  <input
                    className="rr-input"
                    value={tokens[token.key]}
                    onChange={(event) =>
                      handleTokenChange(token.key, event.target.value)
                    }
                  />
                </span>
              </label>
            ))}
          </div>

          <div className="rr-row rr-theme-builder__actions">
            <button
              type="button"
              className="rr-button rr-button--ghost"
              onClick={() => setTokens(getComputedTokenDefaults())}
            >
              Reset to current theme
            </button>
            <button
              type="button"
              className="rr-button rr-button--primary"
              onClick={handleSave}
              disabled={!themeName.trim()}
            >
              Save theme
            </button>
          </div>
        </div>
      </section>

      <section className="rr-theme-builder__preview rr-stack">
        <div className="rr-theme-builder__preview-header">
          <h2 className="rr-subtitle">Live preview</h2>
          <div className="rr-pill">Components</div>
        </div>

        <div className="rr-theme-builder__preview-grid">
          <article className="rr-card">
            <p className="rr-card-title">Signal overview</p>
            <p className="rr-body">
              Toggle between runs, drill into metadata, and track changes.
            </p>
            <div className="rr-divider"></div>
            <div className="rr-row">
              <button className="rr-button rr-button--primary">Run</button>
              <button className="rr-button rr-button--ghost">Inspect</button>
            </div>
          </article>

          <article className="rr-config-card">
            <div className="rr-config-card__header">
              <div>
                <p className="rr-card-title">Pipeline settings</p>
                <p className="rr-card-meta">Align inputs before launch.</p>
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
                    <option>Customer events</option>
                    <option>Product inventory</option>
                  </select>
                </div>
              </div>
              <div className="rr-config-row">
                <div className="rr-config-row__label">
                  <p className="rr-config-row__title">Validation</p>
                  <p className="rr-helper">Guardrails before running.</p>
                </div>
                <label className="rr-checkbox">
                  <input type="checkbox" defaultChecked /> Schema checks
                </label>
              </div>
            </div>
          </article>
        </div>

        <div className="rr-theme-builder__preview-surface">
          <div className="rr-component-row">
            <input className="rr-input" placeholder="Search pipelines" />
            <div className="rr-select-wrapper" style={{ minWidth: 200 }}>
              <select className="rr-select">
                <option>Adaptive</option>
                <option>Fixed 1k rows</option>
              </select>
            </div>
          </div>
          <div className="rr-component-row">
            <label className="rr-toggle">
              <input type="checkbox" defaultChecked /> Enabled
            </label>
            <div className="rr-tabs">
              <span className="rr-tab is-active">Overview</span>
              <span className="rr-tab">Runs</span>
              <span className="rr-tab">Logs</span>
            </div>
          </div>
          <table className="rr-table">
            <thead>
              <tr>
                <th>Pipeline</th>
                <th>Status</th>
                <th>Last run</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Launch readiness</td>
                <td>Active</td>
                <td>2 min ago</td>
              </tr>
              <tr>
                <td>Customer signals</td>
                <td>Paused</td>
                <td>1 hr ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
