import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import FlowNode from "../components/FlowNode";
import FlowEdge from "../components/FlowEdge";
import driveIcon from "../assets/project-icons/drive.png";
import classificationIcon from "../assets/project-icons/classification.png";
import openAiIcon from "../assets/project-icons/openAI.png";
import webhookIcon from "../assets/project-icons/webhook.png";

const initialNodes = [
  {
    id: "source",
    position: { x: 100, y: 120 },
    type: "rrNode",
    data: {
      title: "Data Source",
      iconSrc: driveIcon,
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
      iconSrc: driveIcon,
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
      iconSrc: classificationIcon,
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
      iconSrc: classificationIcon,
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
      iconSrc: openAiIcon,
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
      iconSrc: openAiIcon,
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
      iconSrc: webhookIcon,
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
      iconSrc: webhookIcon,
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

  const onConnect = (connection) =>
    setEdges((eds) => addEdge(connection, eds));

  const onConnectStart = () => {
    setSelectedEdgeId(null);
  };

  const handleDeleteEdge = (edgeId) =>
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));

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

  return (
    <div className="rr-canvas">
      <ReactFlow
        nodes={decoratedNodes}
        edges={decoratedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
      >
        <Background gap={24} size={1} color="rgba(255,255,255,0.05)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
