import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Save, Loader2, Check, MessageCircle, Mail, FileSpreadsheet, Bot, Webhook, Database, Clock, GitBranch, Filter, Zap, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { NodePalette } from "../components/NodePalette";
import { WorkflowCanvas, Node } from "../components/WorkflowCanvas";
import { ConfigPanel } from "../components/ConfigPanel";
import { api } from "../../api";

const ICON_MAP: Record<string, React.ElementType> = {
  Webhook, Clock, MessageCircle, Mail, FileSpreadsheet, Bot, Zap, GitBranch, Filter, Database, Calendar,
  webhook: Webhook, schedule: Clock, whatsapp: MessageCircle, gmail: Mail,
  sheets: FileSpreadsheet, chatbot: Bot, "ai-process": Zap, ai: Bot, trigger: Zap, condition: GitBranch,
  filter: Filter, database: Database, calendar: Calendar,
};

export function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [workflowId, setWorkflowId] = useState<number | null>(isNew ? null : Number(id));

  useEffect(() => {
    if (!isNew && id) {
      api.workflows.get(Number(id)).then((wf) => {
        setWorkflowName(wf.name);
        if (wf.canvas_json) {
          const canvas = JSON.parse(wf.canvas_json);
          const restoredNodes = (canvas.nodes || []).map((n: any) => ({
            ...n,
            icon: typeof n.icon === "function"
              ? n.icon
              : ICON_MAP[n.icon?.displayName] || ICON_MAP[n.type] || Zap,
          }));
          setNodes(restoredNodes);
          setConnections(
            (canvas.edges || []).map((e: any) => ({ from: e.source, to: e.target }))
          );
        }
      }).catch(() => {});
    }
  }, [id, isNew]);

  const selectedNodeData = nodes.find((n) => n.id === selectedNode) || null;

  const handleUpdateConfig = (config: Record<string, any>) => {
    if (selectedNode) {
      setNodes(nodes.map((node) => node.id === selectedNode ? { ...node, config } : node));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const canvas_json = JSON.stringify({
      nodes: nodes.map(n => ({
        ...n,
        icon: typeof n.icon === "function"
          ? (n.icon as any).displayName || n.type
          : n.type,
      })),
      edges: connections.map((c) => ({ source: c.from, target: c.to, id: `${c.from}-${c.to}` })),
    });
    try {
      if (isNew || !workflowId) {
        const wf = await api.workflows.create({ name: workflowName, canvas_json });
        setWorkflowId(wf.id);
        navigate(`/workflows/${wf.id}`, { replace: true });
      } else {
        await api.workflows.update(workflowId, { name: workflowName, canvas_json });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Save failed. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!workflowId) { alert("Save the workflow first!"); return; }
    const triggerNode = nodes.find((node) => node.type === "trigger" || node.type.endsWith("_trigger"));
    setRunning(true);
    try {
      const result = await api.workflows.run(workflowId, {
        text: triggerNode?.config?.text || "Manual test message",
        from: "manual",
        channel: "manual",
      });
      alert(`Run complete! Status: ${result.status}`);
    } catch (e) {
      alert("Run failed. Check the logs.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-screen flex flex-col overflow-hidden">
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/10 backdrop-blur-xl bg-black/40 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Back</span></Button></Link>
            <div className="w-px h-6 bg-white/10 flex-shrink-0" />
            <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)}
              className="text-base sm:text-xl font-bold bg-transparent border-none outline-none focus:ring-0 min-w-0 flex-1 xl:w-64" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium whitespace-nowrap">
              {nodes.length} nodes
            </div>
            <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-white/10 whitespace-nowrap">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
            <Button onClick={handleRun} disabled={running} size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 whitespace-nowrap">
              {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              {running ? "Running..." : "Run Workflow"}
            </Button>
          </div>
        </div>
      </motion.header>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 min-w-0">
        <NodePalette />
        <WorkflowCanvas nodes={nodes} setNodes={setNodes} selectedNode={selectedNode}
          setSelectedNode={setSelectedNode} connections={connections} setConnections={setConnections} />
        <AnimatePresence>
          {selectedNodeData && (
            <ConfigPanel node={selectedNodeData} onClose={() => setSelectedNode(null)} onUpdate={handleUpdateConfig} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
