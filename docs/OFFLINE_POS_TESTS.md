# Phase 4 - Offline POS Manual Test Checklist (Frontend)

**Repository:** Sadia.lux  
**Date:** January 3, 2025  
**Status:** Ready for Testing

---

## Frontend Test Environment Setup

### Prerequisites

1. **Frontend running:** `npm run dev` from `Sadia.lux/` directory

   - Confirm Vite dev server running on `http://localhost:5173`
   - Check console for no immediate errors

2. **Backend running:** Must be running on `http://localhost:3000`

   - API calls will fail if backend unavailable
   - Verify: `http://localhost:3000/api/health`

3. **Test Data Available:**

   - Multiple products with stock > 0
   - At least one product with low stock (< 10)
   - Test users created (CASHIER, ADMIN, USER roles)

4. **Browser Environment:**
   - Chrome/Firefox/Safari (latest version)
   - DevTools open for console monitoring
   - localStorage cleared or previous test data cleaned

---

## Test Suite 1: Online Store - Ensure No Regression

### Test 1.1 - Homepage & Navigation

**Objective:** Basic homepage and navigation work

**Steps:**

1. Navigate to `http://localhost:5173/`
2. Verify homepage loads without errors
3. Header displays with logo, nav links (Shop, About, Account, etc.)
4. Footer visible with links and info
5. Click "Shop" in navigation
6. Verify redirect to `/shop`

**Expected Results:**

- ✓ Homepage loads in < 3 seconds
- ✓ No 404 or 500 errors in console
- ✓ Navigation links functional
- ✓ Responsive design (test on mobile view too)

---

### Test 1.2 - Browse Shop Products

**Objective:** Product listing page works

**Steps:**

1. On `/shop` page
2. Verify products display in grid/list format
3. Each product shows: image, name, price, stock (if visible)
4. Scroll down, verify infinite scroll or pagination works
5. Click category filter (if available)
6. Verify product list updates
7. Use search bar to search product (e.g., "dress")
8. Verify filtered results display

**Expected Results:**

- ✓ Products load and display properly
- ✓ Images load without broken links
- ✓ Prices displayed correctly
- ✓ Filters work (category, price range, etc.)
- ✓ Search results accurate
- ✓ No console errors

---

### Test 1.3 - Product Detail Page

**Objective:** Product detail page fully functional

**Steps:**

1. Click on a product from shop
2. Verify `/product/{slug}` page loads
3. Check displayed elements:
   - Product images (carousel if multiple)
   - Product name, description
   - Price, stock availability
   - Size/color options (if applicable)
   - Star rating, reviews
4. Click image carousel arrows
5. Verify image switching works
6. Read product description
7. Check reviews section

**Expected Results:**

- ✓ Product page loads correctly
- ✓ Images display with proper aspect ratio
- ✓ Description and details accurate
- ✓ Rating and review count shown
- ✓ All interactive elements work (carousel, etc.)
- ✓ Stock availability clearly indicated

---

### Test 1.4 - Add to Online Cart

**Objective:** Shopping cart add functionality works

**Steps:**

1. On product detail page
2. Select size/color (if required)
3. Set quantity using +/- buttons
4. Click "Add to Cart" button
5. Verify cart notification/toast appears
6. Check cart icon updates with count (e.g., shows "1")
7. Click cart icon to view cart
8. Verify `/cart` page shows added product
9. Confirm: name, size, quantity, price, subtotal correct

**Expected Results:**

- ✓ Product adds to cart
- ✓ Toast/notification displays
- ✓ Cart count updates
- ✓ Cart persists (localStorage or server)
- ✓ Correct product details shown in cart

---

### Test 1.5 - Cart Management

**Objective:** Cart update and removal works

**Steps:**

1. On `/cart` page with items
2. Use +/- buttons to change quantity
3. Verify subtotal updates
4. Verify total price updates
5. Click "Remove" button
6. Verify item removed from cart
7. Verify count updated
8. Add multiple items to cart
9. Modify various items
10. Verify all totals recalculate

**Expected Results:**

- ✓ Quantity changes work
- ✓ Prices recalculate correctly
- ✓ Remove button works
- ✓ Cart empty state shows when no items
- ✓ "Continue Shopping" link works
- ✓ No console errors during updates

---

### Test 1.6 - Online Checkout (Non-POS)

**Objective:** Regular online checkout process works

**Steps:**

