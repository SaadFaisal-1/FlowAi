import os
import json


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
        creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        if not creds_json or not sheet_id:
            context["sheets_error"] = "Google credentials or sheet_id not configured"
            return context

        import gspread
        gc = gspread.service_account_from_dict(json.loads(creds_json))
        ws = gc.open_by_key(sheet_id).sheet1
        ws.append_row(row)
        context["sheets_appended"] = True
        context["sheets_row"] = row

    except Exception as e:
        context["sheets_error"] = str(e)

    return context
