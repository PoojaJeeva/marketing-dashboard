// GitHub API helpers — v3
const OWNER = "PoojaJeeva";
const REPO  = "marketing-dashboard";

function getToken() {
  return sessionStorage.getItem("gh_pat") || "";
}

async function ghFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  // Always read as text first — never call .json() directly on potentially empty bodies
  const text = await res.text();
  if (!text || !text.trim()) return {};
  return JSON.parse(text);
}

async function triggerWorkflow(workflow, inputs) {
  // GitHub returns 204 No Content on success — ghFetch handles that
  await ghFetch(
    `/repos/${OWNER}/${REPO}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main", inputs }),
    }
  );
}

async function getLatestRun(workflow) {
  const data = await ghFetch(
    `/repos/${OWNER}/${REPO}/actions/workflows/${workflow}/runs?per_page=1`
  );
  return data.workflow_runs?.[0] || null;
}

async function getRunStatus(runId) {
  return ghFetch(`/repos/${OWNER}/${REPO}/actions/runs/${runId}`);
}

async function fetchResultJson(path) {
  const data = await ghFetch(
    `/repos/${OWNER}/${REPO}/contents/${path}?ref=main`
  );
  const text = atob(data.content.replace(/\n/g, ""));
  return JSON.parse(text);
}

// Poll until workflow run completes or fails
function pollRun(runId, onStatus) {
  return new Promise((resolve, reject) => {
    const iv = setInterval(async () => {
      try {
        const run = await getRunStatus(runId);
        onStatus(run.status, run.conclusion);
        if (run.status === "completed") {
          clearInterval(iv);
          if (run.conclusion === "success") resolve(run);
          else reject(new Error(`Run failed: ${run.conclusion}`));
        }
      } catch (e) {
        clearInterval(iv);
        reject(e);
      }
    }, 8000);
  });
}
