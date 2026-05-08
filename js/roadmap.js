const RoadmapView = (() => {
  let _member      = null;
  let _appointments = null;
  let _visItems    = null;
  let _visGroups   = null;

  function getServiceNumber() {
    return new URLSearchParams(window.location.search).get("id");
  }

  const ASPIRATION_LABELS = {
    SeniorTechExpert: "Senior Tech Expert",
    UnitLeader:       "Unit Leader",
    OfficerConversion:"Officer Conversion",
    TransitionOut:    "Transition Out"
  };

  const COMPETENCY_CSS = {
    "Software Engineering":  "comp-se",
    "Cloud Engineering":     "comp-ce",
    "Data Analytics and AI": "comp-da",
    "Product Management":    "comp-pm"
  };

  const POTENTIAL_LABEL = {
    High:   "High → ME7",
    Medium: "Medium → ME6",
    Low:    "Low → ME5"
  };
  const POTENTIAL_CSS = {
    High:   "potential-high",
    Medium: "potential-medium",
    Low:    "potential-low"
  };

  // ── Appointment options for a given rank ──────────────────────
  function apptOptionsHtml(rank, current) {
    const list = (_appointments || []).filter(a =>
      a.competency === _member.competency && a.rank === rank
    );
    const found = list.some(a => a.title === current);
    let html = found ? "" : `<option value="${current || ""}" selected>${current || "(none)"}</option>`;
    html += list.map(a =>
      `<option value="${a.title}"${a.title === current ? " selected" : ""}>${a.title}</option>`
    ).join("");
    return html;
  }

  // ── Flags ──────────────────────────────────────────────────────
  function renderFlags(flags) {
    const container = document.getElementById("flags-container");
    if (!container) return;
    if (!flags || flags.length === 0) { container.innerHTML = ""; return; }
    container.innerHTML = flags.map(f => `
      <div class="flag-banner flag-${f.type}">
        <span class="flag-icon">${f.type === "over" ? "🔴" : f.type === "warning" ? "⚠️" : "ℹ️"}</span>
        ${f.message}
      </div>
    `).join("");
  }

  // ── Recalculate roadmap and refresh chart in place ────────────
  function recalculate() {
    const roadmap = RulesEngine.buildRoadmap(_member, _appointments);
    renderFlags(roadmap.flags);
    const visData = RoadmapBuilder.toVisDataset(roadmap);
    // Clear items before groups to avoid dangling group references
    _visItems.clear();
    _visGroups.clear();
    _visGroups.add(visData.groups);
    _visItems.add(visData.items);
  }

  // ── Repopulate appointment select when rank changes ───────────
  function refreshAppointmentSelect(rank) {
    const sel = document.getElementById("edit-appointment");
    if (!sel) return;
    sel.innerHTML = apptOptionsHtml(rank, _member.current_appointment);
    // If current appointment is no longer valid, adopt the new first option
    const firstVal = sel.options[0] ? sel.options[0].value : "";
    if (!sel.value) { sel.value = firstVal; }
    _member.current_appointment = sel.value;
  }

  // ── Bind change events on all editable fields ─────────────────
  function bindEvents() {
    document.getElementById("edit-rank").addEventListener("change", e => {
      _member.current_rank = e.target.value;
      refreshAppointmentSelect(e.target.value);
      recalculate();
    });

    document.getElementById("edit-appointment").addEventListener("change", e => {
      _member.current_appointment = e.target.value;
      recalculate();
    });

    document.getElementById("edit-rank-date").addEventListener("change", e => {
      if (e.target.value) { _member.rank_date = e.target.value; recalculate(); }
    });

    document.getElementById("edit-appt-start").addEventListener("change", e => {
      if (e.target.value) { _member.appointment_start_date = e.target.value; recalculate(); }
    });

    document.getElementById("edit-eos").addEventListener("change", e => {
      if (e.target.value) { _member.end_of_service_date = e.target.value; recalculate(); }
    });

    document.getElementById("edit-aspiration").addEventListener("change", e => {
      _member.aspiration = e.target.value;
      recalculate();
    });

    document.getElementById("edit-potential").addEventListener("change", e => {
      _member.potential_rating = e.target.value;
      recalculate();
    });

    document.getElementById("edit-aptitude").addEventListener("change", e => {
      _member.leadership_aptitude = e.target.value;
      recalculate();
    });
  }

  // ── Render editable profile form ──────────────────────────────
  function renderProfile(member) {
    const el = document.getElementById("member-profile");
    if (!el) return;

    const rankOpts = RULES.rank_order.map(r =>
      `<option value="${r}"${r === member.current_rank ? " selected" : ""}>${r}</option>`
    ).join("");

    const aspirationOpts = Object.entries(ASPIRATION_LABELS).map(([k, v]) =>
      `<option value="${k}"${k === member.aspiration ? " selected" : ""}>${v}</option>`
    ).join("");

    const potentialOpts = ["High", "Medium", "Low"].map(p =>
      `<option value="${p}"${p === member.potential_rating ? " selected" : ""}>${POTENTIAL_LABEL[p]}</option>`
    ).join("");

    const aptitudeOpts = ["High", "Medium", "Low"].map(a =>
      `<option value="${a}"${a === member.leadership_aptitude ? " selected" : ""}>${a}</option>`
    ).join("");

    const historyHtml = (member.posting_history || []).length > 0 ? `
      <div class="posting-history">
        <label>Posting History</label>
        <div class="history-list">
          ${member.posting_history.map(ph => `
            <div class="history-item">
              <span class="rank-badge rank-${ph.rank.toLowerCase()}">${ph.rank}</span>
              <span class="history-title">${ph.appointment}</span>
              <span class="history-dates">${ph.start_date} – ${ph.end_date}</span>
            </div>
          `).join("")}
        </div>
      </div>
    ` : "";

    el.innerHTML = `
      <div class="profile-hint">Edit any field below — the career projection updates automatically.</div>
      <div class="profile-grid">
        <div class="profile-field">
          <label>Name</label>
          <span>${member.name}</span>
        </div>
        <div class="profile-field">
          <label>Service No.</label>
          <span>${member.service_number}</span>
        </div>
        <div class="profile-field">
          <label>Competency</label>
          <span class="comp-badge ${COMPETENCY_CSS[member.competency] || ''}">${member.competency}</span>
        </div>
        <div class="profile-field">
          <label>Current Rank</label>
          <select id="edit-rank" class="profile-select">${rankOpts}</select>
        </div>
        <div class="profile-field">
          <label>Rank Date</label>
          <input type="date" id="edit-rank-date" class="profile-input" value="${member.rank_date}" />
        </div>
        <div class="profile-field">
          <label>Current Appointment</label>
          <select id="edit-appointment" class="profile-select">${apptOptionsHtml(member.current_rank, member.current_appointment)}</select>
        </div>
        <div class="profile-field">
          <label>Appt. Start Date</label>
          <input type="date" id="edit-appt-start" class="profile-input" value="${member.appointment_start_date}" />
        </div>
        <div class="profile-field">
          <label>Aspiration</label>
          <select id="edit-aspiration" class="profile-select">${aspirationOpts}</select>
        </div>
        <div class="profile-field">
          <label>Potential</label>
          <select id="edit-potential" class="profile-select">${potentialOpts}</select>
        </div>
        <div class="profile-field">
          <label>Leadership Aptitude</label>
          <select id="edit-aptitude" class="profile-select">${aptitudeOpts}</select>
        </div>
        <div class="profile-field">
          <label>End of Service</label>
          <input type="date" id="edit-eos" class="profile-input" value="${member.end_of_service_date}" />
        </div>
      </div>
      ${member.supervisor_notes ? `
        <div class="supervisor-notes">
          <label>Supervisor Notes</label>
          <p>${member.supervisor_notes}</p>
        </div>
      ` : ""}
      ${historyHtml}
    `;

    bindEvents();
  }

  // ── Render vis.js Timeline ─────────────────────────────────────
  function renderChart(visData) {
    const container = document.getElementById("roadmap-container");
    if (!container) return;

    _visItems  = new vis.DataSet(visData.items);
    _visGroups = new vis.DataSet(visData.groups);

    const today = new Date();
    const viewStart = new Date(today); viewStart.setFullYear(viewStart.getFullYear() - 5);
    const viewEnd   = new Date(today); viewEnd.setFullYear(viewEnd.getFullYear() + 12);

    const options = {
      stack:           false,
      showCurrentTime: true,
      orientation:     { axis: "top" },
      start:           viewStart,
      end:             viewEnd,
      zoomMin:         1000 * 60 * 60 * 24 * 30,
      zoomMax:         1000 * 60 * 60 * 24 * 365 * 35,
      groupOrder:      "id",
      tooltip:         { followMouse: true, overflowMethod: "flip" },
      margin:          { item: { horizontal: 0, vertical: 4 } }
    };

    new vis.Timeline(container, _visItems, _visGroups, options);
  }

  function renderLegend() {
    const el = document.getElementById("chart-legend");
    if (!el) return;
    el.innerHTML = `
      <div class="legend-item"><span class="legend-swatch appt-historical-sw"></span> Historical</div>
      <div class="legend-item"><span class="legend-swatch appt-current-sw"></span> Current</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-technical"></span> Technical (projected)</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-leadership"></span> Leadership (projected)</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-staff"></span> Staff (projected)</div>
      <div class="legend-item"><span class="legend-swatch appt-lateral appt-cat-leadership"></span> Lateral / Stabilising</div>
      <div class="legend-item"><span class="legend-swatch rank-milestone-swatch"></span> Rank promotion</div>
      <div class="legend-item"><span class="legend-swatch eos-marker-swatch"></span> End of service</div>
    `;
  }

  // ── Entry point ───────────────────────────────────────────────
  async function init() {
    const serviceNumber = getServiceNumber();
    if (!serviceNumber) {
      document.body.innerHTML = `<div class="error-page"><p>No member ID specified. <a href="index.html">Go back</a></p></div>`;
      return;
    }

    try {
      const [member, appointments] = await Promise.all([
        DataClient.getMember(serviceNumber),
        DataClient.getAppointments()
      ]);

      if (!member) {
        document.body.innerHTML = `<div class="error-page"><p>Member not found: ${serviceNumber}. <a href="index.html">Go back</a></p></div>`;
        return;
      }

      // Keep a mutable copy so edits don't corrupt the data cache
      _member      = Object.assign({}, member);
      _appointments = appointments;

      document.title = `${member.name} — ROA`;
      document.getElementById("page-title").textContent = `${member.name} — Career Roadmap`;

      renderProfile(_member);

      const roadmap = RulesEngine.buildRoadmap(_member, _appointments);
      renderFlags(roadmap.flags);

      const visData = RoadmapBuilder.toVisDataset(roadmap);
      renderChart(visData);
      renderLegend();

    } catch (err) {
      document.getElementById("flags-container").innerHTML =
        `<div class="flag-banner flag-over">Error loading roadmap: ${err.message}</div>`;
      console.error(err);
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", RoadmapView.init);
