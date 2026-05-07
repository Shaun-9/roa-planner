const RoadmapView = (() => {
  function getServiceNumber() {
    return new URLSearchParams(window.location.search).get("id");
  }

  const ASPIRATION_LABELS = {
    SeniorTechExpert: "Senior Tech Expert",
    UnitLeader:       "Unit Leader",
    OfficerConversion:"Officer Conversion",
    TransitionOut:    "Transition Out"
  };

  const APTITUDE_CSS = { High: "aptitude-high", Medium: "aptitude-medium", Low: "aptitude-low" };
  const COMPETENCY_CSS = {
    "Software Engineering":  "comp-se",
    "Cloud Engineering":     "comp-ce",
    "Data Analytics and AI": "comp-da",
    "Product Management":    "comp-pm"
  };

  function renderFlags(flags) {
    const container = document.getElementById("flags-container");
    if (!container || !flags || flags.length === 0) { if (container) container.innerHTML = ""; return; }
    container.innerHTML = flags.map(f => `
      <div class="flag-banner flag-${f.type}">
        <span class="flag-icon">${f.type === "over" ? "🔴" : f.type === "warning" ? "⚠️" : "ℹ️"}</span>
        ${f.message}
      </div>
    `).join("");
  }

  function renderProfile(member) {
    const el = document.getElementById("member-profile");
    if (!el) return;

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
          <label>Current Rank</label>
          <span class="rank-badge rank-${member.current_rank.toLowerCase()}">${member.current_rank}</span>
        </div>
        <div class="profile-field">
          <label>Competency</label>
          <span class="comp-badge ${COMPETENCY_CSS[member.competency] || ''}">${member.competency}</span>
        </div>
        <div class="profile-field">
          <label>Current Appointment</label>
          <span>${member.current_appointment}</span>
        </div>
        <div class="profile-field">
          <label>Aspiration</label>
          <span>${ASPIRATION_LABELS[member.aspiration] || member.aspiration}</span>
        </div>
        <div class="profile-field">
          <label>Estimated Max Rank</label>
          <span class="rank-badge rank-${member.potential_rating.toLowerCase()}">${member.potential_rating}</span>
        </div>
        <div class="profile-field">
          <label>Leadership Aptitude</label>
          <span class="aptitude-badge ${APTITUDE_CSS[member.leadership_aptitude] || ''}">${member.leadership_aptitude}</span>
        </div>
        <div class="profile-field">
          <label>End of Service</label>
          <span>${member.end_of_service_date}</span>
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
  }

  function renderChart(visData) {
    const container = document.getElementById("roadmap-container");
    if (!container) return;

    const items  = new vis.DataSet(visData.items);
    const groups = new vis.DataSet(visData.groups);

    // Default view: 5 years before today → 12 years ahead
    const today = new Date();
    const viewStart = new Date(today); viewStart.setFullYear(viewStart.getFullYear() - 5);
    const viewEnd   = new Date(today); viewEnd.setFullYear(viewEnd.getFullYear() + 12);

    const options = {
      stack:           false,
      showCurrentTime: true,
      orientation:     { axis: "top" },
      start:           viewStart,
      end:             viewEnd,
      zoomMin:         1000 * 60 * 60 * 24 * 30,          // 1 month
      zoomMax:         1000 * 60 * 60 * 24 * 365 * 35,    // 35 years
      groupOrder:      "id",
      tooltip:         { followMouse: true, overflowMethod: "flip" },
      margin:          { item: { horizontal: 0, vertical: 4 } }
    };

    new vis.Timeline(container, items, groups, options);
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

      document.title = `${member.name} — ROA`;
      document.getElementById("page-title").textContent = `${member.name} — Career Roadmap`;

      renderProfile(member);

      const roadmap = RulesEngine.buildRoadmap(member, appointments);
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
