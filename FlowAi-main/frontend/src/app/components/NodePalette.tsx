import { motion } from "motion/react";
import { useDrag } from "react-dnd";
import {
  MessageCircle,
  Mail,
  FileSpreadsheet,
  Bot,
  Webhook,
  Database,
  Calendar,
  Clock,
  GitBranch,
  Filter,
  Zap,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const nodeCategories = [
  {
    title: "Triggers",
    nodes: [
      {
        type: "trigger",
        label: "Manual Trigger",
        icon: Zap,
        color: "from-blue-500 to-cyan-500",
      },
      {
        type: "schedule",
        label: "Schedule",
        icon: Clock,
        color: "from-green-500 to-emerald-500",
      },
    ],
  },
  {
    title: "Integrations",
    nodes: [
      {
        type: "whatsapp",
        label: "WhatsApp",
        icon: MessageCircle,
        color: "from-green-400 to-green-600",
      },
      {
        type: "gmail",
        label: "Gmail",
        icon: Mail,
        color: "from-red-400 to-red-600",
      },
      {
        type: "sheets",
        label: "Google Sheets",
        icon: FileSpreadsheet,
        color: "from-green-500 to-green-700",
      },
      {
        type: "calendar",
        label: "Google Calendar",
        icon: Calendar,
        color: "from-blue-400 to-blue-600",
      },
      {
        type: "webhook",
        label: "HTTP Request",
        icon: Webhook,
        color: "from-cyan-500 to-blue-500",
      },
    ],
  },
  {
    title: "AI & Automation",
    nodes: [
      {
        type: "ai",
        label: "AI Chatbot",
        icon: Bot,
        color: "from-purple-500 to-pink-500",
      },
      {
        type: "ai",
        label: "AI Processing",
        icon: Zap,
        color: "from-yellow-500 to-orange-500",
      },
    ],
  },
  {
    title: "Logic",
    nodes: [
      {
        type: "condition",
        label: "Condition",
        icon: GitBranch,
        color: "from-orange-500 to-red-500",
      },
      {
        type: "filter",
        label: "Filter",
        icon: Filter,
        color: "from-indigo-500 to-purple-500",
      },
      {
        type: "database",
        label: "Database",
        icon: Database,
        color: "from-cyan-500 to-blue-500",
      },
    ],
  },
];

interface NodeItemProps {
  type: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

function NodeItem({ type, label, icon: Icon, color }: NodeItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "node",
    item: { type, label, icon: Icon, color },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium truncate">{label}</span>
    </motion.div>
  );
}

export function NodePalette() {
  return (
    <div className="w-full lg:w-64 flex-shrink-0 h-44 sm:h-52 lg:h-full border-b lg:border-b-0 lg:border-r border-white/10 backdrop-blur-xl bg-black/40 flex flex-col">
      <div className="p-3 lg:p-4 border-b border-white/10">
        <h2 className="font-bold text-lg">Nodes</h2>
        <p className="text-xs text-gray-400 mt-1">Drag to canvas</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 lg:p-4 flex gap-5 lg:block lg:space-y-6 min-w-max lg:min-w-0">
          {nodeCategories.map((category) => (
            <div key={category.title} className="w-52 lg:w-auto flex-shrink-0">
              <h3 className="text-xs uppercase font-semibold text-gray-400 mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.nodes.map((node) => (
                  <NodeItem key={`${node.type}-${node.label}`} {...node} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
