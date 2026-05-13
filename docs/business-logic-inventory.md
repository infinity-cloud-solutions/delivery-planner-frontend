# Business Logic Inventory

> Source of truth for validating the current frontend behavior after the recent refactor and for planning full Playwright coverage.

## Coverage Rules

- This inventory includes **user-visible E2E flows**, plus **UI-reachable validation** and **UI-reachable error** branches.
- It reflects the app's **current behavior in this repository**, not legacy intent.
- Each case uses this structure:
  - **Branch ID**
  - **Title**
  - **Description**
  - **Preconditions / Test Data**
  - **Steps to Reproduce**
  - **Coverage Status**
- **Coverage Status** means:
  - `Existing Playwright`: directly covered by a current spec
  - `Missing Playwright`: reachable in the UI but not directly automated today
  - `Needs review`: code suggests a branch, but current UI behavior is inconsistent, incomplete, or not confidently reachable

## Shared Flows and Constraints

- App routing uses **hash routes**:
  - `/#/auth/*`
  - `/#/admin/*`
  - `/#/driver/*`
- `/admin/*` and `/driver/*` are wrapped in `ProtectedRoute`, then page-level `useAuthGuard()` validates the JWT again on mount.
- Auth is based on the Cognito **ID token** stored in `localStorage.idToken`.
- The main role checks are:
  - `isDriver()` -> group `Repartidor`
  - `isAdmin()` -> group `Admin`
- Order statuses: `Creada`, `Programada`, `En ruta`, `Entregada`, `Reprogramada`, `Error`
- Driver-delivery statuses: `Programada`, `En ruta`, `Entregada`, `Reprogramada`

### AUTH-01
**Title:** Unauthenticated admin access redirects to sign-in

**Description:** Any direct visit to an admin hash route without a valid token is blocked by `ProtectedRoute` and the page-level auth guard, then redirected to `/auth`.

**Preconditions / Test Data:** Clear `localStorage.idToken` or use an unauthenticated browser context.

**Steps to Reproduce:**
1. Open `/#/admin/dashboard` or `/#/admin/orders`.
2. Wait for routing to settle.
3. Confirm the app redirects to the sign-in page.

**Coverage Status:** Existing Playwright

### AUTH-02
**Title:** Unauthenticated driver access redirects to sign-in

**Description:** Driver routes are protected the same way as admin routes. Without a valid token, the app redirects the user to `/auth`.

**Preconditions / Test Data:** Clear `localStorage.idToken` or use an unauthenticated browser context.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Wait for routing to settle.
3. Confirm the app redirects to the sign-in page.

**Coverage Status:** Existing Playwright

### AUTH-03
**Title:** Sign-in page renders the expected login controls

**Description:** The sign-in screen exposes the email field, password field, and submit button needed for manual authentication.

**Preconditions / Test Data:** Unauthenticated browser context.

**Steps to Reproduce:**
1. Open `/#/auth/sign-in`.
2. Verify the email input is visible.
3. Verify the password input is visible.
4. Verify the **Iniciar sesión** button is visible.

**Coverage Status:** Existing Playwright

### AUTH-04
**Title:** Invalid credentials show an authentication error

**Description:** When Cognito rejects the submitted credentials, the page shows an authentication error instead of navigating into the app.

**Preconditions / Test Data:** Invalid email/password combination or mocked Cognito `NotAuthorizedException`.

**Steps to Reproduce:**
1. Open `/#/auth/sign-in`.
2. Enter invalid credentials.
3. Submit the form.
4. Confirm an authentication error message is displayed.

**Coverage Status:** Existing Playwright

### AUTH-05
**Title:** Driver users are blocked from admin Orders, Clients, and Products screens

**Description:** Orders, Clients, and Products each run an explicit `isDriver()` check. A driver can authenticate successfully, but still sees a restricted-content message and a link back to `/driver` instead of the admin feature.

**Preconditions / Test Data:** Authenticated driver session with `Repartidor` group.

**Steps to Reproduce:**
1. Sign in as a driver.
2. Open `/#/admin/orders`.
3. Confirm the page shows **El contenido está restringido para administradores y mesa de control** and a link back to the driver section.
4. Repeat for `/#/admin/clients` and `/#/admin/products`.

**Coverage Status:** Missing Playwright

---

## Orders

**Primary source files**
- `src/views/admin/orders/index.tsx`
- `src/views/admin/orders/components/Orders.tsx`
- `src/views/admin/orders/components/CreateOrderModal.tsx`
- `src/views/admin/orders/components/UpdateOrderModal.tsx`
- `src/views/admin/orders/components/OrderFormFields.tsx`
- `src/views/admin/orders/components/OrdersTable.tsx`
- `src/views/admin/orders/components/ScheduleButton.tsx`
- `src/views/admin/orders/components/MapModal.tsx`
- `src/views/admin/orders/components/DeliveryProcessor.tsx`
- `src/views/admin/orders/components/TravelPlanner.tsx`
- `src/views/admin/orders/hooks/useOrders.ts`

### Page Load, Filtering, and Table Behavior

### ORD-PAGE-01
**Title:** Orders page defaults to today's date

**Description:** When the page is opened without a `?date=` query param, the Orders view fetches the current day and renders the header as **Pedidos para hoy**.

**Preconditions / Test Data:** Authenticated admin or control-desk session.

**Steps to Reproduce:**
1. Open `/#/admin/orders` without a `?date=` query string.
2. Wait for the initial fetch to finish.
3. Confirm the heading says **Pedidos para hoy**.

**Coverage Status:** Existing Playwright

### ORD-PAGE-02
**Title:** Orders page honors the selected query-string date

**Description:** If a `?date=YYYY-MM-DD` value exists, or the date selector is used, the page fetches that date and changes the heading to **Pedidos para el ...**.

**Preconditions / Test Data:** Authenticated admin session; at least one date to test other than today.

**Steps to Reproduce:**
1. Open `/#/admin/orders?date=2026-04-25`.
2. Wait for the page to load.
3. Confirm the heading changes from **Pedidos para hoy** to **Pedidos para el ...**.
4. Change the date again from the menu and confirm the table reloads.

**Coverage Status:** Missing Playwright

### ORD-PAGE-03
**Title:** Empty result set shows a no-records state

**Description:** If the orders request returns an empty array for the selected date, the table body is replaced by **No hay registros para mostrar.**

**Preconditions / Test Data:** Authenticated admin session; selected date with no orders or mocked empty response.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Mock or force the orders API to return `[]`.
3. Confirm the page shows **No hay registros para mostrar.**

**Coverage Status:** Missing Playwright

### ORD-PAGE-04
**Title:** Orders with `Error` and `Reprogramada` are sorted first

**Description:** The hook sorts the fetched list so `Error` rows appear first, `Reprogramada` rows second, and all other statuses after them.

**Preconditions / Test Data:** At least one order with `Error`, one with `Reprogramada`, and one with another status.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Load a dataset containing `Error`, `Reprogramada`, and `Creada` rows.
3. Confirm `Error` rows appear before `Reprogramada`, and `Reprogramada` appears before the remaining statuses.

**Coverage Status:** Missing Playwright

