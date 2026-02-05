import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactFlow, {
  Background,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import FlowNode from "../components/FlowNode";
import FlowEdge from "../components/FlowEdge";
import { iconNames, iconUrl, getIconForKey } from "../utils/iconLibrary";
import { useProjects } from "../state/projectsStore.jsx";
import ConnectMenuNode from "../components/ConnectMenuNode.jsx";

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

const NODE_GROUPS = [
  {
    id: "source",
    label: "Source",
    nodes: [
      "Aparavi Data Catalog",
      "Atlassian Confluence",
      "AWS S3",
      "Azure",
      "Chat",
      "Dropper",
      "Google Gmail - Enterprise",
      "Google Gmail - Personal",
      "Google Drive - Enterprise",
      "Google Drive - Personal",
      "Microsoft OneDrive - Enterprise",
      "Microsoft OneDrive - Personal",
      "Microsoft SharePoint - Enterprise",
      "Object Storage",
      "Microsoft Outlook - Enterprise",
      "Microsoft Outlook - Personal",
      "Aparavi Sample Data",
      "File System Simulator",
      "Slack - Enterprise",
      "Slack - Personal",
      "Web Crawler - FireCrawl",
      "Web Hook",
    ],
  },
  {
    id: "embedding",
    label: "Embedding",
    nodes: ["Embedding - Image", "Embedding - OpenAI", "Embedding - Transformer"],
  },
  {
    id: "llm",
    label: "LLM",
    nodes: [
      "LLM - Anthropic",
      "LLM - Amazon Bedrock",
      "LLM - Deepseek",
      "LLM - Gemini",
      "LLM - IBM Granite",
      "LLM - Mistral AI",
      "LLM - Ollama",
      "LLM - OpenAI",
      "LLM - Perplexity",
      "LLM - VertexAI - Enterprise",
      "LLM - VertexAI - Personal",
      "LLM - xAI",
    ],
  },
  {
    id: "database",
    label: "Database",
    nodes: ["Database - MySQL"],
  },
  {
    id: "image",
    label: "Image",
    nodes: [
      "Image - Cleanup",
      "Image - Mistral Vision",
      "Image - OCR",
      "Image - Thumbnail",
    ],
  },
  {
    id: "preprocessor",
    label: "Preprocessor",
    nodes: [
      "Preprocessor - Chonkie",
      "Preprocessor - Code",
      "Preprocessor - General Text",
      "Preprocessor - LLM",
    ],
  },
  {
    id: "store",
    label: "Store",
    nodes: [
      "Vector Store - Astra DB",
      "Vector Store - Chroma",
      "Vector Store - Milvus",
      "Vector Store - MongoDB Atlas",
      "Vector Store - Pinecone",
      "Vector Store - PostgreSQL",
      "Vector Store - Qdrant",
      "Vector Store - Weaviate",
    ],
  },
  {
    id: "text",
    label: "Text",
    nodes: [
      "Text - Anonymize",
      "Text - Classification",
      "Text - Dictionary",
      "Text - Data Extractor",
      "Text - Prompt",
      "Text - Question",
      "Text - Summarization: LLM",
    ],
  },
  {
    id: "audio",
    label: "Audio",
    nodes: ["Audio - Transcribe"],
  },
  {
    id: "video",
    label: "Video",
    nodes: ["Video - Frame Grabber"],
  },
  {
    id: "data",
    label: "Data",
    nodes: [
      "Data - Fingerprinter",
      "Data - LlamaParse",
      "Data - Parser",
      "Data - Reducto",
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    nodes: [
      "HTTP Results",
      "Return Answers",
      "Return Audio",
      "Return Documents",
      "Return Image",
      "Return Questions",
      "Return Table",
      "Return Text",
      "Return Video",
    ],
  },
];

const NODE_DESCRIPTIONS = new Map([
  ["Aparavi Data Catalog", "Index and manage enterprise data sources."],
  ["AWS S3", "Connect to S3 buckets for ingestion and storage."],
  ["Google Drive - Enterprise", "Read from Drive with admin controls."],
  ["Embedding - OpenAI", "Generate embeddings using OpenAI models."],
  ["LLM - OpenAI", "Call OpenAI models for generative tasks."],
  ["Vector Store - Pinecone", "Store embeddings in Pinecone."],
  ["Text - Classification", "Classify text into labeled categories."],
  ["Audio - Transcribe", "Convert audio to text transcripts."],
  ["Video - Frame Grabber", "Extract frames for downstream processing."],
  ["Return Text", "Return text output to downstream apps."],
]);

const getNodeDescription = (label) =>
  NODE_DESCRIPTIONS.get(label) ??
  "Configure this node to match your pipeline requirements.";

const NODE_IO = new Map([
  ["Aparavi Data Catalog", { inputs: [], outputs: ["Audio", "Data", "Image", "Text", "Video"] }],
  ["Atlassian Confluence", { inputs: [], outputs: ["Data"] }],
  ["AWS S3", { inputs: [], outputs: ["Data"] }],
  ["Azure", { inputs: [], outputs: ["Data"] }],
  ["Chat", { inputs: [], outputs: ["Data"] }],
  ["Dropper", { inputs: [], outputs: ["Data"] }],
  ["Google Gmail - Enterprise", { inputs: [], outputs: ["Data"] }],
  ["Google Gmail - Personal", { inputs: [], outputs: ["Data"] }],
  ["Google Drive - Enterprise", { inputs: [], outputs: ["Data"] }],
  ["Google Drive - Personal", { inputs: [], outputs: ["Data"] }],
  ["Microsoft OneDrive - Enterprise", { inputs: [], outputs: ["Data"] }],
  ["Microsoft OneDrive - Personal", { inputs: [], outputs: ["Data"] }],
  ["Microsoft SharePoint - Enterprise", { inputs: [], outputs: ["Data"] }],
  ["Object Storage", { inputs: [], outputs: ["Data"] }],
  ["Microsoft Outlook - Enterprise", { inputs: [], outputs: ["Data"] }],
  ["Microsoft Outlook - Personal", { inputs: [], outputs: ["Data"] }],
  ["Aparavi Sample Data", { inputs: [], outputs: ["Data"] }],
  ["File System Simulator", { inputs: [], outputs: ["Data"] }],
  ["Slack - Enterprise", { inputs: [], outputs: ["Data"] }],
  ["Slack - Personal", { inputs: [], outputs: ["Data"] }],
  ["Web Crawler - FireCrawl", { inputs: [], outputs: ["Data"] }],
  ["Web Hook", { inputs: [], outputs: ["Data"] }],
  ["Embedding - Image", { inputs: ["Image"], outputs: ["Embedding"] }],
  ["Embedding - OpenAI", { inputs: ["Text"], outputs: ["Embedding"] }],
  ["Embedding - Transformer", { inputs: ["Text"], outputs: ["Embedding"] }],
  ["LLM - Anthropic", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - Amazon Bedrock", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - Deepseek", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - Gemini", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - IBM Granite", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - Mistral AI", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - Ollama", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - OpenAI", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - Perplexity", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - VertexAI - Enterprise", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - VertexAI - Personal", { inputs: ["Text"], outputs: ["Text"] }],
  ["LLM - xAI", { inputs: ["Text"], outputs: ["Text"] }],
  ["Database - MySQL", { inputs: ["Data"], outputs: ["Data"] }],
  ["Image - Cleanup", { inputs: ["Image"], outputs: ["Image"] }],
  ["Image - Mistral Vision", { inputs: ["Image"], outputs: ["Text"] }],
  ["Image - OCR", { inputs: ["Image"], outputs: ["Text"] }],
  ["Image - Thumbnail", { inputs: ["Image"], outputs: ["Image"] }],
  ["Preprocessor - Chonkie", { inputs: ["Data"], outputs: ["Data"] }],
  ["Preprocessor - Code", { inputs: ["Text"], outputs: ["Text"] }],
  ["Preprocessor - General Text", { inputs: ["Text"], outputs: ["Text"] }],
  ["Preprocessor - LLM", { inputs: ["Text"], outputs: ["Text"] }],
  ["Vector Store - Astra DB", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - Chroma", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - Milvus", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - MongoDB Atlas", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - Pinecone", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - PostgreSQL", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - Qdrant", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Vector Store - Weaviate", { inputs: ["Embedding"], outputs: ["Data"] }],
  ["Text - Anonymize", { inputs: ["Text"], outputs: ["Text"] }],
  ["Text - Classification", { inputs: ["Text"], outputs: ["Data"] }],
  ["Text - Dictionary", { inputs: ["Text"], outputs: ["Text"] }],
  ["Text - Data Extractor", { inputs: ["Text"], outputs: ["Data"] }],
  ["Text - Prompt", { inputs: ["Text"], outputs: ["Text"] }],
  ["Text - Question", { inputs: ["Text"], outputs: ["Text"] }],
  ["Text - Summarization: LLM", { inputs: ["Text"], outputs: ["Text"] }],
  ["Audio - Transcribe", { inputs: ["Audio"], outputs: ["Text"] }],
  ["Video - Frame Grabber", { inputs: ["Video"], outputs: ["Image"] }],
  ["Data - Fingerprinter", { inputs: ["Data"], outputs: ["Data"] }],
  ["Data - LlamaParse", { inputs: ["Data"], outputs: ["Audio", "Image", "Table", "Text", "Video"] }],
  ["Data - Parser", { inputs: ["Data"], outputs: ["Audio", "Image", "Table", "Text", "Video"] }],
  ["Data - Reducto", { inputs: ["Data"], outputs: ["Data"] }],
  ["HTTP Results", { inputs: ["Data"], outputs: ["Data"] }],
  ["Return Answers", { inputs: ["Data"], outputs: [] }],
  ["Return Audio", { inputs: ["Audio"], outputs: [] }],
  ["Return Documents", { inputs: ["Data"], outputs: [] }],
  ["Return Image", { inputs: ["Image"], outputs: [] }],
  ["Return Questions", { inputs: ["Data"], outputs: [] }],
  ["Return Table", { inputs: ["Data"], outputs: [] }],
  ["Return Text", { inputs: ["Text"], outputs: [] }],
  ["Return Video", { inputs: ["Video"], outputs: [] }],
]);

const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const makePorts = (labels, kind, base) =>
  labels.map((label, index) => ({
    id: `${kind}-${slugify(base)}-${index}`,
    label,
    type: kind,
  }));

const makePlaceholderPort = (base) => [
  {
    id: `placeholder-${slugify(base)}`,
    label: "",
    type: "input",
    isPlaceholder: true,
  },
];

export default function ProjectsCanvas({ flowOptions, projectId }) {
  const { projects, updateProject } = useProjects();
  const activeProject =
    projects.find((project) => project.id === projectId) ?? projects[0];
  const [nodes, setNodes, onNodesChange] = useNodesState(
    activeProject?.nodes ?? initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    activeProject?.edges ?? initialEdges
  );
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [nodesLocked, setNodesLocked] = useState(false);
  const [connectingLabel, setConnectingLabel] = useState(null);
  const [connectMenu, setConnectMenu] = useState(null);
  const [connectMenuCategory, setConnectMenuCategory] = useState("Recommended");
  const [connectPreview, setConnectPreview] = useState(null);
  const didConnectRef = useRef(false);
  const connectContextRef = useRef(null);
  const connectPreviewRef = useRef(null);
  const suppressPaneClickRef = useRef(0);
  const MENU_NODE_WIDTH = 420;
  const MENU_NODE_HEIGHT = 420;
  const MENU_OFFSET_X = 40;
  const [projectTitle, setProjectTitle] = useState(
    activeProject?.name ?? "Untitled Project"
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [saveState, setSaveState] = useState("saved");
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const [projectIcon, setProjectIcon] = useState(
    activeProject?.icon
      ? activeProject.icon.replace(/.*\/(.+)\.svg/, "$1")
      : "file"
  );
  const [projectIconColor, setProjectIconColor] = useState(
    activeProject?.iconColor ?? "#ff8a3c"
  );
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const [inventoryTooltip, setInventoryTooltip] = useState(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hideTooltipTimer = useRef(null);

  const shortcutsRef = useRef(null);
  const saveRef = useRef(null);
  const iconRef = useRef(null);
  const inventoryRef = useRef(null);
  const saveTimerRef = useRef(null);
  const titleInputRef = useRef(null);
  const previousTitleRef = useRef(projectTitle);


  const triggerSave = useCallback(() => {
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
  }, [autosaveEnabled]);

  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
    setConnectMenu(null);
    setConnectingLabel(null);
    setConnectPreview(null);
    didConnectRef.current = true;
    triggerSave();
  };

  const onConnectStart = () => {
    setSelectedEdgeId(null);
  };

  const handleConnectStart = (_, params) => {
    setSelectedEdgeId(null);
    if (params?.handleType === "source" && params.handleId) {
      didConnectRef.current = false;
      const label = portLabelByHandle.get(params.handleId);
      setConnectingLabel(label ?? null);
      const context = {
        open: true,
        sourceNodeId: params.nodeId,
        sourceHandle: params.handleId,
        outputLabel: label ?? null,
        x: null,
        y: null,
      };
      connectContextRef.current = context;
      setConnectMenu(context);
      setConnectMenuCategory("Recommended");
    }
  };

  const handleConnectEnd = () => {
    if (!connectMenu?.open) return;
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    triggerSave();
  };

  useEffect(() => {
    if (!connectingLabel) return;
    const handleMove = (event) => {
      setConnectPreview({ x: event.clientX, y: event.clientY });
      connectPreviewRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleUp = (event) => {
      if (!didConnectRef.current) {
        const preview = connectPreviewRef.current;
        const x = preview?.x ?? event.clientX;
        const y = preview?.y ?? event.clientY;
        if (x && y) {
          const context = connectContextRef.current ?? {};
          const nextMenu = {
            ...context,
            open: true,
            x,
            y,
          };
          setConnectMenu(nextMenu);
          suppressPaneClickRef.current = Date.now();
        }
      }
      setConnectPreview(null);
      connectPreviewRef.current = null;
      setConnectingLabel(null);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [connectingLabel]);

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
          highlightInputLabel: connectingLabel,
        },
      })),
    [nodes, connectedPorts, connectingLabel]
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

  const nodeTypes = useMemo(
    () => ({ rrNode: FlowNode, rrConnectMenu: ConnectMenuNode }),
    []
  );
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
      const clickedInventory = inventoryRef.current?.contains(event.target);
      if (clickedShortcuts || clickedSave || clickedIcon || clickedInventory) {
        return;
      }
      setShortcutsOpen(false);
      setSaveMenuOpen(false);
      setIconMenuOpen(false);
      setInventoryOpen(false);
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

  useEffect(() => {
    if (!activeProject) return;
    // Only hydrate canvas state when switching projects to avoid drag jitter.
    setNodes(activeProject.nodes ?? []);
    setEdges(activeProject.edges ?? []);
    setProjectTitle(activeProject.name ?? "Untitled Project");
    const iconName = activeProject.icon
      ? activeProject.icon.replace(/.*\/(.+)\.svg/, "$1")
      : "file";
    setProjectIcon(iconName);
    setProjectIconColor(activeProject.iconColor ?? "#ff8a3c");
  }, [projectId]);

  useEffect(() => {
    if (!activeProject) return;
    updateProject(activeProject.id, { nodes, edges });
  }, [nodes, edges, activeProject, updateProject]);

  const filteredGroups = useMemo(() => {
    const query = inventoryQuery.trim().toLowerCase();
    if (!query) {
      return NODE_GROUPS;
    }
    return NODE_GROUPS.map((group) => {
      const nodes = group.nodes.filter((node) =>
        node.toLowerCase().includes(query)
      );
      return { ...group, nodes };
    }).filter((group) => group.nodes.length > 0);
  }, [inventoryQuery]);

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const addInventoryNode = (label, groupId) => {
    const baseX = window.innerWidth * 0.55;
    const baseY = window.innerHeight * 0.5;
    const position = reactFlowInstance
      ? reactFlowInstance.project({
          x: baseX + Math.random() * 120 - 60,
          y: baseY + Math.random() * 120 - 60,
        })
      : { x: baseX, y: baseY };
    const nodeId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nodeIO = NODE_IO.get(label);
    const inputs = nodeIO?.inputs ?? (groupId === "source" ? [] : ["In"]);
    const outputs = nodeIO?.outputs ?? (groupId === "source" ? ["Data"] : ["Out"]);
    const icon = getIconForKey(label);
    const newNode = {
      id: nodeId,
      position,
      type: "rrNode",
      data: {
        title: label,
        iconSrc: icon.url,
        meta: groupId.toUpperCase(),
        inputs: makePorts(inputs, "input", label),
        outputs: makePorts(outputs, "output", label),
      },
    };
    setNodes((prev) => [...prev, newNode]);
    triggerSave();
  };

  const categoryIcons = {
    Recommended: "arrow-right",
    Source: "download",
    Embedding: "stack",
    LLM: "cpu",
    Database: "database",
    Image: "image",
    Preprocessor: "filters",
    Store: "archive",
    Text: "align-left",
    Audio: "volume",
    Video: "video",
    Data: "table",
    Infrastructure: "link",
  };

  const getCompatibleNodes = useMemo(() => {
    if (!connectMenu?.outputLabel) return [];
    const label = connectMenu.outputLabel;
    return NODE_GROUPS.flatMap((group) =>
      group.nodes
        .filter((node) => (NODE_IO.get(node)?.inputs ?? []).includes(label))
        .map((node) => ({ node, group: group.label }))
    );
  }, [connectMenu]);

  const connectMenuGroups = useMemo(
    () =>
      NODE_GROUPS.map((group) => ({
        label: group.label,
        nodes: group.nodes,
      })),
    []
  );

  const recommendedNodes = useMemo(
    () => getCompatibleNodes.slice(0, 4).map((item) => item.node),
    [getCompatibleNodes]
  );

  const connectMenuCategories = useMemo(() => {
    const categories = [{ label: "Recommended", icon: categoryIcons.Recommended }];
    NODE_GROUPS.forEach((group) => {
      categories.push({
        label: group.label,
        icon: getIconForKey(group.label).name,
      });
    });
    return categories;
  }, []);

  const nodesByCategory = useMemo(() => {
    const mapping = { Recommended: recommendedNodes };
    connectMenuGroups.forEach((group) => {
      mapping[group.label] = group.nodes;
    });
    return mapping;
  }, [recommendedNodes, connectMenuGroups]);

  const compatibleNodeSet = useMemo(
    () => new Set(getCompatibleNodes.map((item) => item.node)),
    [getCompatibleNodes]
  );

  const handleSelectConnectNode = useCallback(
    (label) => {
    if (!connectMenu?.outputLabel || !connectMenu?.sourceNodeId) return;
    const outputLabel = connectMenu.outputLabel;
    const baseX = connectMenu.x ?? window.innerWidth * 0.5;
    const baseY = connectMenu.y ?? window.innerHeight * 0.5;
    const position = reactFlowInstance
      ? reactFlowInstance.project({
          x: baseX + 220,
          y: baseY - 60,
        })
      : { x: baseX + 220, y: baseY - 60 };
    const nodeId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const io = NODE_IO.get(label);
    const inputs = io?.inputs ?? [outputLabel];
    const outputs = io?.outputs ?? ["Out"];
    const newNode = {
      id: nodeId,
      position,
      type: "rrNode",
      data: {
        title: label,
        iconSrc: getIconForKey(label).url,
        meta: "NEXT",
        inputs: makePorts(inputs, "input", label),
        outputs: makePorts(outputs, "output", label),
      },
    };
    const targetHandle = `${nodeId}:${newNode.data.inputs[0]?.id ?? ""}`;
    setNodes((prev) => [
      ...prev.filter((node) => node.id !== "connect-menu"),
      newNode,
    ]);
    setEdges((prev) =>
      addEdge(
        {
          source: connectMenu.sourceNodeId,
          sourceHandle: connectMenu.sourceHandle,
          target: nodeId,
          targetHandle,
        },
        prev.filter((edge) => edge.target !== "connect-menu")
      )
    );
    setConnectMenu(null);
    setConnectingLabel(null);
    triggerSave();
    },
    [connectMenu, reactFlowInstance, triggerSave]
  );

  const connectMenuData = useMemo(
    () => ({
      categories: connectMenuCategories,
      activeCategory: connectMenuCategory,
      onSelectCategory: setConnectMenuCategory,
      onClose: () => {
        setConnectMenu(null);
        setConnectingLabel(null);
        setNodes((prev) => prev.filter((node) => node.type !== "rrConnectMenu"));
        setEdges((prev) => prev.filter((edge) => edge.target !== "connect-menu"));
      },
      nodesByCategory,
      onPickNode: handleSelectConnectNode,
      getDescription: getNodeDescription,
      meta: "MENU",
      compatibleNodes: compatibleNodeSet,
    }),
    [
      connectMenuCategories,
      connectMenuCategory,
      nodesByCategory,
      compatibleNodeSet,
      handleSelectConnectNode,
      getNodeDescription,
    ]
  );

  useEffect(() => {
    if (!connectMenu?.open || connectMenu.x === null || connectMenu.y === null) {
      setNodes((prev) => prev.filter((node) => node.type !== "rrConnectMenu"));
      return;
    }
    let shouldAddEdge = false;
    let placeholderId = null;
    const placeholderHandleId = "connect-menu:placeholder-connect-menu";
    setNodes((prev) => {
      const hasMenuNode = prev.some((node) => node.id === "connect-menu");
      if (!hasMenuNode) {
        shouldAddEdge = true;
        const position = reactFlowInstance.project({
          x: connectMenu.x + MENU_OFFSET_X,
          y: connectMenu.y - MENU_NODE_HEIGHT / 2,
        });
        const inputs = makePlaceholderPort("connect-menu");
        placeholderId = inputs[0]?.id ?? null;
        const menuNode = {
          id: "connect-menu",
          type: "rrConnectMenu",
          position,
          draggable: true,
          selectable: true,
          data: connectMenuData,
        };
        menuNode.data.inputs = inputs;
        return [
          ...prev.filter((node) => node.type !== "rrConnectMenu"),
          menuNode,
        ];
      }
      return prev.map((node) =>
        node.id === "connect-menu"
          ? {
              ...node,
              data: connectMenuData,
            }
          : node
      );
    });
    if (shouldAddEdge) {
      if (connectMenu.sourceNodeId && connectMenu.sourceHandle && placeholderId) {
        setEdges((prev) =>
          addEdge(
            {
              source: connectMenu.sourceNodeId,
              sourceHandle: connectMenu.sourceHandle,
              target: "connect-menu",
              targetHandle: `connect-menu:${placeholderId}`,
            },
            prev.filter((edge) => edge.target !== "connect-menu")
          )
        );
      }
      return;
    }
    if (connectMenu.sourceNodeId && connectMenu.sourceHandle) {
      setEdges((prev) =>
        addEdge(
          {
            source: connectMenu.sourceNodeId,
            sourceHandle: connectMenu.sourceHandle,
            target: "connect-menu",
            targetHandle: placeholderHandleId,
          },
          prev.filter((edge) => edge.target !== "connect-menu")
        )
      );
    }
  }, [
    connectMenu,
    connectMenuData,
    reactFlowInstance,
  ]);

  const showInventoryTooltip = (event, label) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (hideTooltipTimer.current) {
      clearTimeout(hideTooltipTimer.current);
    }
    setInventoryTooltip({
      title: label,
      description: getNodeDescription(label),
      rect,
    });
  };

  const hideInventoryTooltip = () => {
    if (hideTooltipTimer.current) {
      clearTimeout(hideTooltipTimer.current);
    }
    hideTooltipTimer.current = setTimeout(() => {
      if (!isTooltipHovered) {
        setInventoryTooltip(null);
      }
    }, 120);
  };

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
                          if (activeProject) {
                            updateProject(activeProject.id, {
                              icon: iconUrl(icon),
                            });
                          }
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
                            if (activeProject) {
                              updateProject(activeProject.id, {
                                iconColor: color,
                              });
                            }
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
                        if (activeProject) {
                          updateProject(activeProject.id, {
                            iconColor: event.target.value,
                          });
                        }
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
                    if (activeProject) {
                      updateProject(activeProject.id, {
                        name: projectTitle.trim() || "Untitled project",
                      });
                    }
                    triggerSave();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setIsEditingTitle(false);
                      if (activeProject) {
                        updateProject(activeProject.id, {
                          name: projectTitle.trim() || "Untitled project",
                        });
                      }
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
              onClick={
                item.id === "add-node"
                  ? () => setInventoryOpen((value) => !value)
                  : undefined
              }
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
      <aside
        ref={inventoryRef}
        className={`rr-node-inventory ${inventoryOpen ? "is-open" : ""}`}
      >
        <div className="rr-node-inventory__header">
          <h2>Node Inventory</h2>
          <button
            type="button"
            className="rr-node-inventory__close"
            onClick={() => setInventoryOpen(false)}
          >
            <img src={iconUrl("close")} alt="" />
          </button>
        </div>
        <div className="rr-node-inventory__search">
          <img src={iconUrl("search")} alt="" />
          <input
            type="text"
            value={inventoryQuery}
            onChange={(event) => setInventoryQuery(event.target.value)}
            placeholder="Search nodes"
          />
        </div>
        <div className="rr-node-inventory__list">
          {filteredGroups.map((group) => {
            const collapsed = collapsedGroups.has(group.id);
            const showNodes = !collapsed || inventoryQuery.trim().length > 0;
            return (
              <div key={group.id} className="rr-node-group">
                <button
                  type="button"
                  className="rr-node-group__toggle"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.label}</span>
                  <img
                    src={iconUrl(collapsed ? "chevron-right" : "chevron-down")}
                    alt=""
                  />
                </button>
                {showNodes && (
                  <div className="rr-node-group__items">
                    {group.nodes.map((node) => {
                      const icon = getIconForKey(node);
                      return (
                        <button
                          key={node}
                          type="button"
                          className="rr-node-item"
                          onClick={() => addInventoryNode(node, group.id)}
                          onMouseEnter={(event) =>
                            showInventoryTooltip(event, node)
                          }
                          onMouseLeave={hideInventoryTooltip}
                        >
                          <span className="rr-node-item__icon">
                            <img src={icon.url} alt="" />
                          </span>
                          <span className="rr-node-item__label">{node}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      {inventoryTooltip &&
        createPortal(
          <div
            className="rr-node-item__tooltip rr-node-item__tooltip--portal"
            style={{
              top: `${inventoryTooltip.rect.top + inventoryTooltip.rect.height / 2}px`,
              left: `${inventoryTooltip.rect.left - 12}px`,
            }}
            onMouseEnter={() => {
              if (hideTooltipTimer.current) {
                clearTimeout(hideTooltipTimer.current);
              }
              setIsTooltipHovered(true);
            }}
            onMouseLeave={() => {
              setIsTooltipHovered(false);
              setInventoryTooltip(null);
            }}
          >
            <span className="rr-node-item__tooltip-title">
              {inventoryTooltip.title}
            </span>
            <span className="rr-node-item__tooltip-body">
              {inventoryTooltip.description}
            </span>
            <span className="rr-node-item__tooltip-doc">
              <img src={iconUrl("file")} alt="" />
              Docs
            </span>
          </div>,
          document.body
        )}
      <ReactFlow
        nodes={decoratedNodes}
        edges={decoratedEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        onPaneClick={() => {
          setSelectedEdgeId(null);
          if (Date.now() - suppressPaneClickRef.current < 200) {
            return;
          }
          setConnectMenu(null);
          setConnectingLabel(null);
          setConnectPreview(null);
        }}
        onNodeClick={() => setSelectedEdgeId(null)}
        fitView={options.fitView}
        minZoom={options.minZoom}
        maxZoom={options.maxZoom}
        nodesDraggable={!nodesLocked}
        nodesConnectable={!nodesLocked}
        onInit={setReactFlowInstance}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} color="rgba(255,255,255,0.08)" />
      </ReactFlow>
      {connectPreview && connectingLabel && (
        <div
          className="rr-connect-preview"
          style={{
            top: connectPreview.y,
            left: connectPreview.x,
          }}
        >
          <span className="rr-connect-preview__label">
            {connectingLabel}
          </span>
        </div>
      )}
    </div>
  );
}
