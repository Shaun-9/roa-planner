const RULES = {
  rank_order: ["ME1", "ME2", "ME3", "ME4", "ME5", "ME6", "ME7", "ME8"],

  rank_thresholds: {
    "ME2": { min_tis_months: 12,  min_tig_months: 12 },
    "ME3": { min_tis_months: 36,  min_tig_months: 24 },
    "ME4": { min_tis_months: 72,  min_tig_months: 36 },
    "ME5": { min_tis_months: 120, min_tig_months: 48 },
    "ME6": { min_tis_months: 168, min_tig_months: 48 },
    "ME7": { min_tis_months: 240, min_tig_months: 60 },
    "ME8": { min_tis_months: 300, min_tig_months: 60 }
  },

  appointment_rules: {
    max_duration_months: 36,
    warning_threshold_months: 30
  },

  aspiration_paths: {
    "SeniorTechExpert":  { preferred: ["Technical", "Training"], avoid: ["Staff"] },
    "UnitLeader":        { preferred: ["Leadership", "Staff"],   avoid: [] },
    "OfficerConversion": { preferred: ["Leadership", "Staff", "Training"], avoid: [] },
    "TransitionOut":     { preferred: ["Technical", "Training"], avoid: ["Leadership"] }
  }
};
