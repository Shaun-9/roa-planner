const RoadmapView = (() => {
  // ── Module state ─────────────────────────────────────────────
  let _member         = null;   // mutable working copy
  let _originalMember = null;   // pristine copy for reset
  let _appointments   = null;   // appointment catalogue
  let _visItems       = null;   // vis.js DataSet
  let _visGroups      = null;   // vis.js DataSet
  let _timeline       = null;   // vis.js Timeline instance
  let _selections     = [];     // user's locked choices, indexed by stepIndex
  let _expandedStep   = null;   // stepIndex currently showing alternatives
  let _optionItemIds  = [];     // vis item IDs for displayed option blocks
  let _lastRoadmap    = null;   // most recent buildRoadmap result

  // ── Helpers ──────────────────────────────────────────────────
  function getServiceNumber() {
    return new URLSearchParams(window.location.search).get("id");
  }

  const ASPIRATION_LABELS = {
    SeniorTechExpert:  "Senior Tech Expert",
    UnitLeader:        "Unit Leader",
    OfficerConversion: "Officer Conversion",
    TransitionOut:     "Transition Out"
  };

  const COMPETENCY_CSS = {
    "Software Engineering":  "comp-se",
    "Cloud Engineering":     "comp-ce",
    "Data Analytics and AI": "comp-da",
    "Product Management":    "comp-pm"
  };

  // ── Appointment dropdown helpers ──────────────────────────────
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

  // ── Flags ─────────────────────────────────────────────────────
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

  // ── Core recalculate ─────────────────────────────────────────
  function recalculate() {
    _optionItemIds = [];
    _expandedStep  = null;
    _lastRoadmap   = RulesEngine.buildRoadmap(_member, _appointments, _selections);
    renderFlags(_lastRoadmap.flags);
    const visData  = RoadmapBuilder.toVisDataset(_lastRoadmap);
    _visItems.clear();
    _visGroups.clear();
    _visGroups.add(visData.groups);
    _visItems.add(visData.items);
  }

  // ── Interactive: expand step to show alternatives ─────────────
  function expandStep(stepIndex) {
    collapseOptions();
    if (!_lastRoadmap) return;
    const step = _lastRoadmap.steps[stepIndex];
    if (!step || step.allOptions.length <= 1) return;

    _expandedStep = stepIndex;
    const newOptions = [];

    step.allOptions.forEach((opt, i) => {
      if (opt.title === step.selectedAppt.title) return; // already shown as the main block
      const cat = opt.category.toLowerCase();
      newOptions.push({
        id:        `opt_${stepIndex}_${i}`,
        group:     opt.rank,
        content:   opt.title,
        start:     new Date(step.start),
        end:       new Date(RulesEngine.addMonths(step.start, opt.duration_months)),
        className: `appt-option appt-cat-${cat}`,
        title:     `<strong>${opt.title}</strong><br>${opt.rank} · ${opt.category} · ${opt.duration_months} months<br><em>Click to select</em>`,
        itemType:  "option",
        stepIndex: stepIndex,
        selectable: true,
        appointmentData: opt
      });
    });

    _optionItemIds = newOptions.map(o => o.id);
    _visItems.add(newOptions);
  }

  function collapseOptions() {
    if (_optionItemIds.length > 0) {
      _visItems.remove(_optionItemIds);
      _optionItemIds = [];
    }
    _expandedStep = null;
  }

  function selectOption(stepIndex, appointmentData) {
    collapseOptions();
    _selections[stepIndex] = appointmentData;
    _selections.splice(stepIndex + 1); // clear all downstream choices
    recalculate();
  }

  // ── Timeline click handler ────────────────────────────────────
  function handleTimelineClick(props) {
    if (props.what !== "item" || !props.item) {
      collapseOptions();
      return;
    }
    const item = _visItems.get(props.item);
    if (!item) return;

    if (item.itemType === "option") {
      selectOption(item.stepIndex, item.appointmentData);
      return;
    }

    if (!item.selectable) return;

    // Check the start date hasn't passed
    if (new Date(item.start) <= new Date()) return;

    if (_expandedStep === item.stepIndex) {
      collapseOptions();
    } else {
      expandStep(item.stepIndex);
    }
  }

  // ── localStorage persistence ──────────────────────────────────
  function storageKey() {
    return `roa_${_member.service_number}`;
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.member) Object.assign(_member, saved.member);
      if (Array.isArray(saved.selections)) _selections = saved.selections;
    } catch (e) { /* ignore corrupt storage */ }
  }

  function saveToStorage() {
    const overrides = {
      current_rank:           _member.current_rank,
      rank_date:              _member.rank_date,
      current_appointment:    _member.current_appointment,
      appointment_start_date: _member.appointment_start_date,
      aspiration:             _member.aspiration,
      cep:                    _member.cep,
      leadership_aptitude:    _member.leadership_aptitude,
      end_of_service_date:    _member.end_of_service_date
    };
    localStorage.setItem(storageKey(), JSON.stringify({
      member:     overrides,
      selections: _selections
    }));
    const btn = document.getElementById("btn-save");
    if (btn) { btn.textContent = "Saved ✓"; setTimeout(() => { btn.textContent = "Save"; }, 1800); }
  }

  function resetToOriginal() {
    localStorage.removeItem(storageKey());
    Object.assign(_member, _originalMember);
    _selections = [];
    renderProfile(_member);
    recalculate();
  }

  // ── Refresh appointment select when rank changes ──────────────
  function refreshAppointmentSelect(rank) {
    const sel = document.getElementById("edit-appointment");
    if (!sel) return;
    sel.innerHTML = apptOptionsHtml(rank, _member.current_appointment);
    _member.current_appointment = sel.value;
  }

  // ── Bind form change events ───────────────────────────────────
  function bindEvents() {
    function fieldChange() {
      _selections = []; // context changed — clear locked choices
      recalculate();
    }

    document.getElementById("edit-rank").addEventListener("change", e => {
      _member.current_rank = e.target.value;
      refreshAppointmentSelect(e.target.value);
      fieldChange();
    });
    document.getElementById("edit-appointment").addEventListener("change", e => {
      _member.current_appointment = e.target.value;
      fieldChange();
    });
    document.getElementById("edit-rank-date").addEventListener("change", e => {
      if (e.target.value) { _member.rank_date = e.target.value; fieldChange(); }
    });
    document.getElementById("edit-appt-start").addEventListener("change", e => {
      if (e.target.value) { _member.appointment_start_date = e.target.value; fieldChange(); }
    });
    document.getElementById("edit-eos").addEventListener("change", e => {
      if (e.target.value) { _member.end_of_service_date = e.target.value; fieldChange(); }
    });
    document.getElementById("edit-aspiration").addEventListener("change", e => {
      _member.aspiration = e.target.value; fieldChange();
    });
    document.getElementById("edit-cep").addEventListener("change", e => {
      _member.cep = e.target.value; fieldChange();
    });
    document.getElementById("edit-aptitude").addEventListener("change", e => {
      _member.leadership_aptitude = e.target.value; fieldChange();
    });

    document.getElementById("btn-save").addEventListener("click", saveToStorage);
    document.getElementById("btn-reset").addEventListener("click", resetToOriginal);
  }

  // ── Render editable profile ───────────────────────────────────
  function renderProfile(member) {
    const el = document.getElementById("member-profile");
    if (!el) return;

    const rankOpts = RULES.rank_order.map(r =>
      `<option value="${r}"${r === member.current_rank ? " selected" : ""}>${r}</option>`
    ).join("");

    const cepOpts = RULES.rank_order.map(r =>
      `<option value="${r}"${r === member.cep ? " selected" : ""}>${r}</option>`
    ).join("");

    const aspirationOpts = Object.entries(ASPIRATION_LABELS).map(([k, v]) =>
      `<option value="${k}"${k === member.aspiration ? " selected" : ""}>${v}</option>`
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
      <p class="profile-hint">Edit any field to update the projection. <strong>Save</strong> to persist changes across sessions.</p>
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
          <label>CEP</label>
          <select id="edit-cep" class="profile-select">${cepOpts}</select>
        </div>
        <div class="profile-field">
          <label>Leadership Aptitude</label>
          <select id="edit-aptitude" class="profile-select">${aptitudeOpts}</select>
        </div>
        <div class="profile-field">
          <label>Aspiration</label>
          <select id="edit-aspiration" class="profile-select">${aspirationOpts}</select>
        </div>
        <div class="profile-field">
          <label>End of Service</label>
          <input type="date" id="edit-eos" class="profile-input" value="${member.end_of_service_date}" />
        </div>
      </div>
      <div class="profile-actions">
        <button id="btn-save" class="btn-primary">Save</button>
        <button id="btn-reset" class="btn-secondary">Reset to original</button>
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

  // ── Render vis.js Timeline ────────────────────────────────────
  function renderChart(visData) {
    const container = document.getElementById("roadmap-container");
    if (!container) return;

    _visItems  = new vis.DataSet(visData.items);
    _visGroups = new vis.DataSet(visData.groups);

    const today = new Date();
    const viewStart = new Date(today); viewStart.setFullYear(viewStart.getFullYear() - 5);
    const viewEnd   = new Date(today); viewEnd.setFullYear(viewEnd.getFullYear() + 12);

    const options = {
      stack:           true,
      showCurrentTime: true,
      orientation:     { axis: "top" },
      start:           viewStart,
      end:             viewEnd,
      zoomMin:         1000 * 60 * 60 * 24 * 30,
      zoomMax:         1000 * 60 * 60 * 24 * 365 * 35,
      groupOrder:      "id",
      tooltip:         { followMouse: true, overflowMethod: "flip" },
      margin:          { item: { horizontal: 0, vertical: 4 } },
      selectable:      false
    };

    _timeline = new vis.Timeline(container, _visItems, _visGroups, options);
    _timeline.on("click", handleTimelineClick);
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
      <div class="legend-item"><span class="legend-swatch appt-option-sw"></span> Available alternative (click to select)</div>
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

      _originalMember = Object.assign({}, member);
      _member         = Object.assign({}, member);
      _appointments   = appointments;

      // Apply any saved overrides + selections from localStorage
      loadFromStorage();

      document.title = `${member.name} — ROA`;
      document.getElementById("page-title").textContent = `${member.name} — Career Roadmap`;

      renderProfile(_member);

      _lastRoadmap = RulesEngine.buildRoadmap(_member, _appointments, _selections);
      renderFlags(_lastRoadmap.flags);

      const visData = RoadmapBuilder.toVisDataset(_lastRoadmap);
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
