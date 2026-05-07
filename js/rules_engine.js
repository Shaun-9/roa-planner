const RulesEngine = (() => {
  function monthsBetween(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  }

  function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  function buildRoadmap(member, appointments) {
    const today = new Date();
    const eos = new Date(member.end_of_service_date);
    const rankOrder = RULES.rank_order;

    const currentRankIdx = rankOrder.indexOf(member.current_rank);
    const potentialIdx = rankOrder.indexOf(member.potential_rating);

    const serviceStart = new Date(member.service_start_date);
    const rankDate = new Date(member.rank_date);
    const apptStart = new Date(member.appointment_start_date);

    const currentTIS = monthsBetween(serviceStart, today);
    const currentTIG = monthsBetween(rankDate, today);
    const apptMonthsServed = monthsBetween(apptStart, today);

    const maxAppt = RULES.appointment_rules.max_duration_months;
    const warnAppt = RULES.appointment_rules.warning_threshold_months;

    const roadmap = {
      member,
      flags: [],
      appointments: [],
      events: []
    };

    // Flag current appointment tenure
    if (apptMonthsServed >= maxAppt) {
      roadmap.flags.push({
        type: "over",
        message: `Appointment tenure exceeded: ${member.name} has been in "${member.current_appointment}" for ${apptMonthsServed} months (limit: ${maxAppt} months). Immediate rotation required.`
      });
    } else if (apptMonthsServed >= warnAppt) {
      roadmap.flags.push({
        type: "warning",
        message: `Approaching tenure limit: ${member.name} has been in "${member.current_appointment}" for ${apptMonthsServed} months. Rotation recommended within ${maxAppt - apptMonthsServed} months.`
      });
    }

    // Current appointment block — extends to max 36 months from start, capped at EOS
    const currentApptEnd = addMonths(apptStart, maxAppt);
    const clampedCurrentEnd = currentApptEnd > eos ? eos : currentApptEnd;

    roadmap.appointments.push({
      label: member.current_appointment,
      rank: member.current_rank,
      start: apptStart,
      end: clampedCurrentEnd,
      status: "current",
      category: "current"
    });

    // Walk forward through rank promotions
    let cursorDate = clampedCurrentEnd;
    let cursorRankIdx = currentRankIdx;
    let accumulatedTIS = currentTIS;
    let accumulatedTIG = currentTIG;

    while (cursorDate < eos && cursorRankIdx < potentialIdx && cursorRankIdx < rankOrder.length - 1) {
      const nextRank = rankOrder[cursorRankIdx + 1];
      const threshold = RULES.rank_thresholds[nextRank];
      if (!threshold) break;

      const monthsToTIS = Math.max(0, threshold.min_tis_months - accumulatedTIS);
      const monthsToTIG = Math.max(0, threshold.min_tig_months - accumulatedTIG);
      const monthsToEligible = Math.max(monthsToTIS, monthsToTIG);

      const promotionDate = addMonths(cursorDate, monthsToEligible);
      if (promotionDate >= eos) break;

      roadmap.events.push({
        type: "rank_eligible",
        rank: nextRank,
        fromRank: rankOrder[cursorRankIdx],
        date: promotionDate
      });

      // Select next appointment based on aspiration + specialisation + rank band
      const aspirationPrefs = RULES.aspiration_paths[member.aspiration] || { preferred: [], avoid: [] };
      const nextRankIdx = cursorRankIdx + 1;

      let candidates = appointments.filter(a => {
        const minIdx = rankOrder.indexOf(a.min_rank);
        const maxIdx = rankOrder.indexOf(a.max_rank);
        return (
          nextRankIdx >= minIdx &&
          nextRankIdx <= maxIdx &&
          (a.specialisation === member.specialisation || a.specialisation === "Any") &&
          !aspirationPrefs.avoid.includes(a.category)
        );
      });

      // Score: preferred category = 2, neutral = 1
      candidates = candidates
        .map(a => ({ ...a, score: aspirationPrefs.preferred.includes(a.category) ? 2 : 1 }))
        .sort((a, b) => b.score - a.score);

      // Fallback: relax specialisation filter
      if (candidates.length === 0) {
        candidates = appointments.filter(a => {
          const minIdx = rankOrder.indexOf(a.min_rank);
          const maxIdx = rankOrder.indexOf(a.max_rank);
          return nextRankIdx >= minIdx && nextRankIdx <= maxIdx;
        });
      }

      if (candidates.length === 0) break;

      const chosen = candidates[0];
      const nextApptEnd = addMonths(promotionDate, chosen.duration_months);
      const clampedEnd = nextApptEnd > eos ? eos : nextApptEnd;

      roadmap.appointments.push({
        label: chosen.title,
        rank: nextRank,
        start: promotionDate,
        end: clampedEnd,
        status: "projected",
        category: chosen.category
      });

      const monthsInAppt = monthsBetween(promotionDate, clampedEnd);
      accumulatedTIS = threshold.min_tis_months + monthsBetween(cursorDate, promotionDate) + monthsInAppt;
      accumulatedTIG = monthsInAppt;

      cursorDate = clampedEnd;
      cursorRankIdx += 1;
    }

    return roadmap;
  }

  return { buildRoadmap, monthsBetween, addMonths };
})();
