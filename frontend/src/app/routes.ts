import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { WorkflowBuilder } from "./pages/WorkflowBuilder";
import { Integrations } from "./pages/Integrations";
import { ChatbotBuilder } from "./pages/ChatbotBuilder";
import { Logs } from "./pages/Logs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "workflows/:id", Component: WorkflowBuilder },
      { path: "integrations", Component: Integrations },
      { path: "chatbot", Component: ChatbotBuilder },
      { path: "logs", Component: Logs },
    ],
  },
]);
