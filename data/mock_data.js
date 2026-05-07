const MOCK_DATA = {
  members: [
    {
      service_number: "F3001001",
      name: "Ahmad bin Yusof",
      current_rank: "ME4",
      rank_date: "2024-01-15",
      service_start_date: "2016-01-15",
      specialisation: "AMIC",
      current_appointment: "Aircraft Systems Specialist",
      appointment_start_date: "2024-01-15",
      aspiration: "SeniorTechExpert",
      potential_rating: "ME7",
      supervisor_notes: "Strong technical expertise across airframe and avionics systems. Fast-track potential. Recommend for lead specialist role upon next rotation.",
      end_of_service_date: "2036-01-15",
      is_active: true
    },
    {
      service_number: "F3001002",
      name: "Tan Wei Lin",
      current_rank: "ME5",
      rank_date: "2022-06-01",
      service_start_date: "2014-06-01",
      specialisation: "COMMS",
      current_appointment: "Comms Systems Officer",
      appointment_start_date: "2023-02-01",
      aspiration: "UnitLeader",
      potential_rating: "ME7",
      supervisor_notes: "Ready for leadership transition. Recommend appointment as section head at next rotation. Strong people management observed during exercise.",
      end_of_service_date: "2034-06-01",
      is_active: true
    },
    {
      service_number: "F3001003",
      name: "Lee Boon Kiat",
      current_rank: "ME3",
      rank_date: "2023-05-01",
      service_start_date: "2020-01-01",
      specialisation: "ATC",
      current_appointment: "Air Traffic Control Assistant",
      appointment_start_date: "2023-05-01",
      aspiration: "UnitLeader",
      potential_rating: "ME6",
      supervisor_notes: "Demonstrates good situational awareness and communication skills. Suitable for supervisory role in the near term.",
      end_of_service_date: "2040-01-01",
      is_active: true
    },
    {
      service_number: "F3001004",
      name: "Kumar Selvam",
      current_rank: "ME4",
      rank_date: "2021-03-01",
      service_start_date: "2015-03-01",
      specialisation: "INTEL",
      current_appointment: "Intelligence Analyst",
      appointment_start_date: "2021-03-01",
      aspiration: "OfficerConversion",
      potential_rating: "ME6",
      supervisor_notes: "Exceptional analytical capability. Has expressed interest in officer conversion pathway. Recommended for staff attachment to broaden perspective.",
      end_of_service_date: "2033-03-01",
      is_active: true
    },
    {
      service_number: "F3001005",
      name: "Ng Jun Wei",
      current_rank: "ME2",
      rank_date: "2024-08-01",
      service_start_date: "2023-02-01",
      specialisation: "LOG",
      current_appointment: "Logistics Coordinator",
      appointment_start_date: "2024-08-01",
      aspiration: "TransitionOut",
      potential_rating: "ME4",
      supervisor_notes: "Steady performer. Has indicated preference to transition to civilian sector at end of current contract. Recommend early career planning conversation.",
      end_of_service_date: "2028-02-01",
      is_active: true
    }
  ],

  appointments: [
    {
      id: "APT001",
      title: "Aircraft Maintenance Technician",
      min_rank: "ME1",
      max_rank: "ME2",
      specialisation: "AMIC",
      category: "Technical",
      duration_months: 24,
      aspiration_tags: ["SeniorTechExpert", "TransitionOut"]
    },
    {
      id: "APT002",
      title: "Aircraft Systems Technician",
      min_rank: "ME2",
      max_rank: "ME3",
      specialisation: "AMIC",
      category: "Technical",
      duration_months: 30,
      aspiration_tags: ["SeniorTechExpert", "TransitionOut"]
    },
    {
      id: "APT003",
      title: "Aircraft Systems Specialist",
      min_rank: "ME3",
      max_rank: "ME5",
      specialisation: "AMIC",
      category: "Technical",
      duration_months: 36,
      aspiration_tags: ["SeniorTechExpert"]
    },
    {
      id: "APT004",
      title: "Senior Aircraft Systems Specialist",
      min_rank: "ME5",
      max_rank: "ME7",
      specialisation: "AMIC",
      category: "Technical",
      duration_months: 36,
      aspiration_tags: ["SeniorTechExpert"]
    },
    {
      id: "APT005",
      title: "Comms Systems Technician",
      min_rank: "ME2",
      max_rank: "ME3",
      specialisation: "COMMS",
      category: "Technical",
      duration_months: 30,
      aspiration_tags: ["SeniorTechExpert", "TransitionOut"]
    },
    {
      id: "APT006",
      title: "Comms Systems Specialist",
      min_rank: "ME4",
      max_rank: "ME6",
      specialisation: "COMMS",
      category: "Technical",
      duration_months: 36,
      aspiration_tags: ["SeniorTechExpert"]
    },
    {
      id: "APT007",
      title: "Intelligence Analyst",
      min_rank: "ME3",
      max_rank: "ME6",
      specialisation: "INTEL",
      category: "Technical",
      duration_months: 36,
      aspiration_tags: ["SeniorTechExpert", "OfficerConversion"]
    },
    {
      id: "APT008",
      title: "Flight Training Instructor",
      min_rank: "ME3",
      max_rank: "ME6",
      specialisation: "Any",
      category: "Training",
      duration_months: 24,
      aspiration_tags: ["SeniorTechExpert", "OfficerConversion", "UnitLeader"]
    },
    {
      id: "APT009",
      title: "Section NCO",
      min_rank: "ME3",
      max_rank: "ME5",
      specialisation: "Any",
      category: "Leadership",
      duration_months: 36,
      aspiration_tags: ["UnitLeader", "OfficerConversion"]
    },
    {
      id: "APT010",
      title: "Section Head",
      min_rank: "ME5",
      max_rank: "ME7",
      specialisation: "Any",
      category: "Leadership",
      duration_months: 36,
      aspiration_tags: ["UnitLeader", "OfficerConversion"]
    },
    {
      id: "APT011",
      title: "HQ Staff Officer",
      min_rank: "ME5",
      max_rank: "ME8",
      specialisation: "Any",
      category: "Staff",
      duration_months: 36,
      aspiration_tags: ["OfficerConversion", "UnitLeader"]
    },
    {
      id: "APT012",
      title: "Logistics Coordinator",
      min_rank: "ME1",
      max_rank: "ME4",
      specialisation: "LOG",
      category: "Technical",
      duration_months: 30,
      aspiration_tags: ["SeniorTechExpert", "TransitionOut"]
    }
  ]
};
