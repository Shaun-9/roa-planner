const MemberList = (() => {
  let allMembers = [];

  const ASPIRATION_LABELS = {
    SeniorTechExpert: "Senior Tech Expert",
    UnitLeader:       "Unit Leader",
    OfficerConversion:"Officer Conversion",
    TransitionOut:    "Transition Out"
  };

  const APTITUDE_CSS = {
    High:   "aptitude-high",
    Medium: "aptitude-medium",
    Low:    "aptitude-low"
  };

  const POTENTIAL_CSS = {
    High:   "potential-high",
    Medium: "potential-medium",
    Low:    "potential-low"
  };

  const COMPETENCY_CSS = {
    "Software Engineering":   "comp-se",
    "Cloud Engineering":      "comp-ce",
    "Data Analytics and AI":  "comp-da",
    "Product Management":     "comp-pm"
  };

  function renderTable(members) {
    const tbody = document.getElementById("member-tbody");
    if (!tbody) return;

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No members match your search.</td></tr>`;
      return;
    }

    tbody.innerHTML = members.map(m => `
      <tr>
        <td>${m.service_number}</td>
        <td><a href="member.html?id=${m.service_number}">${m.name}</a></td>
        <td><span class="rank-badge rank-${m.current_rank.toLowerCase()}">${m.current_rank}</span></td>
        <td><span class="comp-badge ${COMPETENCY_CSS[m.competency] || ''}">${m.competency}</span></td>
        <td>${ASPIRATION_LABELS[m.aspiration] || m.aspiration}</td>
        <td><span class="potential-badge ${POTENTIAL_CSS[m.potential_rating] || ''}">${m.potential_rating}</span></td>
        <td><span class="aptitude-badge ${APTITUDE_CSS[m.leadership_aptitude] || ''}">${m.leadership_aptitude}</span></td>
        <td>${m.end_of_service_date}</td>
      </tr>
    `).join("");
  }

  function applyFilter() {
    const query      = (document.getElementById("search-input").value || "").toLowerCase();
    const rankFilter = (document.getElementById("rank-filter").value || "").toLowerCase();
    const compFilter = (document.getElementById("comp-filter").value || "");

    const filtered = allMembers.filter(m => {
      const matchesQuery = !query ||
        m.name.toLowerCase().includes(query) ||
        m.service_number.toLowerCase().includes(query) ||
        m.competency.toLowerCase().includes(query);
      const matchesRank = !rankFilter || m.current_rank.toLowerCase() === rankFilter;
      const matchesComp = !compFilter || m.competency === compFilter;
      return matchesQuery && matchesRank && matchesComp;
    });

    renderTable(filtered);
    document.getElementById("member-count").textContent =
      `${filtered.length} member${filtered.length !== 1 ? "s" : ""}`;
  }

  async function init() {
    try {
      allMembers = await DataClient.getMembers();
      renderTable(allMembers);
      document.getElementById("member-count").textContent =
        `${allMembers.length} member${allMembers.length !== 1 ? "s" : ""}`;

      document.getElementById("search-input").addEventListener("input",  applyFilter);
      document.getElementById("rank-filter").addEventListener("change",  applyFilter);
      document.getElementById("comp-filter").addEventListener("change",  applyFilter);
    } catch (err) {
      document.getElementById("member-tbody").innerHTML =
        `<tr><td colspan="8" class="error-state">Failed to load members: ${err.message}</td></tr>`;
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", MemberList.init);
