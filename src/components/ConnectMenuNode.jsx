import { useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position } from "reactflow";
import { iconUrl, getIconForKey } from "../utils/iconLibrary";

export default function ConnectMenuNode({ id, data }) {
  const {
    categories,
    activeCategory,
    onSelectCategory,
    onClose,
    nodesByCategory,
    onPickNode,
    getDescription,
    compatibleNodes,
  } = data;

  const visibleNodes = nodesByCategory[activeCategory] ?? [];
  const headerTitle = activeCategory;
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

  const isCompatible = (node) =>
    activeCategory === "Recommended" ||
    (compatibleNodes ? compatibleNodes.has(node) : false);

  return (
    <div className="rr-connect-menu-node">
      <Handle
        id={placeholderId ? `${id}:${placeholderId}` : undefined}
        type="target"
        position={Position.Left}
        className="rr-connect-menu-node__handle"
      />
      <div className="rr-connect-menu-node__header">
        <h3>{headerTitle}</h3>
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
      <div className="rr-connect-menu-node__categories">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            className={`rr-connect-menu-node__category ${
              activeCategory === category.label ? "is-active" : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectCategory?.(category.label);
            }}
            aria-label={category.label}
          >
            <img src={iconUrl(category.icon)} alt="" />
          </button>
        ))}
      </div>
      <div className="rr-connect-menu-node__list">
        <div className="rr-connect-menu-node__section">
          <h4>{activeCategory}</h4>
          {visibleNodes.length === 0 && (
            <span className="rr-connect-menu-node__empty">
              No compatible nodes
            </span>
          )}
          {visibleNodes.map((node) => (
            <button
              key={`${activeCategory}-${node}`}
              type="button"
              className={`rr-connect-menu-node__item ${
                isCompatible(node) ? "" : "is-disabled"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                if (!isCompatible(node)) {
                  return;
                }
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
        </div>
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
