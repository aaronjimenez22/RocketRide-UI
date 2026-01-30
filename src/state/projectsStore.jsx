import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getIconForKey } from "../utils/iconLibrary";

const STORAGE_KEY = "rr-projects-store";

const makeRuns = () => {
  const statuses = ["success", "failure", "warning"];
  return Array.from({ length: 10 }, (_, i) => {
    const rand = Math.random();
    let status = "success";
    if (rand > 0.85) status = "failure";
    else if (rand > 0.7) status = "warning";
    return {
      status,
      timestamp: new Date(Date.now() - (i + 1) * 3600000),
      duration: Math.floor(Math.random() * 300) + 10,
    };
  });
};

const buildNode = (label, index) => {
  const icon = getIconForKey(label);
  return {
    id: `node-${label}-${index}`,
    position: { x: 120 + (index % 3) * 240, y: 120 + Math.floor(index / 3) * 180 },
    type: "rrNode",
    data: {
      title: label,
      iconSrc: icon.url,
      meta: "STEP",
      inputs: index === 0 ? [] : [{ id: "in", label: "In", type: "input" }],
      outputs: [{ id: "out", label: "Out", type: "output" }],
    },
  };
};

const buildProject = (overrides) => ({
  id: overrides.id ?? `project-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: overrides.name ?? "Untitled Project",
  icon: overrides.icon ?? getIconForKey(overrides.name ?? "Project").url,
  iconColor: overrides.iconColor ?? "#ff8a3c",
  nodes: overrides.nodes ?? [],
  edges: overrides.edges ?? [],
  status: overrides.status ?? "Inactive",
  cost: overrides.cost ?? 0,
  dateCreated: overrides.dateCreated ?? new Date(),
  lastModified: overrides.lastModified ?? new Date(),
  description: overrides.description ?? "",
  dataProcessed: overrides.dataProcessed ?? "0 MB",
  filesUploaded: overrides.filesUploaded ?? 0,
  lastRuns: overrides.lastRuns ?? makeRuns(),
});

const seedProjects = () => {
  const seed = [
    {
      id: "1",
      name: "Sample RAG Pipeline",
      nodeLabels: ["Source", "Clean", "Embedding", "LLM"],
      status: "Running",
      cost: 45.32,
      dateCreated: new Date("2024-01-15"),
      lastModified: new Date("2024-03-20"),
      description: "Advanced RAG pipeline for document processing",
      dataProcessed: "2.4 GB",
      filesUploaded: 142,
    },
    {
      id: "2",
      name: "Sample RAG Pipeline",
      nodeLabels: ["Source", "Router", "Embedding"],
      status: "Running",
      cost: 38.15,
      dateCreated: new Date("2024-02-01"),
      lastModified: new Date("2024-03-19"),
      description: "Standard RAG implementation",
      dataProcessed: "1.8 GB",
      filesUploaded: 98,
    },
    {
      id: "3",
      name: "Sample Advanced RAG",
      nodeLabels: [
        "Source",
        "Clean",
        "Router",
        "Embedding",
        "LLM",
        "Store",
        "Output",
      ],
      status: "Running",
      cost: 92.47,
      dateCreated: new Date("2023-12-10"),
      lastModified: new Date("2024-03-21"),
      description: "Multi-modal RAG with email integration",
      dataProcessed: "5.2 GB",
      filesUploaded: 287,
    },
    {
      id: "4",
      name: "Sample Simple Chat",
      nodeLabels: ["Source", "LLM", "Output", "Guardrails", "Memory", "Store"],
      status: "Inactive",
      cost: 12.89,
      dateCreated: new Date("2024-01-20"),
      lastModified: new Date("2024-02-15"),
      description: "Basic chat interface",
      dataProcessed: "450 MB",
      filesUploaded: 23,
    },
    {
      id: "5",
      name: "Sample Classify & Anonymize",
      nodeLabels: [
        "Source",
        "Classifier",
        "Anonymizer",
        "Review",
        "Output",
        "Store",
      ],
      status: "Inactive",
      cost: 8.5,
      dateCreated: new Date("2024-02-10"),
      lastModified: new Date("2024-02-28"),
      description: "Data classification and anonymization",
      dataProcessed: "1.1 GB",
      filesUploaded: 67,
    },
    {
      id: "6",
      name: "Content Summary - Webhook",
      nodeLabels: [
        "Webhook",
        "Clean",
        "Summarize",
        "Store",
        "Output",
        "Notify",
      ],
      status: "Inactive",
      cost: 5.25,
      dateCreated: new Date("2024-03-01"),
      lastModified: new Date("2024-03-10"),
      description: "Webhook-triggered content summarization",
      dataProcessed: "320 MB",
      filesUploaded: 15,
    },
  ];

  return seed.map((project) => {
    const nodes = project.nodeLabels.map(buildNode);
    return buildProject({
      ...project,
      nodes,
      edges: [],
      icon: getIconForKey(project.name).url,
    });
  });
};

const loadProjects = () => {
  if (typeof window === "undefined") return seedProjects();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return seedProjects();
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((project) => ({
      ...project,
      dateCreated: new Date(project.dateCreated),
      lastModified: new Date(project.lastModified),
      lastRuns: (project.lastRuns ?? []).map((run) => ({
        ...run,
        timestamp: new Date(run.timestamp),
      })),
    }));
  } catch {
    return seedProjects();
  }
};

const ProjectsContext = createContext(null);

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState(
    () => projects[0]?.id ?? null
  );

  const persist = useCallback((next) => {
    setProjects(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const updateProject = useCallback(
    (projectId, updates) => {
      persist((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...project, ...updates, lastModified: new Date() }
            : project
        )
      );
    },
    [persist]
  );

  const createProject = useCallback(
    (data) => {
      const project = buildProject({
        ...data,
        id: data.id ?? undefined,
        lastRuns: makeRuns(),
      });
      persist((prev) => [project, ...prev]);
      setActiveProjectId(project.id);
      return project.id;
    },
    [persist]
  );

  const deleteProject = useCallback(
    (projectId) => {
      persist((prev) => prev.filter((project) => project.id !== projectId));
      setActiveProjectId((prev) => {
        if (prev === projectId) {
          return projects.find((project) => project.id !== projectId)?.id ?? null;
        }
        return prev;
      });
    },
    [persist, projects]
  );

  const duplicateProject = useCallback(
    (projectId) => {
      const source = projects.find((project) => project.id === projectId);
      if (!source) return null;
      const clone = buildProject({
        ...source,
        id: undefined,
        name: `${source.name} Copy`,
        dateCreated: new Date(),
        lastModified: new Date(),
      });
      persist((prev) => [clone, ...prev]);
      return clone.id;
    },
    [persist, projects]
  );

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      setActiveProjectId,
      updateProject,
      createProject,
      deleteProject,
      duplicateProject,
    }),
    [
      projects,
      activeProjectId,
      updateProject,
      createProject,
      deleteProject,
      duplicateProject,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used inside ProjectsProvider");
  }
  return ctx;
};
