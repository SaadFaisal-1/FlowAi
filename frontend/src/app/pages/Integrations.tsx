import { motion } from "motion/react";
import { useState } from "react";
import {
  MessageCircle,
  Mail,
  FileSpreadsheet,
  Bot,
  Slack,
  Twitter,
  Instagram,
  Facebook,
  Webhook,
  Database,
  Calendar,
  DollarSign,
  Search,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const integrations = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    color: "from-green-400 to-green-600",
    description: "Send and receive WhatsApp messages",
    category: "Messaging",
    connected: true,
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    color: "from-red-400 to-red-600",
    description: "Email automation and management",
    category: "Email",
    connected: true,
  },
  {
    id: "sheets",
    name: "Google Sheets",
    icon: FileSpreadsheet,
    color: "from-green-500 to-green-700",
    description: "Read and write spreadsheet data",
    category: "Productivity",
    connected: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: Bot,
    color: "from-purple-500 to-pink-500",
    description: "AI-powered text generation and analysis",
    category: "AI",
    connected: true,
  },
  {
    id: "slack",
    name: "Slack",
    icon: Slack,
    color: "from-purple-400 to-purple-600",
    description: "Team communication and notifications",
    category: "Messaging",
    connected: false,
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "from-blue-400 to-blue-600",
    description: "Post tweets and monitor mentions",
    category: "Social",
    connected: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-600",
    description: "Manage posts and engagement",
    category: "Social",
    connected: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-700",
    description: "Post updates and analyze insights",
    category: "Social",
    connected: false,
  },
  {
    id: "webhook",
    name: "Webhooks",
    icon: Webhook,
    color: "from-cyan-500 to-blue-500",
    description: "Custom HTTP endpoints",
    category: "Developer",
    connected: true,
  },
  {
    id: "database",
    name: "Database",
    icon: Database,
    color: "from-indigo-500 to-purple-500",
    description: "Connect to SQL and NoSQL databases",
    category: "Data",
    connected: false,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    icon: Calendar,
    color: "from-blue-400 to-blue-600",
    description: "Schedule and manage events",
    category: "Productivity",
    connected: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: DollarSign,
    color: "from-purple-600 to-indigo-600",
    description: "Payment processing and billing",
    category: "Finance",
    connected: false,
  },
];

const categories = ["All", "Messaging", "Email", "AI", "Social", "Productivity", "Developer", "Data", "Finance"];

export function Integrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Integrations</h1>
          <p className="text-gray-400">
            Connect your favorite apps and services
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "border-white/10 hover:bg-white/5"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center`}
                >
                  <integration.icon className="w-7 h-7" />
                </div>
                {integration.connected ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-white/20 text-gray-400">
                    Not Connected
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold mb-2">{integration.name}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {integration.description}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-white/10 text-xs">
                  {integration.category}
                </Badge>
                {integration.connected ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                  >
                    Configure
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No integrations found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
