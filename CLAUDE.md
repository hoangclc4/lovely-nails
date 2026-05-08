# Lovely Nails — Project Instructions

## Project Overview

A web application for **Lovely Nails**, a small nail salon. Tracks employee time, bookings, services, tips, and calculates monthly salaries.

**Project structure:**

```
lovely-nails/
├── backend/      # Nest.js backend (Fastify)
├── frontend/     # Next.js 15 frontend
├── infrastructure/   # AWS CDK
└── docker/
```

---

## Tech Stack

### Backend (`backend/`)

- Nest.js + Fastify adapter, TypeScript strict mode
- Drizzle ORM + PostgreSQL (AWS RDS Aurora)
- Redis (ElastiCache) — real-time employee status
- Zod — validation
- Pino — structured logging
- Swagger — API docs
- Vitest + Supertest — testing

### Frontend (`frontend/`)

- Next.js 15+ App Router, TypeScript strict mode
- shadcn/ui + Tailwind CSS v4
- TanStack Query v5 + TanStack Table v8
- React Hook Form + Zod
- Zustand — UI state only
- Recharts — charts and reports
- next-themes — dark/light/system mode
- next-intl — EN/VI bilingual support
- Vitest + Playwright — testing

### Infrastructure

- AWS CDK (TypeScript)
- Docker (local dev)

---

## Domain Model (Core Entities)

| Entity | Key Fields |
|---|---|
| Employee | id, name, role, phone, isActive, salaryPercentage |
| ClockRecord | id, employeeId, clockIn, clockOut, date |
| Customer | id, name, phone, email, visitCount |
| Booking | id, customerId, employeeId, serviceIds, startTime, endTime, status |
| Service | id, name, description, price, durationMinutes, category, isActive |
| ServiceSession | id, bookingId, employeeId, customerId, services[], startTime, endTime, totalAmount |
| TipRecord | id, sessionId, employeeId, amount, date |
| MonthlySalary | id, employeeId, month, year, totalRevenue, ownerCut, technicianCut, totalTips, finalPay |

---

## API Conventions

- Versioned routes: `/api/v1/...`
- RESTful: `GET /employees`, `POST /employees`, `PATCH /employees/:id`
- Response envelope:
  ```json
  { "data": ..., "meta": { "page": 1, "total": 100 } }
  ```
- Error response:
  ```json
  { "statusCode": 400, "message": "...", "errors": [...] }
  ```
- All list endpoints paginated (offset-based default)
- Auth: JWT Bearer token (admin only for MVP)

---

## Frontend Conventions

- All API calls through TanStack Query (no raw fetch in components)
- Forms use React Hook Form + Zod schema validation
- Global UI state (modals, sidebar) via Zustand — no server state in Zustand
- i18n keys in `messages/en.json` and `messages/vi.json`
- Theme: `next-themes` with `dark` / `light` / `system`

---

## Code Rules (applies to both apps)

- TypeScript strict mode — never use `any`
- No `console.log` in production code — use Pino (API) or structured logger (web)
- No hardcoded strings — use constants or i18n keys
- No magic numbers — name index/threshold constants
- Guard clauses over nested if/else
- DTOs with `class-validator` for all API inputs (backend)
- Zod schemas for all form and API response validation (frontend)
- Handle loading, error, and empty states in every UI component

---

## Feature Scope (MVP)

| # | Feature | Status |
|---|---|---|
| 1 | Employee Management | MVP |
| 2 | Time Tracking / Clock In-Out | MVP |
| 3 | Booking & Scheduling | MVP |
| 4 | Service Management | MVP |
| 5 | Service Session Tracking | MVP |
| 6 | Tip Recording | MVP |
| 7 | Monthly Salary Calculation | MVP |
| 8 | Dashboard & Reports | MVP |
| 9 | Customer Management | MVP |
| 10 | Admin Authentication (single owner account) | MVP |
| 11 | Dark / Light Mode | MVP |
| 12 | EN / VI Internationalization | MVP |
| 13 | Customer accounts & loyalty | Post-MVP |

---

## Environment Variables

Backend (`backend/.env`):

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=3100
```

Frontend (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3100/api/v1
```

Never commit `.env` files.

---

## Dev Commands

```bash
# Backend
cd backend
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm test
pnpm type-check

# Frontend
cd frontend
pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm build
pnpm test
```

---

## Agent Routing

- Frontend tasks → use `frontend-developer` agent
- Backend tasks → use `backend-developer` agent
- Full-stack or architecture tasks → handle in root context

---

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
