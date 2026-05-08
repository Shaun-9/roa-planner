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

  function passesLeadershipGate(appointment, member) {
    if (appointment.requires_leadership === "medium") {
      return (APTITUDE_LEVEL[member.leadership_aptitude] || 0) >= 1;
    }
    return true;
  }

  function selectAppointment(competencyAppts, targetRank, member, usedTitles) {
    const prefs = RULES.aspiration_paths[member.aspiration] || { preferred: [], avoid: [] };

    let candidates = competencyAppts.filter(a =>
      a.rank === targetRank &&
      passesLeadershipGate(a, member) &&
      !prefs.avoid.includes(a.category)
    );

    // Prefer appointments not already used in this member's full career history
    const fresh = candidates.filter(a => !usedTitles.has(a.title));
    if (fresh.length > 0) candidates = fresh;

    // Score by aspiration preference: preferred=2, neutral=1
    candidates = candidates
      .map(a => ({ ...a, score: prefs.preferred.includes(a.category) ? 2 : 1 }))
      .sort((a, b) => b.score - a.score);

    return candidates[0] || null;
  }

  function buildRoadmap(member, appointments) {
    const today = new Date();
    const eos = new Date(member.end_of_service_date);
    const rankOrder = RULES.rank_order;

    // Resolve Low/Medium/High potential to a rank ceiling
    const POTENTIAL_TO_RANK = RULES.potential_to_rank || {};
    const potentialRank = POTENTIAL_TO_RANK[member.potential_rating] || member.potential_rating;

    const currentRankIdx = rankOrder.indexOf(member.current_rank);
    const potentialIdx   = rankOrder.indexOf(potentialRank);
    const me7Idx         = rankOrder.indexOf("ME7");

    // Low leadership aptitude blocks ME7 even when potential is High
    const memberAptitude = APTITUDE_LEVEL[member.leadership_aptitude] || 0;
    const effectivePotentialIdx = (potentialRank === "ME7" && memberAptitude < 1)
      ? me7Idx - 1
      : potentialIdx;

    const rankDate  = new Date(member.rank_date);
    const apptStart = new Date(member.appointment_start_date);

    const currentTIG       = monthsBetween(rankDate, today);
    const apptMonthsServed = monthsBetween(apptStart, today);

    const minAppt  = RULES.appointment_rules.min_duration_months;    // 36
    const maxAppt  = RULES.appointment_rules.max_duration_months;    // 72
    const warnAppt = RULES.appointment_rules.warning_threshold_months; // 60

    const roadmap = { member, flags: [], appointments: [], events: [] };

    // ── Historical postings ──────────────────────────────────
    (member.posting_history || []).forEach(ph => {
      roadmap.appointments.push({
        label:    ph.appointment,
        rank:     ph.rank,
        start:    new Date(ph.start_date),
        end:      new Date(ph.end_date),
        status:   "historical",
        category: "historical"
      });
    });

    // ── Tenure flags ─────────────────────────────────────────
    if (apptMonthsServed >= maxAppt) {
      roadmap.flags.push({
        type: "over",
        message: `Appointment tenure exceeded: "${member.current_appointment}" — ${apptMonthsServed} months served (limit: ${maxAppt} months). Immediate rotation required.`
      });
    } else if (apptMonthsServed >= warnAppt) {
      roadmap.flags.push({
        type: "warning",
        message: `Approaching tenure limit: "${member.current_appointment}" — ${apptMonthsServed} months served. Plan rotation within ${maxAppt - apptMonthsServed} months.`
      });
    }

    // ── ME7 pathway advisory for Low leadership aptitude ─────
    if (potentialRank === "ME7" && memberAptitude < 1) {
      roadmap.flags.push({
        type: "info",
        message: `ME7 pathway not recommended: Low leadership aptitude assessment. Career projection is capped at ME6. CO 8X is also not available.`
      });
    }

    // ── Determine current appointment end ────────────────────
    let cursorDate;

    if (currentRankIdx < effectivePotentialIdx) {
      // Below effective peak — projection promotes upward
      // Must satisfy: TIG ≥ min AND appointment ≥ min
      const monthsToTIG  = Math.max(0, minAppt - currentTIG);
      const monthsToAppt = Math.max(0, minAppt - apptMonthsServed);
      const monthsToPromotion = Math.max(monthsToTIG, monthsToAppt);
      const promotionDate = addMonths(today, monthsToPromotion);
      cursorDate = promotionDate >= eos ? eos : promotionDate;
    } else {
      // At or past effective peak — lateral from appointment max
      const apptEndMax = addMonths(apptStart, maxAppt);
      cursorDate = apptEndMax >= eos ? eos : apptEndMax;
    }

    roadmap.appointments.push({
      label:    member.current_appointment,
      rank:     member.current_rank,
      start:    apptStart,
      end:      cursorDate,
      status:   "current",
      category: "current"
    });

    // ── Walk forward ─────────────────────────────────────────
    const competencyAppts = appointments.filter(a => a.competency === member.competency);

    // Seed usedTitles from ALL prior career history so laterals never repeat any past posting
    const usedTitles = new Set([
      member.current_appointment,
      ...(member.posting_history || []).map(ph => ph.appointment)
    ]);

    let cursorRankIdx = currentRankIdx;

    while (cursorDate < eos) {
      if (cursorRankIdx < effectivePotentialIdx) {
        // ── Upward progression ────────────────────────────
        const nextRank = rankOrder[cursorRankIdx + 1];
        const nextAppt = selectAppointment(competencyAppts, nextRank, member, usedTitles);
        if (!nextAppt) break;

        roadmap.events.push({
          type:     "rank_eligible",
          rank:     nextRank,
          fromRank: rankOrder[cursorRankIdx],
          date:     cursorDate
        });

        const apptEnd    = addMonths(cursorDate, nextAppt.duration_months);
        const clampedEnd = apptEnd >= eos ? eos : apptEnd;

        roadmap.appointments.push({
          label:    nextAppt.title,
          rank:     nextRank,
          start:    cursorDate,
          end:      clampedEnd,
          status:   "projected",
          category: nextAppt.category
        });

        usedTitles.add(nextAppt.title);
        cursorDate = clampedEnd;
        cursorRankIdx++;

      } else {
        // ── Lateral / stabilising at peak rank ────────────
        const lateralAppt = selectAppointment(competencyAppts, rankOrder[cursorRankIdx], member, usedTitles);
        if (!lateralAppt) break;

        const lateralEnd = addMonths(cursorDate, lateralAppt.duration_months);
        const clampedEnd = lateralEnd >= eos ? eos : lateralEnd;
        if (clampedEnd <= cursorDate) break;

        roadmap.appointments.push({
          label:    lateralAppt.title,
          rank:     rankOrder[cursorRankIdx],
          start:    cursorDate,
          end:      clampedEnd,
          status:   "lateral",
          category: lateralAppt.category
        });

        usedTitles.add(lateralAppt.title);
        cursorDate = clampedEnd;
      }
    }

    return roadmap;
  }

  return { buildRoadmap, monthsBetween, addMonths };
})();
