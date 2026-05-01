# Lovely Nails — Frontend (`frontend/`)

## Stack

- Next.js 15+ App Router, TypeScript strict mode
- shadcn/ui + Tailwind CSS v4
- TanStack Query v5 — server/async state
- TanStack Table v8 — data tables
- React Hook Form + Zod — form handling and validation
- Zustand — UI-only state (modals, sidebar, filters)
- Recharts — charts and dashboard reports
- next-themes — dark / light / system theme switching
- next-intl — EN / VI bilingual support
- Vitest + Playwright — unit and E2E tests

---

## App Structure

```
src/
├── app/
│   ├── (admin)/                # Auth-protected route group
│   │   ├── layout.tsx
│   │   ├── employees/
│   │   ├── bookings/
│   │   ├── services/
│   │   ├── sessions/
│   │   ├── customers/
│   │   ├── salaries/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx                # Redirect to /employees
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/                 # Sidebar, Header
│   └── [feature]/              # Feature-specific components (employees/, bookings/, etc.)
├── constants/                  # Domain constants (employee status, etc.)
├── hooks/                      # Custom TanStack Query hooks per feature
├── lib/
│   ├── api-client.ts           # Typed fetch wrapper
│   ├── query-client.ts         # TanStack Query client config
│   └── utils.ts                # cn(), formatCurrency()
├── providers/                  # QueryProvider, ThemeProvider
├── schemas/                    # Zod schemas per feature (used in forms + type inference)
├── stores/                     # Zustand stores (UI state only)
├── types/                      # TypeScript interfaces per feature
├── messages/
│   ├── en.json
│   └── vi.json
└── styles/
    └── globals.css
```

---

## Data Fetching

- All server data via TanStack Query — no raw `fetch` calls inside components
- Query hooks in `hooks/use-[feature].ts`, use `apiClient` from `lib/api-client.ts`
- Mutations invalidate related queries on success
- Always handle `isLoading`, `isError`, and empty data states

Example pattern:

```ts
// hooks/use-employees.ts
export const employeeKeys = {
  all: ['employees'] as const,
  list: (params?: EmployeeListParams) => ['employees', params] as const,
  detail: (id: string) => ['employees', id] as const,
}

export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees', { params }),
  });
}
```

---

## Forms

- React Hook Form + Zod resolver for all forms
- Zod schema defined in `schemas/[feature].schema.ts` — reused for both form validation and type inference
- Never disable the submit button — show inline errors instead
- Show field-level error messages below each input

---

## Internationalization (next-intl)

- All user-facing strings via `useTranslations()` hook or `getTranslations()` (server)
- Translation keys in `messages/en.json` and `messages/vi.json`
- Key naming: `feature.component.label` (e.g., `employees.form.nameLabel`)
- No hardcoded UI strings anywhere in components
- `useTranslations()` is single-namespace per call — for `common.actions.*` strings, always add a second call: `const tCommon = useTranslations('common')`
- Dynamic month keys: use `const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const; type MonthValue = (typeof MONTH_VALUES)[number]` — enables `` t(`months.${m}`) `` (typed iteration) and `` t(`months.${salary.month as MonthValue}`) `` (runtime number cast)

---

## Theming (next-themes)

- Three modes: `light`, `dark`, `system`
- Tailwind CSS v4 dark mode via `class` strategy
- Theme toggle component in app header
- CSS variables for all semantic colors (defined in `globals.css`)

---

## State Management Rules

| State type | Tool |
|---|---|
| Server / async data | TanStack Query |
| Form state | React Hook Form |
| UI state (modals, drawers, sidebar) | Zustand |
| URL state (filters, pagination) | `useSearchParams` |
| Local component state | `useState` |

Never put server data (employee list, bookings, etc.) into Zustand.

---

## Real-time Employee Status

- Poll `GET /api/v1/employees/status` every 30s via TanStack Query `refetchInterval`
- Display colored badges: `free` (green) / `busy` (yellow) / `off` (gray)

---

## Constraints

- Do not touch `backend/` or `infrastructure/`
- Never use `any` type
- Never hardcode UI strings — always use i18n keys
- Never put server/async state in Zustand
- Never skip loading/error/empty states in data-driven components
