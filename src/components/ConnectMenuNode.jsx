import { useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position } from "reactflow";
import { iconUrl, getIconForKey } from "../utils/iconLibrary";

export default function ConnectMenuNode({ id, data }) {
  const {
    onClose,
    groupedNodes,
    onPickNode,
    getDescription,
    outputLabel,
  } = data;

  const [tooltip, setTooltip] = useState(null);

  const placeholderId = data?.inputs?.[0]?.id;

  // Use a portal tooltip so it can overflow the node and canvas safely.
  const showTooltip = (event, node) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({ node, rect });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <div className="rr-connect-menu-node">
      <Handle
        id={placeholderId ? `${id}:${placeholderId}` : undefined}
        type="target"
        position={Position.Left}
        className="rr-connect-menu-node__handle"
      />
      <div className="rr-connect-menu-node__header">
        <h3>{outputLabel ? `${outputLabel} Compatible` : "Compatible Nodes"}</h3>
      </div>
      <button
        type="button"
        className="rr-connect-menu-node__close"
        onClick={(event) => {
          event.stopPropagation();
          onClose?.();
        }}
        aria-label="Close menu"
      >
        <img src={iconUrl("close")} alt="" />
      </button>
      <div className="rr-connect-menu-node__list">
        {groupedNodes?.length === 0 && (
          <span className="rr-connect-menu-node__empty">
            No compatible nodes
          </span>
        )}
        {groupedNodes?.map((group) => (
          <section key={group.label} className="rr-connect-menu-node__section">
            <h4>{group.label}</h4>
            {group.nodes.map((node) => (
              <button
                key={`${group.label}-${node}`}
                type="button"
                className="rr-connect-menu-node__item"
                onClick={(event) => {
                  event.stopPropagation();
                  onPickNode?.(node);
                }}
                onMouseEnter={(event) => showTooltip(event, node)}
                onMouseLeave={hideTooltip}
              >
                <span className="rr-connect-menu-node__icon">
                  <img src={getIconForKey(node).url} alt="" />
                </span>
                <span>{node}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
      {tooltip &&
        createPortal(
          <div
            className="rr-connect-menu-node__tooltip rr-connect-menu-node__tooltip--portal"
            style={{
              top: tooltip.rect.top + tooltip.rect.height / 2,
              left: tooltip.rect.right + 12,
            }}
          >
            <span className="rr-node-item__tooltip-title">{tooltip.node}</span>
            <span className="rr-node-item__tooltip-body">
              {getDescription?.(tooltip.node)}
            </span>
            <span className="rr-node-item__tooltip-doc">
              <img src={iconUrl("file")} alt="" />
              Docs
            </span>
          </div>,
          document.body
        )}
    </div>
  );
}
