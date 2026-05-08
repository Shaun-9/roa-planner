const MOCK_DATA = {

  // ============================================================
  // APPOINTMENT CATALOGUE
  // 62 appointments across 4 competency tracks, ME4 → ME7
  // category: Technical | Leadership | Staff
  // requires_leadership: "none" | "medium" (medium = Low aptitude blocked)
  // ============================================================
  appointments: [

    // — SOFTWARE ENGINEERING — ME4 —
    { id:"SE_ME4_001", title:"Software Engineer",           rank:"ME4", competency:"Software Engineering", category:"Technical",   duration_months:36, requires_leadership:"none"   },
    { id:"SE_ME4_002", title:"Dev Sec Ops Engineer",        rank:"ME4", competency:"Software Engineering", category:"Technical",   duration_months:36, requires_leadership:"none"   },

    // — SOFTWARE ENGINEERING — ME5 —
    { id:"SE_ME5_001", title:"Senior Software Engineer",    rank:"ME5", competency:"Software Engineering", category:"Staff",       duration_months:48, requires_leadership:"none"   },
    { id:"SE_ME5_002", title:"RAP Lead",                    rank:"ME5", competency:"Software Engineering", category:"Leadership",  duration_months:48, requires_leadership:"none"   },
    { id:"SE_ME5_003", title:"Software Dev (DRO)",          rank:"ME5", competency:"Software Engineering", category:"Technical",   duration_months:48, requires_leadership:"none"   },
    { id:"SE_ME5_004", title:"SO/AD Software Architecture", rank:"ME5", competency:"Software Engineering", category:"Staff",       duration_months:48, requires_leadership:"none"   },

    // — SOFTWARE ENGINEERING — ME6 —
    { id:"SE_ME6_001", title:"Head A",                      rank:"ME6", competency:"Software Engineering", category:"Leadership",  duration_months:48, requires_leadership:"none"   },
    { id:"SE_ME6_002", title:"Head I",                      rank:"ME6", competency:"Software Engineering", category:"Leadership",  duration_months:48, requires_leadership:"none"   },
    { id:"SE_ME6_003", title:"CTO",                         rank:"ME6", competency:"Software Engineering", category:"Leadership",  duration_months:48, requires_leadership:"none"   },
    { id:"SE_ME6_004", title:"HD Software Architect",       rank:"ME6", competency:"Software Engineering", category:"Technical",   duration_months:48, requires_leadership:"none"   },

    // — SOFTWARE ENGINEERING — ME7 —
    { id:"SE_ME7_001", title:"Digital Dept Head",           rank:"ME7", competency:"Software Engineering", category:"Leadership",  duration_months:48, requires_leadership:"medium" },
    { id:"SE_ME7_002", title:"Eng Dy Dept Head",            rank:"ME7", competency:"Software Engineering", category:"Leadership",  duration_months:48, requires_leadership:"medium" },

    // — CLOUD ENGINEERING — ME4 —
    { id:"CE_ME4_001", title:"Cloud Platform Engineer",           rank:"ME4", competency:"Cloud Engineering", category:"Technical",  duration_months:36, requires_leadership:"none"   },

    // — CLOUD ENGINEERING — ME5 —
    { id:"CE_ME5_001", title:"Senior Cloud Platform Engineer",    rank:"ME5", competency:"Cloud Engineering", category:"Staff",      duration_months:48, requires_leadership:"none"   },
    { id:"CE_ME5_002", title:"SO Network Architecture",           rank:"ME5", competency:"Cloud Engineering", category:"Staff",      duration_months:48, requires_leadership:"none"   },

    // — CLOUD ENGINEERING — ME6 —
    { id:"CE_ME6_001", title:"Head Cloud Platform Team",          rank:"ME6", competency:"Cloud Engineering", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"CE_ME6_002", title:"HD Network Architecture",           rank:"ME6", competency:"Cloud Engineering", category:"Technical",  duration_months:48, requires_leadership:"none"   },

    // — CLOUD ENGINEERING — ME7 —
    { id:"CE_ME7_001", title:"Digital Dept Head",                 rank:"ME7", competency:"Cloud Engineering", category:"Leadership", duration_months:48, requires_leadership:"medium" },
    { id:"CE_ME7_002", title:"Eng Dy Dept Head",                  rank:"ME7", competency:"Cloud Engineering", category:"Leadership", duration_months:48, requires_leadership:"medium" },

    // — DATA ANALYTICS AND AI — ME4 —
    { id:"DA_ME4_001", title:"Data Engineer (R)",      rank:"ME4", competency:"Data Analytics and AI", category:"Technical",  duration_months:36, requires_leadership:"none"   },
    { id:"DA_ME4_002", title:"Data Scientist (R)",     rank:"ME4", competency:"Data Analytics and AI", category:"Technical",  duration_months:36, requires_leadership:"none"   },
    { id:"DA_ME4_003", title:"Data Engineer (D)",      rank:"ME4", competency:"Data Analytics and AI", category:"Technical",  duration_months:36, requires_leadership:"none"   },
    { id:"DA_ME4_004", title:"Data Scientist (D)",     rank:"ME4", competency:"Data Analytics and AI", category:"Technical",  duration_months:36, requires_leadership:"none"   },

    // — DATA ANALYTICS AND AI — ME5 —
    { id:"DA_ME5_001", title:"Lead Data Scientist (R)", rank:"ME5", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME5_002", title:"SO RDO",                  rank:"ME5", competency:"Data Analytics and AI", category:"Staff",      duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME5_003", title:"SO DG",                   rank:"ME5", competency:"Data Analytics and AI", category:"Staff",      duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME5_004", title:"SDA",                     rank:"ME5", competency:"Data Analytics and AI", category:"Technical",  duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME5_005", title:"SDE",                     rank:"ME5", competency:"Data Analytics and AI", category:"Technical",  duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME5_006", title:"Data Science Team Lead",  rank:"ME5", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"none"   },

    // — DATA ANALYTICS AND AI — ME6 —
    { id:"DA_ME6_001", title:"HD RDO",             rank:"ME6", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME6_002", title:"HD MDT",             rank:"ME6", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME6_003", title:"CTO",                rank:"ME6", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME6_004", title:"HD LDAB",            rank:"ME6", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"DA_ME6_005", title:"HD DATA Architecture",rank:"ME6", competency:"Data Analytics and AI", category:"Technical",  duration_months:48, requires_leadership:"none"   },

    // — DATA ANALYTICS AND AI — ME7 —
    { id:"DA_ME7_001", title:"Digital Dept Head",  rank:"ME7", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"medium" },
    { id:"DA_ME7_002", title:"Eng Dy Dept Head",   rank:"ME7", competency:"Data Analytics and AI", category:"Leadership", duration_months:48, requires_leadership:"medium" },

    // — PRODUCT MANAGEMENT — ME4 —
    { id:"PM_ME4_001", title:"Product Engineer (A)", rank:"ME4", competency:"Product Management", category:"Technical", duration_months:36, requires_leadership:"none" },
    { id:"PM_ME4_002", title:"SO ISM",               rank:"ME4", competency:"Product Management", category:"Staff",     duration_months:36, requires_leadership:"none" },

    // — PRODUCT MANAGEMENT — ME5 —
    { id:"PM_ME5_001", title:"SO P4B",                              rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_002", title:"Product Manager",                     rank:"ME5", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_003", title:"SO Swift",                            rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_004", title:"SO LTSB",                             rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_005", title:"APO LTSB",                            rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_006", title:"SO ISD",                              rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_007", title:"Senior Product Engineer",             rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_008", title:"A Lead",                              rank:"ME5", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_009", title:"SO C4",                               rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_010", title:"SO Digital Strategy and Master Planning", rank:"ME5", competency:"Product Management", category:"Staff", duration_months:48, requires_leadership:"none" },
    { id:"PM_ME5_011", title:"SO Digital Ecosystem",                rank:"ME5", competency:"Product Management", category:"Staff",      duration_months:48, requires_leadership:"none" },

    // — PRODUCT MANAGEMENT — ME6 —
    { id:"PM_ME6_001", title:"HD P",               rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_002", title:"HD Swift",            rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_003", title:"CTO",                 rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_004", title:"HD LTSB",             rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_005", title:"HD LISB",             rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_006", title:"HD LESO",             rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_007", title:"CO 8X",               rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"medium" },
    { id:"PM_ME6_008", title:"HD Digital Strategy", rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },
    { id:"PM_ME6_009", title:"HD Digital Ecosystem",rank:"ME6", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"none"   },

    // — PRODUCT MANAGEMENT — ME7 —
    { id:"PM_ME7_001", title:"Digital Dept Head",   rank:"ME7", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"medium" },
    { id:"PM_ME7_002", title:"Eng Dy Dept Head",    rank:"ME7", competency:"Product Management", category:"Leadership", duration_months:48, requires_leadership:"medium" }
  ],

  // ============================================================
  // MEMBER PERSONAS — 10 total
  // All entered service at ME4. Today = 2026-05-07.
  // Tenure flags:
  //   Razif (ME5001A) → OVER  (80 months in current appt, max 72)
  //   Liyana (ME6001B) → WARNING (61 months, warn at 60)
  // Peak-rank lateral: Jayakumar (ME6002C), Kenneth (ME6003H)
  // Low leadership cap: Marcus (ME5002D), Kenneth (ME6003H)
  // ============================================================
  members: [

    // ── PERSONA 01 ─ Razif bin Hamdan ────────────────────────
    // ME5 · Software Engineering · Medium · Potential ME7
    // Tenure FLAG: OVER (appt started 2019-09-01 → 80 months)
    {
      service_number: "ME5001A",
      name: "Razif bin Hamdan",
      current_rank: "ME5",
      rank_date: "2019-03-01",
      service_start_date: "2013-03-01",
      competency: "Software Engineering",
      current_appointment: "Senior Software Engineer",
      appointment_start_date: "2019-09-01",
      aspiration: "SeniorTechExpert",
      cep: "ME7",
      leadership_aptitude: "Medium",
      supervisor_notes: "Exceptional depth in backend systems and DevSecOps pipelines. Has become the de facto technical authority for the platform. Appointment has exceeded 72-month limit — immediate rotation required. Recommend SO/AD Software Architecture to leverage architecture experience and prepare for ME6.",
      end_of_service_date: "2035-03-01",
      is_active: true,
      posting_history: [
        { appointment:"Software Engineer",     rank:"ME4", competency:"Software Engineering", start_date:"2013-03-01", end_date:"2016-06-01" },
        { appointment:"Dev Sec Ops Engineer",  rank:"ME4", competency:"Software Engineering", start_date:"2016-06-01", end_date:"2019-09-01" }
      ]
    },

    // ── PERSONA 02 ─ Liyana bte Norzahra ─────────────────────
    // ME6 · Product Management · High · Potential ME7
    // Tenure WARNING (appt started 2021-04-01 → 61 months)
    {
      service_number: "ME6001B",
      name: "Liyana bte Norzahra",
      current_rank: "ME6",
      rank_date: "2020-10-01",
      service_start_date: "2010-10-01",
      competency: "Product Management",
      current_appointment: "HD Digital Strategy",
      appointment_start_date: "2021-04-01",
      aspiration: "UnitLeader",
      cep: "ME7",
      leadership_aptitude: "High",
      supervisor_notes: "Steady strategic hand and strong inter-agency relationships. Approaching 61 months — begin rotation planning now. Confirmed ME7 potential. Recommend Digital Dept Head upon next review cycle.",
      end_of_service_date: "2034-10-01",
      is_active: true,
      posting_history: [
        { appointment:"SO ISM",                              rank:"ME4", competency:"Product Management", start_date:"2010-10-01", end_date:"2014-04-01" },
        { appointment:"SO Digital Strategy and Master Planning", rank:"ME5", competency:"Product Management", start_date:"2014-04-01", end_date:"2018-10-01" },
        { appointment:"HD Digital Ecosystem",                rank:"ME6", competency:"Product Management", start_date:"2018-10-01", end_date:"2021-04-01" }
      ]
    },

    // ── PERSONA 03 ─ Jayakumar s/o Suppiah ───────────────────
    // ME6 · Data Analytics and AI · Medium · Potential ME6 (PEAK)
    // At peak rank — lateral/stabilising appointments from here
    {
      service_number: "ME6002C",
      name: "Jayakumar s/o Suppiah",
      current_rank: "ME6",
      rank_date: "2021-06-01",
      service_start_date: "2011-06-01",
      competency: "Data Analytics and AI",
      current_appointment: "HD RDO",
      appointment_start_date: "2021-06-01",
      aspiration: "SeniorTechExpert",
      cep: "ME6",
      leadership_aptitude: "Medium",
      supervisor_notes: "Recognised authority in research data operations and AI model governance. At assessed peak rank (ME6). Recommend lateral stabilising appointments — HD MDT or HD DATA Architecture — to sustain engagement and broaden technical portfolio. ME7 pathway not assessed.",
      end_of_service_date: "2033-06-01",
      is_active: true,
      posting_history: [
        { appointment:"Data Scientist (R)",      rank:"ME4", competency:"Data Analytics and AI", start_date:"2011-06-01", end_date:"2015-06-01" },
        { appointment:"Lead Data Scientist (R)", rank:"ME5", competency:"Data Analytics and AI", start_date:"2015-06-01", end_date:"2019-06-01" },
        { appointment:"SO RDO",                  rank:"ME5", competency:"Data Analytics and AI", start_date:"2019-06-01", end_date:"2021-06-01" }
      ]
    },

    // ── PERSONA 04 ─ Marcus Teo Kah Liang ────────────────────
    // ME5 · Software Engineering · LOW leadership · Potential ME7
    // Low aptitude → effective cap at ME6; CO 8X and ME7 blocked
    {
      service_number: "ME5002D",
      name: "Marcus Teo Kah Liang",
      current_rank: "ME5",
      rank_date: "2022-01-01",
      service_start_date: "2015-01-01",
      competency: "Software Engineering",
      current_appointment: "Software Dev (DRO)",
      appointment_start_date: "2022-01-01",
      aspiration: "SeniorTechExpert",
      cep: "ME7",
      leadership_aptitude: "Low",
      supervisor_notes: "Outstanding individual contributor — consistently top-rated for code quality and system design innovation. Leadership aptitude is assessed as Low; not suited for command or ME7-level leadership appointments. Recommend HD Software Architect at ME6 as ceiling appointment. Focus on deep technical tracks.",
      end_of_service_date: "2037-01-01",
      is_active: true,
      posting_history: [
        { appointment:"Software Engineer", rank:"ME4", competency:"Software Engineering", start_date:"2015-01-01", end_date:"2019-01-01" },
        { appointment:"Dev Sec Ops Engineer", rank:"ME4", competency:"Software Engineering", start_date:"2019-01-01", end_date:"2022-01-01" }
      ]
    },

    // ── PERSONA 05 ─ Priya d/o Devi Nair ─────────────────────
    // ME4 · Data Analytics and AI · High · Potential ME7
    // Early career, OfficerConversion aspiration
    {
      service_number: "ME4001E",
      name: "Priya d/o Devi Nair",
      current_rank: "ME4",
      rank_date: "2023-07-01",
      service_start_date: "2020-07-01",
      competency: "Data Analytics and AI",
      current_appointment: "Data Scientist (D)",
      appointment_start_date: "2023-07-01",
      aspiration: "OfficerConversion",
      cep: "ME7",
      leadership_aptitude: "High",
      supervisor_notes: "Exceptional analyst with outstanding communication and strategic thinking. Strong OfficerConversion candidate. Recommend deliberate Staff exposure at ME5 (SO DG, SO RDO) before nominating for officer conversion board.",
      end_of_service_date: "2040-07-01",
      is_active: true,
      posting_history: [
        { appointment:"Data Engineer (D)", rank:"ME4", competency:"Data Analytics and AI", start_date:"2020-07-01", end_date:"2023-07-01" }
      ]
    },

    // ── PERSONA 06 ─ Chow Wei Xian ───────────────────────────
    // ME5 · Cloud Engineering · Medium · Potential ME6
    // Technical-leaning, SeniorTechExpert aspiration
    {
      service_number: "ME5003F",
      name: "Chow Wei Xian",
      current_rank: "ME5",
      rank_date: "2021-04-01",
      service_start_date: "2014-04-01",
      competency: "Cloud Engineering",
      current_appointment: "SO Network Architecture",
      appointment_start_date: "2023-10-01",
      aspiration: "SeniorTechExpert",
      cep: "ME6",
      leadership_aptitude: "Medium",
      supervisor_notes: "Strong niche in network architecture and cloud-native security. Prefers technical expert track. Recommend HD Network Architecture at ME6 as next posting. Head Cloud Platform Team is an optional broadening tour before ME6 if additional leadership exposure is needed.",
      end_of_service_date: "2034-04-01",
      is_active: true,
      posting_history: [
        { appointment:"Cloud Platform Engineer",        rank:"ME4", competency:"Cloud Engineering", start_date:"2014-04-01", end_date:"2018-04-01" },
        { appointment:"Senior Cloud Platform Engineer", rank:"ME5", competency:"Cloud Engineering", start_date:"2021-04-01", end_date:"2023-10-01" }
      ]
    },

    // ── PERSONA 07 ─ Nur Aisyah bte Ramli ────────────────────
    // ME4 · Product Management · High · Potential ME7
    // Early career, UnitLeader aspiration
    {
      service_number: "ME4002G",
      name: "Nur Aisyah bte Ramli",
      current_rank: "ME4",
      rank_date: "2022-09-01",
      service_start_date: "2019-09-01",
      competency: "Product Management",
      current_appointment: "SO ISM",
      appointment_start_date: "2022-09-01",
      aspiration: "UnitLeader",
      cep: "ME7",
      leadership_aptitude: "High",
      supervisor_notes: "Exceptional stakeholder management and cross-functional coordination from early career. Clear UnitLeader track with ME7 potential. Next posting should be Product Manager or A Lead at ME5. Strong candidate for CO 8X at ME6.",
      end_of_service_date: "2041-09-01",
      is_active: true,
      posting_history: []
    },

    // ── PERSONA 08 ─ Kenneth Lim Boon Huat ───────────────────
    // ME6 · Software Engineering · LOW leadership · Potential ME6 (PEAK)
    // TransitionOut aspiration, near EOS — lateral only
    {
      service_number: "ME6003H",
      name: "Kenneth Lim Boon Huat",
      current_rank: "ME6",
      rank_date: "2020-03-01",
      service_start_date: "2009-03-01",
      competency: "Software Engineering",
      current_appointment: "HD Software Architect",
      appointment_start_date: "2022-03-01",
      aspiration: "TransitionOut",
      cep: "ME6",
      leadership_aptitude: "Low",
      supervisor_notes: "Seasoned software architect with significant contributions to RSAF enterprise architecture. Planning to transition to civilian sector at EOS (2031). Low leadership aptitude — correctly placed in technical head role. Recommend final stabilising tour at Head I to round out legacy contributions.",
      end_of_service_date: "2031-03-01",
      is_active: true,
      posting_history: [
        { appointment:"Software Engineer",      rank:"ME4", competency:"Software Engineering", start_date:"2009-03-01", end_date:"2013-03-01" },
        { appointment:"Dev Sec Ops Engineer",   rank:"ME4", competency:"Software Engineering", start_date:"2013-03-01", end_date:"2016-03-01" },
        { appointment:"Senior Software Engineer",rank:"ME5", competency:"Software Engineering", start_date:"2016-03-01", end_date:"2020-03-01" }
      ]
    },

    // ── PERSONA 09 ─ Ganesh s/o Rajan ────────────────────────
    // ME5 · Data Analytics and AI · High · Potential ME7
    // UnitLeader aspiration — on leadership track
    {
      service_number: "ME5004I",
      name: "Ganesh s/o Rajan",
      current_rank: "ME5",
      rank_date: "2023-01-01",
      service_start_date: "2016-01-01",
      competency: "Data Analytics and AI",
      current_appointment: "Data Science Team Lead",
      appointment_start_date: "2023-01-01",
      aspiration: "UnitLeader",
      cep: "ME7",
      leadership_aptitude: "High",
      supervisor_notes: "Rare combination of technical credibility and organisational influence. Successfully stood up a Data Science Team of 12 analysts from scratch. Recommend HD MDT or HD LDAB at ME6. Strong candidate for Digital Dept Head at ME7 in the medium term.",
      end_of_service_date: "2038-01-01",
      is_active: true,
      posting_history: [
        { appointment:"Data Engineer (R)",    rank:"ME4", competency:"Data Analytics and AI", start_date:"2016-01-01", end_date:"2019-07-01" },
        { appointment:"Data Scientist (R)",   rank:"ME4", competency:"Data Analytics and AI", start_date:"2019-07-01", end_date:"2023-01-01" }
      ]
    },

    // ── PERSONA 10 ─ Fadhillah bin Azri ──────────────────────
    // ME5 · Product Management · Medium · Potential ME6
    // OfficerConversion aspiration — staff-track broadening
    {
      service_number: "ME5005J",
      name: "Fadhillah bin Azri",
      current_rank: "ME5",
      rank_date: "2022-06-01",
      service_start_date: "2015-06-01",
      competency: "Product Management",
      current_appointment: "SO Digital Ecosystem",
      appointment_start_date: "2024-01-01",
      aspiration: "OfficerConversion",
      cep: "ME6",
      leadership_aptitude: "Medium",
      supervisor_notes: "Progressively broadened portfolio from product engineering to digital ecosystem coordination. Motivated for OfficerConversion. Recommend HD Digital Ecosystem or HD P at ME6, and nominate for officer conversion assessment board before 15th year of service.",
      end_of_service_date: "2035-06-01",
      is_active: true,
      posting_history: [
        { appointment:"Product Engineer (A)", rank:"ME4", competency:"Product Management", start_date:"2015-06-01", end_date:"2019-06-01" },
        { appointment:"SO P4B",               rank:"ME5", competency:"Product Management", start_date:"2022-06-01", end_date:"2024-01-01" }
      ]
    }

  ]
};
