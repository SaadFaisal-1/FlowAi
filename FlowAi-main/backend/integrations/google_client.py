import json
import os
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


GOOGLE_SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
GMAIL_SEND_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
GOOGLE_CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def _load_credentials_info(credentials_json: Optional[str] = None) -> dict:
    raw = credentials_json or os.getenv("GOOGLE_CREDENTIALS_JSON")
    if not raw:
        raise ValueError("GOOGLE_CREDENTIALS_JSON is not configured")

    if isinstance(raw, dict):
        return raw

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("GOOGLE_CREDENTIALS_JSON must be valid JSON") from exc


def get_google_credentials(scopes: list[str], credentials_json: Optional[str] = None):
    info = _load_credentials_info(credentials_json)

    if info.get("type") == "service_account":
        return service_account.Credentials.from_service_account_info(
            info,
            scopes=scopes,
        )

    creds = Credentials.from_authorized_user_info(info, scopes=scopes)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def build_google_service(
    api_name: str,
    api_version: str,
    scopes: list[str],
    credentials_json: Optional[str] = None,
):
    creds = get_google_credentials(scopes, credentials_json)
    return build(api_name, api_version, credentials=creds, cache_discovery=False)


def get_google_status(credentials_json: Optional[str] = None) -> dict:
    try:
        info = _load_credentials_info(credentials_json)
        return {
            "configured": True,
            "credential_type": info.get("type", "authorized_user"),
            "project_id": info.get("project_id"),
            "client_email": info.get("client_email"),
        }
    except Exception as exc:
        return {
            "configured": False,
            "error": str(exc),
        }
