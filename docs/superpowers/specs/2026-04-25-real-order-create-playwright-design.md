# Real Order Create Playwright Design

**Goal:** Add one real Playwright scenario that logs into localhost, creates an order for an existing client with two saved addresses, verifies the current auto-fill behavior for the first address, and submits the order successfully.

## Scope

This design covers a single real-flow branch-validation test for the Orders domain:

- Real UI login on localhost
- Real navigation to the Orders screen
- Existing-client phone lookup
- Two-address client behavior as it exists today
- One product-line order creation
- Delivery date/time/payment selection
- Successful order submission

This design does **not** cover:

- Mocked-fixture order tests
- Cleanup of the created order after the run
- Broader route scheduling or driver-portal coverage
- Restoring the old address-selection dialog behavior

## Confirmed Decisions

- Use a **separate real-flow spec**, not the mocked `orders.spec.ts`
- Run against **real localhost + real API behavior**
- Read secure inputs from:
  - `E2E_ADMIN_EMAIL`
  - `E2E_ADMIN_PASSWORD`
  - `E2E_EXISTING_CLIENT_PHONE`
  - `E2E_EXPECTED_CLIENT_NAME`
  - `E2E_EXPECTED_FIRST_ADDRESS`
  - `E2E_ORDER_PRODUCT_NAME`
- Assert the **current** two-address behavior:
  - first address auto-fills automatically
  - no chooser is expected
- Leave the created order in the system after success

## Architecture

The new test should live alongside the current Playwright suite but stay isolated from the mocked projects.

### Project separation

Add a dedicated Playwright project for the real scenario, for example:

- project name: `admin-real`
- test match: `orders.real.spec.ts`
- browser: Desktop Chrome
- no fake storage state
- no auto API mocks

This keeps the existing mocked admin suite stable while adding a separate branch-validation path that hits the real app behavior.

### Test structure

Use:

- `LoginPage` for the real sign-in flow
- `OrdersPage` extended with helpers for the create-order scenario
- a new real spec file:
  - `e2e/specs/orders.real.spec.ts`

Do **not** place this scenario inside the current mocked `orders.spec.ts`, because the login model, API behavior, and reliability expectations are different.

## Scenario Design

The test should perform this exact business flow:

1. Open localhost sign-in
2. Log in with `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD`
3. Navigate to `/#/admin/orders`
4. Open the Create Order modal
5. Fill `E2E_EXISTING_CLIENT_PHONE`
6. Blur the phone field and wait for lookup completion
7. Assert:
   - `Nombre` equals `E2E_EXPECTED_CLIENT_NAME`
   - `Dirección` equals `E2E_EXPECTED_FIRST_ADDRESS`
   - the first address was chosen implicitly
   - no address-selection dialog is shown
8. Compute the **next available day** in the test:
   - start from tomorrow
   - skip Sundays
   - Saturday is allowed because `9 AM - 1 PM` remains valid
9. Select:
   - that computed next available day
   - `9 AM - 1 PM`
   - `Efectivo`
10. Add one product line using `E2E_ORDER_PRODUCT_NAME`
11. Submit the order
12. Assert success feedback
13. Leave the created order in place

## Runtime Data Rules

The test should fail fast if any required env var is missing.

The only scenario values that should remain hardcoded in the test are the intended business assertions:

- delivery time: `9 AM - 1 PM`
- payment method: `Efectivo`
- next available day logic

Those are part of the behavior being validated, not secrets.

## Assertions

The scenario should verify:

1. Real login succeeds and reaches the protected admin flow
2. Existing-client lookup succeeds
3. The current two-address behavior is preserved:
   - first address auto-fills automatically
   - chooser dialog does not appear
4. The order can be created successfully with the requested values
5. The UI shows success feedback after creation

Because the client name may already exist in the table, post-submit verification should avoid assuming a globally unique row. The preferred approach is:

- success alert
- modal closes
- optionally compare row count before vs after for the expected client name

## Locator and Interaction Strategy

Follow the existing Playwright conventions in this repo:

- use `getByRole()` and `getByLabel()` first
- rely on web-first assertions
- avoid arbitrary sleeps

Special handling will likely be needed for the product selector because it uses `react-select`. The implementation should confirm the live interaction pattern against localhost before finalizing the helper method.

## Chrome MCP Role

Chrome MCP is part of the implementation and verification workflow, not part of the test itself.

Use it during implementation to:

- confirm the live login flow
- inspect the real Create Order modal selectors
- validate the `react-select` interaction for product entry
- confirm the current no-dialog two-address behavior on localhost

## Files Expected to Change

- **Modify:** `e2e/playwright.config.ts`
- **Modify:** `e2e/pages/orders.page.ts`
- **Create:** `e2e/specs/orders.real.spec.ts`

`e2e/pages/login.page.ts` should be reused unless real-login behavior reveals a missing helper.

## Success Criteria

This design is successful if the resulting implementation:

- adds one real localhost Playwright test without disturbing the mocked suite
- uses env-driven secure inputs
- validates the current existing-client + first-address autofill behavior
- creates the order successfully with the requested product, date, time, and payment method
- remains maintainable within the repo’s current Playwright structure