1. From `/cart`, click "Proceed to Checkout"
2. Verify redirect to `/checkout`
3. Checkout page displays with:
   - Order summary (items, prices, total)
   - Delivery/shipping info form
   - Payment method selection (PAYME, CLICK, CASH)
4. Fill in customer name, phone, address
5. Select payment method (e.g., CLICK)
6. Click "Place Order" or equivalent
7. Verify order creation (may show confirmation or payment redirect)
8. Check that order source is "ONLINE" (backend verification)

**Expected Results:**

- ✓ Checkout form loads
- ✓ Form validation works (required fields highlighted)
- ✓ Order submits successfully
- ✓ Confirmation/redirect occurs
- ✓ No console errors
- ✓ Order created in backend with `source: ONLINE` (not `POS`)

---

### Test 1.7 - User Account / Order History

**Objective:** User dashboard and order history work

**Steps:**

1. Log in as regular user (if applicable)
2. Navigate to user account/profile page
3. Verify account info displays
4. View order history section
5. Click on past order
6. Verify order details page shows items, dates, status

**Expected Results:**

- ✓ Account page loads
- ✓ Order history visible
- ✓ Order details accurate
- ✓ Can navigate back to account

---

## Test Suite 2: POS System - Cashier Interface

### Test 2.1 - POS Login Page

**Objective:** POS login screen and authentication

**Steps:**

1. Navigate to `http://localhost:5173/pos/login`
2. Verify page displays:
   - "SADIA.LUX POS" title or similar
   - Email input field
   - Password input field
   - "Login" button
   - (Optional) "Back to Shop" link
3. Enter invalid credentials (wrong password)
4. Click Login
5. Verify error message: "Invalid email or password"
6. Enter cashier credentials: `cashier@test.com` / `password123`
7. Click Login
8. Verify processing state (spinner/disabled button)
9. Verify redirect to `/pos` (main screen)

**Expected Results:**

- ✓ POS login page renders correctly
- ✓ Error messages display for invalid login
- ✓ Successful login shows loading state
- ✓ Redirect to `/pos` works
- ✓ No console errors

---

### Test 2.2 - POS Main Screen (Cashier Dashboard)

**Objective:** Main POS interface displays correctly

**Steps:**

1. **Logged in as Cashier** at `/pos`
2. Verify page layout:
   - Header with "POS - Cashier Mode"
   - Cashier name displayed (e.g., "Ahmed")
   - Logout button
3. Left side: Product grid with search
4. Right side: Shopping cart section
5. Search box prominent and functional
6. "Clear Cart" button visible
7. Checkout button at bottom of cart

**Expected Results:**

- ✓ Header displays with cashier info
- ✓ Layout is two-column (products + cart)
- ✓ UI optimized for touch/mouse
- ✓ All buttons visible and clickable
- ✓ Responsive on different screen sizes

---

### Test 2.3 - POS Product Search

**Objective:** Product search and filtering works

**Steps:**

1. **At `/pos`**, search box visible
2. Type product name: "Green"
3. Verify results filter in real-time
4. Should show only products matching "Green" name
5. Clear search box
6. Verify all products reappear (if stock > 0)
7. Search by SKU: "GD-001"
8. Verify SKU-based search works
9. Type partial match: "Dr"
10. Verify matching products shown (case-insensitive)

**Expected Results:**

- ✓ Search is real-time (no separate search button needed)
- ✓ Results filter as you type
- ✓ Only `active_for_pos: true` and `stock > 0` shown
- ✓ Both name and SKU searchable
- ✓ Partial/fuzzy matching works
- ✓ Performance acceptable (no lag)

---

### Test 2.4 - POS Product Grid Display

**Objective:** Product cards show correct information

**Steps:**

1. **At `/pos`** with products displaying
2. Each product card shows:
   - Product image (or placeholder)
   - Product name
   - Price (formatted, e.g., "45,000 so'm")
   - Stock remaining (e.g., "Stock: 50")
   - SKU (if available)
3. Hover over product
4. Verify interactive state (slight color change, shadow, etc.)
5. Click product card
6. Verify product adds to cart with qty=1

**Expected Results:**

- ✓ All required fields displayed
- ✓ Price formatting consistent
- ✓ Stock number accurate
- ✓ Images load without broken links
- ✓ Card is clickable
- ✓ Click adds to cart

---

### Test 2.5 - POS Add to Cart

**Objective:** Items add to cart correctly

**Steps:**

