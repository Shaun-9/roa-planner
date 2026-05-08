# ROA — Route of Advancement Planning App

A browser-based career roadmap tool for RSAF Military Expert (ME) scheme personnel. Managers enter a member's profile and the app generates a horizontal swimlane chart showing their projected career path from ME4 onward — including projected promotions, appointment rotations, lateral/stabilising moves, and flags when tenure limits are approaching.

No server. No installation. Open `index.html` in a browser.

---

## What It Does

- Pulls member profiles from a SharePoint list (or runs on mock data locally)
- Applies configurable career progression rules (TIG gates, appointment tenure limits, leadership aptitude constraints)
- Renders a horizontal swimlane chart per member showing:
  - Full posting history (past appointments in gray)
  - Current appointment (solid blue)
  - Projected appointments coloured by category (Technical / Leadership / Staff)
  - Lateral / stabilising appointments when personnel reach their peak rank
  - Rank promotion markers
  - Flags for tenure violations and leadership pathway restrictions
- **Editable profile panel** — change rank, appointment, aspiration, potential, aptitude, or dates and the projection recalculates instantly, no page reload needed

---

## Competencies

All personnel belong to one of four competency tracks:

| Competency | Focus |
|---|---|
| **Software Engineering** | Application development, DevSecOps, software architecture |
| **Cloud Engineering** | Cloud platforms, network architecture, infrastructure |
| **Data Analytics and AI** | Data science, analytics, AI/ML operations |
| **Product Management** | Product ownership, digital strategy, programme management |

---

## Appointment Structure

### Software Engineering

| Rank | Appointments |
|---|---|
| ME4 | Software Engineer, Dev Sec Ops Engineer |
| ME5 | Senior Software Engineer, RAP Lead, Software Dev (DRO), SO/AD Software Architecture |
| ME6 | Head A, Head I, CTO, HD Software Architect |
| ME7 | Digital Dept Head, Eng Dy Dept Head |

### Cloud Engineering

| Rank | Appointments |
|---|---|
| ME4 | Cloud Platform Engineer |
| ME5 | Senior Cloud Platform Engineer, SO Network Architecture |
| ME6 | Head Cloud Platform Team, HD Network Architecture |
| ME7 | Digital Dept Head, Eng Dy Dept Head |

### Data Analytics and AI

| Rank | Appointments |
|---|---|
| ME4 | Data Engineer (R), Data Scientist (R), Data Engineer (D), Data Scientist (D) |
| ME5 | Lead Data Scientist (R), SO RDO, SO DG, SDA, SDE, Data Science Team Lead |
| ME6 | HD RDO, HD MDT, CTO, HD LDAB, HD DATA Architecture |
| ME7 | Digital Dept Head, Eng Dy Dept Head |

### Product Management / Generalist

| Rank | Appointments |
|---|---|
| ME4 | Product Engineer (A), SO ISM |
| ME5 | SO P4B, Product Manager, SO Swift, SO LTSB, APO LTSB, SO ISD, Senior Product Engineer, A Lead, SO C4, SO Digital Strategy and Master Planning, SO Digital Ecosystem |
| ME6 | HD P, HD Swift, CTO, HD LTSB, HD LISB, HD LESO, CO 8X, HD Digital Strategy, HD Digital Ecosystem |
| ME7 | Digital Dept Head, Eng Dy Dept Head |

---

## Career Progression Rules

| Rule | Value |
|---|---|
| Entry rank | ME4 (all personnel) |
| Minimum appointment duration | 3 years (36 months) |
| Maximum appointment duration | 6 years (72 months) |
| Warning threshold | 5 years (60 months) — plan rotation |
| Minimum TIG before promotion | 36 months at current rank |
| Lateral appointments | Must be a different appointment from all prior postings |
| **CEP** | Career Employment Potential — rank ceiling (ME4–ME8). Engine projects upward to CEP rank then laterals |
| CO 8X eligibility | Medium or High leadership aptitude required |
| ME7 appointments | Medium or High leadership aptitude required |
| ME7 pathway | Blocked for Low leadership aptitude (High potential capped at ME6) |
| At peak rank | Lateral / stabilising appointments at same rank until EOS |

---

## File Structure

