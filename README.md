# ROA — Route of Advancement Planning App

A browser-based career roadmap tool for RSAF Military Expert (ME) scheme personnel. Managers enter a member's profile and the app generates a horizontal swimlane chart showing their projected career path from present to end-of-service.

No server. No installation. Open `index.html` in a browser.

---

## What It Does

- Pulls member profiles from a SharePoint list (or runs on mock data locally)
- Applies configurable rank progression rules (TIS/TIG gates, appointment rotation)
- Renders a horizontal swimlane chart per member showing:
  - Current and projected appointments (colored by category)
  - Rank promotion eligibility markers
  - Aspiration-based career branching (Technical track, Leadership track, Officer conversion, Transition)
  - Flags when a member is approaching or exceeding the 3-year appointment tenure limit

---

## File Structure

```
ROA App/
├── index.html              ← Member list (start here)
├── member.html             ← Individual roadmap / swimlane chart
├── config.js               ← App settings: data source, SharePoint URL, client IDs
├── data/
│   ├── mock_data.js        ← Test members and appointments (used when DATA_SOURCE = "mock")
│   └── rules.js            ← Rank thresholds and aspiration rules (edit to tune)
├── js/
│   ├── auth.js             ← MSAL.js login flow (only used in SharePoint mode)
│   ├── sharepoint.js       ← Microsoft Graph API calls
│   ├── data_client.js      ← Switches between mock and SharePoint data
│   ├── rules_engine.js     ← Builds roadmap from member profile + rules
│   ├── roadmap_builder.js  ← Converts roadmap to vis.js chart format
│   ├── roadmap.js          ← Renders the swimlane chart (member.html)
│   └── member_list.js      ← Search and filter on index.html
├── css/
│   └── main.css
└── vendor/
    ├── msal-browser.min.js     ← Microsoft Authentication Library (vendored)
    ├── vis-timeline.min.js     ← vis.js Timeline chart library (vendored)
    └── vis-timeline.min.css
```

---

## Quick Start (Mock Data — No SharePoint Needed)

1. Download or clone this folder to your computer.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
3. The member list loads using built-in mock data.
4. Click any member to view their career roadmap.

> Safari may block local JS module imports. Use Chrome or Edge if the page appears blank.

---

## Connecting to SharePoint

### Step 1 — Create the SharePoint Lists

In your SharePoint site, create two lists with the following columns:

#### List: `ROA_MemberProfiles`

| Column Name | Type | Notes |
|---|---|---|
| `Title` | Single line of text | Member full name |
| `ServiceNumber` | Single line of text | Unique service number (e.g. "F1234567") |
| `CurrentRank` | Choice | ME1, ME2, ME3, ME4, ME5, ME6, ME7, ME8 |
| `RankDate` | Date and Time | Date promoted to current rank |
| `ServiceStartDate` | Date and Time | Date entered service |
| `Specialisation` | Choice | AMIC, ATC, COMMS, LOG, INTEL, OPS, TRNG (add as needed) |
| `CurrentAppointment` | Single line of text | Current billet / role title |
| `AppointmentStartDate` | Date and Time | Date entered current appointment |
| `Aspiration` | Choice | SeniorTechExpert, UnitLeader, OfficerConversion, TransitionOut |
| `PotentialRating` | Choice | Estimated maximum rank the member can attain: ME1, ME2, ME3, ME4, ME5, ME6, ME7, ME8 |
| `SupervisorNotes` | Multiple lines of text | Free text feedback from supervisor |
| `EndOfServiceDate` | Date and Time | Planned end-of-service date |
| `IsActive` | Yes/No | Set to No for departed members |

#### List: `ROA_AppointmentCatalogue`

| Column Name | Type | Notes |
|---|---|---|
| `Title` | Single line of text | Appointment / role name |
| `MinRank` | Choice | ME1–ME8 (minimum rank for this role) |
| `MaxRank` | Choice | ME1–ME8 (maximum rank appropriate) |
| `Specialisation` | Choice | Required vocation, or "Any" |
| `Category` | Choice | Technical, Leadership, Training, Staff |
| `DurationMonths` | Number | Standard tour length in months |
| `AspirationTags` | Single line of text | Comma-separated: SeniorTechExpert, UnitLeader, etc. |

