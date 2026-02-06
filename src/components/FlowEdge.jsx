import { EdgeLabelRenderer, getBezierPath } from "reactflow";

const TRASH_ICON_URL =
  "https://unpkg.com/pixelarticons@1.8.0/svg/trash.svg";

export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isActive = data?.isHovered || data?.isSelected;
  const isPipelineEdge = data?.isPipelineEdge;
  const isPipelineStep = data?.isPipelineStep;
  const isLocked = data?.isLocked;

  return (
    <>
      <path
        id={id}
        className={[
          "rr-flow-edge-path",
          isActive ? "is-active" : "",
          isPipelineEdge ? "is-pipeline" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {isPipelineStep && (
        // Streaming overlay uses a dash animation to mimic light traveling.
        <path
          className="rr-flow-edge-path rr-flow-edge-path--stream"
          d={edgePath}
          markerEnd={markerEnd}
        />
      )}
      <EdgeLabelRenderer>
        {(data?.isHovered || data?.isSelected) && !isLocked && (
          <div
            className="rr-flow-edge__actions"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={
                data?.isSelected
                  ? "rr-flow-edge__delete is-selected"
                  : "rr-flow-edge__delete"
              }
              onClick={() => data?.onDelete?.(id)}
              aria-label="Delete connection"
            >
              <img src={TRASH_ICON_URL} alt="" className="rr-flow-edge__delete-icon" />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
