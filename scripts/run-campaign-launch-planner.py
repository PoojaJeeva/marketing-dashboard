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

print(f"Planning campaign: {product} / {goal} / {vertical}")

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8000,
    messages=[{
        "role": "user",
        "content": f"""You are a senior product marketing strategist for a B2B deep-tech hardware company.

Build a complete campaign and launch plan for:
- Product: {product}
- Goal: {goal}
- Vertical: {vertical}

Return ONLY a valid JSON object matching this schema exactly. No markdown fences, no prose, no explanation — just the raw JSON object starting with {{ and ending with }}.

Schema:
{schema}

Requirements:
- channel_recommendation.channels: at least 4 channels with budget_pct values that sum to 100
- budget_split.allocation: must match channels and sum to 100%
- messaging_hierarchy.headline: max 8 words, punchy and specific
- launch_timeline.phases: at least 3 phases (pre-launch, launch week, post-launch)
- sales_enablement.talk_track: at least 4 steps
- sales_enablement.objection_handling: at least 3 objections with responses
- kpis.channel_kpis: one KPI per recommended channel
- risk_contingency.risks: at least 2 risks with mitigations
{"- launch_timeline.defense_timing_note: include US Government FY timing guidance" if "Defense" in vertical else "- launch_timeline.defense_timing_note: set to null"}
- All recommendations must be specific and actionable, not generic templates
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
result["generated_at"] = datetime.now(timezone.utc).isoformat()
result["product"] = product
result["goal"] = goal
result["vertical"] = vertical

out_path = Path(f"docs/data/campaigns/{slug}.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(result, indent=2))
print(f"Saved: {out_path}")