1. **At `/pos`** with products visible
2. Click "Green Dress" product card
3. Verify item appears in right-side cart
4. Cart shows: product name, price, qty (1), subtotal
5. Click same product again
6. Verify quantity increases to 2 (not added as separate line)
7. Verify subtotal updates: 2 × 45,000
8. Click different product (e.g., "Blue Shirt")
9. Verify second item added to cart as separate line
10. Verify cart shows both items with correct totals

**Expected Results:**

- ✓ Product adds to cart
- ✓ Quantity stacks (duplicate items increase qty, not added as new line)
- ✓ Cart displays all items
- ✓ Subtotals calculate correctly
- ✓ No console errors

---

### Test 2.6 - POS Cart Quantity Controls

**Objective:** Modify item quantities in cart

**Steps:**

1. **In POS cart** with 2+ items
2. Find "Green Dress" with qty=2
3. Click "+" button next to qty
4. Verify qty increases to 3
5. Verify subtotal updates: 3 × 45,000 = 135,000
6. Click "-" button twice
7. Verify qty decreases to 1
8. Verify subtotal updates: 1 × 45,000
9. Click "-" when qty=1
10. Verify item removed from cart (not qty=0)
11. Verify total updates

**Expected Results:**

- ✓ Plus button increments quantity
- ✓ Minus button decrements quantity
- ✓ Subtracting at qty=1 removes item
- ✓ Subtotals update in real-time
- ✓ Total price recalculates
- ✓ Max qty cannot exceed available stock

---

### Test 2.7 - POS Stock Limits

**Objective:** Cannot add more than available stock

**Steps:**

1. **At POS** with products displayed
2. Find "Blue Shirt" with stock=30
3. Click product to add (qty=1)
4. Try to click product 35 more times (attempt qty=36)
5. At some point, verify error: "Only 30 in stock"
6. Try to increment qty beyond stock using +/- buttons
7. Verify button disabled or error shown
8. Reduce qty to 29
9. Click "+" button
10. Qty changes to 30
11. Try "+" again
12. Verify disabled or error: "Only 30 in stock"

**Expected Results:**

- ✓ Cannot add more items than available stock
- ✓ Error message displayed when attempting to exceed
- ✓ Plus button disabled at max stock
- ✓ Clear feedback to user

---

### Test 2.8 - POS Cart Summary & Totals

**Objective:** Cart totals calculate correctly

**Steps:**

1. **In POS cart** add multiple items:
   - Green Dress × 3 = 135,000
   - Blue Shirt × 2 = 70,000
2. Verify cart displays:
   - Item count: "5 items"
   - Subtotal: 205,000
   - Tax (if applicable): 0 or calculated
   - Total: 205,000
3. Add another item (qty=1)
4. Verify all totals recalculate
5. Click "Clear Cart"
6. Verify cart empties
7. Verify totals reset to 0

**Expected Results:**

- ✓ Subtotal = sum of all items
- ✓ Tax calculated correctly (0 or as per policy)
- ✓ Total = subtotal + tax
- ✓ Totals update in real-time with qty changes
- ✓ Clear Cart removes all items

---

### Test 2.9 - POS Checkout Modal

**Objective:** Checkout modal displays and works

**Steps:**

1. **In POS cart** with items
2. Click "Checkout" button
3. Modal/dialog appears with:
   - Order summary (items, total)
   - Payment method options:
     - 💵 Cash Payment (Instant)
     - 🏦 Terminal Payment (Pending Confirmation)
   - "Pay [Method]" button
   - (Optional) Cancel button
4. Verify payment method can be selected (radio buttons)
5. Select "Cash"
6. Verify selection highlighted
7. Select "Terminal"
8. Verify selection changed
9. Select "Cash" again
10. Click "Pay Cash" (or similar)
11. Verify processing (spinner, disabled button)

**Expected Results:**

- ✓ Modal displays clearly over main POS screen
- ✓ Payment options visible and selectable
- ✓ Only one option selectable at a time
- ✓ Confirm button enabled after selection
- ✓ Processing state shows during submission
- ✓ No console errors

---

## Test Suite 3: POS Cash Sales

### Test 3.1 - Complete Cash Sale

**Objective:** Full cash payment flow works

**Steps:**

1. **At POS main**, add products:
   - Green Dress × 2
   - Blue Shirt × 1
   - Total: 119,000
