import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import DesignSystem from "./pages/DesignSystem.jsx";
import ThemeBuilder from "./pages/ThemeBuilder.jsx";
import ProjectsCanvas from "./pages/ProjectsCanvas.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import { useProjects } from "./state/projectsStore.jsx";
import { baseThemeOptions } from "./data/themeOptions.js";
import customThemesSeed from "./data/customThemes.json";
import {
  THEME_TOKEN_KEYS,
  CUSTOM_THEME_STORAGE_KEY,
  buildThemeSwatch,
} from "./utils/themeBuilder.js";

export default function App() {
  const [activeView, setActiveView] = useState("project-canvas");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("rr-theme") ?? "tungsten"
  );
  const [customThemes, setCustomThemes] = useState(() => {
    const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    let parsed = [];
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (error) {
        parsed = [];
      }
    }
    const merged = [...customThemesSeed, ...parsed];
    const deduped = [];
    const ids = new Set();
    merged.forEach((item) => {
      if (!item?.id || ids.has(item.id)) return;
      ids.add(item.id);
      deduped.push(item);
    });
    return deduped;
  });
  const { activeProjectId, setActiveProjectId } = useProjects();

  const themeOptions = useMemo(() => {
    const customOptions = customThemes.map((custom) => ({
      id: custom.id,
      label: custom.label,
      meta: custom.meta ?? "Custom theme",
      swatch: custom.swatch ?? buildThemeSwatch(custom.tokens ?? {}),
    }));
    return [...baseThemeOptions, ...customOptions];
  }, [customThemes]);

  const flowOptions = useMemo(
    () => ({
      fitView: true,
      minZoom: 0.5,
      maxZoom: 1.6,
    }),
    []
  );

  const mainContent = useMemo(() => {
    switch (activeView) {
      case "project-canvas":
        return (
          <ProjectsCanvas
            flowOptions={flowOptions}
            projectId={activeProjectId}
          />
        );
      case "design-system":
        return <DesignSystem />;
      case "theme-builder":
        return (
          <ThemeBuilder
            existingThemeIds={themeOptions.map((option) => option.id)}
            onSaveTheme={(newTheme) => {
              setCustomThemes((prev) => {
                const next = prev.filter((item) => item.id !== newTheme.id);
                next.push(newTheme);
                localStorage.setItem(
                  CUSTOM_THEME_STORAGE_KEY,
                  JSON.stringify(next)
                );
                return next;
              });
              setTheme(newTheme.id);
            }}
            onNavigate={setActiveView}
          />
        );
      case "api-keys":
        return <PlaceholderPage title="API Keys" />;
      case "feedback":
        return <PlaceholderPage title="Feedback" />;
      case "changelog":
        return <PlaceholderPage title="Changelog" />;
      default:
        return (
          <ProjectsCanvas
            flowOptions={flowOptions}
            projectId={activeProjectId}
          />
        );
    }
  }, [activeView, flowOptions, activeProjectId]);

  const isCanvas = activeView === "project-canvas";

  useEffect(() => {
    const customTheme = customThemes.find((item) => item.id === theme);
    if (customTheme?.tokens) {
      document.documentElement.dataset.theme = "custom";
      Object.entries(customTheme.tokens).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    } else {
      document.documentElement.dataset.theme = theme;
      THEME_TOKEN_KEYS.forEach((key) => {
        document.documentElement.style.removeProperty(key);
      });
    }
    localStorage.setItem("rr-theme", theme);
  }, [theme, customThemes]);

  return (
    <div className="rr-app">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        theme={theme}
        onThemeChange={setTheme}
        themeOptions={themeOptions}
        onCreateTheme={() => setActiveView("theme-builder")}
      />
      <main className={`rr-main ${isCanvas ? "is-canvas" : ""}`}>
        {mainContent}
      </main>
    </div>
  );
}
