import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
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
  Settings,
  Loader2,
  Unplug,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { api, Integration } from "../../api";

const integrationCatalog = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    color: "from-green-400 to-green-600",
    description: "Send and receive WhatsApp messages",
    category: "Messaging",
    fields: [
      { key: "phone_number_id", label: "Phone Number ID", type: "text" },
      { key: "access_token", label: "Access Token", type: "password" },
      { key: "verify_token", label: "Verify Token", type: "text" },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    color: "from-red-400 to-red-600",
    description: "Email automation and management",
    category: "Email",
    fields: [{ key: "credentials_json", label: "Google OAuth JSON", type: "textarea" }],
  },
  {
    id: "sheets",
    name: "Google Sheets",
    icon: FileSpreadsheet,
    color: "from-green-500 to-green-700",
    description: "Read and write spreadsheet data",
    category: "Productivity",
    fields: [{ key: "credentials_json", label: "Google Service Account JSON", type: "textarea" }],
  },
  {
    id: "calendar",
    name: "Google Calendar",
    icon: Calendar,
    color: "from-blue-400 to-blue-600",
    description: "Schedule and manage events",
    category: "Productivity",
    fields: [{ key: "credentials_json", label: "Google OAuth JSON", type: "textarea" }],
  },
  {
    id: "google",
    name: "Google Shared Credentials",
    icon: FileSpreadsheet,
    color: "from-emerald-500 to-cyan-500",
    description: "One credential source for Sheets, Gmail, and Calendar",
    category: "Productivity",
    fields: [{ key: "credentials_json", label: "Google Credentials JSON", type: "textarea" }],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: Bot,
    color: "from-purple-500 to-pink-500",
    description: "AI-powered text generation and analysis",
    category: "AI",
    fields: [{ key: "api_key", label: "API Key", type: "password" }],
  },
  {
    id: "webhook",
    name: "HTTP / Webhook",
    icon: Webhook,
    color: "from-cyan-500 to-blue-500",
    description: "Call custom HTTP endpoints from workflows",
    category: "Developer",
    fields: [{ key: "base_url", label: "Default Base URL", type: "text" }],
  },
  {
    id: "slack",
    name: "Slack",
    icon: Slack,
    color: "from-purple-400 to-purple-600",
    description: "Team communication and notifications",
    category: "Messaging",
    fields: [{ key: "bot_token", label: "Bot Token", type: "password" }],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-600",
    description: "Manage posts and engagement",
    category: "Social",
    fields: [{ key: "access_token", label: "Graph API Token", type: "password" }],
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "from-blue-400 to-blue-600",
    description: "Post tweets and monitor mentions",
    category: "Social",
    fields: [{ key: "bearer_token", label: "Bearer Token", type: "password" }],
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-700",
    description: "Post updates and analyze insights",
    category: "Social",
    fields: [{ key: "page_access_token", label: "Page Access Token", type: "password" }],
  },
  {
    id: "database",
    name: "Database",
    icon: Database,
    color: "from-indigo-500 to-purple-500",
    description: "Connect to SQL and NoSQL databases",
    category: "Data",
    fields: [{ key: "connection_url", label: "Connection URL", type: "password" }],
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: DollarSign,
    color: "from-purple-600 to-indigo-600",
    description: "Payment processing and billing",
    category: "Finance",
    fields: [{ key: "secret_key", label: "Secret Key", type: "password" }],
  },
];

const categories = ["All", "Messaging", "Email", "AI", "Social", "Productivity", "Developer", "Data", "Finance"];

export function Integrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeIntegration = integrationCatalog.find((item) => item.id === activeId) || null;

  useEffect(() => {
    api.integrations
      .list()
      .then((items: Integration[]) => {
        setConnected(Object.fromEntries(items.map((item) => [item.service, item.is_connected])));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredIntegrations = useMemo(() => {
    return integrationCatalog.filter((integration) => {
      const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || integration.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const openConfigure = (id: string) => {
    setActiveId(id);
    setForm({});
  };

  const saveIntegration = async () => {
    if (!activeIntegration) return;
    setSaving(true);
    try {
      await api.integrations.connect(activeIntegration.id, form);
      setConnected((current) => ({ ...current, [activeIntegration.id]: true }));
      setActiveId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not connect integration");
    } finally {
      setSaving(false);
    }
  };

  const disconnectIntegration = async (id: string) => {
    setSaving(true);
    try {
      await api.integrations.disconnect(id);
      setConnected((current) => ({ ...current, [id]: false }));
      if (activeId === id) setActiveId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not disconnect integration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Integrations</h1>
          <p className="text-gray-400">Connect credentials once, then use them inside workflow nodes.</p>
        </div>

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
                className={selectedCategory === category ? "bg-white text-black hover:bg-white/90" : "border-white/10 hover:bg-white/5"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Loading integrations...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredIntegrations.map((integration, index) => {
              const isConnected = Boolean(connected[integration.id]);
              return (
                <motion.div
                  key={integration.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                      <integration.icon className="w-6 h-6" />
                    </div>
                    {isConnected ? (
                      <Badge className="bg-green-500/15 text-green-300 border-green-500/30">
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
                  <p className="text-sm text-gray-400 min-h-10 mb-4">{integration.description}</p>

                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="border-white/10 text-xs">
                      {integration.category}
                    </Badge>
                    <div className="flex gap-2">
                      {isConnected && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disconnectIntegration(integration.id)}
                          disabled={saving}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <Unplug className="w-3 h-3 mr-1" />
                          Disconnect
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openConfigure(integration.id)}
                        className={isConnected ? "bg-white/10 hover:bg-white/15" : "bg-white text-black hover:bg-white/90"}
                      >
                        {isConnected ? <Settings className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                        {isConnected ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No integrations found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>

      {activeIntegration && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl rounded-lg border border-white/10 bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">{activeIntegration.name}</h2>
                <p className="text-sm text-gray-400 mt-1">{activeIntegration.description}</p>
              </div>
              <button onClick={() => setActiveId(null)} className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center">
                x
              </button>
            </div>

            <div className="space-y-4">
              {activeIntegration.fields.map((field) => (
                <div key={field.key}>
                  <Label>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={form[field.key] || ""}
                      onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                      placeholder={field.key.includes("json") ? "{\"type\":\"service_account\",\"project_id\":\"...\"}" : ""}
                      className="mt-2 bg-white/5 border-white/10 min-h-32 font-mono text-xs"
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={form[field.key] || ""}
                      onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setActiveId(null)} className="border-white/10 hover:bg-white/5">
                Cancel
              </Button>
              <Button onClick={saveIntegration} disabled={saving} className="bg-white text-black hover:bg-white/90">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Connection
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
