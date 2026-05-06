Add a new endpoint to an existing backend module in Lovely Nails.

## Instructions

The endpoint to add: **$ARGUMENTS**

Format expected: `METHOD /resource [description]`  
Example: `POST /employees/:id/clock-in — Clock in an employee`

### Steps

1. Read the relevant module files under `apps/api/src/modules/<module>/`
2. Create a new DTO in `dto/` if the endpoint has a request body
3. Add the service method with business logic
4. Add the controller route — keep it thin, delegate to service
5. If the endpoint modifies Redis (employee status), handle that in the service
6. Add the Vitest unit test for the new service method

### Constraints

- Never use `any` type
- Never put business logic in the controller
- If the endpoint touches multiple entities, use a TypeORM transaction
- Guard clauses only — no nested if/else
- New DTO gets its own file — never add to an existing DTO class