### ORD-PAGE-05
**Title:** Status cells change icon, color, and tooltip by order status

**Description:** The table shows different icons and colors for each status. `Error` rows also expose a tooltip with the backend-reported errors when hovered.

**Preconditions / Test Data:** Orders with statuses `Creada`, `Programada`, `En ruta`, `Entregada`, `Reprogramada`, and `Error`.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Locate rows for each status.
3. Verify green/blue/orange/red status icon behavior.
4. Hover an `Error` row and confirm the tooltip lists the order's errors.

**Coverage Status:** Missing Playwright

### ORD-PAGE-06
**Title:** Orders table paginates at 30 rows per page

**Description:** The table uses React Table pagination with a fixed page size of 30 and exposes **Anterior** and **Siguiente** controls.

**Preconditions / Test Data:** At least 31 orders for the selected date.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Load more than 30 orders.
3. Confirm page 1 shows 30 rows.
4. Click **Siguiente** and confirm page 2 is shown.
5. Click **Anterior** to return to page 1.

**Coverage Status:** Missing Playwright

### ORD-EDIT-01
**Title:** Only `Creada`, `Reprogramada`, and `Error` orders can be opened for editing

**Description:** Clicking a row with any other status does not open the update modal. Instead, the page shows an error alert explaining that only `Creada` or `Reprogramada` can be edited.

**Preconditions / Test Data:** At least one row with `Programada`, `En ruta`, or `Entregada`.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Click a row with status `Programada`, `En ruta`, or `Entregada`.
3. Confirm the update modal does not open.
4. Confirm the page shows the error alert about non-editable statuses.

**Coverage Status:** Missing Playwright

### Create Order

### ORD-CREATE-01
**Title:** Create Order starts with only the phone field visible

**Description:** The create modal initially renders the phone field alone. Client fields are intentionally hidden until phone validation completes.

**Preconditions / Test Data:** Authenticated admin session.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Click **Crear**.
3. Confirm the modal opens.
4. Confirm **Teléfono** is visible before the rest of the form.

**Coverage Status:** Existing Playwright

### ORD-CREATE-02
**Title:** Phone numbers shorter than 10 digits show inline validation

**Description:** Blurring the phone field with fewer than 10 digits marks the field invalid and shows **El número de teléfono debe tener 10 dígitos.**

**Preconditions / Test Data:** Authenticated admin session.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Enter a short phone number such as `123`.
3. Blur the field.
4. Confirm the inline 10-digit validation error appears.

**Coverage Status:** Existing Playwright

### ORD-CREATE-03
**Title:** A valid 10-digit phone shows a lookup spinner while the client search runs

**Description:** On blur, a valid 10-digit phone sets `phoneToCheck`, triggers the async lookup effect, and shows a spinner beside the phone input until the lookup finishes.

**Preconditions / Test Data:** Phone number with any lookup outcome; mocked client lookup with noticeable latency helps verify the spinner.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Enter a 10-digit phone number.
3. Blur the field.
4. Confirm the spinner appears while the lookup is pending.

**Coverage Status:** Missing Playwright

### ORD-CREATE-04
**Title:** Existing client without a second address auto-fills and locks the client fields

**Description:** If the lookup returns a known client with only one saved address, the modal fills the client name, address, and discount automatically and disables the name/address fields.

**Preconditions / Test Data:** Existing client with phone number, name, one address, and optional discount.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Enter the saved client's 10-digit phone number and blur.
3. Confirm the modal fills **Nombre** and **Dirección** automatically.
4. Confirm the discount field reflects the saved discount.
5. Confirm the name and address inputs are disabled.

**Coverage Status:** Existing Playwright

### ORD-CREATE-05
**Title:** Existing client with two saved addresses currently auto-selects the first address

**Description:** The current post-refactor behavior does **not** open the address chooser. When a client has `second_address`, the code stores both addresses but leaves the UI on address option `1`, so the first address is used by default.

**Preconditions / Test Data:** Existing client whose lookup returns both `address` and `second_address`.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Enter the phone number of a client with two saved addresses and blur.
3. Confirm the first address is auto-filled into **Dirección**.
4. Confirm no address-selection dialog appears.

**Coverage Status:** Missing Playwright

### ORD-CREATE-06
**Title:** Unknown phone number reveals the manual client fields

**Description:** If the client lookup returns `null`, the modal marks validation as complete and shows the manual fields for name, address, delivery date, delivery time, and payment method.

**Preconditions / Test Data:** 10-digit phone number not present in the clients dataset.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Enter a 10-digit phone number that does not exist and blur.
3. Confirm **Nombre**, **Dirección**, **Fecha de entrega**, **Horario de entrega**, and **Método de pago** appear.

**Coverage Status:** Existing Playwright

### ORD-CREATE-07
**Title:** Client lookup failures show a verification error message

**Description:** If the client lookup throws, the modal shows **Error al verificar el cliente.** and still marks validation as completed.

**Preconditions / Test Data:** Mock the client lookup request to fail.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Enter a valid 10-digit phone number.
3. Force the lookup request to fail.
4. Confirm **Error al verificar el cliente.** appears.

**Coverage Status:** Missing Playwright

### ORD-CREATE-08
**Title:** Save stays disabled until at least two cart items are added

**Description:** The create form requires `cartItems.length > 1`. Even if the other visible fields are filled, the save button stays disabled until at least two product lines exist in the cart.

**Preconditions / Test Data:** Any valid create-order path that reveals the full form.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Complete the client lookup or manual client path so all fields are visible.
3. Fill the required client/date/time/payment fields.
4. Add zero or one cart item.
5. Confirm **Guardar orden** remains disabled.

**Coverage Status:** Existing Playwright

### ORD-CREATE-09
**Title:** Saturday limits delivery-time choices to the morning slot

**Description:** Selecting a Saturday rebuilds the delivery-time options so only **9 AM - 1 PM** is available.

**Preconditions / Test Data:** Choose a Saturday date.

**Steps to Reproduce:**
1. Open the create-order modal and reveal the full form.
2. Pick a Saturday in **Fecha de entrega**.
3. Open **Horario de entrega**.
4. Confirm only **9 AM - 1 PM** is available.

**Coverage Status:** Missing Playwright

### ORD-CREATE-10
**Title:** Sunday blocks delivery scheduling entirely

**Description:** Sundays are rejected with **No hay entregas los domingos** and the available-delivery-times list becomes empty.

**Preconditions / Test Data:** Choose a Sunday date.

**Steps to Reproduce:**
1. Open the create-order modal and reveal the full form.
2. Pick a Sunday in **Fecha de entrega**.
3. Confirm the date error says **No hay entregas los domingos**.
4. Open **Horario de entrega** and confirm there are no valid options.

**Coverage Status:** Missing Playwright

### ORD-CREATE-11
**Title:** Past dates are rejected

**Description:** Selecting a date before today shows **No se puede programar una orden en el pasado**.

**Preconditions / Test Data:** Any date before the current day.

**Steps to Reproduce:**
1. Open the create-order modal and reveal the full form.
2. Choose a past date in **Fecha de entrega**.
3. Confirm the past-date error appears.

**Coverage Status:** Missing Playwright