2. Click "Checkout"
3. Modal appears, select "💵 Cash Payment (Instant)"
4. Click "Pay Cash"
5. Page shows processing state
6. After 1-2 seconds, redirects to receipt page (`/pos/receipt/{orderId}`)
7. Receipt page displays:
   - **Header:** "SADIA.LUX" logo/title
   - **Receipt Number:** "RCP-20250103-001" (format check)
   - **Date/Time:** Current date and time
   - **Cashier:** Name of logged-in cashier
   - **Items Section:**
     - Green Dress × 2 @ 45,000 = 90,000
     - Blue Shirt × 1 @ 35,000 = 35,000
     - Item list with SKU (if available)
   - **Totals:**
     - Subtotal: 125,000
     - Tax: 0 (or as configured)
     - **Total: 125,000**
   - **Payment Status:** "PAID" (in green or checkmark)
   - **Payment Method:** "CASH"
8. At bottom:
   - "🖨️ Print Receipt" button
   - "📝 New Sale" button

**Expected Results:**

- ✓ Order processes immediately (no pending state)
- ✓ Redirect to receipt page
- ✓ Receipt displays all required info
- ✓ Receipt number format: RCP-YYYYMMDD-###
- ✓ Totals calculated correctly
- ✓ Receipt layout print-friendly

---

### Test 3.2 - Print Receipt

**Objective:** Receipt printing works

**Steps:**

1. **On receipt page**
2. Verify "Print" button visible
3. Click "🖨️ Print Receipt"
4. Browser print dialog opens (Ctrl+P would do same)
5. Print preview shows receipt formatted for paper
6. Verify only receipt content visible (no buttons, navigation)
7. Click "Cancel" to close print dialog
8. Verify page still functional
9. Try again and actually print (or print to PDF)
10. Verify printed receipt readable

**Expected Results:**

- ✓ Print dialog opens
- ✓ Print preview shows clean receipt layout
- ✓ No extra UI elements in print
- ✓ Formatting suitable for 80mm thermal printer
- ✓ All content readable when printed

---

### Test 3.3 - New Sale from Receipt

**Objective:** Return to POS after sale

**Steps:**

1. **On receipt page** after sale
2. Click "📝 New Sale" button
3. Verify redirect back to `/pos`
4. Verify cart is empty (ready for next transaction)
5. Verify search/product grid reset
6. Ready for next sale

**Expected Results:**

- ✓ Button redirects to `/pos`
- ✓ Cart clears
- ✓ Product list refreshes
- ✓ Ready for next transaction

---

### Test 3.4 - Multiple Consecutive Cash Sales

**Objective:** Multiple sales process without data loss

**Steps:**

1. **Sale 1:** Green Dress × 2 → Cash → Receipt
2. Click "New Sale"
3. **Sale 2:** Blue Shirt × 3 → Cash → Receipt
4. Click "New Sale"
5. **Sale 3:** Green Dress × 1 → Cash → Receipt
6. Check backend: All 3 orders exist in database
7. Verify receipt numbers increment: RCP-...-001, RCP-...-002, RCP-...-003
8. Verify stock decremented:
   - Green Dress: 50 → 47
   - Blue Shirt: 30 → 27

**Expected Results:**

- ✓ Each sale completes successfully
- ✓ Receipt numbers sequential
- ✓ Stock updates correctly
- ✓ No data loss or duplicates
- ✓ Each order independent

---

## Test Suite 4: POS Terminal Payments

### Test 4.1 - Terminal Payment - Pending State

**Objective:** Terminal payment creates pending order

**Prerequisite:** Verify backend `.env` has `TERMINAL_PROVIDER=mock` and `TERMINAL_MOCK_MODE=success`

**Steps:**

1. **At POS main**, add items:
   - Blue Shirt × 2
   - Total: 70,000
2. Click "Checkout"
3. Select "🏦 Terminal Payment (Pending Confirmation)"
4. Click "Pay Terminal"
5. Page shows processing state
6. After 1-2 seconds, redirects to `/pos/payment/{orderId}`
7. **Payment page displays:**
   - Title: "Terminal Payment Pending"
   - ⏳ Icon: "Awaiting Terminal Confirmation"
   - **Order Details:**
     - Receipt Number
     - Amount: 70,000
     - Date/Time
   - "✓ Confirm Payment" button
   - "❌ Cancel Transaction" button

**Expected Results:**

- ✓ Order created with `payment_status: "pending"`
- ✓ Terminal transaction ID generated
- ✓ Redirect to payment confirmation page
- ✓ Stock NOT decremented yet (order still pending)

---

### Test 4.2 - Terminal Payment - Confirmation Success

**Objective:** Confirm pending payment and complete sale

**Steps:**

