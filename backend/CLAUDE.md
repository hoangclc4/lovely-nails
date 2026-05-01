# Lovely Nails — Backend (`backend/`)

## Stack

- Nest.js + Fastify adapter, TypeScript strict mode
- Drizzle ORM + PostgreSQL (Aurora RDS)
- Redis (ElastiCache) — employee real-time status
- Zod — validation layer
- Pino — structured logging (`nestjs-pino`)
- Swagger (`@nestjs/swagger`) — auto-generated API docs
- Vitest + Supertest — unit and integration tests

---

## Module Structure

```
src/
├── modules/
│   ├── auth/
│   ├── employees/
│   ├── clock-records/
│   ├── customers/
│   ├── bookings/
│   ├── services/
│   ├── service-sessions/
│   ├── tips/
│   └── salaries/
├── common/
│   ├── constants/      # Domain constants (employee, pagination, etc.)
│   ├── types/          # Shared TypeScript types (pagination, etc.)
│   ├── filters/        # GlobalExceptionFilter
│   ├── guards/         # JwtAuthGuard
│   ├── interceptors/   # LoggingInterceptor, TransformInterceptor
│   ├── decorators/     # @CurrentUser, @Public
│   └── pipes/          # ZodValidationPipe
├── config/             # ConfigModule (typed env vars)
├── database/
│   ├── schema/         # Drizzle table definitions
│   └── migrations/     # Generated SQL migrations
└── main.ts             # Fastify bootstrap
```

Each feature module follows: `Controller → Service` with Drizzle ORM for DB access.
Each module has a `schemas/` folder for Zod DTOs (no class-validator).

---

## Conventions

- DTOs in `dto/` — re-export Zod schemas from `schemas/` (no class-validator)
- Zod schemas in `schemas/` per module — used for both validation and types
- Never return raw DB records from controllers — map to response types
- Services handle all business logic — keep controllers thin
- Use Drizzle transactions for multi-step DB writes
- Index all foreign keys and frequently filtered columns
- Paginate all list endpoints (offset-based by default):
  ```
  GET /api/v1/employees?page=1&limit=20
  ```

---

## Real-time Employee Status (Redis)

- Key pattern: `employee:status:{employeeId}`
- Values: `free` | `busy` | `off`
- Set on clock-in, updated on session start/end, cleared on clock-out
- TTL: auto-expire at end of day

---

## Salary Calculation Logic

```
technicianPay = totalSessionRevenue * (employee.salaryPercentage / 100)
ownerCut      = totalSessionRevenue - technicianPay
finalPay      = technicianPay + totalTips
```

Calculated per employee per calendar month. Stored in `MonthlySalary` after confirmation.

---

## Auth

- Single admin JWT account (owner only) for MVP
- `POST /api/v1/auth/login` → returns `accessToken` + `refreshToken`
- All routes protected by `JwtAuthGuard` except login
- `@Public()` decorator to opt-out of guard

---

## Error Handling

Global exception filter returns:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "name", "message": "name is required" }]
}
```

Never expose stack traces. Log full error internally via Pino.

---

## Testing

- Unit tests: service layer, salary calculation logic
- Integration tests: critical API flows (clock-in/out, booking creation, salary calc)
- Use test database — never mock Drizzle queries in integration tests

---

## Constraints

- Do not touch `frontend/` or `infrastructure/`
- Never log passwords, tokens, or PII
- Never use `any` type
- Never bypass `JwtAuthGuard` without `@Public()` decorator