### ORD-CREATE-12
**Title:** Same-day orders are blocked after 9 AM

**Description:** If the selected date is today and the current time is already after 9:00 AM, the form shows **No se puede crear orden después de las 9 am**.

**Preconditions / Test Data:** Test after 9 AM local time, or mock the current time accordingly.

**Steps to Reproduce:**
1. Open the create-order modal and reveal the full form.
2. Pick today's date.
3. Confirm the app shows the after-9-AM error.

**Coverage Status:** Missing Playwright

### ORD-CREATE-13
**Title:** Notes are optional and hidden behind an accordion

**Description:** Create Order does not require delivery notes. The notes textarea stays collapsed until the user expands **Agregar notas**.

**Preconditions / Test Data:** Any create-order path with the full form visible.

**Steps to Reproduce:**
1. Open the create-order modal and reveal the full form.
2. Locate the **Agregar notas** accordion.
3. Expand it.
4. Confirm the notes textarea appears.
5. Collapse it again and confirm the rest of the form remains valid without notes.

**Coverage Status:** Missing Playwright

### ORD-CREATE-14
**Title:** Discount changes the displayed total using the fixed UI discount values

**Description:** The create modal recalculates **Monto total** based on cart items and the selected UI discount options: `0`, `5`, `10`, `15`, and `100`.

**Preconditions / Test Data:** Full create-order form visible; at least two products added with known quantities and prices.

**Steps to Reproduce:**
1. Open the create-order modal and reveal the full form.
2. Add at least two products to the cart.
3. Record the initial total.
4. Change **Descuento** to `5`, `10`, `15`, or `100`.
5. Confirm the displayed total changes accordingly.

**Coverage Status:** Missing Playwright

### ORD-CREATE-15
**Title:** Successful order creation closes the modal and shows success feedback

**Description:** On a successful POST, the page shows **Orden guardada en la base de datos**, closes the modal, and appends the created order into local state.

**Preconditions / Test Data:** Valid full create-order payload; no backend validation errors.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Complete a fully valid order, including at least two cart items.
3. Click **Guardar orden**.
4. Confirm the modal closes.
5. Confirm the success alert appears and the order is visible in the table.

**Coverage Status:** Missing Playwright

### ORD-CREATE-16
**Title:** Backend no-driver errors are surfaced inline in the form

**Description:** If order creation fails with `Order could not be processed due: No drivers available`, the form shows **No hay repartidores disponible para esta fecha/hora...** near the date field and remains open.

**Preconditions / Test Data:** Mock the order-create request to fail with the exact backend message.

**Steps to Reproduce:**
1. Open the create-order modal.
2. Fill a valid order.
3. Force the create request to fail with the no-driver backend message.
4. Confirm the inline API error appears near the date field.
5. Confirm the modal stays open.

**Coverage Status:** Missing Playwright

### Update and Delete Order

### ORD-UPDATE-01
**Title:** Update Order preloads cart, driver, discount, notes, and dates from the selected row

**Description:** When an editable row is opened, the update modal loads the row's current values into the form, including cart items, selected driver, discount, and notes.

**Preconditions / Test Data:** Editable row with existing cart items and optional notes/discount.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Click a row with status `Creada`, `Reprogramada`, or `Error`.
3. Confirm the update modal opens with the order's current values already filled in.

**Coverage Status:** Missing Playwright

### ORD-UPDATE-02
**Title:** Only admins can delete orders or edit latitude/longitude directly

**Description:** The update modal always renders for editable orders, but the delete button and the latitude/longitude fields are reserved for admin users.

**Preconditions / Test Data:** One admin session and one non-admin/non-driver control-desk session.

**Steps to Reproduce:**
1. Open the same editable order as an admin.
2. Confirm the **Eliminar** button is visible and latitude/longitude fields are enabled.
3. Open the same order as a non-admin control-desk user.
4. Confirm the **Eliminar** button is absent and latitude/longitude fields are disabled.

**Coverage Status:** Missing Playwright

### ORD-UPDATE-03
**Title:** Update Order follows the same delivery-date rules as Create Order

**Description:** The update modal reuses the same date validation and delivery-time branching as the create modal: past dates fail, Sundays fail, Saturdays only allow the morning slot, and same-day orders after 9 AM fail.

**Preconditions / Test Data:** Editable order row.

**Steps to Reproduce:**
1. Open an editable order.
2. Change the delivery date to a past day, Sunday, Saturday, or today after 9 AM.
3. Confirm the same validation errors and time-slot restrictions seen in Create Order appear here as well.

**Coverage Status:** Missing Playwright

### ORD-UPDATE-04
**Title:** Changing the delivery date to another day removes the row from the current table after save

**Description:** If the order is updated onto a different delivery date, the hook removes it from the current page's local table state instead of keeping it visible.

**Preconditions / Test Data:** Editable order whose current date matches the table date.

**Steps to Reproduce:**
1. Open an editable order.
2. Change **Fecha de entrega** to another day.
3. Save the order.
4. Confirm the modal closes.
5. Confirm the order disappears from the current table.

**Coverage Status:** Missing Playwright

### ORD-UPDATE-05
**Title:** Update Order can fail with the same no-driver API error as Create Order

**Description:** If the backend rejects the update because there are no drivers for that date/time, the modal shows **No hay repartidores disponible para esta fecha/hora...** and keeps the order open for correction.

**Preconditions / Test Data:** Mock the update request to fail with the no-driver backend message.

**Steps to Reproduce:**
1. Open an editable order.
2. Change the delivery date/time to the failing combination.
3. Save the order.
4. Confirm the inline no-driver error appears.
5. Confirm the modal stays open.

**Coverage Status:** Missing Playwright

### ORD-UPDATE-06
**Title:** Successful order update closes the modal and shows success feedback

**Description:** A successful update shows **Orden actualizada en la base de datos** and closes the modal.

**Preconditions / Test Data:** Editable order; valid update payload.

**Steps to Reproduce:**
1. Open an editable order.
2. Change a field such as payment method.
3. Click **Actualizar**.
4. Confirm the success alert appears and the modal closes.

**Coverage Status:** Existing Playwright

### ORD-DELETE-01
**Title:** Deleting an order requires confirmation and removes the row on success

**Description:** Admin deletion is a two-step flow: open the confirmation modal, confirm deletion, then remove the row from the table on success.

**Preconditions / Test Data:** Admin session; editable order row.

**Steps to Reproduce:**
1. Open an editable order.
2. Click **Eliminar**.
3. Confirm the confirmation dialog appears.
4. Click **Confirmar**.
5. Confirm the row disappears from the table.

**Coverage Status:** Existing Playwright

### Route Scheduling and Consolidation

### ORD-ROUTE-01
**Title:** Route-scheduling controls disappear when the selected date is not today

**Description:** `ScheduleButton` returns `null` whenever the selected date is not today, so route creation is only available on the current day.

**Preconditions / Test Data:** Admin session; any non-today `?date=` value.

**Steps to Reproduce:**
1. Open `/#/admin/orders?date=2026-04-25`.
2. Confirm the **Crear ruta sugerida** controls are not rendered.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-02
**Title:** Route scheduling is disabled unless every row is clean and `Creada`

