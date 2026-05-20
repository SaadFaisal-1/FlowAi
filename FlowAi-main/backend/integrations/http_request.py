import json
from typing import Any, Optional

import httpx


def render_template(value: Any, context: dict) -> Any:
    if isinstance(value, str):
        trigger = context.get("trigger", {})
        return (
            value.replace("{trigger.text}", str(trigger.get("text", "")))
            .replace("{trigger.from}", str(trigger.get("from", "")))
            .replace("{ai_output}", str(context.get("ai_output", "")))
        )
    if isinstance(value, list):
        return [render_template(item, context) for item in value]
    if isinstance(value, dict):
        return {key: render_template(item, context) for key, item in value.items()}
    return value


async def execute_http_request(config: dict, context: Optional[dict] = None) -> dict:
    context = context or {}
    method = str(config.get("method", "POST")).upper()
    url = config.get("url")
    if not url:
        raise ValueError("HTTP request url is required")

    headers = render_template(config.get("headers") or {}, context)
    params = render_template(config.get("params") or {}, context)
    body = render_template(config.get("body"), context)
    timeout = float(config.get("timeout", 20))

    if isinstance(headers, str):
        headers = json.loads(headers) if headers.strip() else {}
    if isinstance(params, str):
        params = json.loads(params) if params.strip() else {}
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            pass

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.request(
            method,
            url,
            headers=headers,
            params=params,
            json=body if isinstance(body, (dict, list)) else None,
            content=body if isinstance(body, str) else None,
        )

    content_type = response.headers.get("content-type", "")
    try:
        response_body = response.json() if "application/json" in content_type else response.text
    except Exception:
        response_body = response.text

    return {
        "status_code": response.status_code,
        "ok": response.is_success,
        "headers": dict(response.headers),
        "body": response_body,
    }


async def run_http_request_node(node: dict, context: dict) -> dict:
    config = node.get("data", {}).get("config", {})
    try:
        context["http_response"] = await execute_http_request(config, context)
    except Exception as exc:
        context["http_error"] = str(exc)
    return context
