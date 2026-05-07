import { motion } from "motion/react";
import { X, Settings, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import type { Node } from "./WorkflowCanvas";

interface ConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (config: Record<string, any>) => void;
}

export function ConfigPanel({ node, onClose, onUpdate }: ConfigPanelProps) {
  if (!node) return null;

  const Icon = node.icon;

  const renderConfig = () => {
    switch (node.type) {
      case "whatsapp":
        return (
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+1234567890"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Action</Label>
              <Select defaultValue="send">
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send">Send Message</SelectItem>
                  <SelectItem value="receive">Receive Message</SelectItem>
                  <SelectItem value="status">Get Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message Template</Label>
              <Textarea
                placeholder="Enter your message..."
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
                placeholder="user@example.com"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Action</Label>
              <Select defaultValue="send">
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send">Send Email</SelectItem>
                  <SelectItem value="read">Read Emails</SelectItem>
                  <SelectItem value="search">Search Emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                placeholder="Email body..."
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
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Action</Label>
              <Select defaultValue="append">
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">Append Row</SelectItem>
                  <SelectItem value="read">Read Data</SelectItem>
                  <SelectItem value="update">Update Row</SelectItem>
                  <SelectItem value="delete">Delete Row</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sheet Name</Label>
              <Input
                placeholder="Sheet1"
                defaultValue="Sheet1"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Range</Label>
              <Input
                placeholder="A1:Z100"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
          </div>
        );

      case "chatbot":
        return (
          <div className="space-y-4">
            <div>
              <Label>AI Model</Label>
              <Select defaultValue="gpt4">
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="gpt3.5">GPT-3.5</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>System Prompt</Label>
              <Textarea
                placeholder="You are a helpful assistant..."
                className="mt-2 bg-white/5 border-white/10 min-h-24"
              />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input
                type="number"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Stream Response</Label>
              <Switch />
            </div>
          </div>
        );

      case "webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://api.example.com/webhook"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select defaultValue="POST">
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
              <Label>Headers</Label>
              <Textarea
                placeholder='{"Authorization": "Bearer token"}'
                className="mt-2 bg-white/5 border-white/10 min-h-20"
              />
            </div>
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <Label>Condition Type</Label>
              <Select defaultValue="if">
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="if">If/Else</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Field</Label>
              <Input
                placeholder="data.status"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Operator</Label>
              <Select defaultValue="equals">
                <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater">Greater Than</SelectItem>
                  <SelectItem value="less">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                placeholder="expected value"
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Node Name</Label>
              <Input
                defaultValue={node.label}
                className="mt-2 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Add a description..."
                className="mt-2 bg-white/5 border-white/10 min-h-20"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      className="w-80 h-full border-l border-white/10 backdrop-blur-xl bg-black/40 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <h2 className="font-bold">Configure Node</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400">{node.label}</p>
      </div>

      {/* Configuration Form */}
      <ScrollArea className="flex-1">
        <div className="p-4">{renderConfig()}</div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
          Reset to Default
        </Button>
      </div>
    </motion.div>
  );
}
