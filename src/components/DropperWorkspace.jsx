import { useMemo, useRef, useState } from "react";
import { iconUrl } from "../utils/iconLibrary";

const TAB_META = {
  markdown: { label: "Markdown", icon: "article" },
  text: { label: "Text", icon: "art-text" },
  table: { label: "Table", icon: "grid" },
  json: { label: "JSON", icon: "code" },
  image: { label: "Image", icon: "image" },
  video: { label: "Video", icon: "video" },
};

const STATUS_LABELS = {
  uploading: "Uploading...",
  completed: "Completed",
  error: "Error",
};

const formatBytes = (value) => {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  const rounded = size >= 100 || index === 0 ? Math.round(size) : size.toFixed(1);
  return `${rounded} ${units[index]}`;
};

const renderContent = (tab, payload) => {
  if (!payload) {
    return (
      <div className="rr-dropper-workspace__empty">
        <p className="rr-empty-title">No extracted content</p>
        <p>Select another tab or upload a supported file.</p>
      </div>
    );
  }

  if (tab === "table") {
    return (
      <div className="rr-dropper-workspace__table-wrap">
        <table className="rr-table">
          <thead>
            <tr>
              {payload.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payload.rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "image") {
    return (
      <div className="rr-dropper-preview rr-dropper-preview--image">
        <img src={payload.src} alt={payload.alt} />
      </div>
    );
  }

  if (tab === "video") {
    return (
      <div className="rr-dropper-preview rr-dropper-preview--video">
        <div className="rr-dropper-preview__poster">
          <img src={payload.poster} alt={payload.title} />
          <span className="rr-dropper-preview__play">
            <img src={iconUrl("play")} alt="" />
          </span>
        </div>
        <div className="rr-dropper-preview__meta">
          <strong>{payload.title}</strong>
          <span>{payload.duration}</span>
          <p>{payload.description}</p>
        </div>
      </div>
    );
  }

  return <pre className="rr-dropper-workspace__code">{payload}</pre>;
};

export default function DropperWorkspace({
  workspace,
  activeTab,
  onTabChange,
  onAddFiles,
  onSelectFile,
  onDeleteFile,
  onCopy,
  onDownload,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);
  const files = workspace?.files ?? [];
  const selectedFile = useMemo(
    () => files.find((file) => file.id === workspace?.selectedFileId) ?? files[0] ?? null,
    [files, workspace]
  );
  const completedCount = files.filter((file) => file.status === "completed").length;
  const activePayload = selectedFile?.extracted?.[activeTab];
  const availableTabs = selectedFile?.availableTabs ?? [];

  const handleFiles = (list) => {
    const nextFiles = Array.from(list ?? []);
    if (!nextFiles.length) return;
    onAddFiles(nextFiles);
    setIsDragActive(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const dropzoneState =
    files.length === 0
      ? isDragActive
        ? "dragging"
        : "idle"
      : completedCount === files.length
        ? "complete"
        : "processing";

  return (
    <div className="rr-dropper-workspace">
      <div className="rr-dropper-workspace__column rr-dropper-workspace__column--left">
        <div
          className={`rr-dropper-zone is-${dropzoneState}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget.contains(event.relatedTarget)) return;
            setIsDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="rr-dropper-zone__input"
            onChange={(event) => handleFiles(event.target.files)}
          />
          {dropzoneState === "processing" || dropzoneState === "complete" ? (
            <>
              <span className="rr-dropper-zone__icon">
                <img src={iconUrl("loader")} alt="" />
              </span>
              <h2>{dropzoneState === "complete" ? "Files Ready" : "Processing Files..."}</h2>
              <p>
                {completedCount} out of {files.length} completed
              </p>
              <button
                type="button"
                className="rr-button rr-button--ghost rr-dropper-zone__cta"
                onClick={() => inputRef.current?.click()}
              >
                Add more files
              </button>
            </>
          ) : (
            <>
              <span className="rr-dropper-zone__icon">
                <img src={iconUrl("upload")} alt="" />
              </span>
              <h2>{isDragActive ? "Drop files to upload them" : "Drop files or click"}</h2>
              <p>Documents, images, and media supported.</p>
              <button
                type="button"
                className="rr-button rr-button--primary rr-dropper-zone__cta"
                onClick={() => inputRef.current?.click()}
              >
                Drop files
              </button>
            </>
          )}
        </div>
        <div className="rr-dropper-workspace__list">
          {files.length === 0 ? (
            <div className="rr-empty">
              <p className="rr-empty-title">No files uploaded</p>
              <p>Add files to start the simulated Dropper flow.</p>
            </div>
          ) : (
            files.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  className={`rr-dropper-file ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectFile(file.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectFile(file.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="rr-dropper-file__header">
                    <div className="rr-dropper-file__icon">
                      <span>{file.extension?.toUpperCase() ?? "FILE"}</span>
                    </div>
                    <div className="rr-dropper-file__meta">
                      <strong>{file.name}</strong>
                      <span>
                        {formatBytes(file.loadedBytes)} of {formatBytes(file.size)}
                        <span className="rr-dropper-file__dot" />
                        <span
                          className={`rr-dropper-file__status rr-dropper-file__status--${file.status}`}
                        >
                          {STATUS_LABELS[file.status] ?? file.status}
                        </span>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="rr-dropper-file__delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      aria-label={`Delete ${file.name}`}
                    >
                      <img src={iconUrl("trash")} alt="" />
                    </button>
                  </div>
                  {file.status !== "completed" && (
                    <div className="rr-dropper-file__progress">
                      <span style={{ width: `${Math.max(4, file.progress ?? 0)}%` }} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="rr-dropper-workspace__column rr-dropper-workspace__column--right">
        <div className="rr-dropper-workspace__header">
          <div className="rr-dropper-workspace__tabs">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rr-dropper-workspace__tab ${activeTab === tab ? "is-active" : ""}`}
                onClick={() => onTabChange(tab)}
              >
                <img src={iconUrl(TAB_META[tab]?.icon ?? "file")} alt="" />
                {TAB_META[tab]?.label ?? tab}
              </button>
            ))}
          </div>
          <div className="rr-dropper-workspace__actions">
            <button
              type="button"
              className="rr-button rr-button--ghost"
              onClick={onCopy}
              disabled={!selectedFile || selectedFile.status !== "completed" || !activePayload}
            >
              <img src={iconUrl("copy")} alt="" />
              Copy
            </button>
            <button
              type="button"
              className="rr-button rr-button--ghost"
              onClick={onDownload}
              disabled={!selectedFile || selectedFile.status !== "completed" || !activePayload}
            >
              <img src={iconUrl("download")} alt="" />
              Download
            </button>
          </div>
        </div>
        <div className="rr-dropper-workspace__content">
          {!selectedFile ? (
            <div className="rr-empty">
              <p className="rr-empty-title">Select a file</p>
              <p>Uploaded files will appear on the left and their extracted results will show here.</p>
            </div>
          ) : selectedFile.status !== "completed" ? (
            <div className="rr-empty">
              <p className="rr-empty-title">Parsing in progress</p>
              <p>{selectedFile.name} is still being processed.</p>
            </div>
          ) : (
            renderContent(activeTab, activePayload)
          )}
        </div>
      </div>
    </div>
  );
}
