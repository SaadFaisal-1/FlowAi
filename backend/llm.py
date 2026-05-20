import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))


async def run_ai_node(node: dict, context: dict) -> dict:
    """
    AI node — calls GPT-4o-mini with a configurable prompt.
    Placeholders like {trigger.text} are replaced with context values.
    """
    config = node.get("data", {}).get("config", {})
    prompt_template = config.get(
        "prompt",
        "Analyze this message and reply helpfully: {trigger_text}"
    )
    model = config.get("model", "gpt-4o-mini")
    max_tokens = int(config.get("max_tokens", 300))

    # Replace simple placeholders from context
    trigger = context.get("trigger", {})
    prompt = prompt_template.replace(
        "{trigger_text}", trigger.get("text", "")
    ).replace(
        "{trigger.text}", trigger.get("text", "")
    ).replace(
        "{ai_output}", context.get("ai_output", "")
    )

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant for business workflow automation."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
        )
        ai_text = response.choices[0].message.content or ""
        context["ai_output"] = ai_text
        context["last_message"] = ai_text
    except Exception as e:
        context["ai_error"] = str(e)
        context["ai_output"] = "AI unavailable"

    return context
