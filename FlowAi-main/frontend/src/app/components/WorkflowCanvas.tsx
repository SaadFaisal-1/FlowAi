import { useState, useCallback, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { motion } from "motion/react";
import { WorkflowNode } from "./WorkflowNode";
import { Plus, ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
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

const WORKSPACE = { width: 4200, height: 2600 };

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
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = 900;
    viewport.scrollTop = 500;
  }, []);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "node",
      drop: (item: any, monitor) => {
        const offset = monitor.getClientOffset();
        const viewport = viewportRef.current;
        if (!offset || !viewport) return;

        const rect = viewport.getBoundingClientRect();
        const x = (offset.x - rect.left + viewport.scrollLeft) / zoom;
        const y = (offset.y - rect.top + viewport.scrollTop) / zoom;
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: item.type,
          label: item.label,
          position: { x: Math.max(40, x), y: Math.max(40, y) },
          icon: item.icon,
          color: item.color,
          config: {},
        };
        setNodes([...nodesRef.current, newNode]);
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [zoom, setNodes]
  );

  const updateNodePosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setNodes(
        nodesRef.current.map((node) =>
          node.id === id
            ? {
                ...node,
                position: {
                  x: Math.max(0, Math.min(WORKSPACE.width - 260, position.x)),
                  y: Math.max(0, Math.min(WORKSPACE.height - 140, position.y)),
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleConnect = useCallback(
    (nodeId: string) => {
      if (connectingFrom === null) {
        setConnectingFrom(nodeId);
        return;
      }

      if (connectingFrom !== nodeId) {
        const newConnection = { from: connectingFrom, to: nodeId };
        const exists = connections.some(
          (conn) => conn.from === newConnection.from && conn.to === newConnection.to
        );
        if (!exists) setConnections([...connections, newConnection]);
      }
      setConnectingFrom(null);
    },
    [connectingFrom, connections, setConnections]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nodesRef.current.filter((node) => node.id !== nodeId));
      setConnections(connections.filter((connection) => connection.from !== nodeId && connection.to !== nodeId));
      setSelectedNode(null);
    },
    [connections, setConnections, setNodes, setSelectedNode]
  );

  const handleDeleteConnection = (index: number) => {
    setConnections(connections.filter((_, i) => i !== index));
    setSelectedConnection(null);
  };

  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromNode = nodes.find((node) => node.id === connection.from);
      const toNode = nodes.find((node) => node.id === connection.to);
      if (!fromNode || !toNode) return null;

      const x1 = fromNode.position.x + 208;
      const y1 = fromNode.position.y + 52;
      const x2 = toNode.position.x;
      const y2 = toNode.position.y + 52;
      const distance = Math.max(80, Math.abs(x2 - x1) / 2);
      const isSelected = selectedConnection === index;

      return (
        <g key={`${connection.from}-${connection.to}-${index}`}>
          <path
            d={`M ${x1} ${y1} C ${x1 + distance} ${y1}, ${x2 - distance} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="transparent"
            strokeWidth="14"
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedConnection(isSelected ? null : index);
            }}
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35 }}
            d={`M ${x1} ${y1} C ${x1 + distance} ${y1}, ${x2 - distance} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={isSelected ? "#f97316" : "#9ca3af"}
            strokeWidth={isSelected ? 3 : 2}
            strokeLinecap="round"
            className="pointer-events-none"
          />
          <circle cx={x2} cy={y2} r="4" fill={isSelected ? "#f97316" : "#9ca3af"} className="pointer-events-none" />
          {isSelected && (
            <foreignObject x={(x1 + x2) / 2 - 44} y={(y1 + y2) / 2 - 14} width="88" height="28">
              <button
                className="h-7 px-3 rounded-md bg-red-500 text-white text-xs shadow-lg"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteConnection(index);
                }}
              >
                Delete
              </button>
            </foreignObject>
          )}
        </g>
      );
    });
  };

  return (
    <div className="flex-1 min-h-[360px] min-w-0 relative overflow-hidden bg-[#0f1117]">
      <div className="absolute top-3 right-3 z-30 flex gap-1 sm:gap-2">
        <Button size="sm" variant="outline" className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60" onClick={() => setZoom(Math.min(1.8, zoom + 0.1))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-black/40 backdrop-blur-xl border-white/10 hover:bg-black/60" onClick={() => setZoom(1)}>
          <Maximize2 className="w-4 h-4" />
        </Button>
        <div className="px-2 sm:px-3 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-md text-xs font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-30 rounded-md border border-white/10 bg-black/45 backdrop-blur px-3 py-2 text-xs text-gray-300 flex items-center gap-2">
        <Move className="w-4 h-4" />
        <span className="truncate">Scroll the canvas. Connect nodes from output to input.</span>
      </div>

      {connectingFrom && (
        <div className="absolute top-14 sm:top-4 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-30 px-4 py-2 bg-orange-500/15 border border-orange-500/40 rounded-md text-sm text-orange-200 backdrop-blur-xl">
          Select another node connector to create the path. <button className="underline" onClick={() => setConnectingFrom(null)}>Cancel</button>
        </div>
      )}

      <div
        ref={viewportRef}
        className="absolute inset-0 overflow-scroll"
        onClick={() => {
          setSelectedConnection(null);
        }}
      >
        <div
          ref={drop}
          id="canvas"
          className={`relative ${isOver ? "bg-white/[0.03]" : ""} transition-colors`}
          style={{ width: WORKSPACE.width * zoom, height: WORKSPACE.height * zoom }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              width: WORKSPACE.width,
              height: WORKSPACE.height,
              backgroundColor: "#11131a",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <svg className="absolute inset-0" width={WORKSPACE.width} height={WORKSPACE.height} style={{ pointerEvents: "all" }}>
              {renderConnections()}
            </svg>
            {nodes.map((node) => (
              <WorkflowNode
                key={node.id}
                node={node}
                isSelected={selectedNode === node.id}
                isConnecting={connectingFrom === node.id}
                onSelect={() => setSelectedNode(node.id)}
                onMove={updateNodePosition}
                onConnect={() => handleConnect(node.id)}
                onDelete={() => handleDeleteNode(node.id)}
                zoom={zoom}
              />
            ))}
            {nodes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute flex items-center justify-center"
                style={{ pointerEvents: "none", left: 900, top: 480, width: 900, height: 520 }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Start Building</h3>
                  <p className="text-gray-400 text-sm">Drag a trigger, add steps, then connect nodes like n8n.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
