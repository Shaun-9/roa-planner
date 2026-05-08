const RoadmapView = (() => {
  // ── Module state ─────────────────────────────────────────────
  let _member         = null;
  let _originalMember = null;
  let _appointments   = null;
  let _visItems       = null;
  let _visGroups      = null;
  let _timeline       = null;
  let _selections     = [];
  let _lastRoadmap    = null;
  let _panelStepIndex = null;

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
    _panelStepIndex = null;
    const panel = document.getElementById("appt-selector");
    if (panel) panel.classList.add("hidden");

    _lastRoadmap = RulesEngine.buildRoadmap(_member, _appointments, _selections);
    renderFlags(_lastRoadmap.flags);
    const visData = RoadmapBuilder.toVisDataset(_lastRoadmap);
    _visItems.clear();
    _visGroups.clear();
    _visGroups.add(visData.groups);
    _visItems.add(visData.items);
  }

  // ── Selection panel ───────────────────────────────────────────
  function showSelectionPanel(stepIndex) {
    if (!_lastRoadmap) return;
    const step = _lastRoadmap.steps[stepIndex];
    if (!step) return;

    _panelStepIndex = stepIndex;
    document.getElementById("selector-label").textContent =
      `Step ${stepIndex + 1} — choose appointment at ${step.rank}`;

    // Appointment option cards
    const optContainer = document.getElementById("selector-options");
    if (step.isSpecialEvent) {
      optContainer.innerHTML = `<p class="selector-empty">This step is a planned special event. Select an appointment below to replace it, or use ↺ Auto-pick.</p>`;
    } else if (step.allOptions.length === 0) {
      optContainer.innerHTML = `<p class="selector-empty">No alternative appointments available at this step.</p>`;
    } else {
      optContainer.innerHTML = step.allOptions.map((opt, i) => {
        const isSelected = !step.isSpecialEvent && step.selectedAppt &&
                           opt.title === step.selectedAppt.title;
        const catLower = opt.category.toLowerCase();
        return `
          <div class="selector-card${isSelected ? " selector-card-active" : ""}"
               data-step="${stepIndex}" data-idx="${i}">
            <div class="selector-card-name">${opt.title}</div>
            <div class="selector-card-meta">
              <span class="cat-dot cat-${catLower}"></span>
              ${opt.rank} · ${opt.category} · ${opt.duration_months} months
              ${isSelected ? "<span class='selector-card-badge'>Current</span>" : ""}
            </div>
          </div>`;
      }).join("");

      optContainer.querySelectorAll(".selector-card").forEach(card => {
        card.addEventListener("click", () => {
          const optIdx = parseInt(card.dataset.idx, 10);
          const chosen = step.allOptions[optIdx];
          hideSelectionPanel();
          selectOption(stepIndex, chosen);
        });
      });
    }

    // Special event buttons
    const specContainer = document.getElementById("selector-special");
    const SPECIAL_EVENTS = [
      { type: "overseas_study", label: "Overseas Study",  duration: 12 },
      { type: "npl",            label: "No-Pay Leave",    duration: 6  },
      { type: "transit",        label: "Career Break",    duration: 6  }
    ];
    specContainer.innerHTML = SPECIAL_EVENTS.map(evt => {
      const isActive = step.isSpecialEvent &&
                       _selections[stepIndex] &&
                       _selections[stepIndex].type === evt.type;
      return `<button class="selector-evt-btn${isActive ? " selector-evt-active" : ""}"
                      data-type="${evt.type}" data-dur="${evt.duration}">
        ${evt.label} · ${evt.duration}m
      </button>`;
    }).join("");

    specContainer.querySelectorAll(".selector-evt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectSpecialEvent(stepIndex, btn.dataset.type, parseInt(btn.dataset.dur, 10));
      });
    });

    document.getElementById("appt-selector").classList.remove("hidden");
  }

  function hideSelectionPanel() {
    const panel = document.getElementById("appt-selector");
    if (panel) panel.classList.add("hidden");
    _panelStepIndex = null;
  }

  function selectOption(stepIndex, appointmentData) {
    _selections[stepIndex] = appointmentData;
    _selections.splice(stepIndex + 1);
    recalculate();
  }

  function selectSpecialEvent(stepIndex, type, duration_months) {
    _selections[stepIndex] = { _specialEvent: true, type, duration_months };
    _selections.splice(stepIndex + 1);
    hideSelectionPanel();
    recalculate();
  }

  // ── Timeline click handler ────────────────────────────────────
  function handleTimelineClick(props) {
    if (props.what !== "item" || !props.item) {
      hideSelectionPanel();
      return;
    }
    const item = _visItems.get(props.item);
    if (!item || !item.selectable) {
      hideSelectionPanel();
      return;
    }
    if (new Date(item.start) <= new Date()) return; // past — not editable

    if (item.stepIndex === _panelStepIndex) {
      hideSelectionPanel(); // toggle off
    } else {
      showSelectionPanel(item.stepIndex);
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
      if (saved.member)                  Object.assign(_member, saved.member);
      if (Array.isArray(saved.history))  _member.posting_history = saved.history;
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
      history:    _member.posting_history,
      selections: _selections
    }));
    const btn = document.getElementById("btn-save");
    if (btn) { btn.textContent = "Saved ✓"; setTimeout(() => { btn.textContent = "Save"; }, 1800); }
  }

  function resetToOriginal() {
    localStorage.removeItem(storageKey());
    _member = JSON.parse(JSON.stringify(_originalMember)); // deep copy
    _selections = [];
    renderProfile(_member);
    renderHistoryEditor();
    recalculate();
  }

  // ── Posting history editor ────────────────────────────────────
  function historyRowHtml(ph, i) {
    const rankOpts = RULES.rank_order.map(r =>
      `<option value="${r}"${r === ph.rank ? " selected" : ""}>${r}</option>`
    ).join("");
    const typeOpts = [
      ["normal",         "Normal Appointment"],
      ["overseas_study", "Overseas Study"],
      ["npl",            "No-Pay Leave (NPL)"],
      ["transit",        "Career Break"]
    ].map(([v, l]) =>
      `<option value="${v}"${v === (ph.type || "normal") ? " selected" : ""}>${l}</option>`
    ).join("");

    return `
      <tr>
        <td><select class="hist-rank profile-select" data-idx="${i}">${rankOpts}</select></td>
        <td><input class="hist-appt profile-input" data-idx="${i}" value="${(ph.appointment || "").replace(/"/g, "&quot;")}" /></td>
        <td><select class="hist-type profile-select" data-idx="${i}">${typeOpts}</select></td>
        <td><input type="date" class="hist-start profile-input" data-idx="${i}" value="${ph.start_date || ""}" /></td>
        <td><input type="date" class="hist-end profile-input" data-idx="${i}" value="${ph.end_date || ""}" /></td>
        <td><button class="btn-danger btn-small hist-delete" data-idx="${i}">✕</button></td>
      </tr>`;
  }

  function renderHistoryEditor() {
    const el = document.getElementById("history-editor");
    if (!el) return;
    const history = _member.posting_history || [];
    if (history.length === 0) {
      el.innerHTML = `<p class="empty-state" style="padding:12px 0 4px; text-align:left">No posting history recorded. Click "+ Add Entry" to begin.</p>`;
    } else {
      el.innerHTML = `
        <table class="history-table">
          <thead><tr>
            <th>Rank</th><th>Appointment / Event</th><th>Type</th>
            <th>Start</th><th>End</th><th></th>
          </tr></thead>
          <tbody>${history.map((ph, i) => historyRowHtml(ph, i)).join("")}</tbody>
        </table>`;
    }
    // Note: event listeners are bound once via initHistoryEvents() in init()
    // and use delegation on the stable #history-editor element, so no binding here.
  }

  // Called once from init() — delegation survives innerHTML replacement.
  function initHistoryEvents() {
    const el = document.getElementById("history-editor");
    if (!el) return;

    el.addEventListener("change", e => {
      const t   = e.target;
      const idx = parseInt(t.dataset.idx, 10);
      if (isNaN(idx) || !_member.posting_history || !_member.posting_history[idx]) return;
      if (t.classList.contains("hist-rank"))  _member.posting_history[idx].rank       = t.value;
      if (t.classList.contains("hist-type"))  _member.posting_history[idx].type       = t.value;
      if (t.classList.contains("hist-start")) _member.posting_history[idx].start_date = t.value;
      if (t.classList.contains("hist-end"))   _member.posting_history[idx].end_date   = t.value;
      _selections = [];
      recalculate();
    });

    el.addEventListener("input", e => {
      const t   = e.target;
      const idx = parseInt(t.dataset.idx, 10);
      if (isNaN(idx) || !t.classList.contains("hist-appt")) return;
      if (!_member.posting_history || !_member.posting_history[idx]) return;
      _member.posting_history[idx].appointment = t.value;
      clearTimeout(el._debounce);
      el._debounce = setTimeout(() => { _selections = []; recalculate(); }, 500);
    });

    el.addEventListener("click", e => {
      const btn = e.target.closest(".hist-delete");
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      if (isNaN(idx) || !_member.posting_history) return;
      _member.posting_history.splice(idx, 1);
      _selections = [];
      renderHistoryEditor();
      recalculate();
    });
  }

  // ── Refresh appointment select when rank changes ──────────────
  function refreshAppointmentSelect(rank) {
    const sel = document.getElementById("edit-appointment");
    if (!sel) return;
    sel.innerHTML = apptOptionsHtml(rank, _member.current_appointment);
    _member.current_appointment = sel.value;
  }

  // ── Bind profile form events (re-bound on every renderProfile) ──
  function bindProfileEvents() {
    function fieldChange() {
      _selections = [];
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
    `;

    bindProfileEvents();
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
      <div class="legend-item"><span class="legend-swatch appt-study-sw"></span> Overseas Study</div>
      <div class="legend-item"><span class="legend-swatch appt-npl-sw"></span> No-Pay Leave</div>
      <div class="legend-item"><span class="legend-swatch appt-transit-sw"></span> Career Break</div>
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

      _originalMember = JSON.parse(JSON.stringify(member)); // deep copy
      _member         = JSON.parse(JSON.stringify(member));
      _appointments   = appointments;

      loadFromStorage();

      document.title = `${member.name} — ROA`;
      document.getElementById("page-title").textContent = `${member.name} — Career Roadmap`;

      renderProfile(_member);
      renderHistoryEditor();
      initHistoryEvents(); // bind once — delegation survives re-renders

      // Static one-time event listeners (elements not re-rendered)
      document.getElementById("btn-add-history").addEventListener("click", () => {
        if (!_member.posting_history) _member.posting_history = [];
        _member.posting_history.push({
          appointment: "", rank: _member.current_rank,
          start_date: "", end_date: "", type: "normal"
        });
        renderHistoryEditor();
      });

      document.getElementById("selector-close").addEventListener("click", hideSelectionPanel);
      document.getElementById("selector-auto").addEventListener("click", () => {
        if (_panelStepIndex !== null) {
          delete _selections[_panelStepIndex];
          _selections.splice(_panelStepIndex + 1);
          hideSelectionPanel();
          recalculate();
        }
      });

      _lastRoadmap = RulesEngine.buildRoadmap(_member, _appointments, _selections);
      renderFlags(_lastRoadmap.flags);

      const visData = RoadmapBuilder.toVisDataset(_lastRoadmap);
      renderChart(visData);
      renderLegend();

    } catch (err) {
      const fc = document.getElementById("flags-container");
      if (fc) fc.innerHTML = `<div class="flag-banner flag-over">Error loading roadmap: ${err.message}</div>`;
      console.error(err);
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", RoadmapView.init);
