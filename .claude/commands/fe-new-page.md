Create a new page in the Lovely Nails frontend following project conventions.

## Instructions

Use the `nextjs-feature` skill as your scaffolding guide.

The page/feature to create: **$ARGUMENTS**

### Steps

1. Read `apps/web/CLAUDE.md` for project-specific conventions
2. Create API query layer at `apps/web/src/lib/api/<feature>.ts`:
   - Typed fetch functions
   - Query key factory
   - Zod response validation
3. Create Zod schemas at `apps/web/src/lib/validations/<feature>.ts`
4. Create TypeScript types at `apps/web/src/types/<feature>.ts`
5. Create custom hook at `apps/web/src/hooks/use<Feature>.ts`
6. Create feature components at `apps/web/src/components/features/<feature>/`
7. Create the page at `apps/web/src/app/[locale]/<feature>/page.tsx`
8. Create `loading.tsx` and `error.tsx` next to the page
9. Add all i18n keys to `apps/web/src/messages/en.json` and `apps/web/src/messages/vi.json`

### Constraints

- Named exports only — no default export for components
- Always handle isLoading / isError / empty states in every data-driven component
- Never put server/async data in Zustand — use TanStack Query
- Never hardcode user-facing strings — all text through `useTranslations`
- Never use `any` type
- Always validate API responses with Zod before using