```
ROA App/
├── index.html              ← Member list (start here)
├── member.html             ← Individual roadmap / swimlane chart
├── config.js               ← App settings: data source, SharePoint URL, client IDs
├── data/
│   ├── mock_data.js        ← 10 test personas + full appointment catalogue
│   └── rules.js            ← Rank thresholds, appointment rules, aspiration paths
├── js/
│   ├── auth.js             ← MSAL.js login flow (SharePoint mode only)
│   ├── sharepoint.js       ← Microsoft Graph API calls
│   ├── data_client.js      ← Switches between mock and SharePoint data
│   ├── rules_engine.js     ← Builds roadmap from member profile + rules
│   ├── roadmap_builder.js  ← Converts roadmap to vis.js chart format
│   ├── roadmap.js          ← Renders the swimlane chart (member.html)
│   └── member_list.js      ← Search and filter on index.html
├── css/
│   └── main.css
└── vendor/
    ├── msal-browser.min.js     ← Placeholder; loaded from CDN in SharePoint mode
    ├── vis-timeline.min.js     ← vis.js Timeline chart library (vendored)
    └── vis-timeline.min.css
```

---

## Quick Start (Mock Data — No SharePoint Needed)

1. Download or clone this folder to your computer.
2. Open `index.html` in Chrome or Edge.
3. The member list loads using 10 built-in test personas.
4. Click any member to view their career roadmap.

> Safari may block local JS module loading. Use Chrome or Edge.

---

## Connecting to SharePoint

### Step 1 — Create the SharePoint Lists

#### List: `ROA_MemberProfiles`

| Column Name | Type | Notes |
|---|---|---|
| `Title` | Single line of text | Member full name |
| `ServiceNumber` | Single line of text | Unique service number |
| `CurrentRank` | Choice | ME4, ME5, ME6, ME7, ME8 |
| `RankDate` | Date and Time | Date promoted to current rank |
| `ServiceStartDate` | Date and Time | Date entered service at ME4 |
| `Competency` | Choice | Software Engineering, Cloud Engineering, Data Analytics and AI, Product Management |
| `CurrentAppointment` | Single line of text | Current billet / role title |
| `AppointmentStartDate` | Date and Time | Date entered current appointment |
| `Aspiration` | Choice | SeniorTechExpert, UnitLeader, OfficerConversion, TransitionOut |
| `PotentialRating` | Choice | CEP — Career Employment Potential (rank ceiling): ME4, ME5, ME6, ME7, ME8 |
| `LeadershipAptitude` | Choice | High, Medium, Low |
| `SupervisorNotes` | Multiple lines of text | Free text feedback from supervisor |
| `EndOfServiceDate` | Date and Time | Planned end-of-service date |
| `IsActive` | Yes/No | Set to No for departed members |

#### List: `ROA_AppointmentCatalogue`

| Column Name | Type | Notes |
|---|---|---|
| `Title` | Single line of text | Appointment / role name |
| `Rank` | Choice | ME4, ME5, ME6, ME7 (specific rank for this appointment) |
| `Competency` | Choice | Software Engineering, Cloud Engineering, Data Analytics and AI, Product Management |
| `Category` | Choice | Technical, Leadership, Staff |
| `DurationMonths` | Number | Standard tour length in months |
| `RequiresLeadership` | Choice | none, medium (medium = Low aptitude blocked) |

### Step 2 — Register an Azure AD App

