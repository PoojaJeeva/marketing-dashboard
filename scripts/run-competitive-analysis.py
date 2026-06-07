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

print(f"Analyzing: {competitor} / {product}")

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8000,
    messages=[{
        "role": "user",
        "content": f"""You are a world-class competitive intelligence analyst for a B2B product marketing team.

Analyze competitor: {competitor}, product: {product}.

Return ONLY a valid JSON object matching this schema exactly. No markdown fences, no prose, no explanation — just the raw JSON object starting with {{ and ending with }}.

Schema:
{schema}

Requirements:
- Fill every field as specifically as possible with real data about {competitor} and {product}
- swot: at least 3 items per category
- battle_card.we_win_when and they_win_when: at least 3 scenarios each
- battle_card.objection_handling: at least 3 objections with responses
- campaign_opportunities.ad_angles_to_test: at least 3 specific ad angles
- Use null only if data is genuinely unknown
- pricing.notes: include any known pricing signals even if exact prices are unavailable
"""
    }]
)

# Extract text
result_text = ""
for block in response.content:
    if hasattr(block, "text") and block.text and block.text.strip():
        result_text = block.text.strip()
        break

if not result_text:
    raise ValueError(f"Empty response. Stop reason: {response.stop_reason}. Content types: {[type(b).__name__ for b in response.content]}")

print(f"Got response ({len(result_text)} chars), stop_reason={response.stop_reason}")

# Strip markdown fences if present
if result_text.startswith("```"):
    result_text = re.sub(r"^```[a-z]*\n?", "", result_text)
    result_text = re.sub(r"\n?```\s*$", "", result_text).strip()

result = json.loads(result_text)
result["analyzed_at"] = datetime.now(timezone.utc).isoformat()
result["competitor"] = competitor
result["product"] = product

out_path = Path(f"docs/data/competitive/{slug}.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(result, indent=2))
print(f"Saved: {out_path}")
