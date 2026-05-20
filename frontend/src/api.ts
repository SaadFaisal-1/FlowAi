// src/api.ts
// Central API client — all backend calls go through here

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ── Workflows ─────────────────────────────────────────────────
export const api = {
  workflows: {
    list: () => req<Workflow[]>("/api/workflows"),
    get: (id: number) => req<Workflow>(`/api/workflows/${id}`),
    create: (data: WorkflowCreate) =>
      req<Workflow>("/api/workflows", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: WorkflowCreate) =>
      req<Workflow>(`/api/workflows/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      req(`/api/workflows/${id}`, { method: "DELETE" }),
    toggle: (id: number) =>
      req<{ is_active: boolean }>(`/api/workflows/${id}/toggle`, { method: "POST" }),
    run: (id: number, payload?: object) =>
      req(`/api/workflows/${id}/run`, { method: "POST", body: JSON.stringify(payload || {}) }),
  },
  stats: {
    get: () => req<Stats>("/api/stats"),
  },
  logs: {
    list: (status?: string) =>
      req<Execution[]>(`/api/logs${status ? `?status=${status}` : ""}`),
  },
  integrations: {
    list: () => req<Integration[]>("/api/integrations"),
    connect: (service: string, data: object) =>
      req(`/api/integrations/${service}/connect`, { method: "POST", body: JSON.stringify(data) }),
    disconnect: (service: string) =>
      req(`/api/integrations/${service}/disconnect`, { method: "POST" }),
  },
};

// ── Types ─────────────────────────────────────────────────────
export interface Workflow {
  id: number;
  name: string;
  description?: string;
  canvas_json?: string;
  is_active: boolean;
  created_at?: string;
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  canvas_json?: string;
}

export interface Stats {
  active_workflows: number;
  total_executions: number;
  success_rate: number;
  avg_runtime: string;
}

export interface Execution {
  id: number;
  workflow_id?: number;
  workflow_name?: string;
  trigger_source?: string;
  status?: string;
  result_data?: string;
  duration_ms?: number;
  executed_at?: string;
}

export interface Integration {
  id: number;
  service: string;
  is_connected: boolean;
}
