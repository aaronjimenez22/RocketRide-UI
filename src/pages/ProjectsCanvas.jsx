import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import FlowNode from "../components/FlowNode";
import FlowEdge from "../components/FlowEdge";
import { iconNames, iconUrl, getIconForKey } from "../utils/iconLibrary";

const initialNodes = [
  {
    id: "source",
    position: { x: 100, y: 120 },
    type: "rrNode",
    data: {
      title: "Data Source",
      iconSrc: getIconForKey("data-source").url,
      meta: "Ingest + label",
      inputs: [],
      outputs: [{ id: "source-out", label: "Data", type: "output" }],
    },
  },
  {
    id: "source-audio",
    position: { x: 100, y: 470 },
    type: "rrNode",
    data: {
      title: "Audio Intake",
      iconSrc: getIconForKey("audio-intake").url,
      meta: "Waveforms",
      inputs: [],
      outputs: [{ id: "audio-out", label: "Audio", type: "output" }],
    },
  },
  {
    id: "transform",
    position: { x: 100, y: 280 },
    type: "rrNode",
    data: {
      title: "Clean + Normalize",
      iconSrc: getIconForKey("clean-normalize").url,
      meta: "Normalize schema",
      inputs: [{ id: "transform-in", label: "Data", type: "input" }],
      outputs: [
        { id: "transform-out", label: "Clean", type: "output" },
        { id: "transform-meta", label: "Meta", type: "output" },
      ],
    },
  },
  {
    id: "router",
    position: { x: 420, y: 120 },
    type: "rrNode",
    data: {
      title: "Router",
      iconSrc: getIconForKey("router").url,
      meta: "Split by type",
      inputs: [
        { id: "router-in", label: "Data", type: "input" },
        { id: "router-meta", label: "Meta", type: "input" },
      ],
      outputs: [
        { id: "router-audio", label: "Audio", type: "output" },
        { id: "router-text", label: "Text", type: "output" },
        { id: "router-image", label: "Image", type: "output" },
      ],
    },
  },
  {
    id: "model",
    position: { x: 420, y: 260 },
    type: "rrNode",
    data: {
      title: "Summarize",
      iconSrc: getIconForKey("summarize").url,
      meta: "LLM inference",
      inputs: [
        { id: "model-context", label: "Context", type: "input" },
        { id: "model-prompt", label: "Prompt", type: "input" },
      ],
      outputs: [{ id: "model-out", label: "Summary", type: "output" }],
    },
  },
  {
    id: "audio-model",
    position: { x: 420, y: 470 },
    type: "rrNode",
    data: {
      title: "Audio Cleanser",
      iconSrc: getIconForKey("audio-cleanser").url,
      meta: "Denoise",
      inputs: [{ id: "audio-in", label: "Audio", type: "input" }],
      outputs: [{ id: "audio-out", label: "Audio", type: "output" }],
    },
  },
  {
    id: "output",
    position: { x: 720, y: 260 },
    type: "rrNode",
    data: {
      title: "Output",
      iconSrc: getIconForKey("output").url,
      meta: "Send downstream",
      inputs: [{ id: "output-in", label: "Summary", type: "input" }],
      outputs: [],
    },
  },
  {
    id: "archive",
    position: { x: 720, y: 470 },
    type: "rrNode",
    data: {
      title: "Archive",
      iconSrc: getIconForKey("archive").url,
      meta: "Store assets",
      inputs: [
        { id: "archive-audio", label: "Audio", type: "input" },
        { id: "archive-image", label: "Image", type: "input" },
      ],
      outputs: [],
    },
  },
];

const initialEdges = [
  {
    id: "e-source-transform",
    source: "source",
    sourceHandle: "source:source-out",
    target: "transform",
    targetHandle: "transform:transform-in",
  },
  {
    id: "e-transform-model",
    source: "transform",
    sourceHandle: "transform:transform-out",
    target: "model",
    targetHandle: "model:model-context",
  },
  {
    id: "e-model-output",
    source: "model",
    sourceHandle: "model:model-out",
    target: "output",
    targetHandle: "output:output-in",
  },
];