1. Go to [portal.azure.com](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**
2. Name it `ROA App`
3. Set **Redirect URI** to `Single-page application (SPA)` → enter the URL where you'll host the app
4. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated** → add `Sites.Read.All`
5. Grant admin consent for your organisation
6. Note the **Application (client) ID** and **Directory (tenant) ID**

### Step 3 — Update `config.js`

```js
const APP_CONFIG = {
  DATA_SOURCE: "sharepoint",         // ← change from "mock"
  SP_SITE_URL: "https://yourorg.sharepoint.com/sites/yoursite",
  SP_CLIENT_ID: "paste-client-id-here",
  SP_TENANT_ID: "paste-tenant-id-here",
  LIST_MEMBERS: "ROA_MemberProfiles",
  LIST_APPOINTMENTS: "ROA_AppointmentCatalogue"
};
```

### Step 4 — Host the App

| Option | How |
|---|---|
| **SharePoint (simplest)** | Upload the `ROA App` folder to your site's **Site Assets** library |
| **Azure Static Web App** | Free tier, drag-and-drop deploy via Azure portal |
| **IIS / internal web server** | Any HTTPS-enabled server |

---

## Adjusting Career Progression Rules

Open `data/rules.js` in any text editor:

| Setting | What it controls |
|---|---|
| `potential_to_rank` | Maps Low/Medium/High potential to a rank ceiling (default: Low→ME5, Medium→ME6, High→ME7) |
| `rank_thresholds` | Minimum TIG (months at current rank) before promotion is eligible |
| `appointment_rules.min_duration_months` | Minimum time in an appointment before rotation (default: 36) |
| `appointment_rules.max_duration_months` | Maximum time in an appointment before flag fires (default: 72) |
| `appointment_rules.warning_threshold_months` | When the yellow warning flag fires (default: 60) |
| `aspiration_paths` | Which appointment categories are preferred / avoided per career aspiration |

Save and refresh — changes take effect immediately.

---

## Rank Scheme Reference (ME Scheme)

| Rank | Typical TIS at entry | Notes |
|---|---|---|
| ME4 | Entry point | All personnel start here |
| ME5 | ~3 years TIG at ME4 | |
| ME6 | ~3 years TIG at ME5 | |
| ME7 | ~3 years TIG at ME6 | Requires Medium or High leadership aptitude |
| ME8 | ~25 years TIS | — (appointments to be defined) |

> Exact thresholds are set in `data/rules.js` and should be verified against current RSAF policy before going live.

---

## Reading the Roadmap Chart

| Element | Meaning |
|---|---|
| **Gray block** | Historical appointment (past posting) |
| **Solid blue block** | Current appointment |
| **Dashed blue block** | Projected Technical appointment |
| **Dashed green block** | Projected Leadership appointment |
| **Dashed yellow block** | Projected Staff appointment |
| **Dotted purple/pink block** | Lateral / stabilising appointment (at peak rank) |
| **Orange ▲ marker** | Rank promotion point |
| **Gray dot — EOS** | End of service |
| **Red flag** | Appointment tenure exceeded (> 6 years) — immediate rotation required |
| **Yellow flag** | Approaching tenure limit (> 5 years) — plan rotation |
| **Blue flag** | ME7 pathway blocked due to Low leadership aptitude |

The chart is interactive — scroll to zoom, drag to pan.

---

## Mock Personas (10 built-in)

| # | Name | Rank | Competency | CEP | Leadership | Notes |
|---|---|---|---|---|---|---|
| 1 | Razif bin Hamdan | ME5 | Software Engineering | ME7 | Medium | **OVER tenure** (80 months) |
| 2 | Liyana bte Norzahra | ME6 | Product Management | ME7 | High | **WARNING** (61 months) |
| 3 | Jayakumar s/o Suppiah | ME6 | Data Analytics and AI | ME6 | Medium | At **peak rank** — lateral only |
| 4 | Marcus Teo Kah Liang | ME5 | Software Engineering | ME7* | Low | ME7 blocked — capped at ME6 |
| 5 | Priya d/o Devi Nair | ME4 | Data Analytics and AI | ME7 | High | Officer Conversion track |
| 6 | Chow Wei Xian | ME5 | Cloud Engineering | ME6 | Medium | Senior Tech Expert |
| 7 | Nur Aisyah bte Ramli | ME4 | Product Management | ME7 | High | Unit Leader track |
| 8 | Kenneth Lim Boon Huat | ME6 | Software Engineering | ME6 | Low | TransitionOut, near EOS |
| 9 | Ganesh s/o Rajan | ME5 | Data Analytics and AI | ME7 | High | Unit Leader track |
| 10 | Fadhillah bin Azri | ME5 | Product Management | ME6 | Medium | Officer Conversion track |

*CEP ME7 but ME7 pathway blocked — Low leadership aptitude caps projection at ME6.

---

## Troubleshooting

**Page is blank when opened locally**
- Use Chrome or Edge. Safari blocks local JS module loading.
- Check the browser console (F12) for errors.

**"Sign in" popup does not appear**
- Ensure the app is served over HTTPS, not `file://`.
- Verify the redirect URI in Azure AD matches the URL you are accessing.

**SharePoint returns no data**
- Confirm list names in `config.js` exactly match SharePoint list names (case-sensitive).
- Confirm the Azure AD app has `Sites.Read.All` permission with admin consent granted.

**Rules changes not showing**
- Hard-refresh the browser (Ctrl + Shift + R).
