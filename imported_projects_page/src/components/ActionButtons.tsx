import React from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAltOutlined';
export function ActionButtons() {
  return <div className="flex items-center space-x-2">
      <button className="flex items-center px-3 py-2 bg-white border border-gray-200 text-gray-500 text-sm font-medium rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff9200] focus:ring-offset-1 whitespace-nowrap">
        <FilterAltIcon className="w-3.5 h-3.5 mr-2" />
        Filter
      </button>
    </div>;
}