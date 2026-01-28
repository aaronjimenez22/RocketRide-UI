import { useMemo, useState } from "react";
import aparaviIcon from "../assets/project-icons/aparavi.png";
import attlasianIcon from "../assets/project-icons/attlasian.png";
import classificationIcon from "../assets/project-icons/classification.png";
import dragNDropIcon from "../assets/project-icons/dragndrop.png";
import driveIcon from "../assets/project-icons/drive.png";
import gmailIcon from "../assets/project-icons/gmail.png";
import outlookIcon from "../assets/project-icons/outlook.svg";
import webhookIcon from "../assets/project-icons/webhook.png";
import openAiIcon from "../assets/project-icons/openAI.png";
import s3Icon from "../assets/project-icons/S3.png";
import qdrantIcon from "../assets/project-icons/qdrant.png";

const iconUrl = (name) =>
  `https://unpkg.com/pixelarticons@1.8.0/svg/${name}.svg`;

const nodeAssets = {
  clipboard: { src: classificationIcon, label: "Classification" },
  folder: { src: driveIcon, label: "Drive" },
  link: { src: webhookIcon, label: "Webhook" },
  mail: { src: gmailIcon, label: "Gmail" },
  briefcase: { src: attlasianIcon, label: "Atlassian" },
  database: { src: aparaviIcon, label: "Aparavi" },
  share: { src: dragNDropIcon, label: "Drag & Drop" },
  openai: { src: openAiIcon, label: "OpenAI" },
  s3: { src: s3Icon, label: "S3" },
  qdrant: { src: qdrantIcon, label: "Qdrant" },
  default: { src: outlookIcon, label: "Outlook" },
};

const generateLastRuns = () => {
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

const SAMPLE_DATA = [
  {
    id: "1",
    name: "Sample RAG Pipeline",
    nodes: ["clipboard", "folder", "link", "mail", "share", "database"],
    status: "Running",
    lastRuns: generateLastRuns(),
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
    nodes: ["clipboard", "folder", "link", "mail"],
    status: "Running",
    extraNodes: 3,
    lastRuns: generateLastRuns(),
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
    nodes: ["folder", "clipboard", "mail", "link", "briefcase"],
    status: "Running",
    extraNodes: 2,
    lastRuns: generateLastRuns(),
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
    nodes: ["clipboard", "folder", "link", "database", "share", "briefcase"],
    status: "Inactive",
    lastRuns: generateLastRuns(),
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
    nodes: ["clipboard", "folder", "link", "mail", "share", "database"],
    status: "Inactive",
    extraNodes: 1,
    lastRuns: generateLastRuns(),
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
    nodes: ["link", "clipboard", "folder", "mail", "share", "database"],
    status: "Inactive",
    extraNodes: 2,
    lastRuns: generateLastRuns(),
    cost: 5.25,
    dateCreated: new Date("2024-03-01"),
    lastModified: new Date("2024-03-10"),
    description: "Webhook-triggered content summarization",
    dataProcessed: "320 MB",
    filesUploaded: 15,
  },
];

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
  const iconData = nodeAssets[type] ?? nodeAssets.default;
  return (
    <span className="rr-node-chip" style={{ zIndex: total - index }}>
      <img src={iconData.src} alt={iconData.label} />
    </span>
  );
};

export default function ProjectsList({ onOpenProject }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [columnsOpen, setColumnsOpen] = useState(false);

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
    let filtered = SAMPLE_DATA.filter((project) =>
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
  }, [searchQuery, sortField, sortDirection]);

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
          <button className="rr-button rr-button--primary">
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
                  {project.name}
                </td>
                {visibleColumns.map((column) => {
                  if (column.id === "nodes") {
                    const maxVisible = 5;
                    const visibleNodes = project.nodes.slice(0, maxVisible);
                    const totalNodes =
                      project.nodes.length + (project.extraNodes ?? 0);
                    const hiddenCount = Math.max(
                      0,
                      totalNodes - visibleNodes.length
                    );
                    const hiddenNodes = project.nodes.slice(maxVisible);
                    const extraPlaceholders = Math.max(
                      0,
                      hiddenCount - hiddenNodes.length
                    );
                    const tooltipNodes = [
                      ...hiddenNodes,
                      ...Array(extraPlaceholders).fill("default"),
                    ];
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
                          {project.status}
                        </span>
                      </td>
                    );
                  }
                  return <td key={column.id}></td>;
                })}
                <td className="rr-projects__menu-cell">
                  <button className="rr-icon-button rr-projects__menu-button">
                    <img src={iconUrl("more-vertical")} alt="" />
                  </button>
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
    </div>
  );
}