### Step 2 — Register an Azure AD App

1. Go to [portal.azure.com](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**
2. Name it `ROA App`
3. Set **Supported account types** to your organisation's tenant only
4. Set **Redirect URI** to `Single-page application (SPA)` → enter the URL where you'll host the app (e.g. `https://yourorg.sharepoint.com/sites/yoursite/SiteAssets/ROA%20App/index.html`)
5. After creating, go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated** → add `Sites.Read.All`
6. Grant admin consent for your organisation
7. Note the **Application (client) ID** and **Directory (tenant) ID** from the Overview page

### Step 3 — Update `config.js`

Open `config.js` and fill in your details:

```js
const APP_CONFIG = {
  DATA_SOURCE: "sharepoint",         // ← change from "mock" to "sharepoint"
  SP_SITE_URL: "https://yourorg.sharepoint.com/sites/yoursite",
  SP_CLIENT_ID: "paste-client-id-here",
  SP_TENANT_ID: "paste-tenant-id-here",
  LIST_MEMBERS: "ROA_MemberProfiles",
  LIST_APPOINTMENTS: "ROA_AppointmentCatalogue"
};
```

### Step 4 — Host the App

The app must be served over HTTPS for the SharePoint login to work. Options:

| Option | How |
|---|---|
| **SharePoint (simplest)** | Upload the entire `ROA App` folder to your site's **Site Assets** library. Open `index.html` from there. |
| **Azure Static Web App** | Free tier. Drag-and-drop deploy via the Azure portal. |
| **IIS / internal web server** | Copy files to any HTTPS-enabled server. |

> Opening `index.html` directly from your hard drive (`file://...`) will not work in SharePoint mode because browsers block OAuth redirects from local files.

---

## Adjusting Career Progression Rules

Open `data/rules.js` in any text editor (Notepad works). The values you can change:

| Setting | What it controls |
|---|---|
| `rank_thresholds` | Minimum TIS (time in service) and TIG (time in grade) in months before a member is eligible for the next rank |
| `appointment_rules.max_duration_months` | How long a member can stay in one appointment (default: 36 months) |
| `appointment_rules.warning_threshold_months` | When to show the yellow tenure warning (default: 30 months) |
| `aspiration_paths` | Which appointment categories are preferred / avoided for each career aspiration |

Save the file and refresh the browser — changes take effect immediately.

---

## Rank Scheme Reference (ME Scheme)

| Rank | Typical TIS at promotion | Notes |
|---|---|---|
| ME1 | On enlistment | Junior Military Expert |
| ME2 | ~1 year | |
| ME3 | ~3 years | |
| ME4 | ~6 years | Senior Military Expert |
| ME5 | ~10 years | |
| ME6 | ~14 years | |
| ME7 | ~20 years | Chief Military Expert |
| ME8 | ~25 years | |

> Exact thresholds are set in `data/rules.js` and should be verified against current RSAF policy before going live.

---

## Reading the Roadmap Chart

| Element | Meaning |
|---|---|
| **Solid blue block** | Current appointment |
| **Light blue dashed block** | Projected future appointment |
| **Orange diamond marker** | Earliest date eligible for next rank promotion |
| **Yellow banner (top)** | Warning: member is approaching or over the 3-year appointment tenure limit |

The chart is interactive — scroll to zoom in/out, drag to pan across the timeline.

---

## Troubleshooting

**Page is blank when opened locally**
- Use Chrome or Edge. Safari blocks local JS modules.
- Check the browser console (F12) for errors.

**"Sign in" popup does not appear**
- Ensure the app is served over HTTPS, not `file://`.
- Verify the redirect URI in Azure AD matches the URL you are accessing.

**SharePoint returns no data**
- Confirm the list names in `config.js` exactly match the SharePoint list names (case-sensitive).
- Confirm the Azure AD app has `Sites.Read.All` permission with admin consent granted.

**Rules changes not showing**
- Hard-refresh the browser (Ctrl + Shift + R) to clear cached JS files.
