import os
import json
import re
from datetime import datetime, timezone
from pathlib import Path
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
product = os.environ["PRODUCT_NAME"]
goal = os.environ["CAMPAIGN_GOAL"]
vertical = os.environ["VERTICAL"]
slug = re.sub(r"[^a-z0-9]+", "-", f"{product}-{vertical}".lower()).strip("-")

schema = Path("agents/campaign-launch-planner/output-schema.json").read_text()
system_prompt = Path("agents/campaign-launch-planner/SKILL.md").read_text()

print(f"Running campaign planner for: {product} / {goal} / {vertical}")

messages = [
    {
        "role": "user",
        "content": (
            f"Product: {product}\nGoal: {goal}\nVertical: {vertical}\n\n"
            f"Output schema to follow:\n{schema}\n\n"
            "Research current market trends and best practices for this product and vertical, "
            "then return ONLY valid JSON matching the schema above. "
            "Do not include any text outside the JSON object."
        ),
    }
]

tools = [{"type": "web_search_20250305", "name": "web_search"}]

while True:
    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=8096,
        system=system_prompt,
        tools=tools,
        messages=messages,
    )

    print(f"  stop_reason: {response.stop_reason}")

    tool_uses = [b for b in response.content if b.type == "tool_use"]
    text_blocks = [b for b in response.content if b.type == "text"]

    if response.stop_reason == "end_turn" or not tool_uses:
        if text_blocks:
            result_text = text_blocks[-1].text
            break
        else:
            raise ValueError("No text in final response")

    messages.append({"role": "assistant", "content": response.content})

    tool_results = []
    for tu in tool_uses:
        print(f"  tool_use: {tu.name}({json.dumps(tu.input)[:120]})")
        tool_results.append(
            {
                "type": "tool_result",
                "tool_use_id": tu.id,
                "content": "Tool executed successfully.",
            }
        )

    messages.append({"role": "user", "content": tool_results})

json_text = result_text.strip()
if json_text.startswith("```"):
    json_text = re.sub(r"^```[a-z]*\n?", "", json_text)
    json_text = re.sub(r"\n?```$", "", json_text)

result = json.loads(json_text)
result["generated_at"] = datetime.now(timezone.utc).isoformat()
result["product"] = product
result["goal"] = goal
result["vertical"] = vertical

out_path = Path(f"docs/data/campaigns/{slug}.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(result, indent=2))
print(f"Saved: {out_path}")