1. **On payment page** from Test 4.1
2. Verify order details displayed correctly
3. Click "✓ Confirm Payment"
4. Page shows processing state: "Confirming..."
5. After ~1 second, payment state updates
6. **Page transitions to success state:**
   - ✅ Green checkmark displayed
   - "Payment Confirmed!"
   - Amount displayed in green box
7. After 1-2 more seconds, redirects to receipt page
8. **Receipt page shows:**
   - Receipt number
   - Payment status: "PAID"
   - Payment method: "TERMINAL"
   - Transaction ID (if shown)

**Expected Results:**

- ✓ Confirmation succeeds (mock returns success)
- ✓ UI transitions to success state
- ✓ Stock decremented (now that payment confirmed)
- ✓ Redirect to receipt page
- ✓ Receipt shows correct payment method

---

### Test 4.3 - Terminal Payment - Failure & Retry

**Objective:** Handle failed terminal payment and retry option

**Prerequisite:** Change backend `.env` to `TERMINAL_MOCK_MODE=fail` and restart backend

**Steps:**

1. **At POS main**, add items and select Terminal payment
2. Redirected to `/pos/payment/{orderId}`
3. Click "✓ Confirm Payment"
4. Processing state shows
5. After ~1 second, **failure state displayed:**
   - ❌ Red X icon
   - "Payment Failed"
   - Error message: "Terminal declined transaction" (or similar)
   - "🔄 Retry Payment" button
   - "💵 Try Cash Payment Instead" button (optional)
   - "Discard & Start Over" button
6. Click "🔄 Retry Payment"
7. Processing state again
8. Fails again (same mock mode)
9. Click "Discard & Start Over"
10. Verify redirect to `/pos`
11. Verify order still exists in backend with `payment_status: "failed"`
12. Verify stock unchanged (no decrement for failed order)

**Expected Results:**

- ✓ Payment failure detected and displayed
- ✓ Clear error message
- ✓ Retry button functional
- ✓ Can discard failed order
- ✓ Stock NOT decremented for failed order
- ✓ Order marked as `payment_status: "failed"`

---

### Test 4.4 - Terminal Payment - Fallback to Cash

**Objective:** User can switch to cash if terminal fails (if implemented)

**Steps:**

1. **On failed payment page** from Test 4.3
2. (If "Try Cash Payment Instead" button exists) Click it
3. Verify transitions to cash payment flow
4. Complete as cash sale
5. Order marked as `payment_method: "CASH"` (despite initial terminal attempt)
6. Stock decremented, receipt shown

**Expected Results:**

- ✓ Fallback option works (if implemented)
- ✓ Order payment method changes to CASH
- ✓ Payment completes successfully
- ✓ Stock decremented
- ✓ User not stuck on failed transaction

---

### Test 4.5 - Multiple Terminal Sales

**Objective:** Multiple terminal transactions process correctly

**Steps:**

1. **Sale 1 (Terminal):** Green Dress × 2 → Pending → Confirm → Success → Receipt
2. Click "New Sale"
3. **Sale 2 (Terminal):** Blue Shirt × 1 → Pending → Confirm → Success → Receipt
4. Backend verification:
   - Both orders exist with correct data
   - Both have terminal_transaction_id
   - Both have `payment_status: "paid"`
   - Receipt numbers sequential
   - Stock decremented for each sale

**Expected Results:**

- ✓ Multiple terminal sales work without issues
- ✓ Transaction IDs unique
- ✓ No data corruption
- ✓ Stock updates correctly

---

## Test Suite 5: Mixed Payment Methods

### Test 5.1 - Session with Cash & Terminal Sales

**Objective:** Same cashier session with mixed payment methods

**Steps:**

1. **Sale 1 (Cash):** Green Dress × 2 → Pay Cash → Receipt
2. "New Sale"
3. **Sale 2 (Terminal):** Blue Shirt × 1 → Pay Terminal → Confirm → Receipt
4. "New Sale"
5. **Sale 3 (Cash):** Green Dress × 1 → Pay Cash → Receipt
6. Backend verification:
   - Sale 1: `payment_method: "CASH"`, `payment_status: "paid"`, `channel: "offline"`
   - Sale 2: `payment_method: "TERMINAL"`, `payment_status: "paid"`, `terminal_transaction_id: ...`
   - Sale 3: `payment_method: "CASH"`, `payment_status: "paid"`
   - All have `source: "POS"` (not "ONLINE")
   - All have `cashier_id: [cashier]`
   - Stock decremented correctly for all

