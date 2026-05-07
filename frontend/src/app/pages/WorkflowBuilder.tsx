import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Save, Settings, MoreVertical, Loader2, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { NodePalette } from "../components/NodePalette";
import { WorkflowCanvas, Node } from "../components/WorkflowCanvas";
import { ConfigPanel } from "../components/ConfigPanel";
import { api } from "../../api";

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
          setNodes(canvas.nodes || []);
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
      nodes,
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
    setRunning(true);
    try {
      const result = await api.workflows.run(workflowId, {});
      alert(`Run complete! Status: ${result.status}`);
    } catch (e) {
      alert("Run failed. Check the logs.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/10 backdrop-blur-xl bg-black/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
            <div className="w-px h-6 bg-white/10" />
            <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none focus:ring-0 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium">
              {nodes.length} nodes
            </div>
            <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-white/10">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
            <Button onClick={handleRun} disabled={running} size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              {running ? "Running..." : "Run Workflow"}
            </Button>
          </div>
        </div>
      </motion.header>
      <div className="flex-1 flex overflow-hidden">
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
