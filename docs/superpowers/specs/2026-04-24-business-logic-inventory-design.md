# Business Logic Inventory Design

**Goal:** Create a single master business-logic inventory document for this repo that captures current UI-reachable behavior across Orders, Clients, Products, admin route creation/assignment, admin driver management, and the Driver portal. The document will serve as the source of truth for validating the recent refactor and for planning future Playwright coverage.

## Scope

The inventory will include:

- User-visible E2E flows
- UI-reachable validation branches
- UI-reachable error branches
- Shared auth and role-based restrictions that affect multiple domains

The inventory will not include:

- Internal hook-only branches that have no UI-visible effect
- Speculative backend behavior that is not evidenced by the frontend code
- Dead-looking or ambiguous flows mixed into the main reproducible list

Ambiguous or partially active branches will be documented separately as `Needs review`.

## Source of Truth

The inventory should reflect the app's **current behavior in the repository**, not intended legacy behavior. Where the code and the UI appear inconsistent, the document should call that out explicitly instead of inventing a clean path that may not exist anymore.

## Output Artifact

The final artifact should be written to:

- `docs/business-logic-inventory.md`

It should be a **single master document**, not multiple files.

## Document Structure

The document should use this structure:

1. **Coverage Rules**
   - What counts as a branch
   - What is in scope vs out of scope
   - How ambiguous flows are marked

2. **Shared Flows and Constraints**
   - Authentication entry points
   - Protected route behavior
   - Role restrictions
   - Cross-domain delivery date and time rules

3. **Domain Sections**
   - Orders
   - Clients
   - Products
   - Admin Route / Driver Management
   - Driver Portal

4. **Coverage Gaps / Needs Review**
   - Branches implied by code but not confidently reproducible from the current UI
   - Missing or partial admin surfaces
   - Any refactor inconsistencies that should be reviewed before automation

## Case Template

Each documented branch should use a stable, test-friendly structure:

- **Branch ID**
- **Title**
- **Description**
- **Preconditions / Test Data**
- **Steps to Reproduce**
- **Coverage Status**

`Description` should explain the trigger, the branching condition, and the expected visible outcome. `Coverage Status` should use one of:

- `Existing Playwright`
- `Missing Playwright`
- `Needs review`

## Organization Rules

- Group cases by domain, then by feature within the domain.
- Prefer short, concrete cases over long prose narratives.
- Reuse shared rules once instead of repeating them in every branch.
- Keep steps focused on UI actions a user or Playwright test can reproduce.
- Include enough preconditions to make each case independently testable.

## Success Criteria

The final document is successful if:

- It covers the requested domains in one place.
- Each branch can be translated into a Playwright test without reverse-engineering the code again.
- Shared rules are documented once and referenced consistently.
- Ambiguous flows are surfaced honestly instead of being hidden.
