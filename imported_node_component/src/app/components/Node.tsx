import { motion, AnimatePresence } from 'motion/react';
import { useState, ReactNode } from 'react';
import { MoreVertical, Plus } from 'lucide-react';

interface Port {
  id: string;
  label: string;
  type: 'input' | 'output';
}

interface NodeProps {
  id: string;
  title: string;
  icon: ReactNode;
  inputs?: Port[];
  outputs?: Port[];
  initialPosition?: { x: number; y: number };
  onPortClick?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  onPositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
}

interface PortComponentProps {
  port: Port;
  nodeId: string;
  onPortClick?: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  isHovered: boolean;
  isAnyPortHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function PortComponent({ 
  port, 
  nodeId, 
  onPortClick, 
  isHovered, 
  isAnyPortHovered, 
  onHoverStart, 
  onHoverEnd 
}: PortComponentProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onPortClick?.(nodeId, port.id, port.type);
  };

  const labelOpacity = isAnyPortHovered ? (isHovered ? 1 : 0.4) : 1;
  const labelScale = isHovered ? 1.1 : 1;

  return (
    <div className={`content-stretch flex gap-[8px] items-center ${port.type === 'input' ? 'justify-center px-0 py-[10px]' : 'h-[40px] px-0 py-[20px]'} relative shrink-0`}>
      {port.type === 'output' && (
        <motion.div 
          animate={{ 
            opacity: labelOpacity,
            scale: labelScale
          }}
          transition={{ duration: 0.2 }}
          className="flex flex-col font-['Roboto:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#838383] text-[16px] text-right w-[55px] origin-right" 
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="css-4hzbpn leading-[normal]">{port.label}</p>
        </motion.div>
      )}
      <motion.div
        className="relative shrink-0 cursor-pointer p-3"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isHovered && !isActive ? 1.3 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="size-[25px]">
          {isHovered && !isActive ? (
            // Orange circle with plus icon when hovered
            <div className="size-full rounded-full bg-[#FF8C00] flex items-center justify-center shadow-lg">
              <Plus className="size-4 text-white stroke-[3]" />
            </div>
          ) : (
            // Default circle
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
              <g>
                <g>
                  <mask fill="white" id={`path-${nodeId}-${port.id}`}>
                    <path d="M12.5 0C19.4035 0 25 5.59643 25 12.5C25 19.4035 19.4035 25 12.5 25C5.59643 25 0 19.4035 0 12.5C0 5.59643 5.59643 0 12.5 0Z" />
                  </mask>
                  <motion.path 
                    d="M12.5 0C19.4035 0 25 5.59643 25 12.5C25 19.4035 19.4035 25 12.5 25C5.59643 25 0 19.4035 0 12.5C0 5.59643 5.59643 0 12.5 0Z" 
                    fill={isActive ? "#4CAF50" : "white"}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.path 
                    d="M12.5 -2.5C20.6421 -2.5 27.5 4.35786 27.5 12.5C27.5 20.6421 20.6421 27.5 12.5 27.5C4.35786 27.5 -2.5 20.6421 -2.5 12.5C-2.5 4.35786 4.35786 -2.5 12.5 -2.5ZM12.5 2.5C7.25 2.5 2.5 7.25 2.5 12.5C2.5 17.75 7.25 22.5 12.5 22.5C17.75 22.5 22.5 17.75 22.5 12.5C22.5 7.25 17.75 2.5 12.5 2.5Z" 
                    fill={isActive ? "#4CAF50" : "#8F8F8F"}
                    mask={`url(#path-${nodeId}-${port.id})`}
                    transition={{ duration: 0.2 }}
                  />
                </g>
              </g>
            </svg>
          )}
        </div>
      </motion.div>
      {port.type === 'input' && (
        <motion.div 
          animate={{ 
            opacity: labelOpacity,
            scale: labelScale
          }}
          transition={{ duration: 0.2 }}
          className="flex flex-col font-['Roboto:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#838383] text-[16px] w-[55px] origin-left" 
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="css-4hzbpn leading-[normal]">{port.label}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function Node({ 
  id, 
  title, 
  icon, 
  inputs = [], 
  outputs = [], 
  initialPosition = { x: 0, y: 0 },
  onPortClick,
  onPositionChange
}: NodeProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isNodeHovered, setIsNodeHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [hoveredPortId, setHoveredPortId] = useState<string | null>(null);

  const handleDragEnd = (_: any, info: any) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPosition);
    onPositionChange?.(id, newPosition);
  };

  const handleMenuAction = (action: string) => {
    console.log(`${action} clicked for node ${id}`);
    setMenuOpen(false);
  };

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() === '') {
      setEditedTitle(title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: position.x, y: position.y }}
      style={{ x: position.x, y: position.y }}
      className="absolute cursor-move"
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white content-stretch flex flex-col items-start rounded-[10px] shadow-lg" data-name={`node-${id}`}>
        <div aria-hidden="true" className="absolute border-[#dcdcdc] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[10px]" />
        
        {/* Options Menu Button */}
        <AnimatePresence>
          {isNodeHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-4 z-10"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <MoreVertical className="size-6 text-[#9E9E9E]" strokeWidth={2.5} />
              </button>
              
              {/* Dropdown Menu */}
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-full ml-2 top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleMenuAction('Copy')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                  >
                    <span>Copy</span>
                    <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">⌘ C</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('Duplicate')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                  >
                    <span>Duplicate</span>
                    <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">⌘ C</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('Help')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                  >
                    Help
                  </button>
                  <div className="h-px bg-gray-200 my-1" />
                  <button
                    onClick={() => handleMenuAction('Delete')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                  >
                    <span>Delete</span>
                    <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">Del</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Node Header */}
        <div className="h-[73px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-[355px]" data-name="Node Header">
          <div className="absolute left-[10px] size-[53px] top-[10px]">
            {icon}
          </div>
          <div className="absolute flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] left-[76px] text-[20px] text-black top-[36.5px] translate-y-[-50%] w-[189px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="w-full px-2 py-1 border-2 border-[#FF8C00] rounded focus:outline-none focus:border-[#FF8C00] text-[20px] font-['Roboto:Medium',sans-serif] font-medium"
                style={{ fontVariationSettings: "'wdth' 100" }}
                autoFocus
              />
            ) : (
              <div
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${isTitleHovered ? 'bg-[#F5F5F5]' : 'bg-transparent'}`}
                onDoubleClick={handleTitleDoubleClick}
                onMouseEnter={() => setIsTitleHovered(true)}
                onMouseLeave={() => setIsTitleHovered(false)}
              >
                <p className="css-4hzbpn leading-[normal]">
                  {editedTitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-0 relative shrink-0 w-[355px]">
          <div className="absolute inset-[-1px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 355 1">
              <line stroke="#DCDCDC" x2="355" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>

        {/* Ports */}
        <div className="content-stretch flex gap-[10px] items-start justify-center pb-[10px] pt-[6px] px-[0px] relative shrink-0 w-[355px] py-[10px]">
          {/* Input Ports */}
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-col items-end justify-center size-full">
              <div className="content-stretch flex flex-col items-end justify-start pl-0 pr-[107px] py-[10px] relative w-full">
                {inputs.map((input) => (
                  <PortComponent 
                    key={input.id} 
                    port={input} 
                    nodeId={id} 
                    onPortClick={onPortClick} 
                    isHovered={hoveredPortId === input.id}
                    isAnyPortHovered={hoveredPortId !== null}
                    onHoverStart={() => setHoveredPortId(input.id)}
                    onHoverEnd={() => setHoveredPortId(null)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Output Ports */}
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-col justify-center size-full">
              <div className="content-stretch flex flex-col gap-[5px] items-start justify-start pl-[107px] pr-[0px] py-[5px] relative w-full pt-[0px] pb-[0px]">
                {outputs.map((output) => (
                  <PortComponent 
                    key={output.id} 
                    port={output} 
                    nodeId={id} 
                    onPortClick={onPortClick} 
                    isHovered={hoveredPortId === output.id}
                    isAnyPortHovered={hoveredPortId !== null}
                    onHoverStart={() => setHoveredPortId(output.id)}
                    onHoverEnd={() => setHoveredPortId(null)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}