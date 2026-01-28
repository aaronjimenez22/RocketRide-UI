import React from 'react';
import AutorenewIcon from '@mui/icons-material/AutorenewOutlined';
export function StateBadge() {
  return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#ff9200] text-[#ff9200] text-[14px] font-semibold justify-center bg-[#fff1e1]">
      <AutorenewIcon className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '1.25s' }} />
      Running...
    </span>;
}