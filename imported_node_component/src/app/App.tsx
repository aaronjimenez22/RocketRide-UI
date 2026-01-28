import Node from '@/app/components/Node';
import svgPaths from '@/imports/svg-gwsn2qrgo6';
import { useState } from 'react';

function DataParserIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53 53">
      <g>
        <path d={svgPaths.p2b6d6f00} fill="white" />
        <path d={svgPaths.p18567580} fill="#56565A" />
      </g>
    </svg>
  );
}

interface Connection {
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}

export default function App() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPort, setSelectedPort] = useState<{nodeId: string, portId: string, type: 'input' | 'output'} | null>(null);

  const handlePortClick = (nodeId: string, portId: string, portType: 'input' | 'output') => {
    if (!selectedPort) {
      // First click - select a port
      setSelectedPort({ nodeId, portId, type: portType });
      console.log(`Selected ${portType} port: ${portId} on node ${nodeId}`);
    } else {
      // Second click - try to create connection
      if (selectedPort.type !== portType) {
        const newConnection: Connection = {
          fromNode: selectedPort.type === 'output' ? selectedPort.nodeId : nodeId,
          fromPort: selectedPort.type === 'output' ? selectedPort.portId : portId,
          toNode: selectedPort.type === 'input' ? selectedPort.nodeId : nodeId,
          toPort: selectedPort.type === 'input' ? selectedPort.portId : portId,
        };
        setConnections([...connections, newConnection]);
        console.log('Created connection:', newConnection);
      }
      setSelectedPort(null);
    }
  };

  const handlePositionChange = (nodeId: string, position: { x: number; y: number }) => {
    console.log(`Node ${nodeId} moved to:`, position);
  };

  return (
    <div className="bg-[#f6f6f6] relative size-full overflow-hidden">
      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md z-10 max-w-xs">
        <h3 className="font-semibold mb-2">Interactive Node Graph</h3>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• Drag nodes to reposition</li>
          <li>• Click ports to connect (click output, then input)</li>
          <li>• Hover over ports to highlight</li>
          <li>• Active connections shown in green</li>
        </ul>
        {selectedPort && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
            Selected: {selectedPort.type} port on node {selectedPort.nodeId}
          </div>
        )}
        {connections.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-semibold">Connections ({connections.length}):</p>
            <ul className="text-xs mt-1 space-y-1">
              {connections.map((conn, idx) => (
                <li key={idx} className="text-gray-600">
                  {conn.fromNode}.{conn.fromPort} → {conn.toNode}.{conn.toPort}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Data Parser Node */}
      <Node
        id="parser-1"
        title="Data - Parser"
        icon={<DataParserIcon />}
        initialPosition={{ x: 100, y: 150 }}
        inputs={[
          { id: 'data-in', label: 'Data', type: 'input' }
        ]}
        outputs={[
          { id: 'audio-out', label: 'Audio', type: 'output' },
          { id: 'image-out', label: 'Image', type: 'output' },
          { id: 'table-out', label: 'Table', type: 'output' },
          { id: 'text-out', label: 'Text', type: 'output' }
        ]}
        onPortClick={handlePortClick}
        onPositionChange={handlePositionChange}
      />

      {/* Data Source Node */}
      <Node
        id="source-1"
        title="Data - Source"
        icon={<DataParserIcon />}
        initialPosition={{ x: 550, y: 250 }}
        inputs={[]}
        outputs={[
          { id: 'raw-data', label: 'Data', type: 'output' }
        ]}
        onPortClick={handlePortClick}
        onPositionChange={handlePositionChange}
      />

      {/* Media Output Node */}
      <Node
        id="output-1"
        title="Media - Output"
        icon={<DataParserIcon />}
        initialPosition={{ x: 100, y: 450 }}
        inputs={[
          { id: 'audio-in', label: 'Audio', type: 'input' },
          { id: 'video-in', label: 'Video', type: 'input' }
        ]}
        outputs={[]}
        onPortClick={handlePortClick}
        onPositionChange={handlePositionChange}
      />
    </div>
  );
}
