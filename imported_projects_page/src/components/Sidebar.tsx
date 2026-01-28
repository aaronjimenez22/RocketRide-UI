import React, { useState } from 'react';
import HelpIcon from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import FolderIcon from '@mui/icons-material/FolderOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};
export function Sidebar({
  isOpen,
  toggleSidebar
}: SidebarProps) {
  const navItems = [{
    icon: HomeIcon,
    label: 'Home',
    active: false
  }, {
    icon: FolderIcon
  }];
  const bottomItems = [{
    icon: SettingsIcon,
    label: 'Settings'
  }, {
    icon: HelpIcon,
    label: 'Help'
  }];
  return <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar Container */}
      <nav className={`fixed lg:static inset-y-0 left-0 z-30 w-[56px] bg-white border-r border-gray-200 flex flex-col items-center py-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="mb-8 p-2">
          <img src="/Group_47522.png" alt="Logo" className="w-8 h-8" />
        </div>

        {/* Main Navigation */}
        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          {navItems.map((item, index) => <button key={index} className={`p-2 rounded-md transition-colors group relative ${item.active ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`} title={item.label}>
              <item.icon className={`w-4 h-4 ${item.active ? 'text-[#ff9200]' : 'text-[#757575] group-hover:text-[#ff9200]'}`} />
            </button>)}
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col gap-6 w-full items-center mt-auto">
          {bottomItems.map((item, index) => <button key={index} className="p-2 rounded-md hover:bg-gray-200 transition-colors group" title={item.label}>
              <item.icon className="w-4 h-4 text-[#757575] group-hover:text-gray-900" />
            </button>)}
          <div className="text-[10px] text-gray-400 font-medium">©</div>
        </div>
      </nav>
    </>;
}