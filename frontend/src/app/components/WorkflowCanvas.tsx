import { useState, useCallback, useRef } from "react";
import { useDrop } from "react-dnd";
import { motion } from "motion/react";
import { WorkflowNode } from "./WorkflowNode";
import { Plus, ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

export interface Node {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  icon: React.ElementType | string;
  color: string;
  config?: Record<string, any>;
}

interface WorkflowCanvasProps {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  selectedNode: string | null;
  setSelectedNode: (id: string | null) => void;
  connections: Array<{ from: string; to: string }>;
  setConnections: (connections: Array<{ from: string; to: string }>) => void;
}

export function WorkflowCanvas({
  nodes, setNodes, selectedNode, setSelectedNode, connections, setConnections,
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node",
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const canvasRect = document.getElementById("canvas")?.getBoundingClientRect();
        if (canvasRect) {
          const x = (offset.x - canvasRect.left) / zoom;
          const y = (offset.y - canvasRect.top) / zoom;
          const newNode: Node = {
            id: `node-${Date.now()}`,
            type: item.type,
            label: item.label,
            position: { x, y },
            icon: item.icon,
            color: item.color,
            config: {},
          };
          setNodes([...nodesRef.current, newNode]);
        }
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }), [zoom]);

  const updateNodePosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setNodes(nodesRef.current.map((node) => node.id === id ? { ...node, position } : node));
    },
    [setNodes]
  );

  const handleConnect = useCallback(
    (nodeId: string) => {
      if (connectingFrom === null) {
        setConnectingFrom(nodeId);
      } else {
        if (connectingFrom !== nodeId) {
          const newConnection = { from: connectingFrom, to: nodeId };
          const exists = connections.some(
            (conn) => conn.from === newConnection.from && conn.to === newConnection.to
          );
          if (!exists) setConnections([...connections, newConnection]);
        }
        setConnectingFrom(null);
      }
    },
    [connectingFrom, connections, setConnections]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nodesRef.current.filter((n) => n.id !== nodeId));
      setConnections(connections.filter((c) => c.from !== nodeId && c.to !== nodeId));
      setSelectedNode(null);
    },
    [connections, setConnections, setNodes, setSelectedNode]
  );

  const handleDeleteConnection = (index: number) => {
    setConnections(connections.filter((_, i) => i !== index));
    setSelectedConnection(null);
  };

  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromNode = nodes.find((n) => n.id === conn.from);
      const toNode = nodes.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return null;

      const x1 = fromNode.position.x + 100;
      const y1 = fromNode.position.y + 40;
      const x2 = toNode.position.x + 100;
      const y2 = toNode.position.y + 40;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const isSelected = selectedConnection === index;

      return (
        <g key={`${conn.from}-${conn.to}-${index}`}>
          <defs>
            <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isSelected ? "#ef4444" : "#a855f7"} />
              <stop offset="100%" stopColor={isSelected ? "#ef4444" : "#ec4899"} />
            </linearGradient>
          </defs>
          {/* Invisible thick path for easy clicking */}
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="transparent"
            strokeWidth="12"
            className="cursor-pointer"
            onClick={() => setSelectedConnection(isSelected ? null : index)}
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={`url(#gradient-${index})`}
            strokeWidth={isSelected ? 3 : 2}
            strokeLinecap="round"
            className="pointer-events-none"
          />
          <circle cx={x2} cy={y2} r="4" fill={isSelected ? "#ef4444" : "#ec4899"} className="pointer-events-none" />
          {/* Delete button on selected connection */}
          {isSelected && (
            <foreignObject x={midX - 16} y={midY - 16} width="32" height="32">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                onClick={(e) => { e.stopPropagation(); handleDeleteConnection(index); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="outline" className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60"
          onClick={() => setZoom(1)}><Maximize2 className="w-4 h-4" /></Button>
        <div className="px-3 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-xs font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-pink-500/20 border border-pink-500/40 rounded-lg text-sm text-pink-300 backdrop-blur-xl">
          Now click the 🔗 icon on another node to connect • <span className="cursor-pointer underline" onClick={() => setConnectingFrom(null)}>Cancel</span>
        </div>
      )}

      <div ref={drop} id="canvas"
        className={`w-full h-full relative ${isOver ? "bg-white/5" : ""} transition-colors`}
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        onClick={() => { setSelectedConnection(null); }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: "100%", height: "100%" }}>
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "all" }}>
            {renderConnections()}
          </svg>
          {nodes.map((node) => (
            <WorkflowNode key={node.id} node={node}
              isSelected={selectedNode === node.id}
              isConnecting={connectingFrom === node.id}
              onSelect={() => setSelectedNode(node.id)}
              onMove={updateNodePosition}
              onConnect={() => handleConnect(node.id)}
              onDelete={() => handleDeleteNode(node.id)}
            />
          ))}
          {nodes.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Start Building</h3>
                <p className="text-gray-400 text-sm">Drag nodes from the left panel to create your workflow</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