export default function ProjectsCanvas({ flowOptions }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [nodesLocked, setNodesLocked] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Content summary");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [saveState, setSaveState] = useState("saved");
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const [projectIcon, setProjectIcon] = useState("file");
  const [projectIconColor, setProjectIconColor] = useState("#ff8a3c");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const shortcutsRef = useRef(null);
  const saveRef = useRef(null);
  const iconRef = useRef(null);
  const saveTimerRef = useRef(null);
  const titleInputRef = useRef(null);
  const previousTitleRef = useRef(projectTitle);


  const triggerSave = () => {
    if (!autosaveEnabled) {
      return;
    }
    setSaveState("saving");
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saved");
    }, 900);
  };

  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
    triggerSave();
  };

  const onConnectStart = () => {
    setSelectedEdgeId(null);
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    triggerSave();
  };

  const portLabelByHandle = useMemo(() => {
    const portMap = new Map();
    nodes.forEach((node) => {
      const ports = [...(node.data?.inputs ?? []), ...(node.data?.outputs ?? [])];
      ports.forEach((port) => {
        portMap.set(`${node.id}:${port.id}`, port.label);
      });
    });
    return portMap;
  }, [nodes]);

  const isValidConnection = (connection) => {
    if (!connection.sourceHandle || !connection.targetHandle) {
      return false;
    }
    const sourceLabel = portLabelByHandle.get(connection.sourceHandle);
    const targetLabel = portLabelByHandle.get(connection.targetHandle);
    return Boolean(sourceLabel && targetLabel && sourceLabel === targetLabel);
  };

  const connectedPorts = useMemo(() => {
    const portIds = new Set();
    edges.forEach((edge) => {
      if (edge.sourceHandle) {
        portIds.add(edge.sourceHandle);
      }
      if (edge.targetHandle) {
        portIds.add(edge.targetHandle);
      }
    });
    return portIds;
  }, [edges]);

  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          connectedPorts,
        },
      })),
    [nodes, connectedPorts]
  );

  const decoratedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: "rrEdge",
        data: {
          ...edge.data,
          isHovered: edge.id === hoveredEdgeId,
          isSelected: edge.id === selectedEdgeId,
          onDelete: handleDeleteEdge,
        },
      })),
    [edges, hoveredEdgeId, selectedEdgeId]
  );

  const nodeTypes = useMemo(() => ({ rrNode: FlowNode }), []);
  const edgeTypes = useMemo(() => ({ rrEdge: FlowEdge }), []);

  const options = useMemo(
    () => ({
      fitView: flowOptions?.fitView ?? true,
      minZoom: flowOptions?.minZoom ?? 0.5,
      maxZoom: flowOptions?.maxZoom ?? 1.6,
    }),
    [flowOptions]
  );

  const handleNodesChange = (changes) => {
    onNodesChange(changes);
    triggerSave();
  };

  const handleEdgesChange = (changes) => {
    onEdgesChange(changes);
    triggerSave();
  };

  useEffect(() => {
    const handleClick = (event) => {
      const clickedShortcuts = shortcutsRef.current?.contains(event.target);
      const clickedSave = saveRef.current?.contains(event.target);
      const clickedIcon = iconRef.current?.contains(event.target);
      if (clickedShortcuts || clickedSave || clickedIcon) {
        return;
      }
      setShortcutsOpen(false);
      setSaveMenuOpen(false);
      setIconMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isEditingTitle) {
      return;
    }
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditingTitle]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const shortcutItems = [
    { label: "Navigate Canvas", keys: ["Shift", "Arrow Keys"] },
    { label: "Save Project", keys: ["⌘", "S"] },
    { label: "Select All Nodes", keys: ["⌘", "A"] },
    { label: "Delete Selected", keys: ["Del/Backspace"] },
    { label: "Group Selected", keys: ["⌘", "G"] },
    { label: "Ungroup Selected", keys: ["⌘", "Shift", "G"] },
    { label: "Toggle Dev Mode", keys: ["⌘", "D"] },
    { label: "Run Pipeline", keys: ["⌘", "Enter"] },
  ];

  const saveLabel = autosaveEnabled
    ? saveState === "saving"
      ? "Saving"
      : "Saved"
    : "Save";

  const saveIcon = autosaveEnabled
    ? saveState === "saving"
      ? "cloud-upload"
      : "cloud-done"
    : "save";

  return (
    <div className="rr-canvas">
      <div className="rr-canvas__overlay">
        {/* Header stays fixed to the canvas viewport while the graph pans/zooms. */}
        <header className="rr-canvas-header">
          <div className="rr-canvas-header__left">
            <div className="rr-project-icon" ref={iconRef}>
              <button
                type="button"
                className="rr-project-icon__button"
                onClick={() => {
                  setIconMenuOpen((value) => !value);
                  setShortcutsOpen(false);
                  setSaveMenuOpen(false);
                }}
                aria-label="Project icon"
                style={{
                  "--rr-icon-url": `url(${iconUrl(projectIcon)})`,
                  "--rr-icon-color": projectIconColor,
                }}
              >
                <span className="rr-project-icon__glyph" aria-hidden="true" />
              </button>
              {iconMenuOpen && (
                <div className="rr-canvas-popover rr-canvas-popover--icon">
                  <div className="rr-canvas-popover__header">
                    <span>Project Icon</span>
                  </div>
                  <div className="rr-icon-grid">
                    {iconNames.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`rr-icon-grid__item ${
                          projectIcon === icon ? "is-active" : ""
                        }`}
                        onClick={() => {
                          setProjectIcon(icon);
                          triggerSave();
                        }}
                      >
                        <img src={iconUrl(icon)} alt="" />
                      </button>
                    ))}
                  </div>
                  <div className="rr-icon-color">
                    <span className="rr-icon-color__label">Accent</span>
                    <div className="rr-icon-color__swatches">
                      {[
                        "#ff8a3c",
                        "#c76530",
                        "#6fcf97",
                        "#f2c94c",
                        "#8b5cf6",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`rr-icon-color__swatch ${
                            projectIconColor === color ? "is-active" : ""
                          }`}
                          style={{ background: color }}
                          onClick={() => {
                            setProjectIconColor(color);
                            triggerSave();
                          }}
                          aria-label={`Set icon color to ${color}`}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={projectIconColor}
                      onChange={(event) => {
                        setProjectIconColor(event.target.value);
                        triggerSave();
                      }}
                      aria-label="Custom icon color"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="rr-project-title">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  className="rr-project-title__input"
                  value={projectTitle}
                  onChange={(event) => setProjectTitle(event.target.value)}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    if (!projectTitle.trim()) {
                      setProjectTitle("Untitled project");
                    }
                    triggerSave();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setIsEditingTitle(false);
                      triggerSave();
                    }
                    if (event.key === "Escape") {
                      setProjectTitle(previousTitleRef.current);
                      setIsEditingTitle(false);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className={`rr-project-title__button ${
                    titleHovered ? "is-hovered" : ""
                  }`}
                  onClick={() => {
                    previousTitleRef.current = projectTitle;
                    setIsEditingTitle(true);
                  }}
                  onMouseEnter={() => setTitleHovered(true)}
                  onMouseLeave={() => setTitleHovered(false)}
                >
                  {projectTitle}
                </button>
              )}
            </div>
          </div>

          <div className="rr-canvas-header__right">
            <div className="rr-canvas-header__menu" ref={shortcutsRef}>
              <button
                type="button"
                className="rr-canvas-header__button"
                onClick={() => {
                  setShortcutsOpen((value) => !value);
                  setSaveMenuOpen(false);
                  setIconMenuOpen(false);
                }}
              >
                <img src={iconUrl("keyboard")} alt="" />
                Shortcuts
              </button>
              {shortcutsOpen && (
                <div className="rr-canvas-popover rr-canvas-popover--shortcuts">
                  <div className="rr-canvas-popover__header">
                    Keyboard Shortcuts
                  </div>
                  <div className="rr-shortcuts">
                    {shortcutItems.map((item) => (
                      <div key={item.label} className="rr-shortcut">
                        <span>{item.label}</span>
                        <span className="rr-shortcut__keys">
                          {item.keys.map((key, index) => (
                            <span key={`${item.label}-${index}`} className="rr-kbd">
                              {key}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="button" className="rr-canvas-header__button">
              <img src={iconUrl("arrows-vertical")} alt="" />
              Import/Export
            </button>

            <div className="rr-canvas-header__menu" ref={saveRef}>
              <button
                type="button"
                className="rr-canvas-header__button"
                onClick={() => {
                  setSaveMenuOpen((value) => !value);
                  setShortcutsOpen(false);
                  setIconMenuOpen(false);
                }}
              >
                <img src={iconUrl(saveIcon)} alt="" />
                {saveLabel}
                <img
                  src={iconUrl("chevron-down")}
                  alt=""
                  className="rr-canvas-header__caret"
                />
              </button>
              {saveMenuOpen && (
                <div className="rr-canvas-popover rr-canvas-popover--save">
                  <div className="rr-save-row">
                    <span>Autosave</span>
                    <label className="rr-toggle">
                      <input
                        type="checkbox"
                        checked={autosaveEnabled}
                        onChange={(event) => {
                          setAutosaveEnabled(event.target.checked);
                          setSaveState("saved");
                        }}
                      />
                      Enabled
                    </label>
                  </div>
                  <button
                    type="button"
                    className="rr-canvas-popover__action"
                    onClick={() => setSaveMenuOpen(false)}
                  >
                    Save As
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Bottom toolbar stays fixed in viewport; actions are UI-only for now. */}
        <div className="rr-canvas-toolbar">
          {[
            { id: "add-node", label: "Add Node", icon: "add-box", primary: true },
            { id: "add-comment", label: "Add Comment", icon: "note" },
            { id: "log-history", label: "Log History", icon: "clock" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rr-canvas-tool ${item.primary ? "is-primary" : ""}`}
              data-tooltip={item.label}
            >
              <img src={iconUrl(item.icon)} alt="" />
            </button>
          ))}
          <div className="rr-canvas-toolbar__divider" />
          <button
            type="button"
            className="rr-canvas-tool"
            data-tooltip={nodesLocked ? "Unlock Nodes" : "Lock Nodes"}
            onClick={() => setNodesLocked((value) => !value)}
          >
            <img
              src={iconUrl(nodesLocked ? "lock" : "lock-open")}
              alt=""
            />
          </button>
          <button
            type="button"
            className="rr-canvas-tool"
            data-tooltip="Fit View"
            onClick={() => reactFlowInstance?.fitView({ padding: 0.2 })}
          >
            <img src={iconUrl("scale")} alt="" />
          </button>
          <button
            type="button"
            className="rr-canvas-tool"
            data-tooltip="Zoom Out"
            onClick={() => reactFlowInstance?.zoomOut()}
          >
            <img src={iconUrl("zoom-out")} alt="" />
          </button>
          <button
            type="button"
            className="rr-canvas-tool"
            data-tooltip="Zoom In"
            onClick={() => reactFlowInstance?.zoomIn()}
          >
            <img src={iconUrl("zoom-in")} alt="" />
          </button>
          <button
            type="button"
            className="rr-canvas-tool"
            data-tooltip="Undo"
          >
            <img src={iconUrl("undo")} alt="" />
          </button>
          <button
            type="button"
            className="rr-canvas-tool"
            data-tooltip="Redo"
          >
            <img src={iconUrl("redo")} alt="" />
          </button>
        </div>
      </div>
      <ReactFlow
        nodes={decoratedNodes}
        edges={decoratedEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        onPaneClick={() => setSelectedEdgeId(null)}
        onNodeClick={() => setSelectedEdgeId(null)}
        fitView={options.fitView}
        minZoom={options.minZoom}
        maxZoom={options.maxZoom}
        nodesDraggable={!nodesLocked}
        nodesConnectable={!nodesLocked}
        onInit={setReactFlowInstance}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} color="rgba(255,255,255,0.05)" />
      </ReactFlow>
    </div>
  );
}
