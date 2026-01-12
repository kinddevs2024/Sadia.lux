# Offline POS System - Frontend Discovery & Plan

**Date:** January 3, 2025  
**Status:** Phase 0 - Discovery Complete

## Current Frontend State

### 1. Project Setup

**Framework:** Vite + React 18  
**Package.json:** `src/` structure (non-TypeScript, JSX)  
**State Management:** React Context (AuthContext, CartContext, TranslationContext)  
**API Client:** Axios with interceptors for JWT auth  
**Router:** React Router v6

**Key Libraries:**

- React Router DOM v6
- Axios for HTTP
- React Hook Form for forms
- TailwindCSS for styling
- Material-UI components
- Framer Motion for animations

### 2. Routing Structure (src/router.jsx)

**Current Routes:**

```
PUBLIC:
  /               → Home
  /shop           → Shop
  /product/:id    → Product detail
  /cart           → Cart
  /checkout       → Checkout
  /about          → About
  /contact        → Contact

USER:
  /user/login     → UserLogin
  /user/register  → UserRegister
  /user/profile   → UserProfile

ADMIN:
  /admin/login    → AdminLogin
  /admin          → AdminDashboard
  /admin/products → AdminProducts
  /admin/inventory → AdminInventory
  /admin/orders   → AdminOrders
  /admin/analytics → AdminAnalytics
  /admin/support  → AdminSupport
  /admin/reviews  → AdminReviews
  /admin/users    → AdminUsers
  /admin/coupons  → AdminCoupons
  /admin/exchanges → AdminExchanges
  /admin/database → AdminDatabase
  /admin/categories → AdminCategories
  /admin/product-images → AdminProductImages
  /admin/newsletter → AdminNewsletter

POS (BASIC - EXISTS):
  /pos/login      → POSLogin
  /pos            → POSMain
  /pos/payment    → POSPayment
```

**Status:** ✓ POS routes skeleton exists, needs full implementation

### 3. Authentication Context (src/context/AuthContext.jsx)

```javascript
const value = {
  user,
  loading,
  login,
  register,
  logout,
  isAuthenticated: !!user,
  isAdmin: user?.role === "ADMIN" || user?.role === "SUPERADMIN",
  isSuperAdmin: user?.role === "SUPERADMIN",
  isCashier:
    user?.role === "CASHIER" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPERADMIN",
};
```

**Status:** ✓ Already recognizes CASHIER role and provides `isCashier` flag

### 4. API Client (src/services/api.js)

```javascript
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://sadia-backend.vercel.app/api"
    : "http://localhost:3000/api");

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: adds Authorization header from localStorage.token
// Response interceptor: clears token on 401
```

**Status:** ✓ Ready for use, no changes needed

### 5. Service Layer Pattern (src/services/)

**Existing services:**

- `auth.service.js` - Login, register, logout, getCurrentUser
- `api.js` - Axios instance with interceptors
- `category.service.js` - CRUD for categories
- `coupon.service.js` - Coupon management
- `database.service.js` - Database operations
- `exchange.service.js` - Exchange requests
- `inventory.service.js` - Inventory CRUD
- ...more

**Pattern:** Service module exports functions that use `api` client

```javascript
// Example: category.service.js
export const categoryService = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};
```

**Status:** ✓ Pattern established, will create `pos.service.js` following same style

### 6. Admin Panel Structure (src/pages/Admin/)

**Admin Components:**

- `Dashboard.jsx` - Overview
- `Products.jsx` - Product listing & CRUD
- `Inventory.jsx` - Size-based inventory management
- `Orders.jsx` - Online orders list
- `Analytics.jsx` - Sales metrics
- `Support.jsx` - Customer messages
- `Reviews.jsx` - Product reviews
- `Users.jsx` - User management
- `Coupons.jsx` - Coupon CRUD
- `Exchanges.jsx` - Exchange requests
- `Database.jsx` - Database operations
- `Categories.jsx` - Category management
- `ProductImages.jsx` - Image management
- `Newsletter.jsx` - Newsletter subscribers
- `Login.jsx` - Admin login

**Admin Layout:** `src/components/admin/AdminLayout.jsx`

**Status:**

- ✓ Admin panel is comprehensive
- Need to ADD: "POS Products" and "POS Orders" management sections

### 7. POS Existing Components (src/pages/pos/)

**Current files:**

- `Login.jsx` - POS cashier login
- `Main.jsx` - Main POS screen (SKELETON)
- `Payment.jsx` - Payment screen (SKELETON)

**POS Layout:** `src/components/pos/POSLayout.jsx`

**Status:**

- Skeleton exists
- Need full implementation:
  - Product search/grid
  - Shopping cart
  - Checkout flow with payment methods
  - Receipt printing

### 8. Component Structure (src/components/)

**Directories:**

- `admin/` - Admin-specific components (only AdminLayout.jsx exists)
- `pos/` - POS-specific components (POSLayout.jsx exists)
- `public/` - Public page components
- `shared/` - Reusable components (ProtectedRoute, etc.)

**Status:** Modular structure in place, ready to extend

### 9. Context Hooks Pattern

All contexts follow standard pattern:

```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

**Status:** ✓ Ready to use throughout components

### 10. Cart Context (src/context/CartContext.jsx)

**Status:** Exists for online shopping, can reuse or create separate POSCart context

---

## Phase 3 Implementation Plan

### New Components Needed

#### 1. POS Main Screen (`/src/pages/pos/Main.jsx`)

```
Layout:
  Left side: Product search & grid
  Right side: Shopping cart + checkout

