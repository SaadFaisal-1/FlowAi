import os
import httpx

WA_PHONE_NUMBER_ID = os.getenv("WA_PHONE_NUMBER_ID", "")
WA_ACCESS_TOKEN = os.getenv("WA_ACCESS_TOKEN", "")


async def send_whatsapp_message(to: str, message: str) -> dict:
    """Send a WhatsApp text message via Meta Cloud API."""
    if not WA_PHONE_NUMBER_ID or not WA_ACCESS_TOKEN:
        return {"status": "skipped", "reason": "WhatsApp not configured"}

    url = f"https://graph.facebook.com/v18.0/{WA_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WA_ACCESS_TOKEN}",
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

    result = await send_whatsapp_message(to, message)
    context["whatsapp_sent"] = result
    return context


def verify_webhook(token: str, expected: str) -> bool:
    return token == expected
