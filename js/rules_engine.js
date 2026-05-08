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

  // Valid appointments for a rank: filtered by gate + aspiration, sorted by preference score.
  // Rank progression is always sequential — cursorRankIdx increments by 1 each promotion step.
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

  function specialEventLabel(type) {
    if (type === "overseas_study") return "Overseas Study";
    if (type === "npl")            return "No-Pay Leave";
    if (type === "transit")        return "Career Break";
    return "Special Event";
  }

  function buildRoadmap(member, appointments, selections = []) {
    const today = new Date();
    const eos   = new Date(member.end_of_service_date);
    const rankOrder = RULES.rank_order;

    const cepRank = member.cep || member.potential_rating;
    const currentRankIdx  = rankOrder.indexOf(member.current_rank);
    const cepIdx          = rankOrder.indexOf(cepRank);
    const me7Idx          = rankOrder.indexOf("ME7");

    const aptitude = APTITUDE_LEVEL[member.leadership_aptitude] || 0;
    // Low leadership blocks ME7+ even if CEP is ME7 or ME8
    const effectiveCEPIdx = (cepIdx >= me7Idx && aptitude < 1) ? me7Idx - 1 : cepIdx;

    const rankDate  = new Date(member.rank_date);
    const apptStart = new Date(member.appointment_start_date);
    const currentTIG       = monthsBetween(rankDate, today);
    const apptMonthsServed = monthsBetween(apptStart, today);

    // Deduct NPL months at current rank from TIG (NPL does not count toward promotion eligibility)
    const nplMonths = (member.posting_history || [])
      .filter(ph => ph.type === "npl" && ph.rank === member.current_rank)
      .reduce((sum, ph) => sum + Math.max(0, monthsBetween(ph.start_date, ph.end_date)), 0);
    const effectiveTIG = currentTIG - nplMonths;

    const minAppt  = RULES.appointment_rules.min_duration_months;
    const maxAppt  = RULES.appointment_rules.max_duration_months;
    const warnAppt = RULES.appointment_rules.warning_threshold_months;

    const roadmap = { member, flags: [], appointments: [], events: [], steps: [] };

    // ── Historical postings (sorted by start date) ────────────
    const sortedHistory = [...(member.posting_history || [])].sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );
    sortedHistory.forEach(ph => {
      roadmap.appointments.push({
        label: ph.appointment, rank: ph.rank,
        start: new Date(ph.start_date), end: new Date(ph.end_date),
        status: "historical", category: "historical",
        eventType: ph.type || "normal"
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
      const monthsToTIG  = Math.max(0, minAppt - effectiveTIG);
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

    // Seed used titles from entire career history to avoid repeat appointments
    const usedTitles = new Set([
      member.current_appointment,
      ...(member.posting_history || []).map(ph => ph.appointment)
    ]);

    let cursorRankIdx = currentRankIdx;
    let stepIndex     = 0;

    while (cursorDate < eos) {
      const selection = selections[stepIndex] || null;

      // ── Future special event (overseas study, NPL, career break) ──
      // Inserting an event advances cursorDate by its duration, pausing the career projection.
      if (selection && selection._specialEvent) {
        const evtRank    = rankOrder[cursorRankIdx];
        const evtEnd     = addMonths(cursorDate, selection.duration_months);
        const clampedEnd = evtEnd >= eos ? eos : evtEnd;
        if (clampedEnd <= cursorDate) break;

        roadmap.appointments.push({
          label: specialEventLabel(selection.type),
          rank: evtRank,
          start: cursorDate, end: clampedEnd,
          status: "special_event", category: "special",
          eventType: selection.type, stepIndex
        });
        roadmap.steps.push({
          stepIndex, selectedAppt: null, allOptions: [],
          start: cursorDate, end: clampedEnd, rank: evtRank,
          isSpecialEvent: true, selectable: true
        });

        cursorDate = clampedEnd;
        stepIndex++;
        continue;
      }

      // ── Normal appointment step ──────────────────────────────
      // Promotion is always one rank at a time (no skipping).
      const canPromote = cursorRankIdx < effectiveCEPIdx;
      const nextRank   = canPromote ? rankOrder[cursorRankIdx + 1] : null;
      const upwardOpts = canPromote ? getValidOptions(competencyAppts, nextRank, member) : [];

      // Fall back to lateral if no appointments exist at the next rank (e.g. ME8 edge case)
      const goUpward = canPromote && upwardOpts.length > 0;
      const apptRank = goUpward ? nextRank : rankOrder[cursorRankIdx];

      const allValid      = getValidOptions(competencyAppts, apptRank, member);
      const fresh         = allValid.filter(a => !usedTitles.has(a.title));
      const displayOptions = fresh.length > 0 ? fresh : allValid;

      const isLocked = !!(selection && allValid.find(o => o.title === selection.title));
      const chosen   = isLocked ? selection : (displayOptions[0] || null);
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
        status, category: chosen.category, stepIndex,
        locked: isLocked, selectable: true
      });

      roadmap.steps.push({
        stepIndex,
        selectedAppt: chosen,
        allOptions:   displayOptions,
        start: stepStart, end: clampedEnd, rank: apptRank,
        locked: isLocked, selectable: true
      });

      usedTitles.add(chosen.title);
      cursorDate = clampedEnd;
      stepIndex++;
    }

    return roadmap;
  }

  return { buildRoadmap, monthsBetween, addMonths };
})();