**Description:** The schedule button disables when there are no orders, when any order has errors, or when any status is not `Creada`.

**Preconditions / Test Data:** Orders dataset with one of these cases:
- empty list
- a row with `errors.length > 0`
- a row with status other than `Creada`

**Steps to Reproduce:**
1. Open `/#/admin/orders` for today.
2. Test each dataset state above.
3. Confirm **Crear ruta sugerida** is disabled in each failing scenario.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-03
**Title:** Admin can schedule with both drivers or force all orders onto a single driver

**Description:** The default route path uses drivers `1` and `2`. Expanding **Ver opciones avanzadas** lets the user pick one driver and remap all orders to that driver before sequencing.

**Preconditions / Test Data:** Today's orders with valid lat/lng and `Creada` status.

**Steps to Reproduce:**
1. Open `/#/admin/orders` for today.
2. Confirm the schedule button label references both drivers by default.
3. Expand **Ver opciones avanzadas**.
4. Choose **Repartidor 1** or **Repartidor 2**.
5. Confirm the schedule button label changes to the single-driver version.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-04
**Title:** Suggested route generation opens the map modal with optimized sequences

**Description:** Clicking **Crear ruta sugerida** runs `DeliveryProcessor`, which groups by driver and time slot, applies nearest-neighbor sequencing from the warehouse, and opens the map modal.

**Preconditions / Test Data:** Today's orders with valid coordinates, `Creada` status, and no errors.

**Steps to Reproduce:**
1. Open `/#/admin/orders` for today.
2. Click **Crear ruta sugerida**.
3. Confirm the map modal opens.
4. Confirm the order list inside the modal contains delivery sequence numbers.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-05
**Title:** Map modal filters and drag-drop reordering change delivery sequence

**Description:** The map modal exposes driver and time-slot filters. Reordering the table with drag-and-drop rewrites `delivery_sequence` for the filtered subset.

**Preconditions / Test Data:** Map modal already open with at least two filtered orders.

**Steps to Reproduce:**
1. Open the map modal from the Orders page.
2. Select a driver and a delivery-time filter.
3. Drag one row below another.
4. Confirm the visible sequence numbers update.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-06
**Title:** Route confirmation sets orders to `Programada` and warns that editing will be blocked

**Description:** Before the route is saved, the UI opens a confirmation modal warning that scheduled orders for today will become non-editable. Confirming sends the route payload and updates matching rows to `Programada`.

**Preconditions / Test Data:** Map modal open with route assignments ready.

**Steps to Reproduce:**
1. Open the map modal.
2. Click **Confirmar y mandar a ruta**.
3. Confirm the warning modal appears.
4. Click **Confirmar**.
5. Confirm the map modal closes and the affected orders show status `Programada`.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-07
**Title:** Route save failures keep the map modal open

**Description:** If the route-save request fails, the page shows an error alert and the map modal remains open so the user can try again.

**Preconditions / Test Data:** Force the route-save POST to fail.

**Steps to Reproduce:**
1. Open the map modal.
2. Click **Confirmar y mandar a ruta** and confirm the warning dialog.
3. Force the save request to fail.
4. Confirm the page shows the route-save error.
5. Confirm the map modal stays open.

**Coverage Status:** Missing Playwright

### ORD-ROUTE-08
**Title:** Consolidated products modal groups quantities by driver

**Description:** **Ver consolidado** opens a read-only modal that groups total product quantities under each driver number.

**Preconditions / Test Data:** Orders list with at least one product assigned to one or more drivers.

**Steps to Reproduce:**
1. Open `/#/admin/orders`.
2. Click **Ver consolidado**.
3. Confirm the modal opens.
4. Confirm products are grouped under **Repartidor X** headings.

**Coverage Status:** Missing Playwright

---

## Clients

**Primary source files**
- `src/views/admin/clients/index.tsx`
- `src/views/admin/clients/components/Clients.tsx`
- `src/views/admin/clients/components/CreateClientModal.tsx`
- `src/views/admin/clients/components/UpdateClientModal.tsx`
- `src/views/admin/clients/hooks/useClients.ts`

### CLI-PAGE-01
**Title:** Clients page renders search and create controls

**Description:** The Clients screen exposes a phone search box, a **Buscar** button, and a **Crear** button for starting CRUD flows.

**Preconditions / Test Data:** Authenticated admin or control-desk session.

**Steps to Reproduce:**
1. Open `/#/admin/clients`.
2. Confirm the phone input is visible.
3. Confirm **Buscar** is visible.
4. Confirm **Crear** is visible.

**Coverage Status:** Existing Playwright

### CLI-SEARCH-01
**Title:** Client search only enables once the phone number reaches 10 digits

**Description:** The search input toggles the **Buscar** button based strictly on `value.length === 10`.

**Preconditions / Test Data:** Authenticated admin or control-desk session.

**Steps to Reproduce:**
1. Open `/#/admin/clients`.
2. Type fewer than 10 digits into the phone search box.
3. Confirm **Buscar** is disabled.
4. Complete the phone number to 10 digits.
5. Confirm **Buscar** becomes enabled.

**Coverage Status:** Missing Playwright

### CLI-SEARCH-02
**Title:** Searching for an existing client opens the update modal

**Description:** A successful client fetch opens **Ver Cliente** and clears the search field.

**Preconditions / Test Data:** Existing client phone number.

**Steps to Reproduce:**
1. Open `/#/admin/clients`.
2. Enter a known 10-digit client phone number.
3. Click **Buscar**.
4. Confirm the update modal opens.
5. Confirm the search input is cleared.

**Coverage Status:** Missing Playwright

### CLI-SEARCH-03
**Title:** Searching for a missing client shows an inline not-found error

**Description:** If the fetch returns `null`, the search form switches into the invalid state and shows **Cliente no encontrado.**

**Preconditions / Test Data:** 10-digit phone number not present in the client dataset.

**Steps to Reproduce:**
1. Open `/#/admin/clients`.
2. Enter a non-existent 10-digit phone number.
3. Click **Buscar**.
4. Confirm **Cliente no encontrado.** appears under the search input.

**Coverage Status:** Missing Playwright

### Create Client

### CLI-CREATE-01
**Title:** Create Client starts with phone only

**Description:** The create-client modal keeps the rest of the form hidden until phone validation finishes.

**Preconditions / Test Data:** Authenticated admin or control-desk session.

**Steps to Reproduce:**
1. Open `/#/admin/clients`.
2. Click **Crear**.
3. Confirm **Teléfono** is visible before the other fields.

**Coverage Status:** Existing Playwright

### CLI-CREATE-02
**Title:** Invalid client phone shows the 10-digit validation message

**Description:** Blurring the create-client phone input with fewer than 10 digits shows **El número de teléfono debe tener 10 dígitos.**

**Preconditions / Test Data:** Create-client modal open.

**Steps to Reproduce:**
1. Enter a short phone number in **Teléfono**.
2. Blur the field.
3. Confirm the 10-digit validation message appears.

**Coverage Status:** Missing Playwright

### CLI-CREATE-03
**Title:** A new phone number reveals editable client fields

