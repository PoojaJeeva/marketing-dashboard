// Shared app logic for both agent pages

// On load: prompt for PAT if not in sessionStorage
document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("gh_pat")) {
    const pat = prompt(
      "Enter your GitHub Personal Access Token (PAT) with repo scope.\n" +
      "It stays in this browser tab only — never sent anywhere except GitHub.com.\n\n" +
      "Create one at: github.com/settings/tokens → Generate new token (classic) → check 'repo'"
    );
    if (pat) sessionStorage.setItem("gh_pat", pat.trim());
  }
});

function setStatus(msg, type) {
  const bar = document.getElementById("status-bar");
  const dot = document.getElementById("status-dot");
  const txt = document.getElementById("status-text");
  if (!bar) return;
  bar.classList.add("visible");
  dot.className = "status-dot " + type;
  txt.textContent = msg;
}

function showResults(heading, sub) {
  const header = document.getElementById("results-header");
  if (header) {
    header.classList.add("visible");
    document.getElementById("results-title").textContent = heading;
    document.getElementById("results-sub").textContent = sub;
  }
  const tabs = document.getElementById("section-tabs");
  if (tabs) tabs.classList.add("visible");
  const grid = document.getElementById("results-grid");
  if (grid) grid.classList.add("visible");
}

function populateTabs(count) {
  const tabs = document.getElementById("section-tabs");
  if (!tabs) return;
  tabs.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const b = document.createElement("button");
    b.className = "tab-btn" + (i === 1 ? " active" : "");
    b.textContent = `${i}`;
    b.onclick = () => scrollToSection(i, b);
    tabs.appendChild(b);
  }
}

function scrollToSection(num, btn) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const card = document.querySelector(`[data-section="${num}"]`);
  if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function copyBattleCard(data) {
  const bc = data.battle_card || data.sales_enablement || {};
  let text = `BATTLE CARD — ${data.competitor || data.product}\n${"=".repeat(50)}\n\n`;

  if (bc.we_win_when) {
    text += "WE WIN WHEN:\n" + (bc.we_win_when || []).map(x => `• ${x}`).join("\n") + "\n\n";
    text += "THEY WIN WHEN:\n" + (bc.they_win_when || []).map(x => `• ${x}`).join("\n") + "\n\n";
  }

  if (bc.objection_handling) {
    text += "OBJECTION HANDLING:\n";
    (bc.objection_handling || []).forEach(o => {
      text += `Q: ${o.objection}\nA: ${o.response}\n\n`;
    });
  }

  if (bc.talk_track) {
    text += "TALK TRACK:\n" + (bc.talk_track || []).map(x => `• ${x}`).join("\n") + "\n\n";
  }

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copy-btn");
    if (btn) { btn.textContent = "Copied!"; setTimeout(() => btn.textContent = "Copy Battle Card", 2000); }
  });
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(data.competitor || data.product || "result").replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
}
