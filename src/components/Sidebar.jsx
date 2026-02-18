import { useEffect, useMemo, useRef, useState } from "react";
import logoMark from "../assets/rocketridev1.svg";
import { iconUrl, getIconForKey } from "../utils/iconLibrary";
import { useProjects } from "../state/projectsStore.jsx";

const buildTemplateNodes = (labels) =>
  labels.map((label, index) => ({
    id: `template-${label}-${index}`,
    position: { x: 120 + (index % 3) * 220, y: 120 + Math.floor(index / 3) * 160 },
    type: "rrNode",
    data: {
      title: label,
      iconSrc: getIconForKey(label).url,
      meta: "STEP",
      inputs: index === 0 ? [] : [{ id: "in", label: "In", type: "input" }],
      outputs: [{ id: "out", label: "Out", type: "output" }],
    },
  }));

const templateCategories = [
  "Recommended",
  "Chatbots",
  "Content & Media",
  "Data Analysis",
  "Knowledge Retrieval",
];

const templateLibrary = [
  {
    id: "legal-chatbot",
    title: "Legal Chatbot",
    category: "Recommended",
    description:
      "Capture, summarize, and answer legal questions with a controlled RAG stack.",
    nodes: ["text", "folder", "link", "openai", "share", "database"],
  },
  {
    id: "pii-identifier",
    title: "PII Identifier",
    category: "Recommended",
    description:
      "Scan inbound docs and highlight sensitive content with alerts and redaction.",
    nodes: ["clipboard", "mail", "share", "database", "openai", "folder"],
  },
  {
    id: "support-chat",
    title: "Support Triage Bot",
    category: "Chatbots",
    description:
      "Route support tickets, craft summaries, and generate response drafts.",
    nodes: ["mail", "clipboard", "openai", "link", "database"],
  },
  {
    id: "marketing-digest",
    title: "Marketing Digest",
    category: "Content & Media",
    description:
      "Collect brand signals and compile a weekly newsletter summary.",
    nodes: ["link", "folder", "openai", "mail", "share"],
  },
  {
    id: "sales-insights",
    title: "Sales Insights",
    category: "Data Analysis",
    description:
      "Aggregate CRM exports, annotate trends, and deliver action items.",
    nodes: ["database", "clipboard", "openai", "share"],
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base Builder",
    category: "Knowledge Retrieval",
    description:
      "Ingest docs, build embeddings, and ship a searchable knowledge base.",
    nodes: ["folder", "database", "openai", "share", "clipboard"],
  },
];

const statusOrder = {
  Running: 0,
  Inactive: 1,
};

