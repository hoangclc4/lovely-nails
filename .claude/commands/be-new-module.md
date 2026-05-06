Create a new backend module for Lovely Nails following the project conventions.

## Instructions

Use the `nestjs-module` skill as your scaffolding guide.

The module name is: **$ARGUMENTS**

### Steps

1. Read `apps/api/CLAUDE.md` for project-specific conventions
2. Create all files under `apps/api/src/modules/<module-name>/`:
   - `entities/<module-name>.entity.ts` — TypeORM entity with uuid PK, timestamps, soft delete
   - `dto/create-<module-name>.dto.ts`
   - `dto/update-<module-name>.dto.ts` — uses `PartialType`
   - `dto/query-<module-name>.dto.ts` — extends `PaginationDto`
   - `<module-name>.service.ts` — full CRUD logic
   - `<module-name>.service.spec.ts` — unit tests for service methods
   - `<module-name>.controller.ts` — thin controller, CRUD routes
   - `<module-name>.module.ts` — wires everything together
3. Register the new module in `apps/api/src/app.module.ts`

### Constraints

- Never use `any` type
- Never return raw TypeORM entities from controller — define a response interface
- Always paginate list endpoints
- Always use `NotFoundException` when entity is not found
- Add `@ApiTags` and `@ApiBearerAuth` to the controller
- Use guard clauses — no nested if/else
