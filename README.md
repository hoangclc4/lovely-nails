# Lovely Nails

A web application for **Lovely Nails**, a small nail salon. Tracks employee time, bookings, services, tips, and calculates monthly salaries.

## Project Structure

```
lovely-nails/
├── backend/        # Nest.js + Fastify + Drizzle ORM + PostgreSQL
├── frontend/       # Next.js 15 App Router + shadcn/ui + TanStack Query
├── infrastructure/ # AWS CDK
└── docker/
```

## Tech Stack

**Backend** — Nest.js, Fastify, Drizzle ORM, PostgreSQL (AWS RDS Aurora), Redis, Zod, Pino, Swagger, Vitest

**Frontend** — Next.js 15, shadcn/ui, Tailwind CSS v4, TanStack Query v5, React Hook Form, Zod, Zustand, Recharts, next-intl (EN/VI)

**Infrastructure** — AWS CDK, Docker

## Getting Started

```bash
# Backend
cd backend
pnpm install
pnpm dev

# Frontend
cd frontend
pnpm install
pnpm dev
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.local.example`.
