const RoadmapBuilder = (() => {
  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }

  function toVisDataset(roadmap) {
    const rankOrder = RULES.rank_order;

    // Collect all ranks used across historical + current + projected appointments
    const usedRankIndices = roadmap.appointments
      .map(a => rankOrder.indexOf(a.rank))
      .filter(i => i >= 0);

    const minRankIdx = Math.min(...usedRankIndices);
    const maxRankIdx = Math.max(
      ...usedRankIndices,
      rankOrder.indexOf(roadmap.member.potential_rating)
    );

    // Groups = one swimlane per rank in range
    const groups = [];
    for (let i = minRankIdx; i <= maxRankIdx; i++) {
      groups.push({ id: rankOrder[i], content: rankOrder[i] });
    }

    const items = [];
    let itemId = 1;

    // Appointment blocks
    roadmap.appointments.forEach(appt => {
      let cssClass;
      const cat = (appt.category || "").toLowerCase();
      switch (appt.status) {
        case "historical": cssClass = "appt-historical";                         break;
        case "current":    cssClass = "appt-current";                            break;
        case "projected":  cssClass = `appt-projected appt-cat-${cat}`;          break;
        case "lateral":    cssClass = `appt-lateral appt-cat-${cat}`;            break;
        default:           cssClass = "appt-projected";
      }

      const durationMonths = RulesEngine.monthsBetween(appt.start, appt.end);
      const statusLabel = appt.status.charAt(0).toUpperCase() + appt.status.slice(1);

      items.push({
        id:        itemId++,
        group:     appt.rank,
        content:   appt.label,
        start:     new Date(appt.start),
        end:       new Date(appt.end),
        className: cssClass,
        title:     `<strong>${appt.label}</strong><br>${appt.rank} · ${statusLabel}<br>${formatDate(appt.start)} – ${formatDate(appt.end)}<br>${durationMonths} months`
      });
    });

    // Rank promotion markers
    roadmap.events.forEach(evt => {
      if (evt.type === "rank_eligible") {
        items.push({
          id:        itemId++,
          group:     evt.fromRank,
          content:   `▲ ${evt.rank}`,
          start:     new Date(evt.date),
          type:      "point",
          className: "rank-milestone",
          title:     `Promoted to <strong>${evt.rank}</strong>: ${formatDate(evt.date)}`
        });
      }
    });

    // EOS marker on the highest rank group
    const topRank = groups[groups.length - 1].id;
    items.push({
      id:        itemId++,
      group:     topRank,
      content:   "EOS",
      start:     new Date(roadmap.member.end_of_service_date),
      type:      "point",
      className: "eos-marker",
      title:     `End of Service: ${formatDate(roadmap.member.end_of_service_date)}`
    });

    return { groups, items, flags: roadmap.flags };
  }

  return { toVisDataset, formatDate };
})();
