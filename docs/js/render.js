// Render helpers shared by both agent pages

function pills(arr, cls = "") {
  if (!arr || !arr.length) return '<span class="pill">—</span>';
  return arr.map((x) => `<span class="pill ${cls}">${esc(x)}</span>`).join("");
}

function bulletList(arr) {
  if (!arr || !arr.length) return "<p style='color:var(--text-muted)'>—</p>";
  return `<ul class="bullet-list">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function card(num, title, icon, bodyHtml) {
  return `
    <div class="section-card" data-section="${num}">
      <div class="section-card-header" onclick="toggleCard(this)">
        <h3><span class="section-num">${num}</span>${icon} ${esc(title)}</h3>
        <span style="color:var(--text-muted);font-size:0.8rem">▾</span>
      </div>
      <div class="section-card-body">${bodyHtml}</div>
    </div>`;
}

function toggleCard(header) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector("span:last-child");
  if (body.style.display === "none") {
    body.style.display = "";
    chevron.textContent = "▾";
  } else {
    body.style.display = "none";
    chevron.textContent = "▸";
  }
}

// ──────────────────────────────────────────────
// COMPETITIVE ANALYSIS RENDER
// ──────────────────────────────────────────────

function renderCompetitiveAnalysis(d) {
  const sections = [];

  // 1 Company Overview
  sections.push(card(1, "Company Overview", "🏢", `
    <div class="kv-list">
      <div class="kv-row"><span class="kv-key">Founded</span><span class="kv-val">${esc(d.company_overview?.founded) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Size</span><span class="kv-val">${esc(d.company_overview?.size) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Headquarters</span><span class="kv-val">${esc(d.company_overview?.headquarters) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Funding</span><span class="kv-val">${esc(d.company_overview?.funding) || "—"}</span></div>
    </div>
    <hr class="divider">
    <p style="font-size:0.875rem">${esc(d.company_overview?.description) || "—"}</p>
    ${d.company_overview?.recent_news?.length ? `
      <div class="news-list">
        ${d.company_overview.recent_news.map(n => `<div class="news-item">${esc(n)}</div>`).join("")}
      </div>` : ""}
  `));

  // 2 Product Analysis
  const specs = d.product_analysis?.technical_specs || {};
  sections.push(card(2, "Product Analysis", "⚙️", `
    <p style="font-size:0.875rem;margin-bottom:1rem">${esc(d.product_analysis?.description) || "—"}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;flex-wrap:wrap">
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">Key Features</p>
        ${bulletList(d.product_analysis?.key_features)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">Limitations</p>
        ${bulletList(d.product_analysis?.limitations)}
      </div>
    </div>
    ${Object.keys(specs).length ? `
      <hr class="divider">
      <table class="data-table">
        <thead><tr><th>Spec</th><th>Value</th></tr></thead>
        <tbody>${Object.entries(specs).map(([k,v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</tbody>
      </table>` : ""}
    ${d.product_analysis?.certifications?.length ? `
      <hr class="divider">
      <div>${pills(d.product_analysis.certifications, "accent")}</div>` : ""}
  `));

  // 3 Pricing
  sections.push(card(3, "Pricing Intelligence", "💰", `
    <div class="kv-list" style="margin-bottom:1rem">
      <div class="kv-row"><span class="kv-key">Model</span><span class="kv-val">${esc(d.pricing?.model) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Free tier</span><span class="kv-val">${d.pricing?.free_tier ? "Yes" : "No"}</span></div>
      <div class="kv-row"><span class="kv-key">Enterprise</span><span class="kv-val">${d.pricing?.enterprise_pricing ? "Yes" : "No"}</span></div>
    </div>
    ${d.pricing?.tiers?.length ? `
      <table class="data-table">
        <thead><tr><th>Tier</th><th>Price</th><th>Includes</th></tr></thead>
        <tbody>${d.pricing.tiers.map(t => `
          <tr><td>${esc(t.name)}</td><td>${esc(t.price)}</td><td>${(t.includes||[]).join(", ")}</td></tr>
        `).join("")}</tbody>
      </table>` : ""}
    ${d.pricing?.notes ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:.75rem">${esc(d.pricing.notes)}</p>` : ""}
  `));

  // 4 Messaging & Positioning
  sections.push(card(4, "Messaging & Positioning", "🎯", `
    ${d.positioning?.tagline ? `<div style="font-size:1.2rem;font-weight:700;margin-bottom:1rem;color:var(--accent2)">"${esc(d.positioning.tagline)}"</div>` : ""}
    <p style="font-size:0.875rem;margin-bottom:1rem">${esc(d.positioning?.positioning_statement) || "—"}</p>
    <hr class="divider">
    <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">Key Messages</p>
    ${bulletList(d.positioning?.key_messages)}
    ${d.positioning?.tone ? `<hr class="divider"><div><span class="pill accent">Tone: ${esc(d.positioning.tone)}</span></div>` : ""}
  `));

  // 5 ICP
  sections.push(card(5, "ICP & Target Audience", "👥", `
    <div class="kv-list" style="margin-bottom:1rem">
      <div class="kv-row"><span class="kv-key">Company size</span><span class="kv-val">${esc(d.icp?.company_size) || "—"}</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;flex-wrap:wrap">
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Industries</p>
        ${pills(d.icp?.industries)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Personas</p>
        ${pills(d.icp?.buyer_personas, "blue")}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Geographies</p>
        ${pills(d.icp?.geographies)}
      </div>
    </div>
  `));

  // 6 GTM
  sections.push(card(6, "GTM Strategy", "🚀", `
    <div class="kv-list" style="margin-bottom:1rem">
      <div class="kv-row"><span class="kv-key">Sales motion</span><span class="kv-val">${esc(d.gtm?.sales_motion) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Content</span><span class="kv-val">${esc(d.gtm?.content_strategy) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Community</span><span class="kv-val">${esc(d.gtm?.community) || "—"}</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Primary Channels</p>
        ${bulletList(d.gtm?.primary_channels)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Partnerships</p>
        ${bulletList(d.gtm?.partnerships)}
      </div>
    </div>
  `));

  // 7 SWOT
  const sw = d.swot || {};
  sections.push(card(7, "SWOT Analysis", "📊", `
    <div class="swot-grid">
      <div class="swot-cell strengths">
        <h4>Strengths</h4>
        <ul>${(sw.strengths||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      </div>
      <div class="swot-cell weaknesses">
        <h4>Weaknesses</h4>
        <ul>${(sw.weaknesses||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      </div>
      <div class="swot-cell opportunities">
        <h4>Opportunities</h4>
        <ul>${(sw.opportunities||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      </div>
      <div class="swot-cell threats">
        <h4>Threats</h4>
        <ul>${(sw.threats||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      </div>
    </div>
  `));

  // 8 Battle Card
  const bc = d.battle_card || {};
  sections.push(card(8, "Battle Card", "⚔️", `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem">
      <div>
        <p style="font-size:0.75rem;color:#4ade80;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">We Win When</p>
        ${bulletList(bc.we_win_when)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:#f87171;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">They Win When</p>
        ${bulletList(bc.they_win_when)}
      </div>
    </div>
    <hr class="divider">
    <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.75rem">Objection Handling</p>
    ${bc.objection_handling?.length ? `
      <table class="data-table">
        <thead><tr><th>Objection</th><th>Response</th></tr></thead>
        <tbody>${bc.objection_handling.map(o=>`<tr><td style="color:#f87171">${esc(o.objection)}</td><td>${esc(o.response)}</td></tr>`).join("")}</tbody>
      </table>` : "<p style='color:var(--text-muted);font-size:.875rem'>—</p>"}
    ${bc.trap_questions?.length ? `
      <hr class="divider">
      <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">Trap Questions</p>
      ${bulletList(bc.trap_questions)}` : ""}
  `));

  // 9 Campaign Opportunities
  const co = d.campaign_opportunities || {};
  sections.push(card(9, "Campaign Opportunities", "💡", `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem">
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Gaps in Their Messaging</p>
        ${bulletList(co.gaps_in_their_messaging)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Keywords They Don't Own</p>
        ${pills(co.keywords_they_dont_own, "green")}
      </div>
    </div>
    <hr class="divider">
    <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.75rem">Ad Angles to Test</p>
    ${bulletList(co.ad_angles_to_test)}
  `));

  // 10 Launch Counter-Strategy
  const lcs = d.launch_counter_strategy || {};
  sections.push(card(10, "Launch Counter-Strategy", "🛡️", `
    <p style="font-size:0.875rem;margin-bottom:1rem"><strong>Recommended positioning:</strong> ${esc(lcs.if_launching_against_them) || "—"}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem">
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Channels to Prioritize</p>
        ${bulletList(lcs.channels_to_prioritize)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Messages to Lead With</p>
        ${bulletList(lcs.messages_to_lead_with)}
      </div>
    </div>
    <div class="kv-list">
      <div class="kv-row"><span class="kv-key">Timing</span><span class="kv-val">${esc(lcs.timing_recommendation) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Risk to watch</span><span class="kv-val">${esc(lcs.risk_to_watch) || "—"}</span></div>
    </div>
  `));

  return sections.join("");
}

// ──────────────────────────────────────────────
// CAMPAIGN & LAUNCH PLANNER RENDER
// ──────────────────────────────────────────────

function renderCampaignPlan(d) {
  const sections = [];

  // 1 Campaign Brief
  const cb = d.campaign_brief || {};
  sections.push(card(1, "Campaign Brief", "📋", `
    <div class="kv-list">
      <div class="kv-row"><span class="kv-key">Objective</span><span class="kv-val">${esc(cb.objective) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Target audience</span><span class="kv-val">${esc(cb.target_audience) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Key message</span><span class="kv-val">${esc(cb.key_message) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">Proof point</span><span class="kv-val">${esc(cb.proof_point) || "—"}</span></div>
      <div class="kv-row"><span class="kv-key">CTA</span><span class="kv-val">${esc(cb.call_to_action) || "—"}</span></div>
    </div>
  `));

  // 2 Buyer Persona & ICP
  const bp = d.buyer_persona || {};
  const pp = bp.primary_persona || {};
  sections.push(card(2, "Buyer Persona & ICP", "👤", `
    <div style="margin-bottom:1rem">
      <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.25rem">Primary Persona</p>
      <p style="font-size:0.9rem;font-weight:600">${esc(pp.role) || "—"}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Pain Points</p>
        ${bulletList(pp.pain_points)}
      </div>
      <div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.5rem">Info Sources</p>
        ${bulletList(pp.information_sources)}
      </div>
    </div>
    <hr class="divider">
    <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:.75rem">Buying Committee</p>
    ${bp.buying_committee?.length ? `
      <table class="data-table">
        <thead><tr><th>Role</th><th>Their Question</th><th>Content Needed</th></tr></thead>
        <tbody>${bp.buying_committee.map(r=>`<tr><td><span class="pill blue">${esc(r.role)}</span></td><td>${esc(r.their_question)}</td><td>${esc(r.content_needed)}</td></tr>`).join("")}</tbody>
      </table>` : ""}
  `));

  // 3 Messaging Hierarchy
  const mh = d.messaging_hierarchy || {};
  sections.push(card(3, "Messaging Hierarchy", "✍️", `
    <div style="margin-bottom:1.25rem">
      <div style="font-size:1.4rem;font-weight:800;color:var(--text);margin-bottom:.35rem">${esc(mh.headline) || "—"}</div>
      <div style="font-size:1rem;color:var(--accent2);margin-bottom:.75rem">${esc(mh.subheadline) || "—"}</div>
      <p style="font-size:0.875rem;color:var(--text-muted)">${esc(mh.body_message) || "—"}</p>
    </div>
    <hr class="divider">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div>
        <p style="font-size:0.75rem;color:#4ade80;margin-bottom:.5rem">Words to Use</p>
        ${pills(mh.words_to_use, "green")}
      </div>
      <div>
        <p style="font-size:0.75rem;color:#f87171;margin-bottom:.5rem">Words to Avoid</p>
        ${pills(mh.words_to_avoid, "red")}
      </div>
    </div>
    ${mh.tone ? `<hr class="divider"><span class="pill accent">Tone: ${esc(mh.tone)}</span>` : ""}
  `));

  // 4 Channel Recommendation
  const cr = d.channel_recommendation || {};
  sections.push(card(4, "Channel Recommendation", "📡", `
    ${cr.channel_sequence ? `<div style="background:var(--surface2);border-radius:var(--radius-sm);padding:.875rem 1rem;font-size:.85rem;margin-bottom:1rem;color:var(--accent2)">${esc(cr.channel_sequence)}</div>` : ""}
    <div class="channel-list">
      ${(cr.channels || []).map(c => `
        <div class="channel-item">
          <div class="channel-item-left">
            <h4>${esc(c.channel)}</h4>
            <p>${esc(c.rationale)}</p>
            <p style="margin-top:.25rem;color:var(--text-muted);font-size:.78rem">KPI: ${esc(c.kpi)}</p>
          </div>
          <div class="channel-item-right">
            <div class="pct">${c.budget_pct}%</div>
            <div><span class="badge-label ${(c.priority||"").toLowerCase()}">${esc(c.priority)}</span></div>
          </div>
        </div>`).join("")}
    </div>
  `));

  // 5 Budget Split
  const bs = d.budget_split || {};
  sections.push(card(5, "Budget Split", "💵", `
    ${bs.total_budget_assumption ? `<p style="font-size:.875rem;margin-bottom:1rem">Based on <strong>${esc(bs.total_budget_assumption)}</strong></p>` : ""}
    <div class="budget-bar-wrap">
      ${(bs.allocation || []).map(a => `
        <div class="budget-row">
          <div class="budget-row-label">
            <span>${esc(a.channel)}</span>
            <span>${a.pct}% &nbsp; ${esc(a.monthly_est)}</span>
          </div>
          <div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${a.pct}%"></div></div>
        </div>`).join("")}
    </div>
  `));

  // 6 Content & Creative Plan
  const cc = d.content_creative_plan || {};
  sections.push(card(6, "Content & Creative Plan", "🎬", `
    ${cc.hero_asset ? `
      <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:.875rem 1rem;margin-bottom:1rem">
        <p style="font-size:.72rem;color:var(--text-muted);margin-bottom:.25rem">HERO ASSET</p>
        <p style="font-size:.875rem">${esc(cc.hero_asset)}</p>
      </div>` : ""}
    ${cc.supporting_assets?.length ? `
      <table class="data-table" style="margin-bottom:1rem">
        <thead><tr><th>Format</th><th>Purpose</th><th>Specs</th></tr></thead>
        <tbody>${cc.supporting_assets.map(a=>`<tr><td>${esc(a.format)}</td><td>${esc(a.purpose)}</td><td style="color:var(--text-muted);font-size:.8rem">${esc(a.specs)}</td></tr>`).join("")}</tbody>
      </table>` : ""}
    ${cc.content_calendar?.length ? `
      <p style="font-size:.75rem;color:var(--text-muted);margin-bottom:.5rem">Content Calendar</p>
      ${cc.content_calendar.map(w=>`
        <div style="display:flex;gap:.75rem;padding:.5rem 0;border-bottom:1px solid var(--border);font-size:.85rem">
          <span style="color:var(--accent2);min-width:56px;flex-shrink:0">Week ${w.week}</span>
          <span>${esc(w.action)}</span>
        </div>`).join("")}` : ""}
  `));

  // 7 Launch Timeline
  const lt = d.launch_timeline || {};
  sections.push(card(7, "Launch Timeline", "📅", `
    ${lt.defense_timing_note ? `<div style="background:var(--orange-bg);border:1px solid #d97706;border-radius:var(--radius-sm);padding:.75rem 1rem;font-size:.82rem;margin-bottom:1rem;color:#fbbf24">⚠️ ${esc(lt.defense_timing_note)}</div>` : ""}
    ${(lt.phases || []).map(p => `
      <div style="margin-bottom:1rem">
        <p style="font-size:.8rem;font-weight:600;color:var(--accent2);margin-bottom:.4rem">${esc(p.phase)}</p>
        ${bulletList(p.actions)}
      </div>`).join("")}
  `));

  // 8 Sales Enablement
  const se = d.sales_enablement || {};
  sections.push(card(8, "Sales Enablement", "🤝", `
    ${se.one_pager_summary ? `<p style="font-size:.875rem;margin-bottom:1rem">${esc(se.one_pager_summary)}</p><hr class="divider">` : ""}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem">
      <div>
        <p style="font-size:.75rem;color:var(--text-muted);margin-bottom:.5rem">Talk Track</p>
        ${bulletList(se.talk_track)}
      </div>
      <div>
        <p style="font-size:.75rem;color:var(--text-muted);margin-bottom:.5rem">Demo Sequence</p>
        ${bulletList(se.demo_sequence)}
      </div>
    </div>
    ${se.objection_handling?.length ? `
      <hr class="divider">
      <p style="font-size:.75rem;color:var(--text-muted);margin-bottom:.5rem">Objection Handling</p>
      <table class="data-table">
        <thead><tr><th>Objection</th><th>Response</th></tr></thead>
        <tbody>${se.objection_handling.map(o=>`<tr><td style="color:#f87171">${esc(o.objection)}</td><td>${esc(o.response)}</td></tr>`).join("")}</tbody>
      </table>` : ""}
  `));

  // 9 KPIs
  const kp = d.kpis || {};
  sections.push(card(9, "KPIs & Success Metrics", "📈", `
    ${kp.primary_kpi ? `<div style="background:var(--blue-bg);border:1px solid #2563eb;border-radius:var(--radius-sm);padding:.875rem 1rem;margin-bottom:1rem"><p style="font-size:.72rem;color:#60a5fa;margin-bottom:.25rem">PRIMARY KPI</p><p style="font-size:.95rem;font-weight:600">${esc(kp.primary_kpi)}</p></div>` : ""}
    ${kp.channel_kpis?.length ? `
      <table class="data-table">
        <thead><tr><th>Channel</th><th>KPI</th><th>Target</th></tr></thead>
        <tbody>${kp.channel_kpis.map(k=>`<tr><td>${esc(k.channel)}</td><td>${esc(k.kpi)}</td><td style="color:#4ade80;font-weight:600">${esc(k.target)}</td></tr>`).join("")}</tbody>
      </table>` : ""}
    ${kp.reporting_cadence ? `<p style="font-size:.8rem;color:var(--text-muted);margin-top:.75rem">Cadence: ${esc(kp.reporting_cadence)}</p>` : ""}
  `));

  // 10 Risk & Contingency
  const rc = d.risk_contingency || {};
  sections.push(card(10, "Risk & Contingency", "⚠️", `
    <div class="risk-list">
      ${(rc.risks || []).map(r => `
        <div class="risk-item">
          <div class="risk-item-header">
            <h4>${esc(r.risk)}</h4>
            <span class="badge-label ${(r.probability||"").toLowerCase()}">${esc(r.probability)}</span>
          </div>
          <p>${esc(r.mitigation)}</p>
        </div>`).join("")}
    </div>
    ${rc.pivot_triggers?.length ? `
      <hr class="divider">
      <p style="font-size:.75rem;color:var(--text-muted);margin-bottom:.5rem">Pivot Triggers</p>
      ${bulletList(rc.pivot_triggers)}` : ""}
  `));

  return sections.join("");
}
