# 🛡️ GUARDIA — NEXORA

> **Intelligent Disaster Management & Emergency Response Coordination Platform for India.**  
> **Every Second Matters. Every Signal Counts.**

![Project](https://img.shields.io/badge/project-Disaster%20Management-163A70)
![Frontend](https://img.shields.io/badge/frontend-React%2019-61DAFB)
![Backend](https://img.shields.io/badge/backend-Express.js-000000)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6)
![Build](https://img.shields.io/badge/build-Vite-646CFF)

GUARDIA is a web-based disaster management and emergency response coordination platform developed by **Team NEXORA**. It brings incident reporting, emergency prioritisation, response-team recommendations, resource monitoring, department coordination, family reunification, and missing-person support into one unified interface.

The platform is designed around a life-first principle: emergency reports should be assessed by the potential threat to people, not simply handled in the order in which they arrive.

---

## 📌 Problem Statement

During natural disasters, accidents, fires, floods, structural collapses, and other large-scale emergencies, information and response activities can become fragmented across citizens, administrators, and emergency departments.

Common operational challenges include:

1. **Delayed incident assessment:** Authorities may receive many reports at once and need a consistent way to identify reports that indicate immediate danger.
2. **Fragmented coordination:** Police, fire and rescue, ambulance, and disaster-response teams need shared incident information and clear response status.
3. **Resource and team allocation:** Selecting a suitable response team requires considering its availability, capabilities, equipment, and proximity to an incident.
4. **Duplicate and clustered reports:** Multiple people may report the same event or nearby events, making it harder to understand the overall situation.
5. **Family separation and missing persons:** Disasters can separate families and make it difficult to organise safety check-ins, sightings, and reunification information.
6. **Unverified information:** Images and reports shared during a crisis may require review before being relied upon operationally.

**GUARDIA** addresses these challenges through a centralised emergency-management workspace with dedicated modules for citizens, administrators, and response departments.

---

## 🚀 Core Features

| Feature | Subsystem | Engineering Mechanism | Output / Purpose | Implementation Note |
|---|---|---|---|---|
| **LifeFirst Priority Engine** | `lifeFirstEngine.ts` | Weighted assessment of immediate danger, injury severity, medical indicators, trapped people, affected population, vulnerable people, incident progression, and waiting time. | Risk score, suggested P1–P4 priority, urgent reasons, and missing-information indicators. | Rule-based assessment engine |
| **Dynamic Reassessment** | LifeFirst Engine | Recalculates an incident assessment when new information is submitted and checks whether the suggested priority should escalate. | Updated assessment and escalation result. | Implemented in backend |
| **Response-Team Recommendation** | `teamAssignmentEngine.ts` | Filters teams by availability and response category; scores candidates using distance, category match, equipment, and incident needs. | Recommended team, distance, estimated travel time, suitability score, and alternatives. | Uses Haversine distance and an estimated travel-time calculation |
| **Incident Reporting & Tracking** | Incident Management | Creates incident records with category, location, affected/injured counts, severity indicators, reporter details, and a unique reference. | Trackable incident record and operational status. | REST API |
| **Crisis Pulse** | `crisisPulse.ts` | Groups related incident information into crisis clusters. | Cluster records for situational awareness and review. | Implemented in backend |
| **Duplicate Detection** | `duplicateDetection.ts` | Generates duplicate suggestions for incident records. | Potential duplicate records for administrative review. | Suggestions can be resolved through the API |
| **RescueBridge Coordination** | `rescueBridge.ts` | Creates department notifications associated with incidents and supports acknowledgement and status updates. | Department notification and response-status records. | Workflow is represented in the application; live external dispatch integration is not established by the repository |
| **Resource Management** | Resource Management | Tracks emergency resources and supports assignment and release against incidents. | Resource availability and assignment status. | REST API |
| **SOS Now** | SOS Management | Creates SOS alerts with location, emergency category, contact information, and status. | SOS reference and response status. | Contact notification states include simulated delivery status |
| **FamilyLink** | Family Reunification | Supports family-group creation, invitation-code joining, member check-ins, and reunification-centre records. | Family safety and reunification information. | REST API |
| **Finder** | Missing-Person Management | Creates missing-person cases, records sightings, and supports sighting verification and case-status updates. | Search case and sighting records. | REST API |
| **RealityCheck** | `realityCheckEngine.ts` | Computes a SHA-256 hash and applies filename, payload-string, and file-size/metadata heuristics. | Image assessment record, indicators, and review fields. | Demonstration heuristic; not a validated forensic or AI detector |
| **Command Dashboard & Analytics** | Overview Dashboard | Aggregates incident, priority, injury, team, resource, SOS, missing-person, family, and department-acknowledgement information. | Central operational overview. | Dashboard fetches API data periodically |
| **Audit & Notifications** | Notification and Audit APIs | Stores operational changes and platform notifications. | Reviewable activity and notification records. | Backed by application data layer |

---

## 🧠 LifeFirst — Human-Centred Emergency Prioritisation

LifeFirst is GUARDIA's rule-based incident assessment engine. It evaluates several factors and calculates a weighted score to suggest an emergency priority.

### Assessment factors

| Assessment factor | Weight |
|---|---:|
| Immediate threat to life | 25% |
| Injury severity | 25% |
| Medical condition indicators | 15% |
| People trapped | 12% |
| Number of people affected | 10% |
| Vulnerable individuals | 5% |
| Incident progression | 5% |
| Waiting time | 3% |
| **Total** | **100%** |

The engine returns:
- A composite score from 0–100.
- A suggested priority from P1 to P4.
- Urgent-review override information.
- Reasons contributing to urgency.
- Missing-information warnings.

### Priority bands

| Priority | Score / Condition |
|---|---|
| **P1 — Critical** | Score of 75 or above, or an urgent-review override |
| **P2 — High** | Score from 50 to 74 |
| **P3 — Moderate** | Score from 25 to 49 |
| **P4 — Low** | Score below 25 |

The engine also includes precautionary handling for unknown injury severity rather than treating missing information as zero risk.

**Important:** LifeFirst is a decision-support mechanism implemented with predefined rules and weights. Its suggested priority is not a substitute for emergency-professional judgement or an officially validated triage protocol.

---

## 🚑 Intelligent Response-Team Recommendation

GUARDIA includes a team recommendation engine that considers both incident requirements and response-team information.

### Recommendation workflow

1. Identify the response category associated with the incident.
2. Filter teams by availability and compatible capabilities.
3. Calculate geographical distance using the Haversine formula.
4. Estimate travel time using the team's configured speed and a dispatch allowance.
5. Adjust suitability according to category match and relevant equipment.
6. Return the highest-scoring recommendation and alternative teams.

The engine can consider categories such as:
- Fire and rescue.
- Medical ambulance.
- Police.
- Disaster response.
- Search and rescue.

The route coordinates generated by the current implementation are interpolated between the team and incident coordinates. They are illustrative map coordinates, not directions from a live road-routing service.

---

## 🏗️ Technology Stack

### Frontend Client

| Component | Version / Package | Role in Architecture |
|---|---|---|
| **React** | `^19.0.1` | Component-based user interface and application state |
| **TypeScript** | `^7.0.2` | Typed application models and frontend logic |
| **Vite** | `^8.3.0` | Development server and frontend build tooling |
| **Tailwind CSS** | `^4.3.3` | Utility-first styling |
| **Lucide React** | `^0.546.0` | Interface icons |
| **Motion** | `^12.23.24` | UI animation and motion |
| **Chart.js** | `^4.6.1` | Dashboard charts and data visualisation |
| **Leaflet** | `^1.9.4` | Interactive map components |

### Backend Services

| Component | Version / Package | Role in Architecture |
|---|---|---|
| **Node.js** | Runtime | JavaScript / TypeScript server runtime |
| **Express.js** | `^4.21.2` | HTTP server and REST API endpoints |
| **TypeScript** | `^7.0.2` | Backend types and application logic |
| **tsx** | `^4.21.0` | Executes TypeScript server code |
| **Vite** | `^8.3.0` | Integrated with Express middleware during development |
| **dotenv** | `^17.2.3` | Environment-variable loading |

### AI, Mapping & Supporting Libraries

| Component | Version / Package | Role in Architecture |
|---|---|---|
| **Google GenAI SDK** | `@google/genai ^2.4.0` | Available dependency for Google Gemini API integration |
| **Leaflet** | `^1.9.4` | Map rendering and location visualisation |
| **SHA-256** | Node.js `crypto` | Evidence-payload hashing in RealityCheck |

> Versions above are taken from the repository's `package.json`. The presence of an SDK dependency does not by itself establish that every module uses a live external AI service.

---

## 📂 Project Structure

```text
Guardia---Nexora/
│
├── data/
│   └── guardia_db.json              # Application data file created/read by the data layer
│
├── public/
│   └── assets/
│       └── aistudio/                # Public static assets
│
├── server/
│   ├── db.ts                        # Data access, persistence and demo data
│   ├── lifeFirstEngine.ts            # Weighted emergency assessment and reassessment
│   ├── teamAssignmentEngine.ts       # Response-team recommendation and route coordinates
│   ├── realityCheckEngine.ts         # Image assessment and SHA-256 hashing
│   ├── crisisPulse.ts                # Incident cluster detection
│   ├── duplicateDetection.ts         # Potential duplicate incident detection
│   └── rescueBridge.ts               # Department notification creation
│
├── src/
│   ├── components/                   # React interface components
│   ├── translations/                 # Language and translation definitions
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript domain models
│   └── App.tsx                       # Main application and dashboard orchestration
│
├── .env.example                      # Environment variable template
├── .gitignore
├── bun.lock                          # Bun dependency lockfile
├── index.html                        # HTML entry point
├── metadata.json                     # Project metadata
├── package.json                      # Dependencies and npm scripts
├── server.ts                         # Express API server and Vite integration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite and Tailwind configuration
└── README.md                         # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js:** A version compatible with the Vite version specified in `package.json`.
- **npm:** Installed with Node.js.
- **Git:** To clone the repository.
- **Google Gemini API key:** Only if you are using functionality that requires Gemini API access.

### Step 1: Clone the Repository

```bash
git clone https://github.com/hasicodes/Guardia---Nexora.git
cd Guardia---Nexora
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Configure the values:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

- `GEMINI_API_KEY` is documented in the repository as the key for Gemini API calls.
- `APP_URL` represents the hosted application URL and is used for self-referential links, OAuth callbacks, and API endpoints as described in the example environment file.

Keep private API keys out of source control.

### Step 4: Start the Development Server

```bash
npm run dev
```

The `dev` script runs `tsx server.ts`. In development, the Express server integrates Vite middleware.

### Step 5: Open GUARDIA

Visit:

```text
http://localhost:3000
```

The server uses port `3000` by default. If a `PORT` environment variable is supplied, the server uses that configured port.

### Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the TypeScript server with Vite development middleware |
| `npm run build` | Builds the frontend using Vite |
| `npm start` | Starts the TypeScript server |
| `npm run preview` | Runs the Vite preview command |
| `npm run lint` | Runs TypeScript checking with `tsc --noEmit` |
| `npm run clean` | Removes `dist` and `server.js` |

---

## 🏛️ System Architecture

GUARDIA uses a React frontend connected to an Express backend through REST API endpoints. The backend coordinates the application modules and accesses the platform's JSON-file data layer.

```text
                      GUARDIA PLATFORM
                              |
             -----------------------------------
             |                |                |
          CITIZENS        ADMINISTRATORS    DEPARTMENTS
             |                |                |
             -----------------------------------
                              |
                       REACT FRONTEND
                              |
                        REST API CALLS
                              |
                       EXPRESS SERVER
                              |
        -------------------------------------------------
        |            |            |          |           |
     LifeFirst    Team         Incident    SOS       FamilyLink
     Engine       Assignment   Management  Module    Module
        |            |            |          |           |
        -------------------------------------------------
                              |
        -------------------------------------------------
        |             |              |                  |
     CrisisPulse   Duplicate      RealityCheck       RescueBridge
                   Detection      Engine
        |             |              |                  |
        -------------------------------------------------
                              |
                      DATA ACCESS LAYER
                              |
                       JSON FILE STORAGE
                       data/guardia_db.json
```

---

## 🔄 How It Works

### 1. Incident Submission

1. A citizen or authorised interface submits an emergency report.
2. The backend validates mandatory incident fields.
3. A new incident record is created with location, category, impact details, and a unique reference.
4. The incident is stored through the application data layer.

### 2. LifeFirst Assessment

1. The incident information is passed to the LifeFirst assessment engine.
2. The engine evaluates the defined emergency factors.
3. A weighted score and suggested P1–P4 priority are generated.
4. Urgent reasons and missing information are attached to the assessment.
5. New information can trigger dynamic reassessment.

### 3. Team Recommendation

1. The system identifies the response category required for the incident.
2. Available or returning teams are checked for category compatibility.
3. Candidate teams are scored using proximity, estimated travel time, category suitability, and relevant equipment.
4. The best-fit team and alternatives are returned for operational review.

### 4. Department Coordination

1. Incident-related notifications are made available to relevant departments.
2. Department users can acknowledge notifications.
3. Responders can update their response status and notes.
4. Notification records contribute to coordination monitoring.

### 5. Resource Allocation

1. Administrators view the available emergency resources.
2. Resources can be assigned to an incident.
3. Resource status is updated through the backend.
4. Resources can be released when no longer assigned.

### 6. Citizen Safety & Reunification

1. SOS alerts can be created with emergency and location information.
2. Family groups can be created or joined using invitation codes.
3. Members can submit safety check-ins.
4. Missing-person cases and sightings can be recorded and reviewed.
5. Reunification-centre information can be maintained.

### 7. Command Dashboard

The frontend requests incident, resource, cluster, duplicate, notification, and analytics data from the backend. The main application refreshes these records at a 10-second interval and updates the dashboard state.

---

## 🌟 Novelty & Comparative Analysis

GUARDIA's key design idea is to connect emergency assessment with response coordination and citizen-safety workflows in one platform.

| Capability | Conventional Reporting Workflow | GUARDIA |
|---|---|---|
| Incident intake | Separate reporting channels | Central incident records |
| Emergency prioritisation | Manual or fixed priority labels | Weighted LifeFirst assessment with reassessment |
| Team selection | Manual coordination | Capability- and distance-based team recommendation |
| Incident visibility | Individual reports | Crisis clusters and duplicate suggestions |
| Department coordination | Separate communication records | Incident-linked department notifications and acknowledgements |
| Resource tracking | Separate resource lists | Incident-linked assignment and release workflow |
| Family safety | Informal communication | FamilyLink groups and safety check-ins |
| Missing-person tracking | Separate case handling | Finder cases and sighting records |
| Evidence review | Manual inspection alone | RealityCheck screening record with hash and heuristic indicators |

### Core Innovation: LifeFirst + Response Matching

The central innovation is the connection between two decision-support stages:

- **LifeFirst** estimates incident urgency using human-impact factors.
- **Response-Team Recommendation** identifies suitable teams using incident category, availability, proximity, and equipment information.

Together, these modules aim to help administrators move from receiving an emergency report to reviewing a prioritised incident and a reasoned response-team recommendation.

These outputs support human decision-making; they do not independently dispatch emergency services.

---

## 🔧 Feature Depth & Engineering Considerations

### 1. Dynamic Reassessment

An incident can change after its initial submission. GUARDIA allows new information to be passed to the LifeFirst engine so the assessment can be recalculated. The backend compares priority levels and reports whether an escalation has occurred.

### 2. Precautionary Handling of Missing Information

Unknown injury severity receives a non-zero assessment score and creates a missing-information warning. This avoids automatically interpreting an incomplete report as a harmless incident.

### 3. Response-Team Suitability

Team recommendations account for:
- Availability status.
- Response category compatibility.
- Geographical distance.
- Estimated travel time.
- Equipment relevant to trapped individuals or life-threatening injuries.

### 4. Persistent Application Data

The data layer reads and writes application records through `server/db.ts`, using `data/guardia_db.json` as its JSON data file. The repository does not currently establish a PostgreSQL, MongoDB, or other external database deployment.

### 5. Demo Data

The data layer includes seeded demonstration users, incidents, teams, and other records. Some displayed response teams and operational information are explicitly marked as simulated. Demonstration data should not be interpreted as live government or emergency-service data.

---

## 🧪 Feasibility & Deployment Considerations

GUARDIA is built using a compact TypeScript stack:

- React and Vite provide the web interface and build workflow.
- Express provides the API layer.
- TypeScript defines shared models and backend logic.
- JSON-file persistence supports the current prototype data workflow.
- Leaflet provides map functionality.
- The application can be built using the repository's npm scripts.

Before deployment for real emergency operations, additional engineering work would be required, including:

- Production-grade authentication and role-based authorisation.
- Secure, scalable database infrastructure and backup procedures.
- Reliable notification and messaging integrations.
- Verified live location and road-routing services.
- Monitoring, logging, rate limiting, and API protection.
- Load, reliability, accessibility, and security testing.
- Operational agreements and integration with authorised emergency departments.

---

## ⚠️ Security, Ethics & Operational Disclaimer

GUARDIA is a **disaster-management prototype and decision-support application**. It is not a certified emergency dispatch, public-warning, medical triage, or life-safety system.

### Important limitations

- **Authentication:** The current login API uses demonstration-oriented user lookup and role selection. It should not be treated as production-grade authentication.
- **LifeFirst:** Priority scores are generated using predefined rules and weights. They require validation and human review before operational use.
- **Team assignment:** Estimated travel time is calculated from straight-line distance and configured speed. Generated route coordinates are illustrative and are not live road directions.
- **RealityCheck:** The current implementation uses filename and payload-string clues, file-size/metadata heuristics, and SHA-256 hashing. A cryptographic hash can help identify a particular payload, but it does not prove that an image depicts a genuine event. The current checks are not a validated AI deepfake detector or forensic authentication method.
- **Notifications:** Department notification and acknowledgement workflows are represented in the application. The repository does not establish a live connection to official police, fire, ambulance, or government dispatch networks.
- **Demonstration records:** Seeded users, teams, locations, and incident records may be simulated.
- **Personal information:** Real deployments must protect phone numbers, location information, family details, missing-person records, and uploaded evidence.

All emergency decisions must remain under the control of authorised personnel and established emergency-response procedures.

---

## 🗺️ Future Scope

Potential areas for future development include:

1. Integration with authorised emergency-service systems and verified dispatch channels.
2. Secure real-time notifications through approved SMS, push, or messaging providers.
3. Live GPS tracking and road-network routing through a trusted mapping service.
4. Multilingual citizen reporting and accessibility improvements.
5. Stronger duplicate-report correlation using location, time, and incident characteristics.
6. Independently validated image provenance and manipulation analysis.
7. Scalable database infrastructure, audit controls, and disaster-recovery mechanisms.
8. Offline-friendly reporting for areas with limited connectivity.

These are proposed extensions and should not be interpreted as currently completed features.

---

## 📜 License

No explicit open-source license is identified in the repository files reviewed for this README. Unless a license is added, reuse and redistribution remain subject to the applicable copyright rules.

---

## 🧩 Project & Team

| Detail | Information |
|---|---|
| **Project Name** | GUARDIA |
| **Team** | NEXORA |
| **Domain** | Disaster Management & Emergency Response |
| **Platform** | Web Application |
| **Primary Focus** | Life-first emergency assessment and coordinated response |
| **Target Context** | Disaster management in India |
| **Repository** | [Guardia---Nexora](https://github.com/hasicodes/Guardia---Nexora) |
| **Development Stage** | Prototype |

---

## 💙 Our Vision

We envision a future where emergency information does not remain scattered, response teams are easier to coordinate, and families are not left without a way to communicate during disasters.

GUARDIA brings together technology, structured decision support, and human-centred emergency workflows to help build a safer and more prepared society.

> **GUARDIA — Every Second Matters. Every Signal Counts.**  
> *Intelligence in Every Response. Humanity in Every Decision.*

---

**Developed by Team NEXORA**  
*Building technology for a safer, more prepared tomorrow.*