**Description:** If the phone lookup finds no existing client, the modal reveals **Nombre**, **Dirección**, **Email**, and **Descuento** for manual entry.

**Preconditions / Test Data:** 10-digit phone number not present in the dataset.

**Steps to Reproduce:**
1. Open the create-client modal.
2. Enter a new 10-digit phone number and blur.
3. Confirm **Nombre** and **Dirección** appear.
4. Confirm the rest of the form becomes editable.

**Coverage Status:** Existing Playwright

### CLI-CREATE-04
**Title:** Existing client phone numbers auto-fill the form and disable submission

**Description:** When the create-client lookup returns an existing client, the modal fills the known values, shows **El cliente con este número de teléfono ya existe.**, disables the editable fields, and keeps **Guardar** disabled.

**Preconditions / Test Data:** Existing client phone number.

**Steps to Reproduce:**
1. Open the create-client modal.
2. Enter an existing 10-digit client phone number and blur.
3. Confirm the form shows the existing-client error.
4. Confirm **Guardar** stays disabled.

**Coverage Status:** Existing Playwright

### CLI-CREATE-05
**Title:** Lookup failures show a verification error in Create Client

**Description:** If the existence check throws, the modal shows **Error al verificar el cliente.**

**Preconditions / Test Data:** Mock the client lookup request to fail.

**Steps to Reproduce:**
1. Open the create-client modal.
2. Enter a valid 10-digit phone number.
3. Force the lookup request to fail.
4. Confirm the verification error message appears.

**Coverage Status:** Missing Playwright

### CLI-CREATE-06
**Title:** Email is optional, but invalid email blocks submission

**Description:** The create form accepts an empty email, but any non-empty email must satisfy the regex or the submit button stays disabled.

**Preconditions / Test Data:** Create-client modal open with the full form visible.

**Steps to Reproduce:**
1. Reveal the full create-client form with a non-existing phone number.
2. Fill name and address.
3. Enter an invalid email such as `not-a-valid-email`.
4. Confirm **Guardar** stays disabled.
5. Clear the email and confirm the form can become valid again.

**Coverage Status:** Existing Playwright

### CLI-CREATE-07
**Title:** Successful client creation closes the modal and shows success feedback

**Description:** A successful create request shows **Cliente guardado en la base de datos.**, resets the form, and closes the modal.

**Preconditions / Test Data:** Valid phone, name, address, optional email, and discount.

**Steps to Reproduce:**
1. Open the create-client modal.
2. Fill a valid new client.
3. Click **Guardar**.
4. Confirm the success alert appears.
5. Confirm the modal closes.

**Coverage Status:** Existing Playwright

### CLI-CREATE-08
**Title:** Client-create failures keep the modal open

**Description:** If the POST fails, the modal remains open and shows the create-client error instead of closing.

**Preconditions / Test Data:** Mock the client-create request to fail.

**Steps to Reproduce:**
1. Open the create-client modal.
2. Fill a valid client.
3. Force the create request to fail.
4. Confirm the error alert appears.
5. Confirm the modal stays open.

**Coverage Status:** Missing Playwright

### Update and Delete Client

### CLI-UPDATE-01
**Title:** Update Client preloads data and requires an actual change before enabling update

**Description:** The update modal loads the current client values and disables **Actualizar** until the user makes a real change and the form remains valid.

**Preconditions / Test Data:** Existing client found through search.

**Steps to Reproduce:**
1. Search for an existing client.
2. Wait for the update modal to open.
3. Confirm the client's current values are preloaded.
4. Confirm **Actualizar** is disabled before any edits.
5. Change a field and confirm **Actualizar** becomes enabled.

**Coverage Status:** Missing Playwright

### CLI-UPDATE-02
**Title:** Changing the client phone warns that a new record will be created

**Description:** Changing the phone number turns on a warning branch that says the change will create a new record and shows the **Eliminar el registro antiguo** checkbox.

**Preconditions / Test Data:** Existing client in the update modal.

**Steps to Reproduce:**
1. Search for an existing client.
2. Change the value in **Teléfono**.
3. Confirm the warning about creating a new record appears.
4. Confirm the **Eliminar el registro antiguo** checkbox appears and defaults to checked.

**Coverage Status:** Missing Playwright

### CLI-UPDATE-03
**Title:** Second address can be added or removed only in the update flow

**Description:** The client update modal exposes **Agregar 2da dirección** / **Eliminar 2da dirección**, allowing the secondary-address branch to be toggled on or off.

**Preconditions / Test Data:** Existing client in the update modal.

**Steps to Reproduce:**
1. Search for an existing client.
2. Click **Agregar 2da dirección** if the secondary address is hidden.
3. Confirm the secondary-address field appears.
4. Click **Eliminar 2da dirección**.
5. Confirm the field is removed again.

**Coverage Status:** Missing Playwright

### CLI-UPDATE-04
**Title:** Only admins can edit client geolocation fields or delete clients

**Description:** The primary and secondary latitude/longitude inputs are admin-only, and the **Eliminar** button is also admin-only.

**Preconditions / Test Data:** One admin session and one non-admin/non-driver control-desk session.

**Steps to Reproduce:**
1. Open the update-client modal as an admin.
2. Confirm latitude/longitude fields are editable and **Eliminar** is visible.
3. Open the same modal as a non-admin control-desk user.
4. Confirm latitude/longitude fields are disabled and **Eliminar** is hidden.

**Coverage Status:** Missing Playwright

### CLI-UPDATE-05
**Title:** Address changes clear stored geolocation values on save

**Description:** If the primary or secondary address changes, the payload sends `null` geolocation for the changed address so the backend can recalculate it.

**Preconditions / Test Data:** Existing client with saved geolocation and, ideally, a saved second address.

**Steps to Reproduce:**
1. Open the update-client modal.
2. Change the primary or secondary address.
3. Save the client.
4. Confirm the request payload clears the corresponding geolocation field.

**Coverage Status:** Missing Playwright

### CLI-UPDATE-06
**Title:** Successful client updates close the modal and show success feedback

**Description:** A successful update shows **Cliente guardado en la base de datos.** and closes the modal.

**Preconditions / Test Data:** Existing client with at least one valid change.

**Steps to Reproduce:**
1. Search for an existing client.
2. Change a field such as **Nombre**.
3. Click **Actualizar**.
4. Confirm the success alert appears.
5. Confirm the modal closes.

**Coverage Status:** Existing Playwright

### CLI-DELETE-01
**Title:** Client deletion is admin-only and removes the record on success

**Description:** Admin users can delete the current client record directly from the update modal. Non-admin control-desk users do not see the delete action.

**Preconditions / Test Data:** Existing client and admin session.

**Steps to Reproduce:**
1. Search for an existing client as an admin.
2. Click **Eliminar**.
3. Confirm the request succeeds.
4. Confirm the success alert appears and the modal closes.

**Coverage Status:** Missing Playwright

---

## Products

**Primary source files**
- `src/views/admin/products/index.tsx`
- `src/views/admin/products/components/Products.tsx`
- `src/views/admin/products/components/CreateProductModal.tsx`
- `src/views/admin/products/components/UpdateProductModal.tsx`
- `src/views/admin/products/hooks/useProductsCRUD.ts`

