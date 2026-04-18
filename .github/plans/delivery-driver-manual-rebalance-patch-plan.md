# Delivery Planner Driver 3 Manual Rebalance Patch Plan And Estimate

## Executive Summary

- Confirmed assumption: for the urgent manual rebalance patch, most of the implementation is frontend.
- Important correction: the current app does not ask the backend to generate the route sequence. The suggested route is generated in the browser and only the final driver and sequence values are persisted to the backend.
- The existing backend already exposes a persistence endpoint that can save updated `driver` and `delivery_sequence` values, so the patch can reuse that path without a required backend code change.
- Driver 3 can see reassigned routes after normal configuration work because the driver portal already maps users to driver numbers through `REACT_APP_DRIVERS_MAP`.
- This patch is feasible as a fast operational workaround.
- This patch does not solve the deeper platform limitation: new orders will still be auto-assigned under the current 2-driver backend rules until dispatch manually rebalances them.

### Recommended patch estimate

- Engineering effort: 20-28 hours
- Safer client-facing quote with contingency: 22-30 hours
- Cost at MXN 670/hour: MXN 14,000-MXN 19,600
- Safer client-facing quote at MXN 600/hour: MXN 15,400-MXN 21,000

## Why This Estimate Is Lower Than The Previous Workaround Estimate

The previous workaround estimate assumed more backend scheduling work.

After reviewing the current repos, the actual flow is:

1. The frontend fetches the orders for the selected day.
2. The frontend generates the suggested sequence locally.
3. The admin reviews the route in the modal.
4. The frontend posts the final `driver` and `delivery_sequence` values to the backend.

That means the requested patch is narrower than the earlier 36-48 hour workaround estimate. The backend already has the persistence path needed for a manual dispatch-time rebalance.

## Repos And Files Reviewed

### Frontend

- `src/views/admin/orders/index.jsx`
- `src/views/admin/orders/components/Orders.js`
- `src/views/admin/orders/components/MapModal.js`
- `src/views/admin/orders/components/DeliveryProcessor.js`
- `src/views/admin/orders/components/TravelPlanner.js`
- `src/views/admin/orders/components/UpdateOrderModal.js`
- `src/views/driver/deliveries/index.jsx`

### Backend

- `temp/delivery-planner-backend/src/orders/delivery/app.py`
- `temp/delivery-planner-backend/src/orders/delivery/delivery_modules/models/delivery.py`
- `temp/delivery-planner-backend/src/orders/delivery/delivery_modules/dao/order_dao.py`
- `temp/delivery-planner-backend/src/orders/delivery/delivery_modules/utils/doorman.py`
- `temp/delivery-planner-backend/src/orders/order_modules/data_mapper/order_mapper.py`
- `temp/delivery-planner-backend/src/orders/order_modules/utils/delivery.py`
- `temp/delivery-planner-backend/src/orders/template.yaml`

## Verified Current Behavior

### 1. Route suggestion is currently frontend-generated

The current admin flow does not call the backend scheduling endpoint.

Evidence:

- `src/views/admin/orders/index.jsx` uses `handleScheduleOrders` to process the route locally.
- `src/views/admin/orders/components/DeliveryProcessor.js` assigns `delivery_sequence` values in the browser.
- `src/views/admin/orders/components/TravelPlanner.js` calculates the suggested path with a nearest-neighbor style distance check.

Impact:

- The client request is more frontend-heavy than originally assumed.
- We do not need to add a backend route-generation feature for this patch.

### 2. The frontend already persists route changes

Evidence:

- `src/views/admin/orders/index.jsx` posts the final route payload to `REACT_APP_UPDATE_SEQUENCING_ORDERS_BASE_URL`.
- `src/views/admin/orders/components/MapModal.js` already builds a payload with `id`, `delivery_date`, `status`, `driver`, and `delivery_sequence`.

Impact:

- We can reuse the current persistence flow.
- The patch should focus on letting the dispatcher modify driver assignment and sequence before saving.

### 3. The current route review modal only supports drivers 1 and 2

Evidence:

- `src/views/admin/orders/components/MapModal.js` hardcodes driver options `1` and `2`.
- `src/views/admin/orders/components/Orders.js` hardcodes `[1, 2]` as the default available drivers and only shows options for driver 1 and driver 2.
- `src/views/admin/orders/components/UpdateOrderModal.js` only lets admin manually assign driver 1 or driver 2.

Impact:

- The main patch work is in the admin frontend.
- Driver lists need to become dynamic and the route modal needs a real reassignment workflow.

### 4. The backend already accepts manual sequence persistence

Evidence:

- `temp/delivery-planner-backend/src/orders/delivery/app.py` exposes `update_delivery_schedule_order`.
- `temp/delivery-planner-backend/src/orders/delivery/delivery_modules/models/delivery.py` validates a list of orders containing `id`, `delivery_date`, `delivery_sequence`, `driver`, and `status`.
- `temp/delivery-planner-backend/src/orders/delivery/delivery_modules/dao/order_dao.py` bulk-updates the records.
- `temp/delivery-planner-backend/src/orders/template.yaml` exposes this as `POST /update-sequencing-orders`.

Impact:

- No mandatory backend code change is required for the patch.
- The backend can persist driver `3` as long as the frontend sends it.

### 5. Driver 3 visibility is already mostly supported

Evidence:

- `src/views/driver/deliveries/index.jsx` reads `REACT_APP_DRIVERS_MAP` and filters orders by the mapped driver number.

Impact:

- Once driver 3 is added to `REACT_APP_DRIVERS_MAP` and provisioned as a valid user, the driver portal can already show that route.
- This is deployment and configuration work, not a major code task.

### 6. The backend create-order flow still assumes the 2-driver model

Evidence:

- `temp/delivery-planner-backend/src/orders/order_modules/data_mapper/order_mapper.py` auto-assigns a driver during order creation.
- `temp/delivery-planner-backend/src/orders/order_modules/utils/delivery.py` is still explicitly built around drivers 1 and 2.

Impact:

- The patch is operational, not structural.
- Orders created after the dispatcher has already balanced the routes may still be assigned to driver 1 or 2 and may require a second manual rebalance.

## Conclusion On The Client Assumption

The assumption is correct for this patch, with one important nuance.

Yes, most of the work is frontend.

The nuance is that this is true because the current route suggestion is already frontend-generated and the backend already has a persistence endpoint that we can reuse. If the client later wants real 3-driver support during order creation and scheduling, the larger backend refactor from the previous plan is still necessary.

## Recommended Patch Scope

## Goal

Allow dispatch to:

1. Generate the suggested route as they do today.
2. Review the route before saving.
3. Move selected stops from driver 1 or driver 2 to driver 3.
4. Adjust the final sequence for each affected driver.
5. Persist the final driver and sequence values to the existing backend endpoint.
6. Let each driver see the persisted route in their normal portal.

## Technical Approach

### 1. Centralize the driver list in the frontend

Replace the hardcoded driver options with a shared driver source.

Recommended implementation:

- Derive the available driver IDs from `REACT_APP_DRIVERS_MAP` and normalize them into a unique sorted list.
- Use that shared list in:
  - `src/views/admin/orders/components/Orders.js`
  - `src/views/admin/orders/components/MapModal.js`
  - `src/views/admin/orders/components/UpdateOrderModal.js`

Reason:

- This solves the immediate driver 3 need.
- It also avoids repeating the same hardcoded change later if driver 4 is added.

### 2. Refactor the route review modal into a true working draft editor

The biggest change should be in `src/views/admin/orders/components/MapModal.js`.

Recommended implementation:

- Keep a full `draftOrders` working copy inside the modal instead of only tracking the current filtered slice.
- Filter the visible list by `selectedDriver` and `selectedHours`, but keep all changes in the full draft.
- Add order selection controls so dispatch can choose multiple stops.
- Add a `Move selected to driver X` action.
- When orders move from one driver to another, automatically normalize `delivery_sequence` for both the source group and the target group within the selected time window.
- Let the dispatcher switch to driver 3 and use the existing drag-and-drop behavior to fine-tune the final order.

Reason:

- The current modal is good enough for resequencing within one driver.
- It is not structured well for moving orders across drivers and keeping both affected sequences consistent.

### 3. Keep route generation on the frontend for this patch

Do not add backend scheduling work to the urgent patch.

Reason:

- The app already calculates the suggested route locally.
- Wiring the backend `/schedule-orders` endpoint into the urgent patch would add risk without solving the client's immediate operational problem.
- The real backend limitation is the create-order auto-assignment logic, which is outside the scope of this patch.

### 4. Reuse the current persistence endpoint

Keep using `POST /update-sequencing-orders`.

Payload shape to persist:

```json
[
  {
    "id": "order-id",
    "delivery_date": "2026-04-18",
    "status": "Programada",
    "driver": 3,
    "delivery_sequence": 1
  }
]
```

Reason:

- This endpoint already exists.
- It already matches the current frontend save flow.
- It keeps backend change risk near zero for the patch.

### 5. Keep the admin single-order edit flow consistent

Update `src/views/admin/orders/components/UpdateOrderModal.js` so driver 3 is available there too.

Reason:

- Without this, the route modal would support driver 3 but the single-order admin edit screen would still be inconsistent.
- This is a small frontend change and worth including in the patch.