const sortOptions = [
  { id: "manual", label: "Manual (Recent Open)" },
  {
    id: "updated-desc",
    label: "Updated (Newest)",
    compare: (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
  },
  {
    id: "created-desc",
    label: "Created (Newest)",
    compare: (a, b) => b.dateCreated.getTime() - a.dateCreated.getTime(),
  },
  {
    id: "name-asc",
    label: "Name (A-Z)",
    compare: (a, b) => a.name.localeCompare(b.name),
  },
  {
    id: "name-desc",
    label: "Name (Z-A)",
    compare: (a, b) => b.name.localeCompare(a.name),
  },
  {
    id: "cost-desc",
    label: "Cost (Highest)",
    compare: (a, b) => b.cost - a.cost,
  },
  {
    id: "status",
    label: "Status",
    compare: (a, b) => statusOrder[a.status] - statusOrder[b.status],
  },
];

const isSourceNode = (node) => {
  const meta = String(node?.data?.meta ?? "").toUpperCase();
  if (meta === "SOURCE") return true;
  const inputs = node?.data?.inputs ?? [];
  const outputs = node?.data?.outputs ?? [];
  return inputs.length === 0 && outputs.length > 0;
};

const NodeChip = ({ type, index, total }) => {
  const iconData = getIconForKey(type);
  return (
    <span className="rr-node-chip" style={{ zIndex: total - index }}>
      <img src={iconData.url} alt={type} />
    </span>
  );
};

export default function Sidebar({
  activeView,
  onNavigate,
  theme,
  onThemeChange,
  themeOptions = [],
  onCreateTheme,
}) {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    updateProject,
    createProject,
    deleteProject,
    duplicateProject,
  } = useProjects();

  const [collapsed, setCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("manual");
  const [projectMenuOpenId, setProjectMenuOpenId] = useState(null);
  const [collapsedProjectIds, setCollapsedProjectIds] = useState(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [templateQuery, setTemplateQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [sourceRunStates, setSourceRunStates] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [projectOrder, setProjectOrder] = useState(() =>
    projects.map((project) => project.id)
  );

  const helpRef = useRef(null);
  const profileRef = useRef(null);
  const themeRef = useRef(null);
  const sortRef = useRef(null);
  const projectMenuRefs = useRef({});
  const runTimersRef = useRef({});
  const isResizingRef = useRef(false);

  const activeTheme = themeOptions.find((option) => option.id === theme);

  useEffect(() => {
    const handleClick = (event) => {
      const clickedHelp = helpRef.current?.contains(event.target);
      const clickedProfile = profileRef.current?.contains(event.target);
      const clickedTheme = themeRef.current?.contains(event.target);
      const clickedSort = sortRef.current?.contains(event.target);
      const clickedProjectMenu = Object.values(projectMenuRefs.current).some((ref) =>
        ref?.contains(event.target)
      );

      if (
        clickedHelp ||
        clickedProfile ||
        clickedTheme ||
        clickedSort ||
        clickedProjectMenu
      ) {
        return;
      }

      setHelpOpen(false);
      setProfileOpen(false);
      setThemeOpen(false);
      setSortOpen(false);
      setProjectMenuOpenId(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(runTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  useEffect(() => {
    setProjectOrder((prev) => {
      const valid = prev.filter((id) => projects.some((project) => project.id === id));
      const additions = projects
        .map((project) => project.id)
        .filter((id) => !valid.includes(id));
      return [...additions, ...valid];
    });
  }, [projects]);

  useEffect(() => {
    const handleMove = (event) => {
      if (!isResizingRef.current) return;
      const nextWidth = Math.min(500, Math.max(120, event.clientX));

      if (nextWidth < 240) {
        setCollapsed(true);
        isResizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        return;
      }

      setCollapsed(false);
      setSidebarWidth(nextWidth);
    };

    const handleUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  useEffect(() => {
    if (!createOpen) return;

    const handleKey = (event) => {
      if (event.key === "Escape") setCreateOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [createOpen]);

  const filteredTemplates = useMemo(() => {
    const query = templateQuery.trim().toLowerCase();
    const pool = query
      ? templateLibrary
      : templateLibrary.filter((template) =>
          activeCategory === "Recommended"
            ? template.category === "Recommended"
            : template.category === activeCategory
        );

    if (!query) return pool;

    return pool.filter((template) => {
      const text = `${template.title} ${template.description}`.toLowerCase();
      return text.includes(query);
    });
  }, [templateQuery, activeCategory]);

  const sortedProjects = useMemo(() => {
    if (sortMode === "manual") {
      const lookup = new Map(projects.map((project) => [project.id, project]));
      return projectOrder.map((id) => lookup.get(id)).filter(Boolean);
    }

    const activeSort = sortOptions.find((option) => option.id === sortMode);
    if (!activeSort?.compare) return projects;
    return [...projects].sort(activeSort.compare);
  }, [projects, sortMode, projectOrder]);

  const openProject = (projectId) => {
    setActiveProjectId(projectId);
    onNavigate("project-canvas");
    setProjectMenuOpenId(null);

    if (sortMode === "manual") {
      setProjectOrder((prev) => [projectId, ...prev.filter((id) => id !== projectId)]);
    }
  };

  const toggleProjectCollapse = (projectId) => {
    setCollapsedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleRenameProject = (project) => {
    const nextName = window.prompt("Rename project", project.name);
    if (!nextName || !nextName.trim()) return;
    updateProject(project.id, { name: nextName.trim() });
    setProjectMenuOpenId(null);
  };

  const handleCreateProject = (data) => {
    const projectId = createProject(data);
    setCreateOpen(false);
    setTemplateQuery("");
    setActiveCategory("Recommended");
    openProject(projectId);
  };

  const toggleSourceRun = (projectId, sourceNodeId) => {
    const key = `${projectId}:${sourceNodeId}`;
    const currentState = sourceRunStates[key] ?? "idle";

    if (currentState === "loading") {
      if (runTimersRef.current[key]) {
        clearTimeout(runTimersRef.current[key]);
        runTimersRef.current[key] = null;
      }
      setSourceRunStates((prev) => ({ ...prev, [key]: "idle" }));
      return;
    }

    setSourceRunStates((prev) => ({ ...prev, [key]: "loading" }));

    if (runTimersRef.current[key]) clearTimeout(runTimersRef.current[key]);
    runTimersRef.current[key] = setTimeout(() => {
      setSourceRunStates((prev) => ({ ...prev, [key]: "idle" }));
      runTimersRef.current[key] = null;
    }, 5000);
  };

  return (
    <>
      <aside
        className={`rr-sidebar ${collapsed ? "is-collapsed" : ""}`}
        style={collapsed ? undefined : { width: `${sidebarWidth}px` }}
      >
        <div className="rr-sidebar__top">
          <div className="rr-sidebar__brand">
            <div className="rr-sidebar__logo-wrapper">
              <img src={logoMark} alt="RocketRide" className="rr-sidebar__logo" />
            </div>
            <span className="rr-sidebar__brand-text">RocketRide</span>
          </div>
          <button
            className="rr-icon-button rr-sidebar__toggle"
            type="button"
            onClick={() => {
              setCollapsed((value) => {
                const next = !value;
                if (!next && sidebarWidth < 240) {
                  setSidebarWidth(240);
                }
                return next;
              });
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span
              className="rr-icon-image"
              style={{
                "--rr-icon-url": `url(${iconUrl(
                  collapsed ? "chevron-right" : "chevron-left"
                )})`,
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="rr-sidebar__projects-shell">
          <button
            type="button"
            className="rr-button rr-button--ghost rr-sidebar__new-project"
            onClick={() => setCreateOpen(true)}
          >
            <img src={iconUrl("add-box")} alt="" />
            <span>New Project</span>
          </button>

          <div className="rr-sidebar-projects-header">
            <h3>Projects</h3>
            <div className="rr-sidebar-projects-sort" ref={sortRef}>
              <button
                type="button"
                className="rr-icon-button rr-sidebar-projects-sort__trigger"
                onClick={() => setSortOpen((value) => !value)}
                aria-label="Sort projects"
              >
                <span
                  className="rr-icon-image"
                  style={{ "--rr-icon-url": `url(${iconUrl("sort-alphabetic")})` }}
                  aria-hidden="true"
                />
              </button>
              {sortOpen && (
                <div className="rr-sidebar-projects-sort__menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`rr-sidebar-projects-sort__item ${
                        sortMode === option.id ? "is-active" : ""
                      }`}
                      onClick={() => {
                        setSortMode(option.id);
                        setSortOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {sortMode === option.id && <img src={iconUrl("check")} alt="" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rr-sidebar-projects-list">
            {sortedProjects.map((project) => {
              const sourceNodes = (project.nodes ?? []).filter(isSourceNode);
              const projectCollapsed = collapsedProjectIds.has(project.id);
              return (
                <div
                  key={project.id}
                  className={`rr-sidebar-project ${
                    activeProjectId === project.id && activeView === "project-canvas"
                      ? "is-active"
                      : ""
                  }`}
                >
                  <div className="rr-sidebar-project__row">
                    <button
                      type="button"
                      className="rr-sidebar-project__collapse"
                      onClick={() => toggleProjectCollapse(project.id)}
                      aria-label={projectCollapsed ? "Expand sources" : "Collapse sources"}
                    >
                      <span
                        className="rr-sidebar-project__icon"
                        style={{
                          "--rr-icon-url": `url(${project.icon ?? iconUrl("file")})`,
                          "--rr-icon-color": project.iconColor ?? "#ffffff",
                        }}
                      />
                      <span className="rr-sidebar-project__chevron">
                        <img
                          src={iconUrl(projectCollapsed ? "chevron-right" : "chevron-down")}
                          alt=""
                        />
                      </span>
                    </button>

                    <button
                      type="button"
                      className="rr-sidebar-project__main"
                      onClick={() => openProject(project.id)}
                    >
                      {project.name}
                    </button>

                    <div
                      className="rr-sidebar-project__menu-wrap"
                      ref={(ref) => {
                        projectMenuRefs.current[project.id] = ref;
                      }}
                    >
                      <button
                        type="button"
                        className="rr-sidebar-project__menu-trigger"
                        onClick={() =>
                          setProjectMenuOpenId((prev) =>
                            prev === project.id ? null : project.id
                          )
                        }
                        aria-label="Project actions"
                      >
                        <img src={iconUrl("more-vertical")} alt="" />
                      </button>
                      {projectMenuOpenId === project.id && (
                        <div className="rr-sidebar-project__menu">
                          <button type="button" onClick={() => openProject(project.id)}>
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              duplicateProject(project.id);
                              setProjectMenuOpenId(null);
                            }}
                          >
                            Duplicate
                          </button>
                          <button type="button" onClick={() => handleRenameProject(project)}>
                            Rename
                          </button>
                          <button
                            type="button"
                            className="is-danger"
                            onClick={() => {
                              deleteProject(project.id);
                              setProjectMenuOpenId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!projectCollapsed && sourceNodes.length > 0 && (
                    <div className="rr-sidebar-source-list">
                      {sourceNodes.map((node) => {
                        const key = `${project.id}:${node.id}`;
                        const runState = sourceRunStates[key] ?? "idle";
                        return (
                          <div
                            key={node.id}
                            className="rr-sidebar-source"
                            role="button"
                            tabIndex={0}
                            onClick={() => openProject(project.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openProject(project.id);
                              }
                            }}
                          >
                            <span className="rr-sidebar-source__label">
                              {node.data?.iconSrc && (
                                <img
                                  src={node.data.iconSrc}
                                  alt=""
                                  className="rr-sidebar-source__icon"
                                />
                              )}
                              <span className="rr-sidebar-source__title">
                                {node.data?.title ?? "Source"}
                              </span>
                            </span>
                            <button
                              type="button"
                              className={`rr-sidebar-source__run ${
                                runState === "loading" ? "is-running" : ""
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleSourceRun(project.id, node.id);
                              }}
                              aria-label={
                                runState === "loading" ? "Pause source" : "Run source"
                              }
                            >
                              <span
                                className="rr-sidebar-source__run-glyph"
                                style={{
                                  "--rr-run-icon-url": `url(${iconUrl(
                                    runState === "loading" ? "pause" : "play"
                                  )})`,
                                }}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {sortedProjects.length === 0 && <div className="rr-empty">No projects yet.</div>}
          </div>
        </div>

        <div className="rr-sidebar__footer">
          <div className="rr-sidebar__section-divider" />
          <button
            type="button"
            className="rr-sidebar__item"
            onClick={() => onNavigate("feedback")}
          >
            <span className="rr-icon">
              <span
                className="rr-icon-image"
                style={{ "--rr-icon-url": `url(${iconUrl("chat")})` }}
                aria-hidden="true"
              />
            </span>
            <span className="rr-sidebar__item-label">Feedback</span>
          </button>
          <button
            type="button"
            className="rr-sidebar__item"
            onClick={() => onNavigate("changelog")}
          >
            <span className="rr-icon">
              <span
                className="rr-icon-image"
                style={{ "--rr-icon-url": `url(${iconUrl("list")})` }}
                aria-hidden="true"
              />
            </span>
            <span className="rr-sidebar__item-label">Changelog</span>
          </button>

          <div className="rr-sidebar__help" ref={helpRef}>
            <button
              type="button"
              className="rr-sidebar__item"
              onClick={() => setHelpOpen((value) => !value)}
            >
              <span className="rr-icon">
                <span
                  className="rr-icon-image"
                  style={{ "--rr-icon-url": `url(${iconUrl("info-box")})` }}
                  aria-hidden="true"
                />
              </span>
              <span className="rr-sidebar__item-label">Help</span>
            </button>
            {helpOpen && (
              <div className="rr-sidebar__popover">
                <button
                  type="button"
                  className="rr-sidebar__popover-item"
                  onClick={() => {
                    onNavigate("design-system");
                    setHelpOpen(false);
                  }}
                >
                  Design System
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="rr-sidebar__item"
            onClick={() => onNavigate("api-keys")}
          >
            <span className="rr-icon">
              <span
                className="rr-icon-image"
                style={{ "--rr-icon-url": `url(${iconUrl("code")})` }}
                aria-hidden="true"
              />
            </span>
            <span className="rr-sidebar__item-label">API Keys</span>
          </button>

          <div className="rr-sidebar__theme" ref={themeRef}>
            <button
              type="button"
              className="rr-sidebar__item rr-sidebar__theme-trigger"
              onClick={() => setThemeOpen((value) => !value)}
            >
              <span className="rr-icon">
                <span
                  className="rr-icon-image"
                  style={{ "--rr-icon-url": `url(${iconUrl("paint-bucket")})` }}
                  aria-hidden="true"
                />
              </span>
              <span className="rr-sidebar__item-label">Theme</span>
              <span className="rr-sidebar__theme-value">
                {activeTheme?.label ?? "Theme"}
              </span>
            </button>
            {themeOpen && (
              <div className="rr-sidebar__popover rr-sidebar__popover--theme">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`rr-sidebar__theme-option ${
                      theme === option.id ? "is-active" : ""
                    }`}
                    onClick={() => {
                      onThemeChange(option.id);
                      setThemeOpen(false);
                    }}
                  >
                    <span
                      className="rr-sidebar__theme-swatch"
                      data-theme={option.swatch ? undefined : option.id}
                      style={option.swatch ? { background: option.swatch } : undefined}
                    />
                    <span className="rr-sidebar__theme-text">
                      <span className="rr-sidebar__theme-name">{option.label}</span>
                      <span className="rr-sidebar__theme-meta">{option.meta}</span>
                    </span>
                  </button>
                ))}
                <div className="rr-sidebar__theme-actions">
                  <button
                    type="button"
                    className="rr-sidebar__theme-create"
                    onClick={() => {
                      onCreateTheme?.();
                      setThemeOpen(false);
                    }}
                  >
                    Create new theme
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rr-sidebar__section-divider" />
          <div className="rr-sidebar__user-popover" ref={profileRef}>
            <button
              type="button"
              className="rr-sidebar__user"
              onClick={() => setProfileOpen((value) => !value)}
            >
              <span className="rr-icon rr-icon--outlined rr-icon--initials">
                <span className="rr-icon__initials">UN</span>
              </span>
              <div className="rr-sidebar__user-meta">
                <span className="rr-sidebar__user-name">User Name</span>
                <span className="rr-sidebar__user-plan">Free Plan</span>
              </div>
            </button>
            {profileOpen && (
              <div className="rr-sidebar__popover rr-sidebar__popover--profile">
                <button type="button" className="rr-sidebar__popover-item">
                  Profile
                </button>
                <button type="button" className="rr-sidebar__popover-item">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {!collapsed && (
          <button
            type="button"
            className="rr-sidebar__resize-handle"
            aria-label="Resize sidebar"
            onMouseDown={(event) => {
              event.preventDefault();
              isResizingRef.current = true;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
          />
        )}
      </aside>

      {createOpen && (
        <div className="rr-modal-overlay" onClick={() => setCreateOpen(false)}>
          <div
            className="rr-project-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rr-project-modal__left">
              <h2>Create Project</h2>
              <div className="rr-project-modal__menu">
                {templateCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`rr-project-modal__menu-item ${
                      activeCategory === category ? "is-active" : ""
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="rr-project-modal__right">
              <button
                type="button"
                className="rr-project-modal__close"
                onClick={() => setCreateOpen(false)}
              >
                <img src={iconUrl("close")} alt="" />
              </button>
              <div className="rr-project-modal__actions">
                <div className="rr-project-modal__search">
                  <img src={iconUrl("search")} alt="" />
                  <input
                    type="text"
                    value={templateQuery}
                    onChange={(event) => setTemplateQuery(event.target.value)}
                    placeholder="Search templates"
                  />
                </div>
                <button
                  className="rr-button rr-button--primary"
                  onClick={() =>
                    handleCreateProject({
                      name: "Untitled Project",
                      nodes: [],
                      edges: [],
                      status: "Inactive",
                    })
                  }
                >
                  <img src={iconUrl("note-plus")} alt="" />
                  Create Blank
                </button>
              </div>
              <div className="rr-template-grid">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="rr-template-card"
                    onClick={() =>
                      handleCreateProject({
                        name: template.title,
                        description: template.description,
                        nodes: buildTemplateNodes(template.nodes),
                        edges: [],
                        status: "Inactive",
                        icon: getIconForKey(template.title).url,
                      })
                    }
                  >
                    <div className="rr-template-card__header">
                      <span
                        className="rr-projects__icon"
                        style={{
                          "--rr-icon-url": `url(${getIconForKey(template.title).url})`,
                        }}
                      />
                      <div>
                        <p className="rr-card-title">{template.title}</p>
                        <p className="rr-card-meta">By RocketRide</p>
                      </div>
                    </div>
                    <p className="rr-body">{template.description}</p>
                    <div className="rr-node-stack">
                      {template.nodes.slice(0, 5).map((node, index) => (
                        <NodeChip
                          key={`${template.id}-${node}-${index}`}
                          type={node}
                          index={index}
                          total={Math.min(template.nodes.length, 5)}
                        />
                      ))}
                      {template.nodes.length > 5 && (
                        <span className="rr-node-count">
                          +{template.nodes.length - 5}
                        </span>
                      )}
                    </div>
                    <span className="rr-template-card__cta">Use template</span>
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="rr-empty">
                    <p className="rr-empty-title">No templates found</p>
                    <p className="rr-body">Try another keyword or category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
