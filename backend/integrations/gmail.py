import os
import base64
from email.mime.text import MIMEText


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
        creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        if not creds_json:
            context["gmail_error"] = "Google credentials not configured"
            return context

        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        import json

        creds = Credentials(**json.loads(creds_json))
        service = build("gmail", "v1", credentials=creds)

        msg = MIMEText(body)
        msg["to"] = to
        msg["subject"] = subject
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

        service.users().messages().send(
            userId="me", body={"raw": raw}
        ).execute()

        context["gmail_sent"] = True
        context["gmail_to"] = to

    except Exception as e:
        context["gmail_error"] = str(e)

    return context
