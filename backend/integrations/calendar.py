import os
import json


async def run_calendar_node(node: dict, context: dict) -> dict:
    """Create a Google Calendar event."""
    config = node.get("data", {}).get("config", {})
    title = config.get("title", "FlowMind Event")
    start = config.get("start", "")
    end = config.get("end", "")
    description = config.get("description", "") or context.get("ai_output", "")

    try:
        creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        if not creds_json:
            context["calendar_error"] = "Google credentials not configured"
            return context

        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build

        creds = Credentials(**json.loads(creds_json))
        service = build("calendar", "v3", credentials=creds)

        event = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start, "timeZone": "Asia/Karachi"},
            "end": {"dateTime": end, "timeZone": "Asia/Karachi"},
        }
        result = service.events().insert(calendarId="primary", body=event).execute()
        context["calendar_event_id"] = result.get("id")
        context["calendar_event_link"] = result.get("htmlLink")

    except Exception as e:
        context["calendar_error"] = str(e)

    return context
