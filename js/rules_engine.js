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

  const APTITUDE_LEVEL = { "Low": 0, "Medium": 1, "High": 2 };

  function passesLeadershipGate(appt, member) {
    if (appt.requires_leadership === "medium") {
      return (APTITUDE_LEVEL[member.leadership_aptitude] || 0) >= 1;
    }
    return true;
  }

  // All appointments that pass gate and aspiration filter for a given rank,
  // sorted by aspiration preference score.
  function getValidOptions(competencyAppts, rank, member) {
    const prefs = RULES.aspiration_paths[member.aspiration] || { preferred: [], avoid: [] };
    return competencyAppts
      .filter(a =>
        a.rank === rank &&
        passesLeadershipGate(a, member) &&
        !prefs.avoid.includes(a.category)
      )
      .map(a => ({ ...a, score: prefs.preferred.includes(a.category) ? 2 : 1 }))
      .sort((a, b) => b.score - a.score);
  }

  function buildRoadmap(member, appointments, selections = []) {
    const today = new Date();
    const eos   = new Date(member.end_of_service_date);
    const rankOrder = RULES.rank_order;

    // CEP is a rank string directly (ME4–ME8); fall back to legacy field name
    const cepRank = member.cep || member.potential_rating;
    const currentRankIdx   = rankOrder.indexOf(member.current_rank);
    const cepIdx           = rankOrder.indexOf(cepRank);
    const me7Idx           = rankOrder.indexOf("ME7");

    // Low leadership blocks ME7+ even if CEP is ME7 or ME8
    const aptitude = APTITUDE_LEVEL[member.leadership_aptitude] || 0;
    const effectiveCEPIdx  = (cepIdx >= me7Idx && aptitude < 1) ? me7Idx - 1 : cepIdx;

    const rankDate  = new Date(member.rank_date);
    const apptStart = new Date(member.appointment_start_date);
    const currentTIG       = monthsBetween(rankDate, today);
    const apptMonthsServed = monthsBetween(apptStart, today);

    const minAppt  = RULES.appointment_rules.min_duration_months;
    const maxAppt  = RULES.appointment_rules.max_duration_months;
    const warnAppt = RULES.appointment_rules.warning_threshold_months;

    const roadmap = { member, flags: [], appointments: [], events: [], steps: [] };

    // ── Historical postings ──────────────────────────────────
    (member.posting_history || []).forEach(ph => {
      roadmap.appointments.push({
        label: ph.appointment, rank: ph.rank,
        start: new Date(ph.start_date), end: new Date(ph.end_date),
        status: "historical", category: "historical"
      });
    });

    // ── Tenure flags ─────────────────────────────────────────
    if (apptMonthsServed >= maxAppt) {
      roadmap.flags.push({ type: "over",
        message: `Appointment tenure exceeded: "${member.current_appointment}" — ${apptMonthsServed} months served (limit: ${maxAppt} months). Immediate rotation required.`
      });
    } else if (apptMonthsServed >= warnAppt) {
      roadmap.flags.push({ type: "warning",
        message: `Approaching tenure limit: "${member.current_appointment}" — ${apptMonthsServed} months served. Plan rotation within ${maxAppt - apptMonthsServed} months.`
      });
    }

    // ── Leadership advisory ──────────────────────────────────
    if (cepIdx >= me7Idx && aptitude < 1) {
      roadmap.flags.push({ type: "info",
        message: `ME7 pathway not recommended: Low leadership aptitude. Career projection is capped at ME6. CO 8X is also not available.`
      });
    }

    // ── Current appointment end ──────────────────────────────
    let cursorDate;
    if (currentRankIdx < effectiveCEPIdx) {
      const monthsToTIG  = Math.max(0, minAppt - currentTIG);
      const monthsToAppt = Math.max(0, minAppt - apptMonthsServed);
      const promotionDate = addMonths(today, Math.max(monthsToTIG, monthsToAppt));
      cursorDate = promotionDate >= eos ? eos : promotionDate;
    } else {
      const apptEndMax = addMonths(apptStart, maxAppt);
      cursorDate = apptEndMax >= eos ? eos : apptEndMax;
    }

    roadmap.appointments.push({
      label: member.current_appointment, rank: member.current_rank,
      start: apptStart, end: cursorDate,
      status: "current", category: "current"
    });

    // ── Walk forward ─────────────────────────────────────────
    const competencyAppts = appointments.filter(a => a.competency === member.competency);

    // Seed usedTitles from entire prior career history
    const usedTitles = new Set([
      member.current_appointment,
      ...(member.posting_history || []).map(ph => ph.appointment)
    ]);

    let cursorRankIdx = currentRankIdx;
    let stepIndex     = 0;

    while (cursorDate < eos) {
      const selection = selections[stepIndex] || null;

      // Decide whether to go upward or lateral
      const canPromote = cursorRankIdx < effectiveCEPIdx;
      const nextRank   = canPromote ? rankOrder[cursorRankIdx + 1] : null;
      const upwardOpts = canPromote ? getValidOptions(competencyAppts, nextRank, member) : [];

      // If promotion is due but no appointments exist at next rank, fall back to lateral
      const goUpward = canPromote && upwardOpts.length > 0;
      const apptRank = goUpward ? nextRank : rankOrder[cursorRankIdx];

      const allValid = getValidOptions(competencyAppts, apptRank, member);
      const fresh    = allValid.filter(a => !usedTitles.has(a.title));
      // Display options: fresh first, fall back to all valid if exhausted
      const displayOptions = fresh.length > 0 ? fresh : allValid;

      let chosen;
      if (selection && allValid.find(o => o.title === selection.title)) {
        chosen = selection;
      } else {
        chosen = displayOptions[0] || null;
      }
      if (!chosen) break;

      const stepStart  = cursorDate;
      const apptEnd    = addMonths(cursorDate, chosen.duration_months);
      const clampedEnd = apptEnd >= eos ? eos : apptEnd;
      if (clampedEnd <= cursorDate) break;

      if (goUpward) {
        roadmap.events.push({
          type: "rank_eligible", rank: apptRank,
          fromRank: rankOrder[cursorRankIdx], date: cursorDate
        });
        cursorRankIdx++;
      }

      const status = goUpward ? "projected" : "lateral";
      roadmap.appointments.push({
        label: chosen.title, rank: apptRank,
        start: stepStart, end: clampedEnd,
        status, category: chosen.category, stepIndex
      });

      roadmap.steps.push({
        stepIndex,
        selectedAppt: chosen,
        allOptions:   displayOptions,
        start: stepStart,
        end:   clampedEnd,
        rank:  apptRank
      });

      usedTitles.add(chosen.title);
      cursorDate = clampedEnd;
      stepIndex++;
    }

    return roadmap;
  }

  return { buildRoadmap, monthsBetween, addMonths };
})();
