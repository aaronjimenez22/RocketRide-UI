import React, { useState } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import { StateBadge } from './StateBadge';
import type { ColumnConfig } from './ColumnCustomizer';
import { ColumnArrowDown, ColumnArrowUp } from './SortIcons';
import aparaviIcon from '../../icons/aparavi.png';
import attlasianIcon from '../../icons/attlasian.png';
import classificationIcon from '../../icons/classification.png';
import dragNDropIcon from '../../icons/dragndrop.png';
import driveIcon from '../../icons/drive.png';
import gmailIcon from '../../icons/gmail.png';
import outlookIcon from '../../icons/outlook.svg';
import webhookIcon from '../../icons/webhook.png';
export type RunStatus = 'success' | 'failure' | 'warning';
export type RunDetail = {
  status: RunStatus;
  timestamp: Date;
  duration: number;
};
export type Project = {
  id: string;
  name: string;
  nodes: string[];
  extraNodes?: number;
  status: 'Running' | 'Inactive';
  lastRuns: RunDetail[];
  cost: number;
  dateCreated: Date;
  lastModified: Date;
  description: string;
  dataProcessed: string;
  filesUploaded: number;
};
type SortField = 'name' | 'cost' | 'dateCreated' | 'lastModified' | 'filesUploaded' | 'dataProcessed' | 'status' | null;
type SortDirection = 'asc' | 'desc';
type ProjectTableProps = {
  projects: Project[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  columns: ColumnConfig[];
  onReorderColumns: (columns: ColumnConfig[]) => void;
};
const NodeChip = ({
  type,
  index,
  total
}: {
  type: string;
  index: number;
  total: number;
}) => {
  const baseClass = 'w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center ring-2 ring-white';
  const iconClass = 'w-4 h-4 object-contain';
  const style = {
    zIndex: total - index
  };
  const nodeAssets: Record<string, {
    src: string;
    alt: string;
    bgClass?: string;
  }> = {
    clipboard: {
      src: classificationIcon,
      alt: 'Classification',
      bgClass: 'bg-amber-50 border-amber-100'
    },
    folder: {
      src: driveIcon,
      alt: 'Drive',
      bgClass: 'bg-green-50 border-green-100'
    },
    link: {
      src: webhookIcon,
      alt: 'Webhook',
      bgClass: 'bg-blue-50 border-blue-100'
    },
    mail: {
      src: gmailIcon,
      alt: 'Gmail',
      bgClass: 'bg-red-50 border-red-100'
    },
    briefcase: {
      src: attlasianIcon,
      alt: 'Attlasian',
      bgClass: 'bg-indigo-50 border-indigo-100'
    },
    database: {
      src: aparaviIcon,
      alt: 'Aparavi',
      bgClass: 'bg-purple-50 border-purple-100'
    },
    share: {
      src: dragNDropIcon,
      alt: 'Drag and drop',
      bgClass: 'bg-teal-50 border-teal-100'
    },
    default: {
      src: outlookIcon,
      alt: 'Outlook'
    }
  };
  const iconData = nodeAssets[type] ?? nodeAssets.default;
  return <span className={baseClass} style={style}>
      <img src={iconData.src} alt={iconData.alt} className={iconClass} />
    </span>;
};
const Tooltip = ({
  children,
  content,
  variant = 'dark'
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  variant?: 'dark' | 'light';
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isLight = variant === 'light';
  const containerClasses = isLight ? 'bg-white text-gray-700 border border-gray-200 rounded-lg shadow-lg' : 'bg-gray-900 text-white rounded-lg shadow-lg';
  const arrowClasses = isLight ? 'border-t-white' : 'border-t-gray-900';
  return <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className={`${containerClasses} text-xs py-2 px-3 max-w-xs whitespace-nowrap`}>
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className={`border-4 border-transparent ${arrowClasses}`}></div>
            </div>
          </div>
        </div>}
    </div>;
};
const LastRunsVisualization = ({
  runs
}: {
  runs: RunDetail[];
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  const getStatusColor = (status: RunStatus) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failure':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
    }
  };
  const getStatusLabel = (status: RunStatus) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failure':
        return 'Failed';
      case 'warning':
        return 'Warning';
    }
  };
  return <div className="flex items-center gap-1">
      {runs.map((run, index) => <Tooltip key={index} content={<div className="text-left">
              <div className="font-semibold">{getStatusLabel(run.status)}</div>
              <div className="text-gray-300 text-xs mt-0.5">
                {formatDate(run.timestamp)}
              </div>
              <div className="text-gray-300 text-xs">
                {run.duration}s duration
              </div>
            </div>}>
          <div className={`w-2 h-2 rounded-full transition-transform hover:scale-150 cursor-help ${getStatusColor(run.status)}`} />
        </Tooltip>)}
    </div>;
};
const SortableHeader = ({
  label,
  field,
  currentSortField,
  sortDirection,
  onSort
}: {
  label: string;
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) => {
  const isActive = currentSortField === field;
  return <button onClick={() => onSort(field)} className="flex items-center gap-2 text-left w-full hover:text-gray-900 transition-colors group">
      <span>{label}</span>
      <div className="flex flex-col items-center justify-center gap-0 leading-none">
        <div className="flex items-center justify-center w-full">
          <ColumnArrowUp className={`w-2 h-2 ${isActive && sortDirection === 'asc' ? 'text-[#ff9200]' : 'text-gray-400/60'} transition-colors`} />
        </div>
        <div className="flex items-center justify-center w-full">
          <ColumnArrowDown className={`w-2 h-2 ${isActive && sortDirection === 'desc' ? 'text-[#ff9200]' : 'text-gray-400/60'} transition-colors`} />
        </div>
      </div>
    </button>;
};
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};
export function ProjectTable({
  projects,
  sortField,
  sortDirection,
  onSort,
  columns,
  onReorderColumns
}: ProjectTableProps) {
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column?.locked && column.id !== 'nodes') {
      e.preventDefault();
      return;
    }
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find(col => col.id === columnId);
    if (column?.locked && column.id !== 'nodes') return;
    setDragOverColumnId(columnId);
  };
  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      return;
    }
    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (targetColumn?.locked && targetColumn.id !== 'nodes') {
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      return;
    }
    const draggedIndex = columns.findIndex(col => col.id === draggedColumnId);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);
    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);
    onReorderColumns(newColumns);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };
  const handleDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };
  // Render column header based on column config
  const renderColumnHeader = (column: ColumnConfig) => {
    const isDraggable = !column.locked || column.id === 'nodes';
    const baseClasses = 'text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/50';
    const dragClasses = isDraggable ? `cursor-move transition-all ${dragOverColumnId === column.id ? 'bg-blue-50' : ''} ${draggedColumnId === column.id ? 'opacity-50' : ''}` : '';
    const headerProps = isDraggable ? {
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, column.id),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, column.id),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, column.id),
      onDragEnd: handleDragEnd
    } : {};
    const sortableFields: SortField[] = ['cost', 'dateCreated', 'lastModified', 'filesUploaded', 'dataProcessed', 'status'];
    const isSortable = sortableFields.includes(column.id as SortField);
    return <th key={column.id} className={`${baseClasses} ${dragClasses}`} {...headerProps}>
        <div className="flex items-center gap-2">
          {isDraggable && <DragIndicatorIcon fontSize="small" className="w-1.5 h-1.5 text-gray-400" />}
          {isSortable ? <SortableHeader label={column.label.toUpperCase()} field={column.id as SortField} currentSortField={sortField} sortDirection={sortDirection} onSort={onSort} /> : column.label.toUpperCase()}
        </div>
      </th>;
  };
  // Render column cell based on column config
  const cellBaseClasses = 'py-4 px-6 bg-white group-hover:bg-gray-50';
  const renderColumnCell = (column: ColumnConfig, project: Project) => {
    switch (column.id) {
      case 'lastRuns':
        return <td key={column.id} className={cellBaseClasses}>
            <LastRunsVisualization runs={project.lastRuns} />
          </td>;
      case 'cost':
        return <td key={column.id} className={`${cellBaseClasses} text-sm font-semibold text-gray-900`}>
            ${project.cost.toFixed(2)}
          </td>;
      case 'dateCreated':
        return <td key={column.id} className={`${cellBaseClasses} text-sm text-gray-600`}>
            {formatDate(project.dateCreated)}
          </td>;
      case 'lastModified':
        return <td key={column.id} className={`${cellBaseClasses} text-sm text-gray-600`}>
            {formatDate(project.lastModified)}
          </td>;
      case 'description':
        return <td key={column.id} className={`${cellBaseClasses} text-sm text-gray-600 max-w-xs truncate`}>
            {project.description}
          </td>;
      case 'dataProcessed':
        return <td key={column.id} className={`${cellBaseClasses} text-sm text-gray-600`}>
            {project.dataProcessed}
          </td>;
      case 'filesUploaded':
        return <td key={column.id} className={`${cellBaseClasses} text-sm font-medium text-gray-900`}>
            {project.filesUploaded}
          </td>;
      case 'nodes': {
        const MAX_VISIBLE = 5;
        const visibleNodes = project.nodes.slice(0, MAX_VISIBLE);
        const hiddenNodes = project.nodes.slice(MAX_VISIBLE);
        const totalNodes = project.nodes.length + (project.extraNodes ?? 0);
        const hiddenCount = Math.max(0, totalNodes - visibleNodes.length);
        const extraPlaceholders = Math.max(0, hiddenCount - hiddenNodes.length);
        const tooltipNodes = [...hiddenNodes, ...Array(extraPlaceholders).fill('default')];
        const tooltipRows = tooltipNodes.reduce<string[][]>((rows, node, index) => {
          if (index % MAX_VISIBLE === 0) {
            rows.push([]);
          }
          rows[rows.length - 1].push(node);
          return rows;
        }, []);
        return <td key={column.id} className={cellBaseClasses}>
            <div className="flex items-center -space-x-2">
              {visibleNodes.map((node, i) => <NodeChip key={`${project.id}-node-${i}`} type={node} index={i} total={visibleNodes.length} />)}
              {visibleNodes.length === MAX_VISIBLE && hiddenCount > 0 && <Tooltip variant="light" content={<div className="flex flex-col gap-2 p-1">
                      {tooltipRows.map((row, rowIndex) => <div key={`${project.id}-hidden-row-${rowIndex}`} className="flex items-center -space-x-2">
                          {row.map((node, nodeIndex) => <NodeChip key={`${project.id}-hidden-node-${rowIndex}-${nodeIndex}`} type={node} index={nodeIndex} total={row.length} />)}
                        </div>)}
                    </div>}>
                  <span className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center ring-2 ring-white text-xs font-semibold text-gray-600 ml-1">
                    +{hiddenCount}
                  </span>
                </Tooltip>}
            </div>
          </td>;
      }
      case 'status':
        return <td key={column.id} className={cellBaseClasses}>
            {project.status === 'Running' && <StateBadge />}
          </td>;
      default:
        return null;
    }
  };
  const visibleColumns = columns.filter(col => col.visible && col.id !== 'name');
  return <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100">
              {/* Project Name - Fixed */}
              <th className="sticky left-0 z-20 text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 w-1/4 min-w-[250px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2">
                  <SortableHeader label="PROJECT NAME" field="name" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </div>
              </th>

              {/* Dynamic columns in order */}
              {visibleColumns.map(column => renderColumnHeader(column))}

              <th className="w-12 bg-gray-50/50"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map(project => <tr key={project.id} className="group bg-white hover:bg-gray-50 transition-all duration-150 ease-out cursor-pointer">
                <td className="sticky left-0 z-20 py-4 px-6 text-sm font-semibold text-gray-900 bg-white group-hover:bg-gray-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                  {project.name}
                </td>
                {/* Dynamic columns in order */}
                {visibleColumns.map(column => renderColumnCell(column, project))}

                <td className="py-4 px-4 text-right bg-white group-hover:bg-gray-50">
                  <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100">
                    <MoreVertIcon className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>)}
            {projects.length === 0 && <tr>
                <td colSpan={visibleColumns.length + 2} className="py-12 text-center text-gray-400 text-sm">
                  No projects found.
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>;
}