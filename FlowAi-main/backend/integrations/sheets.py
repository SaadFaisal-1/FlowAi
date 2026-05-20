from integrations.google_client import GOOGLE_SHEETS_SCOPES, build_google_service
from typing import Optional


def append_sheet_row(
    spreadsheet_id: str,
    row: list,
    sheet_name: str = "Sheet1",
    credentials_json: Optional[str] = None,
) -> dict:
    if not spreadsheet_id:
        raise ValueError("spreadsheet_id is required")
    if not row:
        raise ValueError("row must contain at least one value")

    service = build_google_service(
        "sheets",
        "v4",
        GOOGLE_SHEETS_SCOPES,
        credentials_json,
    )
    result = (
        service.spreadsheets()
        .values()
        .append(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet_name}!A:Z",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [row]},
        )
        .execute()
    )
    return {
        "spreadsheet_id": spreadsheet_id,
        "sheet_name": sheet_name,
        "updated_range": result.get("updates", {}).get("updatedRange"),
        "updated_rows": result.get("updates", {}).get("updatedRows", 0),
    }


def read_sheet_values(
    spreadsheet_id: str,
    sheet_range: str = "Sheet1!A1:Z100",
    credentials_json: Optional[str] = None,
) -> dict:
    if not spreadsheet_id:
        raise ValueError("spreadsheet_id is required")

    service = build_google_service(
        "sheets",
        "v4",
        GOOGLE_SHEETS_SCOPES,
        credentials_json,
    )
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=sheet_range)
        .execute()
    )
    return {
        "spreadsheet_id": spreadsheet_id,
        "range": result.get("range", sheet_range),
        "values": result.get("values", []),
    }


async def run_sheets_node(node: dict, context: dict) -> dict:
    """Append a row to Google Sheets."""
    config = node.get("data", {}).get("config", {})
    sheet_id = config.get("sheet_id", "")
    row_template = config.get("row", [])

    # Fill placeholders in each cell
    trigger = context.get("trigger", {})
    row = []
    for cell in row_template:
        cell = str(cell).replace("{trigger.text}", trigger.get("text", ""))
        cell = cell.replace("{ai_output}", context.get("ai_output", ""))
        cell = cell.replace("{trigger.from}", trigger.get("from", ""))
        row.append(cell)

    try:
        if not sheet_id:
            context["sheets_error"] = "sheet_id not configured"
            return context

        sheet_name = config.get("sheet_name", "Sheet1")
        credentials_json = (
            context.get("_credentials", {}).get("sheets")
            or context.get("_credentials", {}).get("google")
        )
        result = append_sheet_row(sheet_id, row, sheet_name, credentials_json=credentials_json)
        context["sheets_appended"] = True
        context["sheets_row"] = row
        context["sheets_result"] = result

    except Exception as e:
        context["sheets_error"] = str(e)

    return context
