import React, { useState } from 'react';
import CheckIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';
export type ColumnConfig = {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean; // Some columns can't be hidden
};
type ColumnCustomizerProps = {
  columns: ColumnConfig[];
  onUpdate: (columns: ColumnConfig[]) => void;
};
export function ColumnCustomizer({
  columns,
  onUpdate
}: ColumnCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleColumn = (id: string) => {
    const updated = columns.map(col => col.id === id && !col.locked ? {
      ...col,
      visible: !col.visible
    } : col);
    onUpdate(updated);
  };
  return <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 bg-white border border-gray-200 text-gray-500 text-sm font-medium rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff9200] focus:ring-offset-1 whitespace-nowrap">
        <ViewColumnIcon className="w-3.5 h-3.5 mr-2" />
        Columns
      </button>

      {isOpen && <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Customize Columns
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <CloseIcon className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="px-2 py-2 space-y-1">
                {columns.map(column => <button key={column.id} onClick={() => toggleColumn(column.id)} disabled={column.locked} className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${column.locked ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                    <span className="text-gray-700 font-medium">
                      {column.label}
                    </span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${column.visible ? 'bg-[#ff9200] border-[#ff9200]' : 'border-gray-300'}`}>
                      {column.visible && <CheckIcon fontSize="inherit" className="w-1.5 h-1.5 text-white" style={{ transform: 'scale(1.05)' }} />}
                    </div>
                  </button>)}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Drag column headers to reorder. Some columns cannot be hidden.
              </p>
            </div>
          </div>
        </>}
    </div>;
}