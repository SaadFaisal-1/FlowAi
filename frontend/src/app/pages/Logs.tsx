import { motion } from "motion/react";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const logs = [
  {
    id: "1",
    workflow: "Email to Sheets Sync",
    status: "success",
    timestamp: "2026-03-29 14:32:15",
    duration: "2.3s",
    message: "Successfully synced 15 emails to Google Sheets",
  },
  {
    id: "2",
    workflow: "WhatsApp Order Processor",
    status: "success",
    timestamp: "2026-03-29 14:28:42",
    duration: "1.8s",
    message: "Processed order #12345 and sent confirmation",
  },
  {
    id: "3",
    workflow: "AI Content Generator",
    status: "failed",
    timestamp: "2026-03-29 14:25:18",
    duration: "5.2s",
    message: "API rate limit exceeded",
  },
  {
    id: "4",
    workflow: "Customer Support Bot",
    status: "success",
    timestamp: "2026-03-29 14:20:03",
    duration: "3.1s",
    message: "Responded to 8 customer queries",
  },
  {
    id: "5",
    workflow: "Email to Sheets Sync",
    status: "warning",
    timestamp: "2026-03-29 14:15:27",
    duration: "4.5s",
    message: "Partial sync completed, 2 items skipped",
  },
  {
    id: "6",
    workflow: "WhatsApp Order Processor",
    status: "success",
    timestamp: "2026-03-29 14:10:55",
    duration: "2.1s",
    message: "Order #12344 processed successfully",
  },
  {
    id: "7",
    workflow: "AI Content Generator",
    status: "running",
    timestamp: "2026-03-29 14:05:12",
    duration: "12.8s",
    message: "Generating blog post content...",
  },
  {
    id: "8",
    workflow: "Customer Support Bot",
    status: "success",
    timestamp: "2026-03-29 14:00:38",
    duration: "2.9s",
    message: "All queries resolved",
  },
  {
    id: "9",
    workflow: "Email to Sheets Sync",
    status: "failed",
    timestamp: "2026-03-29 13:55:21",
    duration: "1.2s",
    message: "Authentication failed - token expired",
  },
  {
    id: "10",
    workflow: "WhatsApp Order Processor",
    status: "success",
    timestamp: "2026-03-29 13:50:09",
    duration: "1.9s",
    message: "Order #12343 processed successfully",
  },
];

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
    label: "Success",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
    label: "Failed",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
    label: "Warning",
  },
  running: {
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    label: "Running",
  },
};

export function Logs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    failed: logs.filter((l) => l.status === "failed").length,
    running: logs.filter((l) => l.status === "running").length,
  };

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
            <h1 className="text-4xl font-bold mb-2">Execution Logs</h1>
            <p className="text-gray-400">
              Monitor workflow execution history and performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-xl border border-white/10 backdrop-blur-xl bg-white/5 p-4"
          >
            <div className="text-sm text-gray-400 mb-1">Total Executions</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-green-500/30 backdrop-blur-xl bg-green-500/10 p-4"
          >
            <div className="text-sm text-green-400 mb-1">Successful</div>
            <div className="text-2xl font-bold text-green-400">
              {stats.success}
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-red-500/30 backdrop-blur-xl bg-red-500/10 p-4"
          >
            <div className="text-sm text-red-400 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-400">
              {stats.failed}
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-blue-500/30 backdrop-blur-xl bg-blue-500/10 p-4"
          >
            <div className="text-sm text-blue-400 mb-1">Running</div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.running}
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logs Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Workflow
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Message
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const config =
                    statusConfig[log.status as keyof typeof statusConfig];
                  const Icon = config.icon;

                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Badge
                          className={`${config.bgColor} ${config.color} ${config.borderColor}`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{log.workflow}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {log.message}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {log.duration}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {log.timestamp}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No logs found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
