import { useEffect, useMemo, useRef, useState } from "react";
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

const DEFAULT_COLUMNS = [
  { id: "name", label: "Project Name", visible: true, locked: true },
  { id: "nodes", label: "Nodes", visible: true },
  { id: "lastRuns", label: "Last 10 Runs", visible: true },
  { id: "cost", label: "Cost", visible: true },
  { id: "dateCreated", label: "Date Created", visible: false },
  { id: "lastModified", label: "Last Modified", visible: false },
  { id: "description", label: "Description", visible: false },
  { id: "dataProcessed", label: "Data Processed", visible: false },
  { id: "filesUploaded", label: "Files Processed", visible: false },
  { id: "status", label: "Status", visible: true },
];

const parseDataProcessed = (value) => {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^([\d.]+)\s*(KB|MB|GB|TB)?$/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return 0;
  const unit = match[2] ?? "MB";
  const multiplier = {
    KB: 1,
    MB: 1024,
    GB: 1024 * 1024,
    TB: 1024 * 1024 * 1024,
  }[unit];
  return amount * multiplier;
};

const statusOrder = {
  Running: 0,
  Inactive: 1,
};

const statusBadge = (status) =>
  status === "Running" ? "rr-status--running" : "rr-status--inactive";

const ColumnArrow = ({ direction, isActive }) => (
  <img
    src={iconUrl(direction === "up" ? "chevron-up" : "chevron-down")}
    alt=""
    className={`rr-sort-icon ${isActive ? "is-active" : ""}`}
  />
);

const Tooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="rr-tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span className="rr-tooltip__content">{content}</span>}
    </span>
  );
};

const LastRunsVisualization = ({ runs }) => {
  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const getStatusLabel = (status) => {
    if (status === "success") return "Success";
    if (status === "failure") return "Failed";
    return "Warning";
  };

  return (
    <div className="rr-runs">
      {runs.map((run, index) => (
        <Tooltip
          key={index}
          content={
            <div className="rr-runs__tooltip">
              <div className="rr-runs__title">{getStatusLabel(run.status)}</div>
              <div className="rr-runs__meta">{formatDate(run.timestamp)}</div>
              <div className="rr-runs__meta">{run.duration}s duration</div>
            </div>
          }
        >
          <span className={`rr-run-dot rr-run-dot--${run.status}`} />
        </Tooltip>
      ))}
    </div>
  );
};

const NodeChip = ({ type, index, total }) => {
  const iconData = getIconForKey(type);
  return (
    <span className="rr-node-chip" style={{ zIndex: total - index }}>
      <img src={iconData.url} alt={type} />
    </span>
  );
};

