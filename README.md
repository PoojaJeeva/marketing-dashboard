# Marketing Intelligence Dashboard

Sub-agentic marketing research dashboard hosted on GitHub Pages. Two AI agents powered by Claude claude-opus-4-8.

## Agents

| Agent | Input | Output |
|---|---|---|
| Competitive Analysis | Competitor name + product name | 10-section intelligence report: company overview, product analysis, pricing, positioning, ICP, GTM, SWOT, battle card, campaign opportunities, launch counter-strategy |
| Campaign & Launch Planner | Product name + goal + vertical | 10-section plan: campaign brief, buyer persona, messaging hierarchy, channel recommendation, budget split, content plan, launch timeline, sales enablement, KPIs, risk & contingency |

## Setup

### 1. Fork / clone this repo

### 2. Add GitHub Secrets

Go to Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

### 3. Enable GitHub Pages

Settings → Pages → Source: **Deploy from branch** → Branch: `main` → Folder: `/dashboard`

### 4. Create a Personal Access Token (PAT)

Settings → Developer settings → Personal access tokens → Classic → Generate with `repo` scope.

You'll paste this into the dashboard when it first loads. It lives in your browser's sessionStorage only.

### 5. Access the dashboard

`https://<your-username>.github.io/marketing-dashboard/`

## How It Works

1. You fill in the input form on GitHub Pages
2. The page calls GitHub REST API → triggers a `workflow_dispatch` on the matching GitHub Actions workflow
3. GitHub Actions runs the Python agent script with Claude claude-opus-4-8 + web search
4. Agent saves results as JSON to `dashboard/data/`
5. GitHub Actions commits the JSON file back to the repo
6. GitHub Pages auto-deploys the new file
7. The dashboard polls for completion, fetches the JSON, and renders all 10 sections

Total time: ~2–4 minutes per analysis.