### PRD-PAGE-01
**Title:** Products page shows either the catalog table or an empty state

**Description:** If products exist, the page renders a table. If the fetch returns an empty list, it shows **No hay registros para mostrar.**

**Preconditions / Test Data:** One dataset with products and one empty dataset.

**Steps to Reproduce:**
1. Open `/#/admin/products`.
2. Load products and confirm the table is visible.
3. Repeat with an empty response.
4. Confirm the empty-state message appears.

**Coverage Status:** Missing Playwright

### PRD-PAGE-02
**Title:** Only admins can create or open product edit flows

**Description:** The Products page blocks create and edit actions behind `isAdmin()`. Non-admin control-desk users can still view the list, but they cannot open create or update flows.

**Preconditions / Test Data:** One admin session and one non-admin/non-driver control-desk session.

**Steps to Reproduce:**
1. Open `/#/admin/products` as an admin.
2. Confirm **Crear** is visible and clicking a row opens the edit modal.
3. Open the same page as a non-admin control-desk user.
4. Confirm **Crear** is hidden and clicking a row does not open the edit modal.

**Coverage Status:** Missing Playwright

### PRD-PAGE-03
**Title:** Products table paginates at 10 rows per page

**Description:** The product catalog uses React Table pagination with a fixed page size of 10 and the standard **Anterior** / **Siguiente** controls.

**Preconditions / Test Data:** More than 10 products.

**Steps to Reproduce:**
1. Open `/#/admin/products`.
2. Load more than 10 products.
3. Confirm only 10 rows are visible on the first page.
4. Use **Siguiente** and **Anterior** to navigate between pages.

**Coverage Status:** Missing Playwright

### Create Product

### PRD-CREATE-01
**Title:** Create Product modal exposes only name and price fields

**Description:** The create-product modal is intentionally simple and asks only for **Nombre del Producto** and **Precio del Producto**.

**Preconditions / Test Data:** Admin session.

**Steps to Reproduce:**
1. Open `/#/admin/products`.
2. Click **Crear**.
3. Confirm the modal shows the name and price fields.

**Coverage Status:** Existing Playwright

### PRD-CREATE-02
**Title:** Create Product submit button stays enabled even before the form is valid

**Description:** The create-product modal has no disabled-state validation on the button. The save button remains clickable before a valid price is entered.

**Preconditions / Test Data:** Create-product modal open.

**Steps to Reproduce:**
1. Open the create-product modal.
2. Fill only the name, or leave both fields blank.
3. Confirm **Crear Producto** remains enabled.

**Coverage Status:** Existing Playwright

### PRD-CREATE-03
**Title:** Invalid or empty product prices silently no-op

**Description:** Clicking **Crear Producto** with a price that parses to `NaN` returns early inside the modal handler and provides no inline validation or toast.

**Preconditions / Test Data:** Create-product modal open; empty price or invalid numeric input.

**Steps to Reproduce:**
1. Open the create-product modal.
2. Leave the price empty.
3. Click **Crear Producto**.
4. Confirm there is no success alert, no error alert, and the modal stays open.

**Coverage Status:** Missing Playwright

### PRD-CREATE-04
**Title:** Successful product creation closes the modal and shows success feedback

**Description:** A successful product create request shows **Producto guardado en la base de datos** and closes the modal.

**Preconditions / Test Data:** Valid admin session, product name, and numeric price.

**Steps to Reproduce:**
1. Open the create-product modal.
2. Fill a valid name and price.
3. Click **Crear Producto**.
4. Confirm the success alert appears and the modal closes.

**Coverage Status:** Existing Playwright

### PRD-CREATE-05
**Title:** Product-create API failures keep the modal open

**Description:** If the create request fails, the parent page shows the error alert and the modal stays open for retry.

**Preconditions / Test Data:** Mock the product-create request to fail.

**Steps to Reproduce:**
1. Open the create-product modal.
2. Fill a valid product.
3. Force the create request to fail.
4. Confirm the error alert appears.
5. Confirm the modal stays open.

**Coverage Status:** Missing Playwright

### Update and Delete Product

### PRD-UPDATE-01
**Title:** Product edit modal opens with the current values prefilled

**Description:** When an admin clicks a product row, the edit modal opens with the existing name and price as default values.

**Preconditions / Test Data:** Admin session and at least one product row.

**Steps to Reproduce:**
1. Open `/#/admin/products`.
2. Click a product row.
3. Confirm the edit modal opens.
4. Confirm the existing name and price are already populated.

**Coverage Status:** Missing Playwright

### PRD-UPDATE-02
**Title:** Product update falls back to existing values when fields are left untouched

**Description:** The update handler uses the current row values when the user leaves either the name or price unchanged, so partial edits are allowed.

**Preconditions / Test Data:** Admin session; one editable product row.

**Steps to Reproduce:**
1. Open a product in the edit modal.
2. Change only the name or only the price.
3. Click **Actualizar**.
4. Confirm the update succeeds using the untouched field's original value.

**Coverage Status:** Missing Playwright

### PRD-UPDATE-03
**Title:** Successful product updates show success feedback

**Description:** A successful product update shows **Producto guardado en la base de datos** and closes the modal.

**Preconditions / Test Data:** Admin session and one valid field change.

**Steps to Reproduce:**
1. Open a product in the edit modal.
2. Change the name or price.
3. Click **Actualizar**.
4. Confirm the success alert appears.

**Coverage Status:** Existing Playwright

### PRD-DELETE-01
**Title:** Product deletion is admin-only and removes the row on success

**Description:** Only admins see **Eliminar** in the edit modal. On success, the product disappears from the local table state immediately.

**Preconditions / Test Data:** Admin session and at least one product row.

**Steps to Reproduce:**
1. Open a product in the edit modal.
2. Click **Eliminar**.
3. Confirm the modal closes.
4. Confirm the product row disappears from the table.

**Coverage Status:** Existing Playwright

### PRD-UPDATE-04
**Title:** Product update and delete failures leave the modal open

**Description:** The edit modal catches errors from update/delete, relies on the parent alert for feedback, and does not close on failure.

**Preconditions / Test Data:** Mock the update or delete request to fail.

**Steps to Reproduce:**
1. Open a product in the edit modal.
2. Attempt **Actualizar** or **Eliminar** with a failing API response.
3. Confirm the parent error alert appears.
4. Confirm the modal stays open.

**Coverage Status:** Missing Playwright

---

## Admin Route / Driver Management

**Primary source files**
- `src/routes.tsx`
- `src/views/admin/orders/components/ScheduleButton.tsx`
- `src/views/admin/orders/components/MapModal.tsx`
- `src/views/admin/orders/components/DeliveryProcessor.tsx`
- `src/views/admin/orders/components/TravelPlanner.tsx`
- `src/views/admin/orders/components/UpdateOrderModal.tsx`

### ADM-DRIVER-01
**Title:** Admin route creation is embedded in Orders, not a standalone admin page

**Description:** The current router does not expose a separate route-planning or driver-management page. Admin route creation starts from **Órdenes** through **Crear ruta sugerida**.

**Preconditions / Test Data:** Admin session.

