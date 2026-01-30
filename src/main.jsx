import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ProjectsProvider } from "./state/projectsStore.jsx";
import "reactflow/dist/style.css";
import "./design-system/index.css";
import "./app.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ProjectsProvider>
      <App />
    </ProjectsProvider>
  </React.StrictMode>
);
