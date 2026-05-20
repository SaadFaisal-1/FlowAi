from integrations.google_client import GOOGLE_CALENDAR_SCOPES, build_google_service
from typing import Optional


def create_calendar_event(
    title: str,
    start: str,
    end: str,
    description: str = "",
    calendar_id: str = "primary",
    timezone: str = "Asia/Karachi",
    credentials_json: Optional[str] = None,
) -> dict:
    if not start or not end:
        raise ValueError("start and end are required")

    service = build_google_service(
        "calendar",
        "v3",
        GOOGLE_CALENDAR_SCOPES,
        credentials_json,
    )
    event = {
        "summary": title or "FlowMind Event",
        "description": description or "",
        "start": {"dateTime": start, "timeZone": timezone},
        "end": {"dateTime": end, "timeZone": timezone},
    }
    result = service.events().insert(calendarId=calendar_id, body=event).execute()
    return {
        "event_id": result.get("id"),
        "html_link": result.get("htmlLink"),
        "calendar_id": calendar_id,
    }


async def run_calendar_node(node: dict, context: dict) -> dict:
    """Create a Google Calendar event."""
    config = node.get("data", {}).get("config", {})
    title = config.get("title", "FlowMind Event")
    start = config.get("start", "")
    end = config.get("end", "")
    description = config.get("description", "") or context.get("ai_output", "")

    try:
        result = create_calendar_event(
            title=title,
            start=start,
            end=end,
            description=description,
            calendar_id=config.get("calendar_id", "primary"),
            timezone=config.get("timezone", "Asia/Karachi"),
            credentials_json=(
                context.get("_credentials", {}).get("calendar")
                or context.get("_credentials", {}).get("google")
            ),
        )
        context["calendar_event_id"] = result.get("event_id")
        context["calendar_event_link"] = result.get("html_link")

    except Exception as e:
        context["calendar_error"] = str(e)

    return context
