import { memo, useMemo, useState } from "react";
import { Handle, Position } from "reactflow";

const HEADER_HEIGHT = 64;
const PORT_ROW_HEIGHT = 44;
const PORT_SECTION_PADDING = 12;
const PORT_DOT_SIZE = 32;
const PORT_HITBOX_SIZE = 55;

function FlowPort({
  nodeId,
  port,
  isHovered,
  isAnyHovered,
  isActive,
  isConnected,
  onHoverStart,
  onHoverEnd,
  onActivate,
}) {
  const isOutput = port.type === "output";
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
        "rr-flow-port nodrag",
        isOutput ? "rr-flow-port--output" : "rr-flow-port--input",
        isHovered ? "is-hovered" : "",
        isActive ? "is-active" : "",
        isConnected ? "is-connected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {isOutput && <span className={labelClassName}>{port.label}</span>}
      <div
        className="rr-flow-port__anchor nodrag"
        style={{
          width: PORT_HITBOX_SIZE,
          height: PORT_HITBOX_SIZE,
          "--rr-port-dot-size": `${PORT_DOT_SIZE}px`,
          "--rr-port-hitbox-size": `${PORT_HITBOX_SIZE}px`,
        }}
      >
        <div className="rr-flow-port__dot" aria-hidden="true">
          <span className="rr-flow-port__plus">+</span>
        </div>
        {/* Connection handle overlays the anchor for drag-to-connect */}
        <Handle
          id={`${nodeId}:${port.id}`}
          type={isOutput ? "source" : "target"}
          position={isOutput ? Position.Right : Position.Left}
          className="rr-flow-port__handle nodrag"
          onClick={(event) => {
            event.stopPropagation();
            onActivate(port.id);
          }}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
        />
      </div>
      {!isOutput && <span className={labelClassName}>{port.label}</span>}
    </div>
  );
}

function FlowNode({ id, data }) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);
  const [titleHovered, setTitleHovered] = useState(false);
  const [hoveredPortId, setHoveredPortId] = useState(null);
  const [activePortId, setActivePortId] = useState(null);

  const showMenu = isHovered || menuOpen;
  const inputs = data.inputs ?? [];
  const outputs = data.outputs ?? [];
  const connectedPorts = data.connectedPorts ?? new Set();

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