Features:
  - Search input (by name/sku)
  - Product grid/list
  - Add to cart button
  - Cart display with:
    - Item list (name, qty, price, subtotal)
    - +/- qty buttons
    - Remove button
    - Subtotal & tax calculation
  - "Proceed to Checkout" button
  - Real-time stock display
```

#### 2. POS Checkout Modal (`/src/components/pos/CheckoutModal.jsx`)

```
Features:
  - Order review
  - Payment method selection:
    * Cash (instant paid)
    * Terminal (pending → confirm)
  - Submit button
  - Error/loading states
  - Success confirmation with receipt button
```

#### 3. Terminal Payment Form (`/src/components/pos/TerminalPayment.jsx`)

```
Features:
  - Show payment status (pending)
  - "Confirm Payment" button
  - Mock terminal display
  - Error retry logic
  - Timeout handling
```

#### 4. Receipt Component (`/src/pages/pos/Receipt.jsx`)

```
Features:
  - Print-friendly layout
  - Receipt details:
    * Receipt number
    * Order date/time
    * Cashier name
    * Items with qty & price
    * Subtotal, tax, total
    * Payment method & status
  - Print button (window.print())
  - Download as PDF (optional)
```

#### 5. Admin POS Management (`/src/pages/Admin/POSManagement.jsx`)

```
Subsections:
  a) POS Products Tab
     - Product list filtered for POS
     - Stock quantity edit inline
     - Active for POS toggle
     - Price quick edit
     - Search

  b) POS Orders Tab
     - Orders list (source='offline')
     - Filters: date range, cashier, status
     - Order detail modal
     - Receipt view/print
```

### New Service File

**`src/services/pos.service.js`**

```javascript
export const posService = {
  // Orders
  getOrders: (filters) => api.get("/pos/orders", { params: filters }),
  createOrder: (data) => api.post("/pos/orders", data),
  getOrder: (id) => api.get(`/pos/orders/${id}`),
  getReceiptData: (id) => api.get(`/pos/orders/${id}/receipt-data`),

  // Products
  getProducts: (search) => api.get("/pos/products", { params: { search } }),

  // Payments
  confirmPayment: (transactionId) =>
    api.post("/pos/payments/confirm", { transactionId }),
};
```

### Routes to Add (router.jsx)

```javascript
// POS
/pos                    → POSMain (full cashier mode)
/pos/orders             → POSOrdersList (for admin/cashier to view)
/pos/receipt/:orderId   → ReceiptPrintable
```

### Styling Strategy

- **Reuse existing:** TailwindCSS, Material-UI where used
- **POS-specific styles:** Create `src/pages/pos/POS.css` or inline Tailwind
- **Responsive:** Ensure POS works on tablets (landscape preferred for cashier terminals)
- **Theme:** Keep consistent with existing admin UI

---

## Implementation Approach

### Step-by-Step

1. **Create `src/services/pos.service.js`**
   - Simple API wrapper functions
2. **Implement `/pos` Main Component** (`src/pages/pos/Main.jsx`)
   - Product search & grid
   - Cart state management (local useState or CartContext)
   - Cart UI panel
   - Add/remove/qty actions
   - Checkout trigger
3. **Implement CheckoutModal** (`src/components/pos/CheckoutModal.jsx`)
   - Payment method selection
   - Cash vs Terminal UI branches
   - Submit to backend
   - Handle success/error
4. **Implement Terminal Payment** (`src/components/pos/TerminalPayment.jsx`)
   - Show pending status
   - Confirm button
   - Mock terminal behavior
   - Status polling or manual confirm
5. **Implement Receipt** (`src/pages/pos/Receipt.jsx`)
   - Fetch receipt data from backend
   - Print-friendly template
   - Print button
6. **Implement Admin POS Section** (`src/pages/Admin/POSManagement.jsx`)
   - Two tabs: Products & Orders
   - Reuse existing admin patterns
7. **Update Router** (`src/router.jsx`)
   - Add new POS routes
   - Ensure role-based access

---

## State Management Decision

**Recommendation:** Use local `useState` for POS cart (isolated session), NOT CartContext

**Reason:**

- POS is cashier-focused (single terminal session)
- Online store uses CartContext (multi-user shopping)
- Separation prevents confusion and data conflicts

**POS Cart State Structure:**

```javascript
const [cart, setCart] = useState([
  {
    productId: "gen-1",
    product: { name: "...", price: 100 },
    quantity: 2,
    subtotal: 200,
  },
]);
```

---

## Testing Considerations

- Test on desktop (normal resolution)
- Test on tablet (landscape, common for POS terminals)
- Mock API responses for development
- Verify stock updates after POS checkout
- Verify online checkout still works (separate from POS)

---

## Files to Create/Modify

### Create

1. `src/services/pos.service.js`
2. `src/pages/pos/Main.jsx`
3. `src/pages/pos/Receipt.jsx`
4. `src/components/pos/CheckoutModal.jsx`
5. `src/components/pos/TerminalPayment.jsx`
6. `src/pages/Admin/POSManagement.jsx`
7. `src/pages/pos/POS.css` (if needed for custom styles)

### Modify

1. `src/router.jsx` - Add /pos/orders and /pos/receipt/:orderId routes
2. `src/pages/pos/Main.jsx` - Full implementation from skeleton
3. `src/pages/pos/Payment.jsx` - Integrate with main flow

---

## Next Steps

1. ✓ Phase 0: Discovery (COMPLETED)
2. → Phase 1: Define requirements
3. → Phase 2: Implement backend
4. → Phase 3: Implement frontend
5. → Phase 4: Test
