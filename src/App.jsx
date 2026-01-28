import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import DesignSystem from "./pages/DesignSystem.jsx";
import ProjectsCanvas from "./pages/ProjectsCanvas.jsx";
import ProjectsList from "./pages/ProjectsList.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";

export default function App() {
  const [activeView, setActiveView] = useState("projects");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("rr-theme") ?? "tungsten"
  );

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
      case "home":
        return <Home />;
      case "projects":
        return (
          <ProjectsList onOpenProject={() => setActiveView("project-canvas")} />
        );
      case "project-canvas":
        return <ProjectsCanvas flowOptions={flowOptions} />;
      case "design-system":
        return <DesignSystem />;
      case "api-keys":
        return <PlaceholderPage title="API Keys" />;
      case "feedback":
        return <PlaceholderPage title="Feedback" />;
      case "changelog":
        return <PlaceholderPage title="Changelog" />;
      default:
        return <PlaceholderPage title="Coming Soon" />;
    }
  }, [activeView, flowOptions]);

  const isCanvas = activeView === "project-canvas";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rr-theme", theme);
  }, [theme]);

  return (
    <div className="rr-app">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main className={`rr-main ${isCanvas ? "is-canvas" : ""}`}>
        {mainContent}
      </main>
    </div>
  );
}
