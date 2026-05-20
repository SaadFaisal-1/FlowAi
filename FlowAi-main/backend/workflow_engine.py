import json
import asyncio
from typing import Any, Optional
from llm import run_ai_node
from integrations.whatsapp import run_whatsapp_node
from integrations.gmail import run_gmail_node
from integrations.sheets import run_sheets_node
from integrations.calendar import run_calendar_node
from integrations.http_request import run_http_request_node


class WorkflowEngine:
    """
    Executes a workflow by traversing the node graph in topological order.
    Each node receives the shared context dict and can add/modify values.
    """

    def __init__(self, canvas_json: str, credentials: Optional[dict] = None):
        data = json.loads(canvas_json or '{"nodes":[],"edges":[]}')
        self.nodes: dict = {n["id"]: n for n in data.get("nodes", [])}
        self.edges: list = data.get("edges", [])
        self.credentials = credentials or {}

    def get_execution_order(self, trigger_node_id: str) -> list[str]:
        """DFS from the trigger node — returns nodes in execution order."""
        order, visited = [], set()

        def dfs(node_id: str):
            if node_id in visited or node_id not in self.nodes:
                return
            visited.add(node_id)
            order.append(node_id)
            for edge in self.edges:
                if edge.get("source") == node_id:
                    dfs(edge.get("target", ""))

        dfs(trigger_node_id)
        return order

    def normalize_node(self, node: dict) -> dict:
        if node.get("data"):
            return node
        return {
            **node,
            "data": {
                "type": node.get("type", ""),
                "config": node.get("config", {}),
            },
        }

    def context_value(self, context: dict, path: str, default: Any = "") -> Any:
        current: Any = context
        for part in path.split("."):
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return default
        return current

    async def execute(self, trigger_node_id: str, trigger_data: dict) -> dict:
        """Execute all nodes in order, passing context between them."""
        order = self.get_execution_order(trigger_node_id)
        context: dict[str, Any] = {"trigger": trigger_data, "_credentials": self.credentials}

        for node_id in order:
            node = self.normalize_node(self.nodes[node_id])
            node_type = node.get("data", {}).get("type", "")

            try:
                if node_type in ("trigger", "whatsapp_trigger", "instagram_trigger"):
                    trigger_config = node.get("data", {}).get("config", {})
                    for key, value in trigger_config.items():
                        context["trigger"].setdefault(key, value)
                    context["trigger_node"] = node_id

                elif node_type in ("ai", "chatbot", "ai-process"):
                    context = await run_ai_node(node, context)

                elif node_type == "whatsapp":
                    context = await run_whatsapp_node(node, context)

                elif node_type == "gmail":
                    context = await run_gmail_node(node, context)

                elif node_type == "sheets":
                    context = await run_sheets_node(node, context)

                elif node_type == "calendar":
                    context = await run_calendar_node(node, context)

                elif node_type in ("webhook", "http_request"):
                    context = await run_http_request_node(node, context)

                elif node_type == "delay":
                    seconds = node.get("data", {}).get("config", {}).get("seconds", 1)
                    await asyncio.sleep(min(float(seconds), 10))  # cap at 10s

                elif node_type == "condition":
                    config = node.get("data", {}).get("config", {})
                    key = config.get("key", "")
                    operator = config.get("operator", "equals")
                    expected = config.get("value", "")
                    actual = self.context_value(context, key)
                    if operator == "contains":
                        passed = str(expected) in str(actual)
                    elif operator == "exists":
                        passed = actual not in ("", None)
                    else:
                        passed = str(actual) == str(expected)
                    context["condition_result"] = passed

            except Exception as e:
                context[f"error_{node_id}"] = str(e)
                # Continue executing remaining nodes even if one fails

        return context
