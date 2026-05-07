import { useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import { motion } from "motion/react";
import { WorkflowNode } from "./WorkflowNode";
import { Plus, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

export interface Node {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  icon: React.ElementType;
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
  nodes,
  setNodes,
  selectedNode,
  setSelectedNode,
  connections,
  setConnections,
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node",
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const canvasRect = document
          .getElementById("canvas")
          ?.getBoundingClientRect();
        if (canvasRect) {
          const x = (offset.x - canvasRect.left) / zoom;
          const y = (offset.y - canvasRect.top) / zoom;
          addNode(item, { x, y });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const addNode = (item: any, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: item.type,
      label: item.label,
      position,
      icon: item.icon,
      color: item.color,
      config: {},
    };
    setNodes([...nodes, newNode]);
  };

  const updateNodePosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setNodes(
        nodes.map((node) => (node.id === id ? { ...node, position } : node))
      );
    },
    [nodes, setNodes]
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
          if (!exists) {
            setConnections([...connections, newConnection]);
          }
        }
        setConnectingFrom(null);
      }
    },
    [connectingFrom, connections, setConnections]
  );

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

      return (
        <g key={`${conn.from}-${conn.to}-${index}`}>
          <defs>
            <linearGradient
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={`url(#gradient-${index})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={x2} cy={y2} r="4" fill="#ec4899" />
        </g>
      );
    });
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60"
          onClick={() => setZoom(1)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <div className="px-3 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-xs font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={drop}
        id="canvas"
        className={`w-full h-full relative ${
          isOver ? "bg-white/5" : ""
        } transition-colors`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: "100%",
            height: "100%",
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              isConnecting={connectingFrom === node.id}
              onSelect={() => setSelectedNode(node.id)}
              onMove={updateNodePosition}
              onConnect={() => handleConnect(node.id)}
            />
          ))}

          {/* Empty state */}
          {nodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Start Building</h3>
                <p className="text-gray-400 text-sm">
                  Drag nodes from the left panel to create your workflow
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
