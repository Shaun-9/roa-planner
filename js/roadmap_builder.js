const RoadmapBuilder = (() => {
  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }

  function toVisDataset(roadmap) {
    const rankOrder = RULES.rank_order;

    const usedRankIndices = roadmap.appointments
      .map(a => rankOrder.indexOf(a.rank))
      .filter(i => i >= 0);

    const cepRank = roadmap.member.cep || roadmap.member.potential_rating;
    const maxRankIdx = Math.max(
      ...usedRankIndices,
      rankOrder.indexOf(cepRank)
    );
    const minRankIdx = Math.min(...usedRankIndices);

    const groups = [];
    for (let i = minRankIdx; i <= maxRankIdx; i++) {
      groups.push({ id: rankOrder[i], content: rankOrder[i] });
    }

    const today = new Date();
    const items = [];
    let itemId  = 1;

    roadmap.appointments.forEach(appt => {
      const cat = (appt.category || "").toLowerCase();
      let cssClass;
      switch (appt.status) {
        case "historical": cssClass = "appt-historical"; break;
        case "current":    cssClass = "appt-current";    break;
        case "projected":  cssClass = `appt-projected appt-cat-${cat} appt-selectable`; break;
        case "lateral":    cssClass = `appt-lateral appt-cat-${cat} appt-selectable`;   break;
        default:           cssClass = "appt-projected";
      }

      const durationMonths = RulesEngine.monthsBetween(appt.start, appt.end);
      const statusLabel    = appt.status.charAt(0).toUpperCase() + appt.status.slice(1);
      const isSelectable   = (appt.status === "projected" || appt.status === "lateral")
                             && new Date(appt.start) > today;
      const hint = isSelectable ? "<br><em style='font-size:10px'>Click to see alternatives</em>" : "";

      const item = {
        id:        itemId++,
        group:     appt.rank,
        content:   appt.label,
        start:     new Date(appt.start),
        end:       new Date(appt.end),
        className: cssClass,
        title:     `<strong>${appt.label}</strong><br>${appt.rank} · ${statusLabel}<br>${formatDate(appt.start)} – ${formatDate(appt.end)}<br>${durationMonths} months${hint}`,
        itemType:  appt.status,
        selectable: isSelectable
      };

      if (appt.stepIndex !== undefined) item.stepIndex = appt.stepIndex;

      items.push(item);
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
          title:     `Promoted to <strong>${evt.rank}</strong>: ${formatDate(evt.date)}`,
          itemType:  "milestone"
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
      title:     `End of Service: ${formatDate(roadmap.member.end_of_service_date)}`,
      itemType:  "eos"
    });

    return { groups, items, flags: roadmap.flags };
  }

  return { toVisDataset, formatDate };
})();