### 6. Enable driver 3 in deployment configuration

Required configuration work:

- Add driver 3's email mapping to `REACT_APP_DRIVERS_MAP`.
- Ensure the new driver has the proper Cognito user and group configuration.
- Confirm the deployed frontend environment contains the updated variable.

Reason:

- The driver portal already filters by the mapped driver number.
- No meaningful driver-portal code change is expected if the configuration is correct.

## Suggested Delivery Flow After The Patch

1. Admin opens today's orders.
2. Admin clicks `Crear ruta sugerida`.
3. The frontend computes the initial route as it does today.
4. In the route review modal, admin selects far-away stops from driver 1 or driver 2.
5. Admin moves those stops to driver 3.
6. The modal normalizes the sequence for the affected groups.
7. Admin reviews driver 3 and reorders stops if needed.
8. Admin confirms the route.
9. The frontend posts the final assignments and sequences to `/update-sequencing-orders`.
10. Driver 1, driver 2, and driver 3 each see their own persisted route when they log in.

## Detailed Scope Breakdown

| Area | Scope | Hours |
| --- | --- | --- |
| Discovery and rules lock | Confirm exact dispatch workflow, whether batch move is required, and whether moved stops always stay in the same delivery window | 2-3 |
| Frontend route editor refactor | Refactor `MapModal.js` state to support cross-driver edits and stable resequencing | 4-6 |
| Frontend reassignment UX | Add selection controls, target driver action, dynamic driver list, and review flow for driver 3 | 6-8 |
| Frontend consistency updates | Remove hardcoded driver 1 and 2 assumptions from `Orders.js` and `UpdateOrderModal.js` | 2-3 |
| Backend verification | Validate the existing sequencing endpoint in staging with driver `3` payloads; no code change expected | 1-2 |
| Config and deployment updates | Add driver 3 mapping and user configuration, then validate access | 1-2 |
| QA, UAT, deployment buffer | Admin regression, route save validation, and driver 3 visibility checks | 4-6 |
| Total | Recommended patch | 20-28 |

## Cost Estimate

### Recommended patch

- Engineering effort: 20-28 hours
- Cost at MXN 700/hour: MXN 14,000-MXN 19600,200

### Safer client-facing quote

- Quoted effort with contingency: 22-30 hours
- Quoted cost at MXN 700/hour: MXN 15,400-MXN 21,000

## Optional Lowest-Cost Variant

If the client wants the fastest possible patch, this can be reduced to a thinner version:

- Driver 3 enabled in selectors
- Per-order reassignment only, with a lighter editing flow
- Less polished dispatcher UX

Estimated effort for this thinner variant:

- 14-18 hours
- MXN 9,800-MXN 12,600 at MXN 700/hour

I would only recommend this thinner version if the client explicitly values speed over operator efficiency.

## What Is Not Included In This Patch

- Real 3-driver auto-assignment during order creation
- Daily driver availability configuration in the backend
- Automatic busiest-zone balancing
- Proper 4-driver platform support
- Replacing the current routing heuristic with a more advanced optimizer

Those items still belong to the larger implementation from `delivery-driver-scaling-plan.md`.

## Risks And Limitations To Communicate Clearly

1. This patch is a manual dispatch-time workaround, not full 3-driver support.
2. New orders will still be created under the current 2-driver backend rules and may need to be manually rebalanced afterward.
3. If dispatch creates the route early and new orders arrive later, the route may need a second edit pass.
4. If the client soon wants a fourth driver or automatic overload balancing, this patch should not be presented as the final platform solution.

## Questions To Lock Before Estimating To The Client

1. Do they need batch reassignment of multiple stops at once, or is one-by-one reassignment acceptable?
2. Should moved stops always keep the same delivery window, or can dispatch also move them between morning and afternoon?
3. Do they want the patch only for driver 3, or should the frontend be made fully dynamic now so driver 4 can be added later with only configuration changes?
4. After a route is saved, should admin still be allowed to reopen and edit it until the first order is marked `En ruta`?

## Recommendation

Quote this as an urgent operational patch, not as full 3-driver support.

Recommended client message:

- We can deliver a fast patch that lets dispatch manually move stops from driver 1 or 2 to driver 3 during route review, reorder them, and persist the final route so each driver sees their own sequence.
- This is mostly frontend work because the current app already generates route suggestions in the browser and the backend already has the persistence endpoint we need.
- Recommended estimate for this patch is 20-28 hours, or MXN 14,000-MXN 19,600 at MXN 700/hour.
- This patch does not replace the larger backend refactor if they later want true automatic 3-driver or 4-driver scheduling.