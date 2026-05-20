import base64
from email.mime.text import MIMEText
from typing import Optional

from integrations.google_client import GMAIL_SEND_SCOPES, build_google_service


def send_gmail_message(
    to: str,
    subject: str,
    body: str,
    credentials_json: Optional[str] = None,
) -> dict:
    if not to:
        raise ValueError("to is required")

    service = build_google_service(
        "gmail",
        "v1",
        GMAIL_SEND_SCOPES,
        credentials_json,
    )

    msg = MIMEText(body or "")
    msg["to"] = to
    msg["subject"] = subject or "Message from FlowMind"
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

    result = service.users().messages().send(
        userId="me",
        body={"raw": raw},
    ).execute()

    return {
        "message_id": result.get("id"),
        "thread_id": result.get("threadId"),
        "to": to,
    }


async def run_gmail_node(node: dict, context: dict) -> dict:
    """Execute a Gmail send node in the workflow."""
    config = node.get("data", {}).get("config", {})
    to = config.get("to", "")
    subject = config.get("subject", "Message from FlowMind")
    body = config.get("body") or context.get("ai_output", "")

    # Replace placeholders
    body = body.replace("{ai_output}", context.get("ai_output", ""))
    body = body.replace("{trigger.text}", context.get("trigger", {}).get("text", ""))

    try:
        credentials_json = (
            context.get("_credentials", {}).get("gmail")
            or context.get("_credentials", {}).get("google")
        )
        result = send_gmail_message(to, subject, body, credentials_json=credentials_json)
        context["gmail_sent"] = True
        context["gmail_to"] = to
        context["gmail_result"] = result

    except Exception as e:
        context["gmail_error"] = str(e)

    return context
