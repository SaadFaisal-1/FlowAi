import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { X, Save, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import type { Node } from "./WorkflowCanvas";

interface ConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (config: Record<string, any>) => void;
}

function defaultsFor(type: string): Record<string, any> {
  switch (type) {
    case "whatsapp":
      return { to: "", message: "{ai_output}" };
    case "gmail":
      return { to: "", subject: "Message from FlowMind", body: "{ai_output}" };
    case "sheets":
      return {
        sheet_id: "",
        sheet_name: "Sheet1",
        row: ["{trigger.text}", "{ai_output}", "{trigger.from}"],
      };
    case "calendar":
      return {
        title: "FlowMind Event",
        start: "",
        end: "",
        description: "{ai_output}",
        calendar_id: "primary",
        timezone: "Asia/Karachi",
      };
    case "ai":
    case "chatbot":
    case "ai-process":
      return {
        model: "gpt-4o-mini",
        prompt: "Analyze this message and reply helpfully: {trigger.text}",
        max_tokens: 300,
      };
    case "webhook":
      return {
        url: "",
        method: "POST",
        headers: "{}",
        body: "{}",
      };
    case "condition":
      return { key: "trigger.text", operator: "contains", value: "" };
    default:
      return {};
  }
}

export function ConfigPanel({ node, onClose, onUpdate }: ConfigPanelProps) {
  const [config, setConfig] = useState<Record<string, any>>({});

  const baseConfig = useMemo(
    () => (node ? { ...defaultsFor(node.type), ...(node.config || {}) } : {}),
    [node]
  );

  useEffect(() => {
    setConfig(baseConfig);
  }, [baseConfig]);

  if (!node) return null;

  const Icon = (typeof node.icon === "function" ? node.icon : Zap) as React.ElementType;
  const setField = (key: string, value: any) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    onUpdate(config);
    onClose();
  };

  const renderConfig = () => {
    switch (node.type) {
      case "trigger":
      case "schedule":
        return (
          <div className="space-y-4">
            <div>
              <Label>Sample Text</Label>
              <Input
                value={config.text || ""}
                onChange={(e) => setField("text", e.target.value)}
                placeholder="Manual test message"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
          </div>
        );

      case "whatsapp":
        return (
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                value={config.to || ""}
                onChange={(e) => setField("to", e.target.value)}
                placeholder="+1234567890"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Message Template</Label>
              <Textarea
                value={config.message || ""}
                onChange={(e) => setField("message", e.target.value)}
                placeholder="{ai_output}"
                className="mt-2 bg-white/5 border-white/10 min-h-24"
              />
            </div>
          </div>
        );

      case "gmail":
        return (
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={config.to || ""}
                onChange={(e) => setField("to", e.target.value)}
                placeholder="user@example.com"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={config.subject || ""}
                onChange={(e) => setField("subject", e.target.value)}
                placeholder="Email subject"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={config.body || ""}
                onChange={(e) => setField("body", e.target.value)}
                placeholder="{ai_output}"
                className="mt-2 bg-white/5 border-white/10 min-h-24"
              />
            </div>
          </div>
        );

      case "sheets":
        return (
          <div className="space-y-4">
            <div>
              <Label>Spreadsheet ID</Label>
              <Input
                value={config.sheet_id || ""}
                onChange={(e) => setField("sheet_id", e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Sheet Name</Label>
              <Input
                value={config.sheet_name || "Sheet1"}
                onChange={(e) => setField("sheet_name", e.target.value)}
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Row Values</Label>
              <Textarea
                value={Array.isArray(config.row) ? config.row.join(", ") : config.row || ""}
                onChange={(e) => setField("row", e.target.value.split(",").map((v) => v.trim()))}
                placeholder="{trigger.text}, {ai_output}, {trigger.from}"
                className="mt-2 bg-white/5 border-white/10 min-h-20"
              />
            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={config.title || ""} onChange={(e) => setField("title", e.target.value)} className="mt-2 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label>Start Date Time</Label>
              <Input value={config.start || ""} onChange={(e) => setField("start", e.target.value)} placeholder="2026-05-19T10:00:00" className="mt-2 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label>End Date Time</Label>
              <Input value={config.end || ""} onChange={(e) => setField("end", e.target.value)} placeholder="2026-05-19T10:30:00" className="mt-2 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={config.description || ""} onChange={(e) => setField("description", e.target.value)} className="mt-2 bg-white/5 border-white/10 min-h-20" />
            </div>
          </div>
        );

      case "ai":
      case "chatbot":
      case "ai-process":
        return (
          <div className="space-y-4">
            <div>
              <Label>AI Model</Label>
              <Select value={config.model || "gpt-4o-mini"} onValueChange={(value) => setField("model", value)}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prompt</Label>
              <Textarea
                value={config.prompt || ""}
                onChange={(e) => setField("prompt", e.target.value)}
                placeholder="Analyze this message: {trigger.text}"
                className="mt-2 bg-white/5 border-white/10 min-h-28"
              />
            </div>
            <div>
              <Label>Max Tokens</Label>
              <Input
                type="number"
                min="1"
                value={config.max_tokens || 300}
                onChange={(e) => setField("max_tokens", Number(e.target.value))}
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
          </div>
        );

      case "webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label>Request URL</Label>
              <Input value={config.url || ""} onChange={(e) => setField("url", e.target.value)} placeholder="https://api.example.com/webhook" className="mt-2 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={config.method || "POST"} onValueChange={(value) => setField("method", value)}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Headers JSON</Label>
              <Textarea value={config.headers || ""} onChange={(e) => setField("headers", e.target.value)} className="mt-2 bg-white/5 border-white/10 min-h-20" />
            </div>
            <div>
              <Label>Body JSON or Text</Label>
              <Textarea value={config.body || ""} onChange={(e) => setField("body", e.target.value)} className="mt-2 bg-white/5 border-white/10 min-h-20" />
            </div>
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <Label>Field</Label>
              <Input value={config.key || ""} onChange={(e) => setField("key", e.target.value)} placeholder="trigger.text" className="mt-2 bg-white/5 border-white/10" />
            </div>
            <div>
              <Label>Operator</Label>
              <Select value={config.operator || "contains"} onValueChange={(value) => setField("operator", value)}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input value={config.value || ""} onChange={(e) => setField("value", e.target.value)} className="mt-2 bg-white/5 border-white/10" />
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-400">This node has no configurable fields yet.</p>;
    }
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      className="w-full lg:w-80 flex-shrink-0 h-80 lg:h-full border-t lg:border-t-0 lg:border-l border-white/10 backdrop-blur-xl bg-black/40 flex flex-col"
    >
      <div className="p-3 lg:p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <h2 className="font-bold">Configure Node</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400">{node.label}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 lg:p-4">{renderConfig()}</div>
      </ScrollArea>

      <div className="p-3 lg:p-4 border-t border-white/10 space-y-2">
        <Button onClick={save} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
        <Button onClick={() => setConfig(defaultsFor(node.type))} variant="outline" className="w-full border-white/10 hover:bg-white/5">
          Reset to Default
        </Button>
      </div>
    </motion.div>
  );
}
