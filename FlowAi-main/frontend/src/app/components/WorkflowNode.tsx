import { useRef } from "react";
import { useDrag } from "react-dnd";
import { motion } from "motion/react";
import { Link as LinkIcon, Zap, X } from "lucide-react";
import type { Node } from "./WorkflowCanvas";

interface WorkflowNodeProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onConnect: () => void;
  onDelete: () => void;
  zoom?: number;
}

export function WorkflowNode({ node, isSelected, isConnecting, onSelect, onMove, onConnect, onDelete, zoom = 1 }: WorkflowNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "canvas-node",
    item: () => ({ id: node.id, ...node.position }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...node.position };
    const handleMouseMove = (e: MouseEvent) => {
      onMove(node.id, {
        x: startPos.x + (e.clientX - startX) / zoom,
        y: startPos.y + (e.clientY - startY) / zoom,
      });
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const Icon = (typeof node.icon === "function" ? node.icon : Zap) as React.ElementType;

  return (
    <motion.div
      ref={nodeRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0.5 : 1 }}
      style={{ position: "absolute", left: node.position.x, top: node.position.y }}
      className={`w-56 cursor-move group ${isSelected ? "z-20" : "z-10"}`}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
    >
      <div className={`rounded-lg bg-[#1b1f2a] border transition-all shadow-xl ${
        isSelected ? "border-orange-400 shadow-orange-500/10"
        : isConnecting ? "border-orange-500 shadow-orange-500/10"
        : "border-white/10 hover:border-white/25"}`}>
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-md bg-gradient-to-br ${node.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">{node.label}</h3>
                <p className="text-[11px] text-gray-400 truncate">{node.type}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onConnect(); }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  isConnecting ? "bg-orange-500 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"}`}>
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-all bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 text-[11px] text-gray-500">
          {node.config && Object.keys(node.config).length > 0 ? "Configured" : "Needs configuration"}
        </div>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#11131a] border-2 border-gray-400" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#11131a] border-2 border-orange-400" />
      </div>
    </motion.div>
  );
}
