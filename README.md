# Samadhan — CM Grievance & Complaint Management Dashboard

> A civic technology platform built for the Office of the Chief Minister, Government of Delhi. Samadhan enables end-to-end grievance management with a structural focus on preventing false closures, ensuring accountability, and providing the CM with real-time visibility across all districts.

---

## The Problem

Delhi's citizens file thousands of grievances daily — spanning roads, water, electricity, sanitation, and law enforcement. Existing systems are fragmented, opaque, and easily gamed. Officers routinely mark complaints as resolved without actual resolution, and there is no structural mechanism to prevent or detect this.

## The Solution

Samadhan is built around one core insight: **resolution cannot be unilateral**. Every complaint closure requires citizen confirmation. Every action is logged immutably. Every officer has a public integrity score. The CM has a live overview of the entire system and can audit any closed complaint at any time.

---

## Key Features

### Anti-Corruption Mechanisms
- **Two-step resolution** — Officer marks resolved → Citizen receives notification → Citizen must confirm or reject. If no response in 72 hours, the system auto-closes (but does NOT penalise the officer, since inaction ≠ bad resolution)
- **Citizen rejection** decrements the responsible officer's integrity score by 2 points, visible on the CM dashboard
- **Immutable audit trail** — Every status change, routing decision, resolution, and citizen action is logged to an append-only AuditLog collection. No update or delete operations are exposed at the API or database layer
- **Spot audit** — The CM can trigger random sampling of closed complaints at any time, with each sampled complaint flagged in the audit trail

### Core Dashboard Capabilities
- **Complaint intake** with auto-categorisation (rule-based classifier with a clean seam for ML model integration)
- **Department routing** with SLA deadlines computed per department
- **Real-time critical alerts** via Socket.io — life-threatening complaints surface instantly on the CM dashboard without page refresh
- **Heatmap overview** of complaint density across Delhi districts
- **Officer bandwidth table** showing active cases and integrity scores
- **MCD311 integration** with graceful fallback — complaints ingested from MCD311 are tagged accordingly; if the external API is unavailable, the system continues operating on directly filed complaints

### Role-Based Access
| Role | Access |
|------|--------|
| Citizen | File complaints, track status, confirm or reject resolutions |
| Officer | View assigned complaints, update status, submit resolution with mandatory notes |
| Admin | Route complaints, assign officers, view department analytics |
| CM Office | Full system overview, real-time alerts, spot audits, officer performance |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Recharts, Leaflet
- **Backend**: Next.js API Routes with RBAC middleware, BullMQ worker process
- **Database**: MongoDB with Mongoose (append-only AuditLog enforced at schema level)
- **Auth**: JWT access tokens (15min) + refresh token rotation (httpOnly cookie)
- **Real-time**: Socket.io (critical alert channel to CM)
- **Queue**: BullMQ + Redis (72-hour auto-confirm jobs, hourly SLA breach scanner)
- **Deployment**: Docker Compose (web, worker, mongo, redis, nginx, seed)

---

## Getting Started

### Prerequisites
- Docker Desktop (running)
- Git

### Setup

```bash
git clone https://github.com/Nimonium/samadhan.git
cd samadhan
cp .env.example .env
docker compose up --build
```

The stack will automatically seed the database with realistic demo data on first startup. Visit `http://localhost:80` once all services are healthy.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for access token signing |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL |
| `REDIS_URL` | Redis connection string for BullMQ |
| `MCD311_SIMULATE_FAILURE` | Set to `true` to simulate MCD311 API outage |
| `NODE_ENV` | `development` or `production` |

### Demo Credentials (seeded automatically)

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@samadhan.in | password123 |
| Officer | officer.djb@samadhan.in | password123 |
| Admin | admin.djb@samadhan.in | password123 |
| CM Office | cm@samadhan.in | password123 |

---

## 3-Minute Demo Script

**Step 1 — Citizen files a complaint** (`/complaints/new`)
Log in as Citizen. Fill in a complaint about water supply. Note the auto-suggested category badge. Select Critical severity and observe the warning text. Submit.

**Step 2 — CM sees the real-time alert** (`/cm/dashboard`)
Log in as CM Office. The critical complaint appears in the live Critical Alerts feed without a page refresh. Observe the heatmap and SLA breach KPI.

**Step 3 — Admin routes the complaint** 
Log in as Admin. Route the complaint to a DJB officer. SLA deadline is computed automatically based on department (48 hours for DJB).

**Step 4 — Officer resolves** (`/officer/complaints/[id]`)
Log in as Officer. Open the complaint — note the "Synced from MCD311" badge if applicable. Fill in resolution notes (required, enforced server-side). Click Mark as Resolved. The confirmation modal warns: *"False or premature closures affect your integrity score."* Confirm. Status moves to "Resolved — Pending Citizen Confirmation."

**Step 5 — Citizen rejects** (`/complaints/[id]/track`)
Log in as Citizen. The tracking timeline shows the pulsing "Pending Your Confirmation" stage. Click "No, reopen this." Status reverts to In Progress. Officer integrity score drops by 2 points.

**Step 6 — CM audits** (`/cm/dashboard`)
Log in as CM Office. Click "Randomly Review Closed Complaints." A random sample of closed complaints is returned. Scroll to the Officer Bandwidth table — the rejecting officer's integrity score is now visible. Click into any complaint's audit trail to see the full immutable history of every action taken.

---

## Project Structure
src/

├── app/

│   ├── api/          # RBAC-gated API routes

│   ├── cm/           # CM dashboard and field view

│   ├── complaints/   # Citizen intake and tracking

│   ├── login/        # Role-based authentication

│   └── officer/      # Officer dashboard and complaint detail

├── lib/

│   ├── auth.ts       # JWT utilities

│   ├── classifier.ts # Auto-categorisation (ML seam)

│   ├── db.ts         # MongoDB connection

│   ├── mcd311.ts     # External API integration with fallback

│   └── models/       # Mongoose schemas

├── worker/

│   └── worker.ts     # BullMQ jobs (auto-confirm, SLA breach)

└── tests/        # State machine, RBAC, MCD311 tests

---

## Running Tests

```bash
npm test
```

Covers: two-step resolution state machine, RBAC boundary enforcement, MCD311 fallback path.

---

## License

Built for the Hansa AI × Delhi Government Civic Tech Challenge — India Innovates 2026.

---
