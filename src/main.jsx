import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "reactflow/dist/style.css";
import "./design-system/index.css";
import "./app.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
