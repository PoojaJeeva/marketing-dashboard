import os
import json
import re
from datetime import datetime, timezone
from pathlib import Path
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
competitor = os.environ["COMPETITOR_NAME"]
product = os.environ["PRODUCT_NAME"]
slug = re.sub(r"[^a-z0-9]+", "-", f"{competitor}-{product}".lower()).strip("-")

schema = Path("agents/competitive-analysis/output-schema.json").read_text()
system_prompt = Path("agents/competitive-analysis/SKILL.md").read_text()

print(f"Running competitive analysis for: {competitor} / {product}")

messages = [
    {
        "role": "user",
        "content": (
            f"Analyze competitor: {competitor}, product: {product}.\n\n"
            f"Output schema to follow:\n{schema}\n\n"
            "Research this competitor thoroughly using web search, then return ONLY valid JSON "
            "matching the schema above. Do not include any text outside the JSON object."
        ),
    }
]

# Agentic loop — keep going until stop_reason is "end_turn"
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

    # Collect tool uses and text
    tool_uses = [b for b in response.content if b.type == "tool_use"]
    text_blocks = [b for b in response.content if b.type == "text"]

    if response.stop_reason == "end_turn" or not tool_uses:
        # Final response — extract JSON
        if text_blocks:
            result_text = text_blocks[-1].text
            break
        else:
            raise ValueError("No text in final response")

    # Append assistant message
    messages.append({"role": "assistant", "content": response.content})

    # Execute tool calls and build tool_result blocks
    tool_results = []
    for tu in tool_uses:
        print(f"  tool_use: {tu.name}({json.dumps(tu.input)[:120]})")
        tool_results.append(
            {
                "type": "tool_result",
                "tool_use_id": tu.id,
                "content": "Tool executed successfully.",  # web_search handles itself
            }
        )

    messages.append({"role": "user", "content": tool_results})

# Parse JSON from the result text (strip any markdown fences if present)
json_text = result_text.strip()
if json_text.startswith("```"):
    json_text = re.sub(r"^```[a-z]*\n?", "", json_text)
    json_text = re.sub(r"\n?```$", "", json_text)

result = json.loads(json_text)
result["analyzed_at"] = datetime.now(timezone.utc).isoformat()
result["competitor"] = competitor
result["product"] = product

out_path = Path(f"docs/data/competitive/{slug}.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(result, indent=2))
print(f"Saved: {out_path}")
