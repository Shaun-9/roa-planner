const MemberList = (() => {
  let allMembers = [];

  const ASPIRATION_LABELS = {
    SeniorTechExpert: "Senior Tech Expert",
    UnitLeader: "Unit Leader",
    OfficerConversion: "Officer Conversion",
    TransitionOut: "Transition Out"
  };

  function renderTable(members) {
    const tbody = document.getElementById("member-tbody");
    if (!tbody) return;

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No members match your search.</td></tr>`;
      return;
    }

    tbody.innerHTML = members.map(m => `
      <tr>
        <td>${m.service_number}</td>
        <td><a href="member.html?id=${m.service_number}">${m.name}</a></td>
        <td><span class="rank-badge rank-${m.current_rank.toLowerCase()}">${m.current_rank}</span></td>
        <td>${m.specialisation}</td>
        <td>${ASPIRATION_LABELS[m.aspiration] || m.aspiration}</td>
        <td>${m.potential_rating}</td>
        <td>${m.end_of_service_date}</td>
      </tr>
    `).join("");
  }

  function applyFilter() {
    const query = (document.getElementById("search-input").value || "").toLowerCase();
    const rankFilter = (document.getElementById("rank-filter").value || "").toLowerCase();

    const filtered = allMembers.filter(m => {
      const matchesQuery = !query ||
        m.name.toLowerCase().includes(query) ||
        m.service_number.toLowerCase().includes(query) ||
        m.specialisation.toLowerCase().includes(query);
      const matchesRank = !rankFilter || m.current_rank.toLowerCase() === rankFilter;
      return matchesQuery && matchesRank;
    });

    renderTable(filtered);
    document.getElementById("member-count").textContent = `${filtered.length} member${filtered.length !== 1 ? "s" : ""}`;
  }

  async function init() {
    try {
      allMembers = await DataClient.getMembers();
      renderTable(allMembers);
      document.getElementById("member-count").textContent = `${allMembers.length} member${allMembers.length !== 1 ? "s" : ""}`;

      document.getElementById("search-input").addEventListener("input", applyFilter);
      document.getElementById("rank-filter").addEventListener("change", applyFilter);
    } catch (err) {
      document.getElementById("member-tbody").innerHTML =
        `<tr><td colspan="7" class="error-state">Failed to load members: ${err.message}</td></tr>`;
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", MemberList.init);