**Steps to Reproduce:**
1. Open the admin sidebar.
2. Confirm there is no separate route-planning or driver-management route.
3. Open `/#/admin/orders`.
4. Confirm route creation starts from the Orders feature.

**Coverage Status:** Missing Playwright

### ADM-DRIVER-02
**Title:** Admin route assignment currently exposes only hardcoded drivers 1 and 2

**Description:** Both the advanced route-scheduling accordion and the order-update modal hardcode **Repartidor 1** and **Repartidor 2** as the available choices.

**Preconditions / Test Data:** Admin session.

**Steps to Reproduce:**
1. Open the Orders page and expand **Ver opciones avanzadas**.
2. Confirm the only available driver options are **Repartidor 1** and **Repartidor 2**.
3. Open an editable order.
4. Confirm the **Repartidor** select also exposes only `1` and `2`.

**Coverage Status:** Missing Playwright

### ADM-DRIVER-03
**Title:** Admin can reassign an individual order to a different driver in Update Order

**Description:** Update Order includes a **Repartidor** select, allowing an order-level driver reassignment before resaving the order.

**Preconditions / Test Data:** Editable order row.

**Steps to Reproduce:**
1. Open an editable order from the Orders table.
2. Change the **Repartidor** selection.
3. Save the order.
4. Confirm the row reflects the new driver value.

**Coverage Status:** Missing Playwright

### ADM-DRIVER-04
**Title:** There is no dedicated admin driver CRUD surface in the current app routes

**Description:** Driver management is currently limited to assignment choices inside Orders. There is no route for creating, editing, or deleting driver records from the admin UI.

**Preconditions / Test Data:** Admin session.

**Steps to Reproduce:**
1. Inspect the admin sidebar and route config.
2. Confirm there is no dedicated driver-management page.

**Coverage Status:** Needs review

### ADM-DRIVER-05
**Title:** Admin driver selection and driver-portal resolution use different source models

**Description:** Admin assignment uses hardcoded drivers `1` and `2`, but the driver portal resolves the active driver from `REACT_APP_DRIVERS_MAP`. This mismatch is important if the business ever needs more than two drivers.

**Preconditions / Test Data:** Review both the admin route-assignment UI and the driver portal configuration.

**Steps to Reproduce:**
1. Inspect the admin route-assignment selects.
2. Inspect the driver portal's current-driver resolution.
3. Confirm admin assignment is hardcoded while driver resolution is env-driven.

**Coverage Status:** Needs review

---

## Driver Portal

**Primary source files**
- `src/driverRoutes.tsx`
- `src/views/driver/deliveries/index.tsx`
- `src/views/driver/deliveries/hooks/useDeliveries.ts`
- `src/views/driver/deliveries/components/Delivery.tsx`
- `src/views/driver/deliveries/components/ConsolidatedModalDeliver.tsx`

### DRV-PAGE-01
**Title:** Driver deliveries page renders cards for the current driver's deliveries

**Description:** The page fetches today's orders, filters them to the active driver's `Programada` and `En ruta` orders, and renders one delivery card per remaining record.

**Preconditions / Test Data:** Authenticated driver session with at least one visible delivery.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Wait for the page to finish loading.
3. Confirm one or more delivery cards are visible.

**Coverage Status:** Existing Playwright

### DRV-PAGE-02
**Title:** Driver empty state appears when no deliveries are scheduled

**Description:** If the filtered delivery list is empty, the page shows **Aún no hay órdenes programadas para este día. Vuelve más tarde.**

**Preconditions / Test Data:** Driver session with no visible deliveries or mocked empty response.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Mock or force the orders response so the filtered list is empty.
3. Confirm the empty-state message appears.

**Coverage Status:** Existing Playwright

### DRV-PAGE-03
**Title:** Driver page shows an error state when deliveries fail to load

**Description:** If the deliveries fetch fails, the screen stops at the error state and shows **Error al cargar las entregas.**

**Preconditions / Test Data:** Force the deliveries GET request to fail.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Force the orders request to fail.
3. Confirm the page shows **Error al cargar las entregas.**

**Coverage Status:** Missing Playwright

### DRV-PAGE-04
**Title:** Driver deliveries are filtered by date, status, and driver, then sorted morning-first

**Description:** Only today's `Programada` or `En ruta` deliveries for the active driver are shown. The hook sorts morning deliveries before afternoon deliveries, then by `delivery_sequence`.

**Preconditions / Test Data:** Mixed dataset containing multiple drivers, statuses, dates, and time slots.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Load deliveries that include:
   - another driver
   - another date
   - a status outside `Programada` / `En ruta`
   - both morning and afternoon time slots
3. Confirm only today's deliveries for the active driver remain.
4. Confirm morning deliveries appear before afternoon ones.

**Coverage Status:** Missing Playwright

### Delivery Card Content

### DRV-CARD-01
**Title:** Delivery cards show address and delivery time

**Description:** Each delivery card exposes the delivery address and its time badge.

**Preconditions / Test Data:** At least one visible driver delivery.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Inspect a delivery card.
3. Confirm the delivery address is visible.
4. Confirm the delivery time badge is visible.

**Coverage Status:** Existing Playwright

### DRV-CARD-02
**Title:** Delivery cards show customer details, payment tag, line items, total, and optional notes

**Description:** Beyond the address and time, each card also renders the client name, phone number, payment method tag, cart items, total amount, and optional notes if they exist.

**Preconditions / Test Data:** At least one visible delivery; include one delivery with notes to verify the optional branch.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Inspect a delivery card.
3. Confirm the client name and phone number are visible.
4. Confirm the payment tag is visible.
5. Confirm the products table and total are visible.
6. If notes exist, confirm the notes row is visible.

**Coverage Status:** Missing Playwright

### DRV-CARD-03
**Title:** Google Maps and consolidated-product actions are available per delivery card

**Description:** Each card exposes **Ver en Google Maps** and **Ver consolidado** actions. The first opens an external Google Maps search, and the second opens the consolidated-products modal.

**Preconditions / Test Data:** At least one visible delivery.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Click **Ver en Google Maps** and confirm a new tab/window is opened.
3. Click **Ver consolidado** and confirm the consolidated modal opens.

**Coverage Status:** Missing Playwright

### Delivery Status Transitions

### DRV-STATUS-01
**Title:** `Programada` deliveries require a cooler before they can be added to the route

**Description:** When a delivery is still `Programada`, the card shows a cooler select from `1` to `10`. **Agregar a ruta** stays disabled until a cooler is chosen.

