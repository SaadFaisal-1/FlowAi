import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Zap, TrendingUp, Clock, CheckCircle2,
  Plus, ArrowRight, Activity, Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { api, Workflow, Stats } from "../../api";

const FALLBACK_STATS: Stats = {
  active_workflows: 0,
  total_executions: 0,
  success_rate: 0,
  avg_runtime: "–",
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats>(FALLBACK_STATS);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.stats.get(), api.workflows.list()])
      .then(([s, wf]) => {
        setStats(s);
        setWorkflows(wf.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Active Workflows", value: stats.active_workflows.toString(), icon: Zap, gradient: "from-purple-500 to-pink-500", trend: "up" },
    { label: "Total Executions", value: stats.total_executions.toLocaleString(), icon: Activity, gradient: "from-blue-500 to-cyan-500", trend: "up" },
    { label: "Avg. Runtime", value: stats.avg_runtime, icon: Clock, gradient: "from-green-500 to-emerald-500", trend: "down" },
    { label: "Success Rate", value: `${stats.success_rate}%`, icon: CheckCircle2, gradient: "from-orange-500 to-yellow-500", trend: "up" },
  ];

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Monitor and manage your automation workflows</p>
          </div>
          <Link to="/workflows/new">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />New Workflow
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /><span className="text-gray-400 text-sm">Loading...</span></div>
                ) : (
                  <><div className="text-3xl font-bold mb-1">{stat.value}</div><div className="text-sm text-gray-400">{stat.label}</div></>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Workflows</h2>
            <Link to="/workflows/new">
              <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No workflows yet</p>
              <Link to="/workflows/new">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500"><Plus className="w-4 h-4 mr-2" />Create your first workflow</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <Link key={workflow.id} to={`/workflows/${workflow.id}`}>
                  <motion.div whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{workflow.name}</h3>
                        <p className="text-sm text-gray-400">{workflow.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${workflow.is_active ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                        {workflow.is_active ? "active" : "paused"}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
