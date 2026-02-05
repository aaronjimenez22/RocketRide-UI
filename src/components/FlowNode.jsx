import { memo, useMemo, useState } from "react";
import { Handle, Position } from "reactflow";

// Layout constants for the node card and connection rows.
const HEADER_HEIGHT = 30;
const PORT_ROW_HEIGHT = 30;
const PORT_SECTION_PADDING = 12;
// Visible dot size vs draggable hitbox size.
const PORT_DOT_SIZE = 32;
const PORT_HITBOX_SIZE = 55;

// A single port row that renders label + connection anchor/handle.
function FlowPort({
  nodeId,
  port,
  isHovered,
  isAnyHovered,
  isActive,
  isConnected,
  isEligible,
  onHoverStart,
  onHoverEnd,
  onActivate,
}) {
  // Output ports render label before anchor; inputs render label after.
  const isOutput = port.type === "output";
  // Label styling reacts to hover and port type.
  const labelClassName = [
    "rr-flow-port__label",
    isHovered ? "is-highlighted" : "",
    isAnyHovered && !isHovered ? "is-dimmed" : "",
    isOutput ? "is-output" : "is-input",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[
        "rr-flow-port",
        isOutput ? "rr-flow-port--output" : "rr-flow-port--input",
        isHovered ? "is-hovered" : "",
        isActive ? "is-active" : "",
        isConnected ? "is-connected" : "",
        isEligible ? "is-eligible" : "",
        port.isPlaceholder ? "is-placeholder" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Output labels sit to the left of the anchor */}
      {isOutput && port.label && (
        <span className={labelClassName}>{port.label}</span>
      )}
      <div
        className="rr-flow-port__anchor nodrag"
        style={{
          width: PORT_HITBOX_SIZE,
          height: PORT_HITBOX_SIZE,
          "--rr-port-dot-size": `${PORT_DOT_SIZE}px`,
          "--rr-port-hitbox-size": `${PORT_HITBOX_SIZE}px`,
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Visual connection point */}
        <div className="rr-flow-port__dot" aria-hidden="true">
          <span className="rr-flow-port__plus">+</span>
        </div>
        {/* Connection handle overlays the anchor for drag-to-connect.
            Note: connection line origin uses the handle's DOM bounds. */}
        <Handle
          id={`${nodeId}:${port.id}`}
          type={isOutput ? "source" : "target"}
          position={isOutput ? Position.Right : Position.Left}
          className="rr-flow-port__handle nodrag"
          // Force the handle to be centered on the dot (not the node edge).
          style={{
            left: "50%",
            top: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
          }}
          onClick={(event) => {
            event.stopPropagation();
            onActivate(port.id);
          }}
        />
      </div>
      {/* Input labels sit to the right of the anchor */}
      {!isOutput && port.label && (
        <span className={labelClassName}>{port.label}</span>
      )}
    </div>
  );
}

// React Flow node renderer (card, menu, and ports).
function FlowNode({ id, data }) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);
  const [titleHovered, setTitleHovered] = useState(false);
  const [hoveredPortId, setHoveredPortId] = useState(null);
  const [activePortId, setActivePortId] = useState(null);

  // Menu remains visible when opened even if node hover leaves.
  const showMenu = isHovered || menuOpen;
  const inputs = data.inputs ?? [];
  const outputs = data.outputs ?? [];
  const connectedPorts = data.connectedPorts ?? new Set();
  const highlightInputLabel = data.highlightInputLabel;

  const handleMenuAction = (action) => {
    console.log(`${action} clicked for node ${id}`);
    setMenuOpen(false);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!editedTitle.trim()) {
      setEditedTitle(data.title);
    }
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      setIsEditingTitle(false);
    }
    if (event.key === "Escape") {
      setEditedTitle(data.title);
      setIsEditingTitle(false);
    }
  };

  // CSS variables allow the layout to be tweaked in CSS.
  const styleVars = useMemo(
    () => ({
      "--rr-node-header-height": `${HEADER_HEIGHT}px`,
      "--rr-node-port-row-height": `${PORT_ROW_HEIGHT}px`,
      "--rr-node-port-padding": `${PORT_SECTION_PADDING}px`,
    }),
    []
  );

  return (
    <div
      className={[
        "rr-flow-node",
        showMenu ? "is-hovered" : "",
        data.state ? `is-${data.state}` : "",
        // Enable to visualize hitbox/handle bounds for debugging alignment.
        data.debugHandles ? "is-debug" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={styleVars}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredPortId(null);
      }}
    >
      {/* Top-right node menu */}
      <div className="rr-flow-node__menu">
        <button
          type="button"
          className="rr-flow-node__menu-button nodrag"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          aria-label="Open node menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>
        {menuOpen && (
          <div className="rr-flow-node__menu-pop nodrag">
            <button
              type="button"
              className="rr-flow-node__menu-item"
              onClick={() => handleMenuAction("Copy")}
            >
              <span>Copy</span>
              <span className="rr-flow-node__menu-kbd">⌘ C</span>
            </button>
            <button
              type="button"
              className="rr-flow-node__menu-item"
              onClick={() => handleMenuAction("Duplicate")}
            >
              <span>Duplicate</span>
              <span className="rr-flow-node__menu-kbd">⌘ D</span>
            </button>
            <button
              type="button"
              className="rr-flow-node__menu-item"
              onClick={() => handleMenuAction("Help")}
            >
              Help
            </button>
            <div className="rr-flow-node__menu-divider" />
            <button
              type="button"
              className="rr-flow-node__menu-item is-danger"
              onClick={() => handleMenuAction("Delete")}
            >
              <span>Delete</span>
              <span className="rr-flow-node__menu-kbd">Del</span>
            </button>
          </div>
        )}
      </div>

      {/* Header contains icon + title/meta */}
      <div className="rr-flow-node__header">
        <div className="rr-flow-node__icon">
          {data.iconSrc ? (
            <img src={data.iconSrc} alt="" />
          ) : (
            <span className="rr-flow-node__icon-fallback" aria-hidden="true">
              {data.title?.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="rr-flow-node__text">
          {isEditingTitle ? (
            <input
              className="rr-flow-node__title-input nodrag"
              value={editedTitle}
              onChange={(event) => setEditedTitle(event.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className={[
                "rr-flow-node__title-button nodrag",
                titleHovered ? "is-hovered" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onDoubleClick={() => setIsEditingTitle(true)}
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
            >
              {editedTitle}
            </button>
          )}
          {data.meta && <p className="rr-flow-node__meta">{data.meta}</p>}
        </div>
      </div>

      {/* Ports are split into input (left) and output (right) columns */}
      <div className="rr-flow-node__ports">
        <div className="rr-flow-node__ports-column">
          {inputs.map((input) => (
            <FlowPort
              key={input.id}
              nodeId={id}
              port={input}
              isHovered={hoveredPortId === input.id}
              isAnyHovered={hoveredPortId !== null}
              isActive={activePortId === input.id}
              isConnected={connectedPorts.has(`${id}:${input.id}`)}
              isEligible={
                highlightInputLabel && highlightInputLabel === input.label
              }
              onHoverStart={() => setHoveredPortId(input.id)}
              onHoverEnd={() => setHoveredPortId(null)}
              onActivate={(portId) =>
                setActivePortId((prev) => (prev === portId ? null : portId))
              }
            />
          ))}
        </div>
        <div className="rr-flow-node__ports-column">
          {outputs.map((output) => (
            <FlowPort
              key={output.id}
              nodeId={id}
              port={output}
              isHovered={hoveredPortId === output.id}
              isAnyHovered={hoveredPortId !== null}
              isActive={activePortId === output.id}
              isConnected={connectedPorts.has(`${id}:${output.id}`)}
              onHoverStart={() => setHoveredPortId(output.id)}
              onHoverEnd={() => setHoveredPortId(null)}
              onActivate={(portId) =>
                setActivePortId((prev) => (prev === portId ? null : portId))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(FlowNode);