**Preconditions / Test Data:** At least one delivery with status `Programada`.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries` with a `Programada` delivery.
2. Confirm the cooler select is visible.
3. Confirm **Agregar a ruta** is disabled before choosing a cooler.
4. Choose a cooler and confirm the button becomes enabled.

**Coverage Status:** Missing Playwright

### DRV-STATUS-02
**Title:** `Agregar a ruta` transitions a delivery from `Programada` to `En ruta`

**Description:** Clicking **Agregar a ruta** sends an order update with status `En ruta`, stores the selected cooler, and keeps the delivery in the list.

**Preconditions / Test Data:** At least one `Programada` delivery and a selected cooler.

**Steps to Reproduce:**
1. Open a `Programada` delivery card.
2. Choose a cooler.
3. Click **Agregar a ruta**.
4. Confirm the update succeeds.
5. Confirm the card now shows the `En ruta` action set.

**Coverage Status:** Missing Playwright

### DRV-STATUS-03
**Title:** `En ruta` deliveries can be marked as delivered

**Description:** For `En ruta` deliveries, the card shows **Entregada**. Confirming the action sends status `Entregada`, shows success feedback, and removes the delivery from the local list.

**Preconditions / Test Data:** At least one `En ruta` delivery.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Click **Entregada** on an `En ruta` card.
3. Confirm the confirmation modal appears.
4. Click **Confirmar**.
5. Confirm a success alert appears and the card disappears from the list.

**Coverage Status:** Missing Playwright

### DRV-STATUS-04
**Title:** `En ruta` deliveries can be reprogrammed with a reason

**Description:** The **Reprogramar** action opens a modal with a reschedule-reason textarea. Confirming sends status `Reprogramada`, includes the notes text, and removes the delivery from the local list.

**Preconditions / Test Data:** At least one `En ruta` delivery.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Click **Reprogramar** on an `En ruta` card.
3. Enter a reason in the textarea.
4. Click the confirm **Reprogramar** button.
5. Confirm a success alert appears and the card disappears from the list.

**Coverage Status:** Missing Playwright

### DRV-STATUS-05
**Title:** Delivery-update failures show an error toast and leave the card in place

**Description:** Any failing delivery PUT request shows **Error al actualizar la orden. Intenta de nuevo.** and leaves the card visible.

**Preconditions / Test Data:** Force the delivery update request to fail.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Trigger **Entregada** or **Reprogramar**.
3. Force the update request to fail.
4. Confirm the error alert appears.
5. Confirm the card remains visible.

**Coverage Status:** Existing Playwright

### DRV-STATUS-06
**Title:** Non-`Programada` cards show cooler as read-only text instead of the select

**Description:** Once a delivery is not `Programada`, the cooler selector is replaced by read-only text: **Orden en hielera: X**.

**Preconditions / Test Data:** At least one `En ruta`, `Entregada`, or `Reprogramada` delivery with a cooler value.

**Steps to Reproduce:**
1. Open `/#/driver/deliveries`.
2. Inspect a non-`Programada` delivery card.
3. Confirm the card shows read-only cooler text instead of the dropdown.

**Coverage Status:** Missing Playwright

---

## Coverage Gaps / Needs Review

### GAP-01
**Title:** Current Playwright mocks still use legacy delivery-time values

**Description:** The real order UI only exposes `9 AM - 1 PM` and `1 PM - 5 PM`, but `e2e/data/mocks.ts` still uses values like `10:00 - 12:00` and `14:00 - 16:00`. Future E2E tests should align their fixtures with the actual UI.

**Preconditions / Test Data:** Review `CreateOrderModal`, `UpdateOrderModal`, and `e2e/data/mocks.ts`.

**Steps to Reproduce:**
1. Inspect the create/update order time selects in the UI code.
2. Compare them with the mock delivery times used by the current Playwright fixtures.
3. Confirm the values do not match.

**Coverage Status:** Needs review

### GAP-02
**Title:** Create Order still contains a dormant address-selection dialog path

**Description:** `CreateOrderModal` still renders the Chakra `AlertDialog` and `handleAddressSelection()` logic, but the current lookup flow no longer sets `isAlertOpen` to true. The current behavior auto-selects address 1 instead.

**Preconditions / Test Data:** Existing client with `second_address`.

**Steps to Reproduce:**
1. Inspect the Create Order flow for a client with two addresses.
2. Confirm the UI never opens the address-selection dialog.
3. Compare this with the still-rendered `AlertDialog` code path.

**Coverage Status:** Needs review

### GAP-03
**Title:** Discount logic supports `20%`, but the UI does not expose it

**Description:** The total-calculation functions in Create Order and Update Order include a `20%` multiplier internally, but the dropdowns only expose `0`, `5`, `10`, `15`, and `100`.

**Preconditions / Test Data:** Review create/update order discount logic.

**Steps to Reproduce:**
1. Inspect the discount dropdown options in the Create and Update modals.
2. Inspect the discount multiplier map in the total-calculation logic.
3. Confirm `20` exists in code but not in the UI.

**Coverage Status:** Needs review

### GAP-04
**Title:** Create Order and Update Order disagree on geolocation requirements

**Description:** Create Order allows `geolocation: null`, but Update Order requires non-empty latitude and longitude to mark the form valid. This is a visible inconsistency in how the same domain treats location data.

**Preconditions / Test Data:** One create-order flow and one editable update-order flow.

**Steps to Reproduce:**
1. Open Create Order and note that latitude/longitude are not required or exposed.
2. Open Update Order and clear latitude/longitude.
3. Confirm the update form becomes invalid.

**Coverage Status:** Needs review

### GAP-05
**Title:** Update Order visually requires payment method, but form validity does not enforce it

**Description:** The Update Order form renders payment as a required field, yet `checkFormValidity()` does not include payment-method validation in the final `isFormValid` calculation.

**Preconditions / Test Data:** Inspect the update-order form logic.

**Steps to Reproduce:**
1. Compare the required payment field in `OrderFormFields` with the validity checks in `UpdateOrderModal`.
2. Confirm payment is visually required but omitted from `isFormValid`.

**Coverage Status:** Needs review

### GAP-06
**Title:** There is no standalone admin driver-management page

**Description:** The requested driver-management domain is only partially present today. Admins can assign or reassign hardcoded drivers in Orders, but there is no dedicated screen for creating, editing, or deleting drivers.

**Preconditions / Test Data:** Review current admin routes and views.

**Steps to Reproduce:**
1. Inspect the admin route config and sidebar.
2. Confirm there is no dedicated driver-management route.

**Coverage Status:** Needs review

### GAP-07
**Title:** Current driver Playwright tests never exercise the `Programada -> En ruta` branch

**Description:** The shipped E2E delivery mocks start in `En ruta`, so the existing suite covers delivered/reprogrammed actions but does not cover cooler selection or **Agregar a ruta**.

**Preconditions / Test Data:** Review `e2e/data/mocks.ts`, `e2e/specs/deliveries.spec.ts`, and `e2e/pages/deliveries.page.ts`.

**Steps to Reproduce:**
1. Inspect the mocked delivery statuses in the Playwright fixtures.
2. Confirm they start in `En ruta`.
3. Confirm the current delivery page object never selects a cooler or clicks **Agregar a ruta**.

**Coverage Status:** Needs review

### GAP-08
**Title:** Create Product silently no-ops on invalid price

**Description:** The create-product modal does not show any inline validation or toast when the price parses to `NaN`; it simply returns early. This is a reachable UX edge case worth either documenting as intended or fixing later.

**Preconditions / Test Data:** Product create modal open.

**Steps to Reproduce:**
1. Open the create-product modal.
2. Leave the price empty.
3. Click **Crear Producto**.
4. Confirm nothing visible happens.

**Coverage Status:** Needs review
