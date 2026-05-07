const RoadmapBuilder = (() => {
  function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }

  function toVisDataset(roadmap) {
    const rankOrder = RULES.rank_order;
    const currentIdx = rankOrder.indexOf(roadmap.member.current_rank);
    const potentialIdx = rankOrder.indexOf(roadmap.member.potential_rating);

    // Groups: one swimlane per rank from current to potential
    const groups = [];
    for (let i = currentIdx; i <= potentialIdx; i++) {
      groups.push({ id: rankOrder[i], content: rankOrder[i] });
    }

    const items = [];
    let itemId = 1;

    // Appointment blocks
    roadmap.appointments.forEach(appt => {
      const cssClass = appt.status === "current"
        ? "appt-current"
        : `appt-projected appt-cat-${appt.category.toLowerCase()}`;

      const durationMonths = RulesEngine.monthsBetween(appt.start, appt.end);

      items.push({
        id: itemId++,
        group: appt.rank,
        content: appt.label,
        start: new Date(appt.start),
        end: new Date(appt.end),
        className: cssClass,
        title: `<strong>${appt.label}</strong><br>${appt.rank} · ${appt.category}<br>${formatDate(appt.start)} – ${formatDate(appt.end)}<br>${durationMonths} months`
      });
    });

    // Rank promotion eligibility markers
    roadmap.events.forEach(evt => {
      if (evt.type === "rank_eligible") {
        items.push({
          id: itemId++,
          group: evt.fromRank,
          content: `▲ ${evt.rank}`,
          start: new Date(evt.date),
          type: "point",
          className: "rank-milestone",
          title: `Earliest eligible for <strong>${evt.rank}</strong>: ${formatDate(evt.date)}`
        });
      }
    });

    // EOS marker on the highest rank group
    const topRank = groups[groups.length - 1].id;
    items.push({
      id: itemId++,
      group: topRank,
      content: "EOS",
      start: new Date(roadmap.member.end_of_service_date),
      type: "point",
      className: "eos-marker",
      title: `End of Service: ${formatDate(roadmap.member.end_of_service_date)}`
    });

    return { groups, items, flags: roadmap.flags };
  }

  return { toVisDataset, formatDate };
})();
