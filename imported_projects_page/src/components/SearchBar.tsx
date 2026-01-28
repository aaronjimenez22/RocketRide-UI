import React from 'react';
import SearchIcon from '@mui/icons-material/SearchOutlined';
type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};
export function SearchBar({
  value,
  onChange
}: SearchBarProps) {
  return <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
      </div>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded text-sm placeholder-gray-500 focus:outline-none focus:border-[#ff9200] focus:ring-1 focus:ring-[#ff9200] bg-white text-[#666666]" placeholder="Search on Projects" />
    </div>;
}