**Expected Results:**

- ✓ Both payment methods work in same session
- ✓ Orders saved with correct metadata
- ✓ Stock consistent across different payment types
- ✓ No interference between payment flows

---

## Test Suite 6: Stock & Inventory

### Test 6.1 - Stock Decrements on Cash Sale

**Objective:** Inventory decreases immediately for cash

**Steps:**

1. Check backend: "Green Dress" has stock=50
2. **At POS**, add Green Dress × 3 and pay cash
3. Immediately check database or backend endpoint
4. Verify Green Dress stock = 47

**Expected Results:**

- ✓ Stock decremented immediately on cash payment
- ✓ No pending state for stock

---

### Test 6.2 - Stock Held (Not Decremented) for Pending Terminal

**Objective:** Terminal payment doesn't decrement stock until confirmed

**Steps:**

1. Check backend: "Blue Shirt" stock=30
2. **At POS**, add Blue Shirt × 5, select Terminal
3. Order created with `payment_status: "pending"`
4. Immediately check database: stock should STILL be 30 (not 25)
5. Return to `/pos/payment/{orderId}`, confirm payment
6. Check database again: stock should now be 25

**Expected Results:**

- ✓ Stock not decremented for pending orders
- ✓ Stock decremented only after confirmation
- ✓ No race condition if terminal takes time to confirm

---

### Test 6.3 - Stock Prevents Overselling

**Objective:** Cannot complete sale if stock insufficient

**Steps:**

1. Product has stock=3
2. **At POS**, try to add qty=5
3. Verify error: "Only 3 in stock" (or similar)
4. Set qty=3
5. Complete sale successfully
6. Stock becomes 0
7. Product no longer appears in product search/list

**Expected Results:**

- ✓ UI prevents adding beyond stock
- ✓ Backend validates on order creation
- ✓ Out-of-stock products hidden from POS list

---

## Test Suite 7: Access Control & Role-Based Tests

### Test 7.1 - Cashier Access to POS

**Objective:** CASHIER role can access POS

**Steps:**

1. Log in as CASHIER (cashier@test.com)
2. Can access `/pos`
3. Can perform all POS actions
4. Can view `/pos/payment/{id}`
5. Can view `/pos/receipt/{id}`

**Expected Results:**

- ✓ All POS pages accessible
- ✓ No permission errors

---

### Test 7.2 - Admin Cannot Access Cashier POS

**Objective:** ADMIN role restricted from cashier interface (different UI)

**Steps:**

1. Log in as ADMIN
2. Navigate to `/pos`
3. Verify either:
   - Denied access with message, OR
   - Redirected to admin POS interface (different from cashier POS)

**Expected Results:**

- ✓ ADMIN has appropriate restrictions
- ✓ Cannot use cashier checkout flow

---

### Test 7.3 - Regular User Denied POS Access

**Objective:** USER role cannot access POS

**Steps:**

1. Log in as USER (user@test.com)
2. Navigate to `/pos`
3. Verify redirected or access denied
4. Message displayed: "Access Denied" or "Requires CASHIER role"

**Expected Results:**

- ✓ USER cannot access `/pos`
- ✓ Protected route works
- ✓ Clear error message

---

### Test 7.4 - Non-Authenticated User Denied POS

**Objective:** Unauthenticated users redirected

**Steps:**

1. Logout (clear auth token)
2. Navigate to `/pos`
3. Verify redirected to `/pos/login` or login page

**Expected Results:**

- ✓ Unauthenticated users cannot access POS
- ✓ Redirect to login works

---

## Test Suite 8: UI/UX & Usability

### Test 8.1 - Responsive Design

**Objective:** POS works on different screen sizes

**Steps:**

1. **On `/pos` main** with DevTools open
2. Test breakpoints:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
3. Verify layout adapts:
   - Products and cart stack properly
   - Buttons remain accessible
   - Text readable
   - Images scale

**Expected Results:**

- ✓ Layout responsive on all sizes
- ✓ Touch targets adequate for mobile (min 48px)
- ✓ No horizontal scrolling on mobile
- ✓ Performance acceptable

---

### Test 8.2 - Touch Interaction (Mobile)

**Objective:** POS usable on touch devices

**Steps:**

1. Test on actual tablet or mobile device (or DevTools mobile emulation)
2. Add product to cart (tap)
3. Modify quantity (+/- buttons)
4. Scroll product list
5. Scroll cart
6. Open checkout modal
7. All interactions should work without pinching/zooming

**Expected Results:**

