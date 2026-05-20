import { useState } from "react";
import { motion } from "motion/react";
import {
  Bot,
  Plus,
  Settings,
  Play,
  MessageSquare,
  Sparkles,
  Save,
  Code,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const chatbots = [
  {
    id: "1",
    name: "Customer Support Bot",
    model: "GPT-4",
    status: "active",
    interactions: 1247,
  },
  {
    id: "2",
    name: "Sales Assistant",
    model: "GPT-3.5",
    status: "active",
    interactions: 892,
  },
  {
    id: "3",
    name: "FAQ Bot",
    model: "Claude",
    status: "paused",
    interactions: 456,
  },
];

const sampleMessages = [
  { role: "user", content: "Hello! I need help with my order" },
  {
    role: "bot",
    content:
      "Hi there! I'd be happy to help you with your order. Could you please provide your order number?",
  },
  { role: "user", content: "It's #12345" },
  {
    role: "bot",
    content:
      "Thank you! I've found your order #12345. It's currently being processed and should be shipped within 24 hours. Is there anything specific you'd like to know about it?",
  },
];

export function ChatbotBuilder() {
  const [selectedBot, setSelectedBot] = useState(chatbots[0]);
  const [testMessage, setTestMessage] = useState("");

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Chatbot Builder</h1>
            <p className="text-gray-400">Create and manage AI-powered chatbots</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            New Chatbot
          </Button>
        </div>

        {/* Chatbots List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chatbots.map((bot) => (
            <motion.div
              key={bot.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedBot(bot)}
              className={`rounded-xl border backdrop-blur-xl p-4 cursor-pointer transition-all ${
                selectedBot.id === bot.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bot.status === "active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {bot.status}
                </div>
              </div>
              <h3 className="font-medium mb-1">{bot.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{bot.model}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MessageSquare className="w-3 h-3" />
                {bot.interactions} interactions
              </div>
            </motion.div>
          ))}
        </div>

        {/* Builder Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5" />
              <h2 className="text-xl font-bold">Configuration</h2>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label>Chatbot Name</Label>
                  <Input
                    defaultValue={selectedBot.name}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label>AI Model</Label>
                  <Select defaultValue="gpt4">
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4</SelectItem>
                      <SelectItem value="gpt3.5">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude">Claude 3</SelectItem>
                      <SelectItem value="gemini">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what your chatbot does..."
                    className="mt-2 bg-white/5 border-white/10 min-h-20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    placeholder="You are a helpful assistant..."
                    defaultValue="You are a helpful customer support assistant. Be polite, professional, and provide accurate information."
                    className="mt-2 bg-white/5 border-white/10 min-h-32"
                  />
                </div>

                <div>
                  <Label>Temperature ({0.7})</Label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue="0.7"
                    className="mt-2 w-full"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Lower values = more focused, Higher values = more creative
                  </p>
                </div>

                <div>
                  <Label>Max Response Length</Label>
                  <Input
                    type="number"
                    defaultValue="500"
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Remember Context</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Keep track of conversation history
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <Label>API Endpoint</Label>
                  <Input
                    placeholder="https://api.example.com/chat"
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label>Custom Headers</Label>
                  <Textarea
                    placeholder='{"Authorization": "Bearer token"}'
                    className="mt-2 bg-white/5 border-white/10 min-h-20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stream Responses</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Show responses as they're generated
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Limit messages per user per hour
                    </p>
                  </div>
                  <Switch />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" className="border-white/10">
                <Code className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Test Chat Interface */}
          <div className="rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-xl font-bold">Test Chat</h2>
            </div>

            <ScrollArea className="flex-1 mb-4 pr-4">
              <div className="space-y-4">
                {sampleMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : "bg-white/10 border border-white/10"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message to test..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 bg-white/5 border-white/10"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && testMessage.trim()) {
                    setTestMessage("");
                  }
                }}
              />
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
