const RoadmapView = (() => {
  function getServiceNumber() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function renderFlags(flags) {
    const container = document.getElementById("flags-container");
    if (!container) return;

    if (!flags || flags.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = flags.map(f => `
      <div class="flag-banner flag-${f.type}">
        <span class="flag-icon">${f.type === "over" ? "🔴" : "⚠️"}</span>
        ${f.message}
      </div>
    `).join("");
  }

  function renderProfile(member) {
    const el = document.getElementById("member-profile");
    if (!el) return;

    const ASPIRATION_LABELS = {
      SeniorTechExpert: "Senior Tech Expert",
      UnitLeader: "Unit Leader",
      OfficerConversion: "Officer Conversion",
      TransitionOut: "Transition Out"
    };

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
          <label>Specialisation</label>
          <span>${member.specialisation}</span>
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
    `;
  }

  function renderChart(visData) {
    const container = document.getElementById("roadmap-container");
    if (!container) return;

    const items = new vis.DataSet(visData.items);
    const groups = new vis.DataSet(visData.groups);

    const today = new Date();
    const minDate = new Date(today);
    minDate.setFullYear(minDate.getFullYear() - 1);

    const options = {
      stack: false,
      showCurrentTime: true,
      orientation: { axis: "top" },
      zoomMin: 1000 * 60 * 60 * 24 * 30,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 25,
      start: minDate,
      groupOrder: "id",
      tooltip: { followMouse: true, overflowMethod: "flip" },
      margin: { item: { horizontal: 0, vertical: 4 } }
    };

    new vis.Timeline(container, items, groups, options);
  }

  function renderLegend() {
    const el = document.getElementById("chart-legend");
    if (!el) return;
    el.innerHTML = `
      <div class="legend-item"><span class="legend-swatch appt-current"></span> Current appointment</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-technical"></span> Technical (projected)</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-leadership"></span> Leadership (projected)</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-training"></span> Training (projected)</div>
      <div class="legend-item"><span class="legend-swatch appt-projected appt-cat-staff"></span> Staff (projected)</div>
      <div class="legend-item"><span class="legend-swatch rank-milestone-swatch"></span> Rank eligible marker</div>
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
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", RoadmapView.init);