- ✓ All taps register
- ✓ No accidental triggers
- ✓ Smooth scrolling
- ✓ No hover states required
- ✓ Works in portrait and landscape

---

### Test 8.3 - Error Message Display

**Objective:** Errors shown clearly to user

**Steps:**

1. Try adding beyond stock → Error message
2. Try network error (disable network) → Error message
3. Try terminal payment failure → Error message
4. Errors should:
   - Display prominently (toast, alert, or inline)
   - Be dismissible
   - Have clear action (Retry, Try Again, Cancel, etc.)
   - Not block other UI

**Expected Results:**

- ✓ All errors visible and readable
- ✓ Error messages actionable
- ✓ Recovery options provided
- ✓ No broken UI state

---

### Test 8.4 - Loading States

**Objective:** Loading feedback during API calls

**Steps:**

1. Add product to cart → instant (no loading needed)
2. Open checkout modal → might load order summary
3. Process cash payment → spinner shows while submitting
4. Process terminal payment → spinner shows while confirming
5. Load receipt page → spinner while fetching receipt data

**Expected Results:**

- ✓ Loading spinners display during operations
- ✓ Buttons disabled during processing
- ✓ User knows something is happening
- ✓ No frozen UI

---

### Test 8.5 - Keyboard Navigation

**Objective:** POS usable with keyboard

**Steps:**

1. Tab through product grid
2. Tab to add product button, press Enter
3. Tab to quantity controls, use +/- or arrow keys
4. Tab to Checkout, press Enter
5. Tab through payment method options
6. Tab to Confirm, press Enter

**Expected Results:**

- ✓ Tab order logical
- ✓ Focus visible
- ✓ Enter/Space activates buttons
- ✓ Fully keyboard accessible

---

## Test Suite 9: Browser Compatibility

### Test 9.1 - Chrome Latest

**Steps:**

1. Run all above tests in Chrome (latest version)
2. Monitor console for errors
3. Check performance

**Expected Results:**

- ✓ All tests pass
- ✓ No console errors
- ✓ Performance good

---

### Test 9.2 - Firefox Latest

**Steps:**

1. Run smoke tests in Firefox
   - POS login
   - Browse products
   - Add to cart
   - Cash sale
   - Terminal payment

**Expected Results:**

- ✓ All core flows work
- ✓ No critical errors

---

### Test 9.3 - Safari (if on Mac)

**Steps:**

1. Run smoke tests in Safari
   - Same as Firefox

**Expected Results:**

- ✓ Core flows work
- ✓ No Safari-specific issues

---

## Test Suite 10: Performance & Load

### Test 10.1 - Page Load Time

**Objective:** POS loads quickly

**Steps:**

1. Navigate to `/pos`
2. Check Time to Interactive (DevTools)
3. Should be < 2 seconds

**Expected Results:**

- ✓ Initial load < 2s
- ✓ Product grid renders < 3s
- ✓ Search response < 500ms

---

### Test 10.2 - Rapid Quantity Changes

**Objective:** No lag when rapidly changing quantities

**Steps:**

1. **On POS** with item in cart
2. Rapidly click +/- buttons 20+ times
3. Verify cart updates smoothly
4. Verify no lag or skipped updates

**Expected Results:**

- ✓ Smooth updates
- ✓ No dropped updates
- ✓ No console errors

---

### Test 10.3 - Large Product List

**Objective:** Performance with many products

**Steps:**

1. Ensure database has 200+ products
2. Navigate to `/pos`
3. Verify products load and search works
4. Type search term → filter response < 500ms

**Expected Results:**

- ✓ Large lists don't cause lag
- ✓ Search still responsive
- ✓ No memory leaks

---

## Integration Tests

### Integration Test 1 - Complete POS Session

**Objective:** Full realistic cashier shift scenario

**Scenario:** Simulate 5 consecutive sales

**Steps:**

1. **Cashier logs in** at `/pos/login`
2. **Sale 1 (Cash):**
   - Green Dress × 2, Blue Shirt × 1
   - Total: 119,000
   - Pay Cash
   - Receipt prints
3. "New Sale"
4. **Sale 2 (Terminal Success):**
   - Green Dress × 1
   - Total: 45,000
   - Pay Terminal
   - Confirm
   - Receipt prints
5. "New Sale"
6. **Sale 3 (Cash):**
   - Blue Shirt × 3
   - Total: 105,000
   - Pay Cash
   - Receipt prints
