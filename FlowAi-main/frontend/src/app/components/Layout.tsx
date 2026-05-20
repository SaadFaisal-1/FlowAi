import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Workflow,
  Blocks,
  Bot,
  FileText,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/workflows/new", icon: Workflow, label: "Workflows" },
  { path: "/integrations", icon: Blocks, label: "Integrations" },
  { path: "/chatbot", icon: Bot, label: "Chatbot" },
  { path: "/logs", icon: FileText, label: "Logs" },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-white/10 backdrop-blur-xl bg-black/40 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">FlowAI</h1>
                <p className="text-xs text-gray-400">Workflow Automation</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path.includes('workflows') && location.pathname.includes('workflows'));
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">John Doe</p>
                <p className="text-xs text-gray-400 truncate">john@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="lg:hidden fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="h-16 px-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold">FlowAI</span>
          </Link>
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path.includes("workflows") && location.pathname.includes("workflows"));
              return (
                <Link key={item.path} to={item.path} className="flex-shrink-0">
                  <div
                    className={`h-10 px-3 rounded-lg flex items-center gap-2 text-sm transition-all ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:ml-64 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
