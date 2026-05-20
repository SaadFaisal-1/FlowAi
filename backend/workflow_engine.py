import json
import time
from typing import Any
from llm import run_ai_node
from integrations.whatsapp import run_whatsapp_node
from integrations.gmail import run_gmail_node
from integrations.sheets import run_sheets_node
from integrations.calendar import run_calendar_node


class WorkflowEngine:
    """
    Executes a workflow by traversing the node graph in topological order.
    Each node receives the shared context dict and can add/modify values.
    """

    def __init__(self, canvas_json: str):
        data = json.loads(canvas_json or '{"nodes":[],"edges":[]}')
        self.nodes: dict = {n["id"]: n for n in data.get("nodes", [])}
        self.edges: list = data.get("edges", [])

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

    async def execute(self, trigger_node_id: str, trigger_data: dict) -> dict:
        """Execute all nodes in order, passing context between them."""
        order = self.get_execution_order(trigger_node_id)
        context: dict[str, Any] = {"trigger": trigger_data}

        for node_id in order:
            node = self.nodes[node_id]
            node_type = node.get("data", {}).get("type", "")

            try:
                if node_type in ("trigger", "whatsapp_trigger", "instagram_trigger"):
                    # Trigger nodes just pass data through
                    context["trigger_node"] = node_id

                elif node_type == "ai":
                    context = await run_ai_node(node, context)

                elif node_type == "whatsapp":
                    context = await run_whatsapp_node(node, context)

                elif node_type == "gmail":
                    context = await run_gmail_node(node, context)

                elif node_type == "sheets":
                    context = await run_sheets_node(node, context)

                elif node_type == "calendar":
                    context = await run_calendar_node(node, context)

                elif node_type == "delay":
                    seconds = node.get("data", {}).get("config", {}).get("seconds", 1)
                    time.sleep(min(seconds, 10))  # cap at 10s

                elif node_type == "condition":
                    # Simple condition: check if a context key equals a value
                    config = node.get("data", {}).get("config", {})
                    key = config.get("key", "")
                    expected = config.get("value", "")
                    context["condition_result"] = str(context.get(key, "")) == str(expected)

            except Exception as e:
                context[f"error_{node_id}"] = str(e)
                # Continue executing remaining nodes even if one fails

        return context