7. "New Sale"
8. **Sale 4 (Terminal Success):**
   - Green Dress × 2
   - Total: 90,000
   - Pay Terminal
   - Confirm
   - Receipt prints
9. "New Sale"
10. **Sale 5 (Cash):**
    - Blue Shirt × 2
    - Total: 70,000
    - Pay Cash
    - Receipt prints
11. **Verification:**
    - 5 orders exist in backend with correct data
    - Green Dress: 50 → 45 (5 sold)
    - Blue Shirt: 30 → 20 (10 sold)
    - All receipt numbers sequential
    - All payment statuses correct
    - No data corruption

**Expected Results:**

- ✓ All 5 sales complete successfully
- ✓ No errors or crashes
- ✓ Data integrity maintained
- ✓ Stock calculations correct
- ✓ Audit trail complete

---

## Sanity Checklist

### Must-Pass Items

```
☐ Online store still works (browse → cart → checkout)
☐ Cashier can login to POS
☐ Products display in POS with stock > 0
☐ Can add/remove items from cart
☐ Can modify quantities
☐ Cash payment completes immediately
☐ Terminal payment shows pending state
☐ Can confirm terminal payment
☐ Receipt displays after sale
☐ Receipt can print
☐ Stock decremented correctly
☐ Receipt number in correct format (RCP-YYYYMMDD-###)
☐ User role denied POS access
☐ No console errors during normal use
☐ Multiple sales without data loss
```

### Should-Pass Items (Non-Critical)

```
☐ Terminal payment fallback to cash (if implemented)
☐ Admin can view POS orders in admin panel
☐ Admin can adjust product stock
☐ Keyboard navigation works
☐ Mobile responsiveness acceptable
☐ Print styling correct
```

---

## Troubleshooting Guide

### Issue: "Cannot load products on POS"

**Solutions:**

1. Verify backend is running (`http://localhost:3000/api/health`)
2. Verify database has products with `active_for_pos: true` and `stock > 0`
3. Check browser console for network errors
4. Verify JWT token is valid (check localStorage)

### Issue: "Stock shows 0 even though I have inventory"

**Solutions:**

1. Check product `active_for_pos` field (must be true)
2. Check product `stock` field (must be > 0)
3. Refresh POS page to reload product list
4. Verify backend database updated correctly

### Issue: "Terminal payment stuck on pending"

**Solutions:**

1. Verify `.env` has `TERMINAL_MOCK_MODE=success`
2. Check backend console for errors
3. Verify order exists with `payment_status: "pending"`
4. Try refreshing browser (state may be stale)

### Issue: "Receipt page doesn't load"

**Solutions:**

1. Check orderId in URL is correct
2. Verify order exists in database
3. Check browser console for API errors
4. Verify JWT token still valid

### Issue: "Receiving 403 Forbidden on POS pages"

**Solutions:**

1. Verify logged in as CASHIER (check localStorage token)
2. Verify token not expired
3. Try logging out and logging back in
4. Check user role is CASHIER (not USER or other)

---

## Test Execution Summary

| Test Suite      | Tests  | Pass     | Fail     | Notes              |
| --------------- | ------ | -------- | -------- | ------------------ |
| Online Store    | 7      | \_\_     | \_\_     | Must not break     |
| POS Cashier     | 9      | \_\_     | \_\_     | Core functionality |
| Cash Sales      | 4      | \_\_     | \_\_     | Payment flow       |
| Terminal        | 5      | \_\_     | \_\_     | Pending + confirm  |
| Mixed Payments  | 1      | \_\_     | \_\_     | Integration        |
| Stock/Inventory | 3      | \_\_     | \_\_     | Safety checks      |
| Access Control  | 4      | \_\_     | \_\_     | Role enforcement   |
| UI/UX           | 5      | \_\_     | \_\_     | Usability          |
| Compatibility   | 3      | \_\_     | \_\_     | Browser support    |
| Performance     | 3      | \_\_     | \_\_     | Speed checks       |
| Integration     | 1      | \_\_     | \_\_     | Full scenario      |
| **TOTAL**       | **45** | **\_\_** | **\_\_** | **Date: \_\_\_**   |

---

## Sign-Off

**Frontend Tester Name:** **********\_\_\_**********

**Date Tested:** **********\_\_\_**********

**Bugs Found:** ☐ None ☐ Minor ☐ Major

**Ready for Release:** ☐ YES ☐ NO ☐ WITH CAVEATS

**Notes:**

---

---

---

---

**END OF FRONTEND TEST CHECKLIST**
