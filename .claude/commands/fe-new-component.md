Create a new UI component for Lovely Nails following project conventions.

## Instructions

The component to create: **$ARGUMENTS**

Format expected: `ComponentName [feature-area] [description]`  
Example: `EmployeeStatusBadge employees — Badge showing free/busy/off status`

### Steps

1. Determine if this is a **base UI component** (`components/ui/`) or a **feature component** (`components/features/<feature>/`)
   - Base UI: generic, no domain data, no API calls (Button, Badge, Modal...)
   - Feature: domain-specific, may use hooks (EmployeeCard, BookingRow...)
2. Create the component file with:
   - Explicit `interface ComponentNameProps` — never use `any`
   - Named export
   - All user-facing text via `useTranslations` (for feature components)
   - Proper Tailwind classes, dark mode compatible
3. If the component needs server data, create or reuse a custom hook — never fetch inside the component
4. Add the i18n keys to `en.json` and `vi.json` if new strings are needed
5. Use `shadcn/ui` primitives where applicable (Button, Card, Badge, Table, etc.)

### For employee status specifically

Status values and colors:
- `free` → green badge
- `busy` → yellow/amber badge  
- `off` → gray badge

Use the constants from `packages/shared` for status values — never hardcode strings.

### Constraints

- Named export — never `export default`
- Dark mode: use Tailwind semantic colors (`text-foreground`, `bg-background`, etc.) not hardcoded colors
- Accessible: include `aria-label` on icon-only elements, use semantic HTML
- Never use `any` type
