import os
import httpx
from typing import Optional

WA_PHONE_NUMBER_ID = os.getenv("WA_PHONE_NUMBER_ID", "")
WA_ACCESS_TOKEN = os.getenv("WA_ACCESS_TOKEN", "")


async def send_whatsapp_message(to: str, message: str, credentials: Optional[dict] = None) -> dict:
    """Send a WhatsApp text message via Meta Cloud API."""
    credentials = credentials or {}
    phone_number_id = credentials.get("phone_number_id") or WA_PHONE_NUMBER_ID
    access_token = credentials.get("access_token") or WA_ACCESS_TOKEN

    if not phone_number_id or not access_token:
        return {"status": "skipped", "reason": "WhatsApp not configured"}

    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message},
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers, timeout=10)
        return resp.json()


async def run_whatsapp_node(node: dict, context: dict) -> dict:
    """Execute a WhatsApp send node in the workflow."""
    config = node.get("data", {}).get("config", {})
    to = config.get("to") or context.get("trigger", {}).get("from", "")
    message = config.get("message") or context.get("ai_output", "Hello!")

    # Replace placeholders
    message = message.replace("{ai_output}", context.get("ai_output", ""))
    message = message.replace("{trigger.text}", context.get("trigger", {}).get("text", ""))

    result = await send_whatsapp_message(
        to,
        message,
        credentials=context.get("_credentials", {}).get("whatsapp"),
    )
    context["whatsapp_sent"] = result
    return context


def verify_webhook(token: str, expected: str) -> bool:
    return token == expected
