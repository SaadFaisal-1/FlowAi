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
}

export function WorkflowNode({ node, isSelected, isConnecting, onSelect, onMove, onConnect, onDelete }: WorkflowNodeProps) {
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
      onMove(node.id, { x: startPos.x + (e.clientX - startX), y: startPos.y + (e.clientY - startY) });
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
      className={`w-52 cursor-move group ${isSelected ? "z-20" : "z-10"}`}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
    >
      <div className={`rounded-xl backdrop-blur-xl bg-white/5 border-2 transition-all ${
        isSelected ? "border-purple-500 shadow-lg shadow-purple-500/20"
        : isConnecting ? "border-pink-500 shadow-lg shadow-pink-500/20"
        : "border-white/10 hover:border-white/20"}`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onConnect(); }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isConnecting ? "bg-pink-500 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"}`}>
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="font-medium text-sm">{node.label}</h3>
          <p className="text-xs text-gray-400 mt-1">{node.type}</p>
        </div>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-gray-900" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-pink-500 border-2 border-gray-900" />
      </div>
    </motion.div>
  );
}
