const RULES = {
  rank_order: ["ME4", "ME5", "ME6", "ME7"],

  // Maps the three-level potential rating to a rank ceiling
  potential_to_rank: {
    "Low":    "ME5",
    "Medium": "ME6",
    "High":   "ME7"
  },

  rank_thresholds: {
    "ME5": { min_tig_months: 36 },
    "ME6": { min_tig_months: 36 },
    "ME7": { min_tig_months: 36 }
  },

  appointment_rules: {
    min_duration_months: 36,
    max_duration_months: 72,
    warning_threshold_months: 60
  },

  // "medium" = requires at least Medium leadership aptitude (Low is blocked)
  // Only CO 8X and all ME7 appointments are gated
  leadership_gates: {
    "CO 8X": "medium",
    "Digital Dept Head": "medium",
    "Eng Dy Dept Head": "medium"
  },

  aspiration_paths: {
    "SeniorTechExpert":  { preferred: ["Technical"],              avoid: ["Leadership"] },
    "UnitLeader":        { preferred: ["Leadership"],             avoid: [] },
    "OfficerConversion": { preferred: ["Leadership", "Staff"],    avoid: [] },
    "TransitionOut":     { preferred: ["Technical"],              avoid: ["Leadership"] }
  }
};