export default function ProjectsList({ onOpenProject, onCreateProject }) {
  const {
    projects,
    createProject,
    deleteProject,
    duplicateProject,
  } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [templateQuery, setTemplateQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const menuRefs = useRef({});

  const handleSort = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    setSortField(null);
    setSortDirection("asc");
  };

  const handleDragStart = (columnId, locked) => {
    if (locked && columnId !== "nodes") return;
    setDraggedColumnId(columnId);
  };

  useEffect(() => {
    const handleClick = (event) => {
      const refs = Object.values(menuRefs.current);
      const clickedMenu = refs.some((ref) => ref?.contains(event.target));
      if (!clickedMenu) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!createOpen) {
      return;
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setCreateOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [createOpen]);

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

  const filteredTemplates = useMemo(() => {
    const query = templateQuery.trim().toLowerCase();
    const pool = query
      ? templateLibrary
      : templateLibrary.filter((template) =>
          activeCategory === "Recommended"
            ? template.category === "Recommended"
            : template.category === activeCategory
        );
    if (!query) {
      return pool;
    }
    return pool.filter((template) => {
      const text = `${template.title} ${template.description}`.toLowerCase();
      return text.includes(query);
    });
  }, [templateQuery, activeCategory]);

  const handleCreateProject = (data) => {
    const projectId = createProject(data);
    setCreateOpen(false);
    if (onCreateProject) {
      onCreateProject(projectId);
    }
  };

  const handleDragOver = (columnId, locked) => {
    if (locked && columnId !== "nodes") return;
    setDragOverColumnId(columnId);
  };

  const handleDrop = (targetColumnId, targetLocked) => {
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      return;
    }
    if (targetLocked && targetColumnId !== "nodes") {
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      return;
    }
    const draggedIndex = columns.findIndex(
      (column) => column.id === draggedColumnId
    );
    const targetIndex = columns.findIndex(
      (column) => column.id === targetColumnId
    );
    const nextColumns = [...columns];
    const [removed] = nextColumns.splice(draggedIndex, 1);
    nextColumns.splice(targetIndex, 0, removed);
    setColumns(nextColumns);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const sortedAndFiltered = useMemo(() => {
    let filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        if (sortField === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === "cost") {
          comparison = a.cost - b.cost;
        } else if (sortField === "dateCreated") {
          comparison = a.dateCreated.getTime() - b.dateCreated.getTime();
        } else if (sortField === "lastModified") {
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
        } else if (sortField === "filesUploaded") {
          comparison = a.filesUploaded - b.filesUploaded;
        } else if (sortField === "dataProcessed") {
          comparison =
            parseDataProcessed(a.dataProcessed) -
            parseDataProcessed(b.dataProcessed);
        } else if (sortField === "status") {
          comparison = statusOrder[a.status] - statusOrder[b.status];
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }
    return filtered;
  }, [projects, searchQuery, sortField, sortDirection]);

  const visibleColumns = columns.filter(
    (column) => column.visible && column.id !== "name"
  );

  const toggleColumn = (id) => {
    const updated = columns.map((column) =>
      column.id === id && !column.locked
        ? { ...column, visible: !column.visible }
        : column
    );
    setColumns(updated);
  };

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  return (
    <div className="rr-page rr-container rr-stack rr-projects">
      <section className="rr-projects__toolbar">
        <div className="rr-projects__toolbar-left">
          <h1 className="rr-title">Projects</h1>
        </div>
        <div className="rr-projects__toolbar-right">
          <div className="rr-projects__search">
            <img src={iconUrl("search")} alt="" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects"
            />
          </div>
          <div className="rr-columns">
            <button
              className="rr-button rr-button--ghost"
              onClick={() => setColumnsOpen((value) => !value)}
            >
              <img src={iconUrl("layout-columns")} alt="" />
              Columns
            </button>
          {columnsOpen && (
            <>
              <div
                className="rr-columns__backdrop"
                onClick={() => setColumnsOpen(false)}
              />
              <div className="rr-columns__panel">
                <div className="rr-columns__header">
                  <span>Customize Columns</span>
                  <button
                    type="button"
                    className="rr-columns__close"
                    onClick={() => setColumnsOpen(false)}
                  >
                    <img src={iconUrl("close")} alt="" />
                  </button>
                </div>
                <div className="rr-columns__list">
                  {columns.map((column) => (
                    <button
                      key={column.id}
                      className={`rr-columns__item ${
                        column.locked ? "is-locked" : ""
                      }`}
                      onClick={() => toggleColumn(column.id)}
                      disabled={column.locked}
                    >
                      <span>{column.label}</span>
                      <span
                        className={`rr-columns__check ${
                          column.visible ? "is-active" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="rr-columns__footer">
                  Drag column headers to reorder.
                </div>
              </div>
            </>
          )}
          </div>
          <button
            className="rr-button rr-button--primary"
            onClick={() => setCreateOpen(true)}
          >
            <img src={iconUrl("add-box")} alt="" />
            New Project
          </button>
        </div>
      </section>

      <section className="rr-projects__table">
        <table>
          <thead>
            <tr>
              <th className="rr-projects__sticky">
                <button
                  className="rr-sort"
                  onClick={() => handleSort("name")}
                >
                  <span>Project Name</span>
                  <span
                    className={`rr-sort__icons ${
                      sortField === null ? "is-inline" : ""
                    }`}
                  >
                    <ColumnArrow
                      direction="up"
                      isActive={sortField === "name" && sortDirection === "asc"}
                    />
                    <ColumnArrow
                      direction="down"
                      isActive={
                        sortField === "name" && sortDirection === "desc"
                      }
                    />
                  </span>
                </button>
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  draggable={!column.locked || column.id === "nodes"}
                  onDragStart={() =>
                    handleDragStart(column.id, column.locked)
                  }
                  onDragOver={(event) => {
                    event.preventDefault();
                    handleDragOver(column.id, column.locked);
                  }}
                  onDragLeave={() => setDragOverColumnId(null)}
                  onDrop={() => handleDrop(column.id, column.locked)}
                  onDragEnd={() => {
                    setDraggedColumnId(null);
                    setDragOverColumnId(null);
                  }}
                  className={`rr-projects__header-cell ${
                    dragOverColumnId === column.id ? "is-drag-over" : ""
                  } ${draggedColumnId === column.id ? "is-dragging" : ""}`}
                >
                  {column.id === "cost" ||
                  column.id === "dateCreated" ||
                  column.id === "lastModified" ||
                  column.id === "filesUploaded" ||
                  column.id === "dataProcessed" ||
                  column.id === "status" ? (
                    <button
                      className="rr-sort"
                      onClick={() => handleSort(column.id)}
                    >
                      <span>{column.label}</span>
                      <span
                        className={`rr-sort__icons ${
                          sortField === null ? "is-inline" : ""
                        }`}
                      >
                        <ColumnArrow
                          direction="up"
                          isActive={
                            sortField === column.id && sortDirection === "asc"
                          }
                        />
                        <ColumnArrow
                          direction="down"
                          isActive={
                            sortField === column.id && sortDirection === "desc"
                          }
                        />
                      </span>
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </th>
              ))}
              <th className="rr-projects__menu-cell"></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFiltered.map((project) => (
              <tr
                key={project.id}
                onClick={() => onOpenProject?.(project.id)}
              >
                <td className="rr-projects__sticky rr-projects__name">
                  <span className="rr-projects__name-wrap">
                    <span
                      className="rr-projects__icon"
                      style={{
                        "--rr-icon-url": `url(${project.icon ?? iconUrl("file")})`,
                        "--rr-icon-color": project.iconColor ?? "#ffffff",
                      }}
                    />
                    {project.name}
                  </span>
                </td>
                {visibleColumns.map((column) => {
                  if (column.id === "nodes") {
                    const maxVisible = 5;
                    const nodeLabels = project.nodes.map(
                      (node) => node.data?.title ?? node.id
                    );
                    const visibleNodes = nodeLabels.slice(0, maxVisible);
                    const totalNodes = nodeLabels.length;
                    const hiddenCount = Math.max(
                      0,
                      totalNodes - visibleNodes.length
                    );
                    const hiddenNodes = nodeLabels.slice(maxVisible);
                    const tooltipNodes = hiddenNodes;
                    return (
                      <td key={column.id}>
                        <div className="rr-node-stack">
                          {visibleNodes.map((node, index) => (
                            <NodeChip
                              key={`${project.id}-${node}-${index}`}
                              type={node}
                              index={index}
                              total={visibleNodes.length}
                            />
                          ))}
                          {hiddenCount > 0 && (
                            <Tooltip
                              content={
                                <div className="rr-node-tooltip">
                                  {tooltipNodes.map((node, nodeIndex) => (
                                    <NodeChip
                                      key={`${project.id}-hidden-${nodeIndex}`}
                                      type={node}
                                      index={nodeIndex}
                                      total={tooltipNodes.length}
                                    />
                                  ))}
                                </div>
                              }
                            >
                              <span className="rr-node-count">
                                +{hiddenCount}
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    );
                  }
                  if (column.id === "lastRuns") {
                    return (
                      <td key={column.id}>
                        <LastRunsVisualization runs={project.lastRuns} />
                      </td>
                    );
                  }
                  if (column.id === "cost") {
                    return (
                      <td key={column.id} className="rr-projects__number">
                        ${project.cost.toFixed(2)}
                      </td>
                    );
                  }
                  if (column.id === "dateCreated") {
                    return (
                      <td key={column.id} className="rr-projects__meta">
                        {formatDate(project.dateCreated)}
                      </td>
                    );
                  }
                  if (column.id === "lastModified") {
                    return (
                      <td key={column.id} className="rr-projects__meta">
                        {formatDate(project.lastModified)}
                      </td>
                    );
                  }
                  if (column.id === "description") {
                    return (
                      <td key={column.id} className="rr-projects__meta">
                        {project.description}
                      </td>
                    );
                  }
                  if (column.id === "dataProcessed") {
                    return (
                      <td key={column.id} className="rr-projects__meta">
                        {project.dataProcessed}
                      </td>
                    );
                  }
                  if (column.id === "filesUploaded") {
                    return (
                      <td key={column.id} className="rr-projects__number">
                        {project.filesUploaded}
                      </td>
                    );
                  }
                  if (column.id === "status") {
                    return (
                      <td key={column.id}>
                        <span className={`rr-status ${statusBadge(project.status)}`}>
                          {project.status === "Running" && (
                            <span className="rr-status__spinner" />
                          )}
                          {project.status}
                        </span>
                      </td>
                    );
                  }
                  return <td key={column.id}></td>;
                })}
                <td className="rr-projects__menu-cell">
                  <div
                    className="rr-projects__menu"
                    ref={(ref) => {
                      menuRefs.current[project.id] = ref;
                    }}
                  >
                    <button
                      className="rr-icon-button rr-projects__menu-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpenId((prev) =>
                          prev === project.id ? null : project.id
                        );
                      }}
                    >
                      <img src={iconUrl("more-vertical")} alt="" />
                    </button>
                    {menuOpenId === project.id && (
                      <div className="rr-projects__menu-popover">
                        <button
                          type="button"
                          className="rr-projects__menu-item"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuOpenId(null);
                            onOpenProject?.(project.id);
                          }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="rr-projects__menu-item"
                          onClick={(event) => {
                            event.stopPropagation();
                            duplicateProject(project.id);
                            setMenuOpenId(null);
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="rr-projects__menu-item is-danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteProject(project.id);
                            setMenuOpenId(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sortedAndFiltered.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="rr-empty">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
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
                    <p className="rr-body">
                      Try another keyword or category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
