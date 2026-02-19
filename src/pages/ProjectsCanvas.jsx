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

const getGroupForNode = (label) =>
  NODE_GROUPS.find((group) => group.nodes.includes(label)) ?? null;

const buildConfigSections = (label, groupId) => {
  const sections = [];
  const addSection = (title, fields) => {
    if (fields.length > 0) {
      sections.push({ title, fields });
    }
  };

  const addCommonIdentity = () => {
    addSection("Identity", [
      {
        id: "node-name",
        label: "Node Name",
        type: "text",
        placeholder: label,
        defaultValue: label,
      },
      {
        id: "node-description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe what this node does.",
        defaultValue: getNodeDescription(label),
      },
      {
        id: "node-enabled",
        label: "Enabled",
        type: "toggle",
        defaultChecked: true,
      },
    ]);
  };

  const addAuthSection = () => {
    addSection("Authentication", [
      {
        id: "auth-method",
        label: "Auth Method",
        type: "select",
        options: ["OAuth", "API Key", "Service Account", "None"],
        defaultValue: "OAuth",
      },
      {
        id: "credential-name",
        label: "Credential Set",
        type: "text",
        placeholder: "Select saved credentials",
      },
      {
        id: "refresh-token",
        label: "Auto Refresh Tokens",
        type: "checkbox",
        defaultChecked: true,
      },
    ]);
  };

  const addScheduleSection = () => {
    addSection("Sync", [
      {
        id: "sync-mode",
        label: "Sync Mode",
        type: "select",
        options: ["Continuous", "Hourly", "Daily", "Manual"],
        defaultValue: "Continuous",
      },
      {
        id: "include-archived",
        label: "Include Archived",
        type: "checkbox",
        defaultChecked: false,
      },
      {
        id: "incremental",
        label: "Incremental Updates",
        type: "toggle",
        defaultChecked: true,
      },
    ]);
  };

  const addConnectionSection = (fields) => {
    addSection("Connection", fields);
  };

  addCommonIdentity();

  if (groupId === "source") {
    const connectionFields = [
      {
        id: "endpoint",
        label: "Endpoint / Host",
        type: "text",
        placeholder: "api.company.com",
      },
      {
        id: "path",
        label: "Path / Collection",
        type: "text",
        placeholder: "/shared/documents",
      },
    ];
    if (label.includes("AWS S3")) {
      connectionFields.unshift(
        { id: "bucket", label: "Bucket", type: "text", placeholder: "rr-data" },
        {
          id: "region",
          label: "Region",
          type: "select",
          options: ["us-east-1", "us-west-2", "eu-west-1"],
          defaultValue: "us-east-1",
        }
      );
    }
    if (label.includes("Google Drive")) {
      connectionFields.push({
        id: "drive-id",
        label: "Drive ID",
        type: "text",
        placeholder: "0A1B2C3D4E",
      });
    }
    if (label.includes("Slack")) {
      connectionFields.push({
        id: "channel",
        label: "Channel",
        type: "text",
        placeholder: "#customer-support",
      });
    }
    if (label.includes("Web Hook")) {
      connectionFields.push({
        id: "webhook-url",
        label: "Webhook URL",
        type: "text",
        placeholder: "https://hooks.example.com/",
      });
      connectionFields.push({
        id: "method",
        label: "HTTP Method",
        type: "select",
        options: ["POST", "PUT", "PATCH"],
        defaultValue: "POST",
      });
    }
    addConnectionSection(connectionFields);
    addAuthSection();
    addScheduleSection();
    addSection("Content Filters", [
      {
        id: "include-patterns",
        label: "Include Patterns",
        type: "text",
        placeholder: "*.pdf, *.docx",
      },
      {
        id: "exclude-patterns",
        label: "Exclude Patterns",
        type: "text",
        placeholder: "tmp/*, archive/*",
      },
    ]);
  }

  if (groupId === "embedding") {
    addSection("Embedding Model", [
      {
        id: "embedding-model",
        label: "Model",
        type: "select",
        options: [
          "text-embedding-3-large",
          "text-embedding-3-small",
          "image-embedding-v2",
        ],
        defaultValue: "text-embedding-3-large",
      },
      {
        id: "dimensions",
        label: "Dimensions",
        type: "number",
        placeholder: "1536",
        defaultValue: 1536,
      },
      {
        id: "batch-size",
        label: "Batch Size",
        type: "number",
        placeholder: "64",
        defaultValue: 64,
      },
      {
        id: "normalize",
        label: "Normalize Vectors",
        type: "toggle",
        defaultChecked: true,
      },
    ]);
  }

  if (groupId === "llm") {
    addSection("Model Setup", [
      {
        id: "llm-model",
        label: "Model",
        type: "select",
        options: [
          "gpt-4o",
          "gpt-4o-mini",
          "claude-3.5-sonnet",
          "gemini-1.5-pro",
        ],
        defaultValue: "gpt-4o",
      },
      {
        id: "temperature",
        label: "Temperature",
        type: "number",
        placeholder: "0.3",
        defaultValue: 0.3,
      },
      {
        id: "max-tokens",
        label: "Max Tokens",
        type: "number",
        placeholder: "2048",
        defaultValue: 2048,
      },
      {
        id: "streaming",
        label: "Stream Responses",
        type: "toggle",
        defaultChecked: true,
      },
    ]);
    addSection("Prompting", [
      {
        id: "system-prompt",
        label: "System Prompt",
        type: "textarea",
        placeholder: "You are a helpful assistant...",
      },
      {
        id: "output-format",
        label: "Output Format",
        type: "select",
        options: ["Plain Text", "JSON", "Markdown"],
        defaultValue: "Plain Text",
      },
    ]);
  }

  if (groupId === "database") {
    addSection("Database Connection", [
      { id: "db-host", label: "Host", type: "text", placeholder: "localhost" },
      { id: "db-port", label: "Port", type: "number", placeholder: "3306", defaultValue: 3306 },
      { id: "db-name", label: "Database", type: "text", placeholder: "rocketride" },
      { id: "db-table", label: "Table", type: "text", placeholder: "documents" },
      { id: "db-ssl", label: "Require SSL", type: "toggle", defaultChecked: true },
    ]);
  }

  if (groupId === "image") {
    addSection("Image Processing", [
      {
        id: "resolution",
        label: "Resolution",
        type: "select",
        options: ["Original", "1024px", "2048px"],
        defaultValue: "Original",
      },
      {
        id: "color-space",
        label: "Color Space",
        type: "select",
        options: ["RGB", "Grayscale"],
        defaultValue: "RGB",
      },
      {
        id: "output-format",
        label: "Output Format",
        type: "select",
        options: ["PNG", "JPG", "WEBP"],
        defaultValue: "PNG",
      },
    ]);
  }

  if (groupId === "preprocessor") {
    addSection("Preprocessing", [
      {
        id: "chunk-size",
        label: "Chunk Size",
        type: "number",
        placeholder: "1024",
        defaultValue: 1024,
      },
      {
        id: "overlap",
        label: "Overlap",
        type: "number",
        placeholder: "120",
        defaultValue: 120,
      },
      {
        id: "strategy",
        label: "Strategy",
        type: "select",
        options: ["Semantic", "Recursive", "Fixed"],
        defaultValue: "Semantic",
      },
    ]);
  }

  if (groupId === "store") {
    addSection("Vector Store", [
      {
        id: "index-name",
        label: "Index Name",
        type: "text",
        placeholder: "rr-main",
      },
      {
        id: "namespace",
        label: "Namespace",
        type: "text",
        placeholder: "default",
      },
      {
        id: "metric",
        label: "Distance Metric",
        type: "select",
        options: ["cosine", "dot", "euclidean"],
        defaultValue: "cosine",
      },
      {
        id: "upsert-policy",
        label: "Upsert Policy",
        type: "select",
        options: ["Merge", "Overwrite", "Skip Existing"],
        defaultValue: "Merge",
      },
      {
        id: "ttl",
        label: "Retention (days)",
        type: "number",
        placeholder: "90",
        defaultValue: 90,
      },
    ]);
  }

  if (groupId === "text") {
    addSection("Text Operation", [
      {
        id: "language",
        label: "Language",
        type: "select",
        options: ["Auto", "English", "Spanish", "French"],
        defaultValue: "Auto",
      },
      {
        id: "output-format",
        label: "Output Format",
        type: "select",
        options: ["Text", "JSON", "Markdown"],
        defaultValue: "Text",
      },
    ]);
    if (label.includes("Classification")) {
      addSection("Classification", [
        {
          id: "labels",
          label: "Labels",
          type: "text",
          placeholder: "Finance, Legal, Support",
        },
        {
          id: "threshold",
          label: "Confidence Threshold",
          type: "number",
          placeholder: "0.7",
          defaultValue: 0.7,
        },
      ]);
    }
    if (label.includes("Summarization")) {
      addSection("Summarization", [
        {
          id: "summary-length",
          label: "Summary Length",
          type: "select",
          options: ["Short", "Medium", "Long"],
          defaultValue: "Medium",
        },
        {
          id: "bullet-points",
          label: "Bullet Points",
          type: "toggle",
          defaultChecked: true,
        },
      ]);
    }
    if (label.includes("Question")) {
      addSection("Questions", [
        {
          id: "question-count",
          label: "Number of Questions",
          type: "number",
          placeholder: "5",
          defaultValue: 5,
        },
      ]);
    }
    if (label.includes("Anonymize")) {
      addSection("Anonymization", [
        {
          id: "entities",
          label: "Entities",
          type: "text",
          placeholder: "PII, SSN, Address",
        },
      ]);
    }
    if (label.includes("Prompt")) {
      addSection("Prompt", [
        {
          id: "prompt-template",
          label: "Prompt Template",
          type: "textarea",
          placeholder: "Rewrite the text in a friendly tone...",
        },
      ]);
    }
    if (label.includes("Dictionary")) {
      addSection("Dictionary", [
        {
          id: "terms",
          label: "Terms",
          type: "textarea",
          placeholder: "term1=definition1",
        },
      ]);
    }
    if (label.includes("Data Extractor")) {
      addSection("Schema", [
        {
          id: "schema",
          label: "Extraction Schema",
          type: "textarea",
          placeholder: "{ name: string, date: string }",
        },
      ]);
    }
  }

  if (groupId === "audio") {
    addSection("Audio Settings", [
      {
        id: "language",
        label: "Language",
        type: "select",
        options: ["Auto", "English", "Spanish"],
        defaultValue: "Auto",
      },
      {
        id: "diarization",
        label: "Speaker Diarization",
        type: "toggle",
        defaultChecked: true,
      },
      {
        id: "timestamps",
        label: "Word Timestamps",
        type: "checkbox",
        defaultChecked: false,
      },
    ]);
  }

  if (groupId === "video") {
    addSection("Frame Extraction", [
      {
        id: "fps",
        label: "Frames per Second",
        type: "number",
        placeholder: "1",
        defaultValue: 1,
      },
      {
        id: "max-frames",
        label: "Max Frames",
        type: "number",
        placeholder: "300",
        defaultValue: 300,
      },
    ]);
  }

  if (groupId === "data") {
    addSection("Parsing", [
      {
        id: "output-type",
        label: "Output Types",
        type: "select",
        options: ["Auto", "Text", "Table", "JSON"],
        defaultValue: "Auto",
      },
      {
        id: "detect-language",
        label: "Detect Language",
        type: "toggle",
        defaultChecked: true,
      },
    ]);
  }

  if (groupId === "infrastructure") {
    addSection("Response", [
      {
        id: "return-type",
        label: "Return Type",
        type: "select",
        options: ["Text", "Image", "Table", "Audio", "Video", "Documents"],
        defaultValue: "Text",
      },
      {
        id: "http-status",
        label: "HTTP Status",
        type: "number",
        placeholder: "200",
        defaultValue: 200,
      },
      {
        id: "headers",
        label: "Headers",
        type: "textarea",
        placeholder: "Content-Type: application/json",
      },
    ]);
  }

  addSection("Advanced", [
    {
      id: "retries",
      label: "Retry Attempts",
      type: "number",
      placeholder: "2",
      defaultValue: 2,
    },
    {
      id: "timeout",
      label: "Timeout (seconds)",
      type: "number",
      placeholder: "30",
      defaultValue: 30,
    },
    {
      id: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Internal notes for this node.",
    },
  ]);

  return sections;
};

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
    activeProject?.iconColor ?? "#ffffff"
  );
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [viewport, setViewport] = useState({ zoom: 1 });
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const [inventoryTooltip, setInventoryTooltip] = useState(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [pipelineRuns, setPipelineRuns] = useState(
    () => activeProject?.pipelineRuns ?? []
  );
  const [sourceRunStates, setSourceRunStates] = useState({});
  const [pipelineEdgeIds, setPipelineEdgeIds] = useState([]);
  const [activeEdgeId, setActiveEdgeId] = useState(null);
  const runTimersRef = useRef({ loading: null, stopping: null, step: null });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(420);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(320);
  const [drawerTab, setDrawerTab] = useState("output");
  const [drawerRange, setDrawerRange] = useState("1m");
  const hideTooltipTimer = useRef(null);
  const didDragNodeRef = useRef(false);
  const isResizingRef = useRef(false);
  const drawerResizingRef = useRef(false);

  const shortcutsRef = useRef(null);
  const saveRef = useRef(null);
  const iconRef = useRef(null);
  const inventoryRef = useRef(null);
  const configRef = useRef(null);
  const drawerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const titleInputRef = useRef(null);
  const previousTitleRef = useRef(projectTitle);

  // Reset per-project analytics/run state when switching projects.
  useEffect(() => {
    setPipelineRuns(activeProject?.pipelineRuns ?? []);
    setSourceRunStates({});
    setPipelineEdgeIds([]);
    setActiveEdgeId(null);
    setSelectedNodeId(null);
    setDrawerOpen(false);
    setDrawerTab("output");
  }, [activeProject?.id]);

  useEffect(() => {
    return () => {
      if (runTimersRef.current.loading) {
        clearTimeout(runTimersRef.current.loading);
      }
      if (runTimersRef.current.stopping) {
        clearTimeout(runTimersRef.current.stopping);
      }
      if (runTimersRef.current.step) {
        clearInterval(runTimersRef.current.step);
      }
    };
  }, []);

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

  const isPipelineLocked = useMemo(
    () => Object.values(sourceRunStates).some((state) => state && state !== "idle"),
    [sourceRunStates]
  );
  const isCanvasLocked = nodesLocked || isPipelineLocked;

  const buildPipeline = useCallback(
    (sourceId) => {
      const visited = new Set([sourceId]);
      const edgeIds = [];
      const nodeIds = [sourceId];
      const queue = [sourceId];
      while (queue.length) {
        const current = queue.shift();
        edges
          .filter((edge) => edge.source === current)
          .forEach((edge) => {
            edgeIds.push(edge.id);
            if (!visited.has(edge.target)) {
              visited.add(edge.target);
              nodeIds.push(edge.target);
              queue.push(edge.target);
            }
          });
      }
      return { edgeIds, nodeIds };
    },
    [edges]
  );

  const stopPipelineAnimation = useCallback(() => {
    if (runTimersRef.current.step) {
      clearInterval(runTimersRef.current.step);
      runTimersRef.current.step = null;
    }
    setActiveEdgeId(null);
  }, []);

  const startPipelineAnimation = useCallback(
    (edgeIds, durationMs) => {
      stopPipelineAnimation();
      if (!edgeIds.length) return;
      let index = 0;
      const stepDuration = Math.max(450, durationMs / edgeIds.length);
      setActiveEdgeId(edgeIds[index]);
      runTimersRef.current.step = setInterval(() => {
        index += 1;
        if (index >= edgeIds.length) {
          stopPipelineAnimation();
          return;
        }
        setActiveEdgeId(edgeIds[index]);
      }, stepDuration);
    },
    [stopPipelineAnimation]
  );

  const handleRunPipeline = useCallback(
    (sourceId) => {
      // Simulate a pipeline run from the chosen source node.
      const currentState = sourceRunStates[sourceId] ?? "idle";
      const isAnyRunning = Object.values(sourceRunStates).some(
        (state) => state && state !== "idle"
      );
      if (currentState === "loading") return;
      if (currentState === "idle" && isAnyRunning) return;

      const runDuration = 5000;

      if (currentState === "stopped") {
        setSourceRunStates((prev) => ({ ...prev, [sourceId]: "loading" }));
        if (runTimersRef.current.stopping) {
          clearTimeout(runTimersRef.current.stopping);
        }
        runTimersRef.current.stopping = setTimeout(() => {
          setSourceRunStates((prev) => ({ ...prev, [sourceId]: "idle" }));
          setPipelineEdgeIds([]);
          stopPipelineAnimation();
        }, runDuration);
        return;
      }

      const pipeline = buildPipeline(sourceId);
      setPipelineEdgeIds(pipeline.edgeIds);
      startPipelineAnimation(pipeline.edgeIds, runDuration);
      setConnectMenu(null);
      setConnectingLabel(null);
      setConnectPreview(null);
      setSourceRunStates((prev) => ({ ...prev, [sourceId]: "loading" }));

      if (runTimersRef.current.loading) {
        clearTimeout(runTimersRef.current.loading);
      }
      runTimersRef.current.loading = setTimeout(() => {
        setSourceRunStates((prev) => ({ ...prev, [sourceId]: "stopped" }));
        stopPipelineAnimation();
      }, runDuration);

      const newRun = {
        id: `run-${Date.now()}`,
        timestamp: new Date(),
        duration: runDuration / 1000,
        nodes: pipeline.nodeIds.length,
        edges: pipeline.edgeIds.length,
        status: "success",
        throughput: Math.floor(40 + Math.random() * 140),
        filesProcessed: Math.floor(50 + Math.random() * 300),
      };
      setPipelineRuns((prev) => {
        const next = [newRun, ...prev];
        if (activeProject) {
          updateProject(activeProject.id, { pipelineRuns: next });
        }
        return next;
      });
    },
    [
      activeProject,
      buildPipeline,
      sourceRunStates,
      startPipelineAnimation,
      stopPipelineAnimation,
      updateProject,
    ]
  );

  // Persist new edge connections and clear any transient menu/preview state.
  const onConnect = (connection) => {
    if (isCanvasLocked) return;
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

  // Capture the source handle and enable the menu preview while dragging a connection.
  const handleConnectStart = (_, params) => {
    if (isCanvasLocked) return;
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

  // Track pointer while dragging a connection to show a menu preview.
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
      nodes.map((node) => {
        const isSourceNode =
          node.data?.isSource || node.data?.meta?.toLowerCase() === "source";
        return {
          ...node,
          data: {
            ...node.data,
            connectedPorts,
            highlightInputLabel: connectingLabel,
            runState: isSourceNode
              ? sourceRunStates[node.id] ?? "idle"
              : undefined,
            onRun: isSourceNode ? handleRunPipeline : undefined,
          },
        };
      }),
    [nodes, connectedPorts, connectingLabel, sourceRunStates, handleRunPipeline]
  );

  const pipelineEdgeSet = useMemo(
    () => new Set(pipelineEdgeIds),
    [pipelineEdgeIds]
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
          isPipelineEdge: pipelineEdgeSet.has(edge.id),
          isPipelineStep: edge.id === activeEdgeId,
          isLocked: isCanvasLocked,
          onDelete: handleDeleteEdge,
        },
      })),
    [
      edges,
      hoveredEdgeId,
      selectedEdgeId,
      pipelineEdgeSet,
      activeEdgeId,
      isCanvasLocked,
    ]
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
    setProjectIconColor(activeProject.iconColor ?? "#ffffff");
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
    if (isCanvasLocked) return;
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
        isSource: groupId === "source",
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

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const selectedNodeGroup = useMemo(() => {
    if (!selectedNode?.data?.title) return null;
    return getGroupForNode(selectedNode.data.title);
  }, [selectedNode]);

  const selectedConfigSections = useMemo(() => {
    if (!selectedNode?.data?.title || !selectedNodeGroup) return [];
    return buildConfigSections(selectedNode.data.title, selectedNodeGroup.id);
  }, [selectedNode, selectedNodeGroup]);

  const isSourceLikeNode = useCallback((node) => {
    if (!node) return false;
    const meta = String(node.data?.meta ?? "").toLowerCase();
    const inputs = node.data?.inputs ?? [];
    return node.data?.isSource || meta === "source" || inputs.length === 0;
  }, []);

  const resolvedRuntimeContext = useMemo(() => {
    if (!selectedNodeId) return null;
    const selected = nodes.find((node) => node.id === selectedNodeId);
    if (!selected) return null;

    if (isSourceLikeNode(selected)) {
      const pipeline = buildPipeline(selected.id);
      return {
        selectedNode: selected,
        sourceNode: selected,
        pipelineNodeIds: pipeline.nodeIds,
        pipelineEdgeIds: pipeline.edgeIds,
      };
    }

    const visited = new Set([selected.id]);
    const queue = [selected.id];
    let upstreamSource = null;
    while (queue.length && !upstreamSource) {
      const current = queue.shift();
      const incoming = edges.filter((edge) => edge.target === current);
      incoming.forEach((edge) => {
        if (visited.has(edge.source)) return;
        visited.add(edge.source);
        const sourceNode = nodes.find((node) => node.id === edge.source);
        if (sourceNode && isSourceLikeNode(sourceNode)) {
          upstreamSource = sourceNode;
          return;
        }
        queue.push(edge.source);
      });
    }

    const sourceNode = upstreamSource ?? selected;
    const pipeline = buildPipeline(sourceNode.id);
    return {
      selectedNode: selected,
      sourceNode,
      pipelineNodeIds: pipeline.nodeIds,
      pipelineEdgeIds: pipeline.edgeIds,
    };
  }, [selectedNodeId, nodes, edges, buildPipeline, isSourceLikeNode]);

  const runtimeSourceState = useMemo(() => {
    const sourceId = resolvedRuntimeContext?.sourceNode?.id;
    if (!sourceId) return "idle";
    return sourceRunStates[sourceId] ?? "idle";
  }, [resolvedRuntimeContext, sourceRunStates]);

  const pipelineStepIndex = useMemo(() => {
    if (!resolvedRuntimeContext?.pipelineEdgeIds?.length || !activeEdgeId) {
      return -1;
    }
    return resolvedRuntimeContext.pipelineEdgeIds.indexOf(activeEdgeId);
  }, [resolvedRuntimeContext, activeEdgeId]);

  const drawerLogs = useMemo(() => {
    if (!resolvedRuntimeContext) return [];
    const base = resolvedRuntimeContext.selectedNode?.data?.title ?? "Node";
    return [
      {
        level: "info",
        message: `${base}: initialized execution context`,
      },
      {
        level: "warn",
        message: `${base}: waiting for upstream payload`,
      },
      {
        level: runtimeSourceState === "idle" ? "info" : "error",
        message:
          runtimeSourceState === "idle"
            ? `${base}: no active run in progress`
            : `${base}: transient network jitter detected`,
      },
    ];
  }, [resolvedRuntimeContext, runtimeSourceState]);

  const metricsSeries = useMemo(() => {
    const baseRuns = pipelineRuns.slice(0, 16).reverse();
    const factor = drawerRange === "1m" ? 6 : drawerRange === "5m" ? 3 : drawerRange === "15m" ? 2 : 1;
    return baseRuns.map((run, index) => ({
      id: run.id ?? `metric-${index}`,
      throughput: Math.max(0, Math.round((run.throughput ?? 0) / factor)),
      cpu: Math.min(100, Math.round(((run.throughput ?? 0) / 2) % 100)),
      memory: Math.min(1, Number((((run.filesProcessed ?? 0) % 100) / 100).toFixed(2))),
    }));
  }, [pipelineRuns, drawerRange]);

  const renderConfigField = (field) => {
    if (field.type === "select") {
      return (
        <div className="rr-select-wrapper">
          <select className="rr-select" defaultValue={field.defaultValue}>
            {field.options.map((option) => (
              <option key={`${field.id}-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (field.type === "textarea") {
      return (
        <textarea
          className="rr-input rr-node-panel__textarea"
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          rows={3}
        />
      );
    }
    if (field.type === "checkbox") {
      return (
        <label className="rr-checkbox">
          <input type="checkbox" defaultChecked={field.defaultChecked} />
          <span>{field.label}</span>
        </label>
      );
    }
    if (field.type === "toggle") {
      return (
        <label className="rr-toggle">
          <input type="checkbox" defaultChecked={field.defaultChecked} />
          {field.label}
        </label>
      );
    }
    return (
      <input
        className="rr-input"
        type={field.type === "number" ? "number" : "text"}
        placeholder={field.placeholder}
        defaultValue={field.defaultValue}
      />
    );
  };

  useEffect(() => {
    const handleMove = (event) => {
      if (!isResizingRef.current) return;
      const nextWidth = Math.max(
        320,
        Math.min(560, window.innerWidth - event.clientX)
      );
      setPanelWidth(nextWidth);
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
    const onMove = (event) => {
      if (!drawerResizingRef.current || !drawerRef.current) return;
      const rect = drawerRef.current.getBoundingClientRect();
      const nextHeight = Math.max(220, Math.min(560, rect.bottom - event.clientY));
      setDrawerHeight(nextHeight);
      setDrawerOpen(true);
    };
    const onUp = () => {
      if (!drawerResizingRef.current) return;
      drawerResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Create the next node from the connect menu and wire it to the source output.
  const handleSelectConnectNode = useCallback(
    (label) => {
    if (!connectMenu?.outputLabel || !connectMenu?.sourceNodeId) return;
    const outputLabel = connectMenu.outputLabel;
    const baseX = connectMenu.x ?? window.innerWidth * 0.5;
    const baseY = connectMenu.y ?? window.innerHeight * 0.5;
    const menuNode = nodes.find((node) => node.id === "connect-menu");
    const position = menuNode
      ? { ...menuNode.position }
      : reactFlowInstance
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
    [connectMenu, nodes, reactFlowInstance, triggerSave]
  );

  // Data payload passed to the connect menu node. Keep this stable to avoid re-mounts.
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

  // Spawn (or update) the connect menu node on the canvas and keep its edge wired.
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

  const latestRun = pipelineRuns[0] ?? null;
  const avgDuration = pipelineRuns.length
    ? Math.round(
        pipelineRuns.reduce((sum, run) => sum + run.duration, 0) /
          pipelineRuns.length
      )
    : 0;
  const avgThroughput = pipelineRuns.length
    ? Math.round(
        pipelineRuns.reduce((sum, run) => sum + (run.throughput ?? 0), 0) /
          pipelineRuns.length
      )
    : 0;

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
        <div
          className="rr-canvas-toolbar"
          style={{
            "--rr-toolbar-offset": `${drawerOpen ? drawerHeight + 16 : 24}px`,
          }}
        >
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
                  ? () => {
                      if (isCanvasLocked) return;
                      setInventoryOpen((value) => !value);
                    }
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
      {/* Pipeline builder view: inventory, canvas, node config panel, and runtime drawer. */}
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
          setConfigOpen(false);
          setSelectedNodeId(null);
        }}
        onNodeClick={(_, node) => {
          setSelectedEdgeId(null);
          if (didDragNodeRef.current) {
            didDragNodeRef.current = false;
            return;
          }
          if (node.type !== "rrNode") {
            return;
          }
          setSelectedNodeId(node.id);
          setConfigOpen(true);
          setDrawerOpen(true);
          setInventoryOpen(false);
        }}
        onNodeDragStart={() => {
          didDragNodeRef.current = false;
        }}
        onNodeDrag={() => {
          didDragNodeRef.current = true;
        }}
        onNodeDragStop={() => {
          window.setTimeout(() => {
            didDragNodeRef.current = false;
          }, 0);
        }}
        fitView={options.fitView}
        minZoom={options.minZoom}
        maxZoom={options.maxZoom}
        nodesDraggable={!isCanvasLocked}
        nodesConnectable={!isCanvasLocked}
        onInit={setReactFlowInstance}
        onMove={(_, nextViewport) => setViewport(nextViewport)}
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
            width: MENU_NODE_WIDTH * (viewport.zoom ?? 1),
            height: MENU_NODE_HEIGHT * (viewport.zoom ?? 1),
            transform: `translate(${MENU_OFFSET_X * (viewport.zoom ?? 1)}px, -50%)`,
          }}
        >
          <span className="rr-connect-preview__icon" aria-hidden="true" />
        </div>
      )}
      {selectedNode && (
        <aside
          ref={configRef}
          className={`rr-node-panel ${configOpen ? "is-open" : ""}`}
          style={{ width: `${panelWidth}px` }}
        >
          <button
            type="button"
            className="rr-node-panel__resize"
            aria-label="Resize panel"
            onMouseDown={(event) => {
              event.preventDefault();
              isResizingRef.current = true;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
          />
          <div className="rr-node-panel__header">
            <div className="rr-node-panel__title">
              <div className="rr-node-panel__icon">
                {selectedNode.data?.iconSrc ? (
                  <img src={selectedNode.data.iconSrc} alt="" />
                ) : (
                  <span className="rr-node-panel__icon-fallback">
                    {selectedNode.data?.title?.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="rr-node-panel__heading">
                <span className="rr-node-panel__name">
                  {selectedNode.data?.title}
                </span>
                <span className="rr-node-panel__meta">
                  {selectedNodeGroup?.label ?? "Node"}
                </span>
              </div>
            </div>
            <div className="rr-node-panel__actions">
              <button
                type="button"
                className="rr-node-panel__icon-button"
                aria-label="Open docs"
              >
                <img src={iconUrl("book")} alt="" />
              </button>
              <button
                type="button"
                className="rr-node-panel__icon-button"
                onClick={() => {
                  setConfigOpen(false);
                  setSelectedNodeId(null);
                }}
                aria-label="Close config"
              >
                <img src={iconUrl("close")} alt="" />
              </button>
            </div>
          </div>
          <div className="rr-node-panel__body">
            <div className="rr-node-panel__summary">
              {getNodeDescription(selectedNode.data?.title)}
            </div>
            {selectedConfigSections.map((section) => (
              <div key={section.title} className="rr-node-panel__section">
                <span className="rr-node-panel__section-title">
                  {section.title}
                </span>
                <div className="rr-node-panel__section-content">
                  {section.fields.map((field) => (
                    <div key={field.id} className="rr-config-row">
                      <div className="rr-config-row__label">
                        <p className="rr-config-row__title">{field.label}</p>
                        {field.helper && (
                          <p className="rr-helper">{field.helper}</p>
                        )}
                      </div>
                      <div className="rr-node-panel__control">
                        {renderConfigField(field)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
      <section
        ref={drawerRef}
        className={`rr-node-console ${drawerOpen ? "is-open" : "is-collapsed"}`}
        style={{ "--rr-drawer-height": `${drawerHeight}px` }}
      >
        <button
          type="button"
          className="rr-node-console__resize"
          aria-label="Resize runtime drawer"
          onMouseDown={(event) => {
            event.preventDefault();
            drawerResizingRef.current = true;
            document.body.style.cursor = "ns-resize";
            document.body.style.userSelect = "none";
          }}
        />
        <header className="rr-node-console__header">
          <div className="rr-node-console__context">
            <strong>
              {resolvedRuntimeContext?.selectedNode?.data?.title ?? "Node Console"}
            </strong>
            <span>
              Source: {resolvedRuntimeContext?.sourceNode?.data?.title ?? "Select a node"}
            </span>
          </div>
          <button
            type="button"
            className="rr-node-console__toggle"
            onClick={() => setDrawerOpen((value) => !value)}
          >
            <img src={iconUrl(drawerOpen ? "chevron-down" : "chevron-up")} alt="" />
          </button>
        </header>
        <div className="rr-node-console__tabs" role="tablist" aria-label="Node runtime tabs">
          {[
            { id: "output", label: "Output" },
            { id: "run", label: "Run" },
            { id: "log", label: "Log" },
            { id: "metrics", label: "Metrics" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rr-node-console__tab ${drawerTab === tab.id ? "is-active" : ""}`}
              onClick={() => {
                setDrawerTab(tab.id);
                if (!drawerOpen) setDrawerOpen(true);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="rr-node-console__body">
          {!resolvedRuntimeContext ? (
            <div className="rr-node-console__empty">
              Select a node to inspect output, run, logs, and metrics.
            </div>
          ) : drawerTab === "output" ? (
            <div className="rr-node-console__panel">
              <div className="rr-node-console__stats">
                <span>MIME: application/json</span>
                <span>Records: {latestRun?.filesProcessed ?? 0}</span>
                <span>
                  Last updated: {latestRun ? new Date(latestRun.timestamp).toLocaleTimeString() : "N/A"}
                </span>
              </div>
              <pre className="rr-node-console__code">{`{\n  \"node\": \"${resolvedRuntimeContext.selectedNode.data?.title}\",\n  \"source\": \"${resolvedRuntimeContext.sourceNode.data?.title}\",\n  \"status\": \"${runtimeSourceState}\",\n  \"preview\": \"Sample output payload\" \n}`}</pre>
            </div>
          ) : drawerTab === "run" ? (
            <div className="rr-node-console__panel">
              <div className="rr-node-console__status-row">
                <span className={`rr-badge rr-badge--${runtimeSourceState === "idle" ? "warning" : "success"}`}>
                  {runtimeSourceState === "idle" ? "Idle" : "Running"}
                </span>
                <span>Avg Duration: {avgDuration}s</span>
                <span>Avg Throughput: {avgThroughput} files/min</span>
              </div>
              <div className="rr-node-console__timeline">
                {pipelineRuns.slice(0, 5).map((run) => (
                  <div key={run.id} className="rr-node-console__timeline-item">
                    <span>{new Date(run.timestamp).toLocaleTimeString()}</span>
                    <span>{run.duration}s</span>
                    <span>{run.throughput ?? 0} files/min</span>
                  </div>
                ))}
              </div>
            </div>
          ) : drawerTab === "log" ? (
            <div className="rr-node-console__panel">
              <div className="rr-node-console__log-filters">
                <span className="rr-pill">All</span>
                <span className="rr-pill">Warnings</span>
                <span className="rr-pill">Errors</span>
              </div>
              <div className="rr-node-console__logs">
                {drawerLogs.map((item, index) => (
                  <div key={`${item.level}-${index}`} className="rr-node-console__log-item">
                    <span className={`rr-badge rr-badge--${item.level === "error" ? "failure" : item.level === "warn" ? "warning" : "success"}`}>
                      {item.level.toUpperCase()}
                    </span>
                    <span>{new Date().toLocaleTimeString()}</span>
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rr-node-console__panel">
              <div className="rr-node-console__status-strip">
                <span
                  className={`rr-node-console__dot ${runtimeSourceState === "idle" ? "" : "is-online"}`}
                />
                <strong>{runtimeSourceState === "idle" ? "Offline" : "Online"}</strong>
                <span>{runtimeSourceState === "idle" ? "Not running" : "Running"}</span>
              </div>
              <div className="rr-node-console__metric-range">
                {[
                  ["1m", "1 min"],
                  ["5m", "5 min"],
                  ["15m", "15 min"],
                  ["all", "All"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`rr-node-console__range-btn ${drawerRange === key ? "is-active" : ""}`}
                    onClick={() => setDrawerRange(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="rr-node-console__chart">
                <svg viewBox="0 0 700 220" preserveAspectRatio="none">
                  <polyline
                    points={metricsSeries
                      .map((point, index) => {
                        const x = metricsSeries.length <= 1 ? 0 : (index / (metricsSeries.length - 1)) * 700;
                        const y = 200 - Math.min(180, point.throughput);
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="rgba(var(--color-accent-primary-rgb), 0.9)"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="rr-node-console__flow">
                <h4>Pipeline Flow</h4>
                <div className="rr-node-console__flow-steps">
                  {resolvedRuntimeContext.pipelineNodeIds.map((nodeId, index) => {
                    const node = nodes.find((item) => item.id === nodeId);
                    return (
                      <span
                        key={nodeId}
                        className={`rr-node-console__flow-step ${
                          pipelineStepIndex >= index - 1 ? "is-active" : ""
                        }`}
                      >
                        {node?.data?.title ?? nodeId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
