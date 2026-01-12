# Offline Shopping Admin Panel - Documentation

**Date:** January 3, 2026  
**Feature:** Admin Offline Shopping with Barcode/QR Code Scanning

---

## 📖 Overview

The Offline Shopping admin panel is a comprehensive tool for managing store inventory and processing customer purchases both online and offline. It combines all barcode/QR code features with a full inventory management system accessible from the admin dashboard.

### Key Features:

- ✅ **Barcode/QR Code Scanning** - Real-time product lookup
- ✅ **Inventory Management** - View and manage product stock
- ✅ **Shopping Cart** - Build orders with quantities
- ✅ **Offline Orders** - Save orders without internet
- ✅ **Receipt Printing** - Print purchase receipts
- ✅ **Product Management** - Add/remove products (admin only)
- ✅ **LocalStorage Sync** - Automatic offline data sync

---

## 🎯 Access & Navigation

### How to Access:

1. Login to admin panel: `/admin/login`
2. Click **"📱 Офлайн покупки"** in sidebar
3. Or navigate directly to: `/admin/offline-shopping`

### Who Can Access:

- ✅ ADMIN users
- ✅ SUPERADMIN users
- ✅ MANAGER users (if configured)

---

## 🔧 Features in Detail

### 1. Barcode/QR Code Scanner

**Button:** "📱 Сканировать штрихкод"

**How it works:**

1. Click scanner button
2. A modal appears with input field
3. Connect barcode scanner OR manually type product ID/SKU
4. Press Enter to scan
5. Product automatically added to cart

**Compatible Input Types:**

- Product ID (e.g., `gen-1`)
- Product SKU (e.g., `GD-001`)
- QR Code Data (e.g., JSON string)
- Barcode numbers (EAN-13, Code128, etc.)

**Hardware Support:**

- USB barcode scanners (keyboard emulation)
- Wireless barcode scanners
- Any device that emulates HID keyboard input

### 2. Product Search

**Search Field:** "Поиск по названию или SKU..."

**Features:**

- Real-time search across all products
- Case-insensitive matching
- Searches both name and SKU
- Shows availability status
- Quick "Add to Cart" button

**Example Searches:**

- `green` → Shows "Green Dress"
- `GD-001` → Shows products with that SKU
- `dress` → Shows all dress products

### 3. Product Grid

**View:** 2-column responsive grid

**For Each Product Shows:**

- Product name
- SKU code
- Price (in sum)
- Stock level
- Add to Cart button (disabled if out of stock)
- QR Code generator button (on hover)

**Quick Actions:**

- Click product → Add to cart
- Hover & click 🔲 → Generate QR code
- Out of stock → Button disabled with message

### 4. Shopping Cart

**Location:** Right sidebar (sticky)

**Cart Features:**

- Real-time item count
- Product list with prices
- Quantity controls (+ / −)
- Remove item button (✕)
- Running total calculation
- Three action buttons

**Cart Persistence:**

- Saved to browser LocalStorage
- Survives page refresh
- Auto-loads on next visit
- Cleared only when user clears it

**Action Buttons:**

| Button              | Function              | Result                              |
| ------------------- | --------------------- | ----------------------------------- |
| ✓ Сохранить оффлайн | Save as offline order | Stored in localStorage, awaits sync |
| 🖨️ Печать квитанции | Print receipt         | Opens print dialog                  |
| 🗑️ Очистить корзину | Clear cart            | Removes all items                   |

### 5. Offline Orders Management

**Storage Location:** `localStorage.offlineOrders`

**Offline Order Structure:**

```json
{
  "id": 1704283800000,
  "createdAt": "2026-01-03T14:30:00Z",
  "items": [
    {
      "id": "gen-1",
      "name": "Green Dress",
      "sku": "GD-001",
      "price": 45000,
      "quantity": 2
    }
  ],
  "total": 90000,
  "operator": "admin@sadia.lux",
  "status": "PENDING_SYNC"
}
```

**What Happens:**

1. User clicks "✓ Сохранить оффлайн"
2. Cart saved to localStorage as new order
3. Cart cleared for new transaction
4. Alert confirms: "Заказ сохранен оффлайн"
5. When internet returns, orders sync automatically

**Accessing Saved Orders:**

```javascript
// In browser console
const orders = JSON.parse(localStorage.getItem("offlineOrders"));
console.log(orders);
```

### 6. Receipt Printing

**Button:** 🖨️ Печать квитанция

**Print Output Includes:**

- Store name: "SADIA.LUX - КВИТАНЦИЯ ОФЛАЙН ПОКУПОК"
- Current date and time
- Operator email
- Item-by-item breakdown:
  - Product name
  - SKU
  - Quantity × Price = Subtotal
- **TOTAL** (sum for entire order)
- Total item count

**Print Example:**

```
SADIA.LUX - КВИТАНЦИЯ ОФЛАЙН ПОКУПОК
=====================================
Дата: 3/1/2026, 2:30:00 PM
Оператор: admin@sadia.lux

ТОВАРЫ:
  Green Dress
  SKU: GD-001
  Кол-во: 2 x 45000 = 90000 сум

=====================================
ИТОГО: 90000 сум
Товаров: 2
=====================================
```

### 7. QR Code Generation

**Access:** Hover over product card, click 🔲 button

**Modal Opens With:**

- Product information
- Format selection radio buttons
- "Generate & Print" button

**Format Options:**

1. **Image Only** - Pure QR code image
2. **With Details** - QR + product information

**What Happens:**

1. Click "Generate & Print"
2. Backend generates QR code
3. Print dialog opens automatically
4. User can print or preview
5. Can cut out and apply to product

**Generated QR Code Contains:**

```json
{
  "type": "PRODUCT",
  "productId": "gen-1",
  "name": "Green Dress",
  "sku": "GD-001",
  "price": 45000,
  "timestamp": "2026-01-03T14:30:00Z"
}
```

### 8. Admin Product Management (ADMIN+ ONLY)

**Section:** "⚙️ Управление товарами" (Red bordered section)

**Features:**

- List of all products
- Quick remove button on each
- Two removal methods available

**Removal Methods:**

1. **Deactivate (Безопасно)**

   - Hides from POS but keeps data
   - Product still in database
   - Can be restored easily
   - Safe for testing

2. **Delete (Необратимо)**
   - Permanently removes product
   - Cannot be restored
   - Removes from database
   - Use with caution

**Removal Process:**

1. Click "Удалить" button on product
2. Dialog appears with method selection
3. Choose deactivate or delete
4. Confirm removal
5. Product removed, page refreshes

---

## 🛒 Cart Management

### Adding Items

**Methods:**

1. **Barcode Scan** - Scan barcode, auto-add with qty 1
2. **Search & Click** - Search product, click "Add to Cart"
3. **Manual Selection** - Browse grid, click product

**Default Quantity:** 1 item

**Duplicate Products:** Quantity increases (no duplicate items)

### Modifying Quantities

**Controls:**

- **+** button → Increase quantity by 1
- **−** button → Decrease quantity by 1
- Press **✕** → Remove entire item

**Constraints:**

- Minimum quantity: 1
- Maximum quantity: Unlimited
- Auto-remove if quantity drops to 0

### Calculating Totals

**Formula:**

```
Total = Σ(Product Price × Quantity)
Item Count = Σ(Quantities)
```

**Example:**

```
Green Dress: 45,000 × 2 = 90,000
Black Shirt: 35,000 × 1 = 35,000
─────────────────────────────────
TOTAL: 125,000 sum
Items: 3
```

---

## 🔄 Offline Workflow

### Scenario: No Internet

**Situation:**

- Barcode scanner connected
- POS terminal without WiFi
- Need to process sales

**Process:**

1. **Create Order**

   - Use barcode scanner to add products
   - Or manually search and select
   - Adjust quantities

2. **Save Offline**

   - Click "✓ Сохранить оффлайн"
   - Order saved to device storage
   - Cart clears for next customer

3. **Continue Working**

   - Process more customers offline
   - All orders stored locally
   - Can work indefinitely offline

4. **Internet Returns**
   - Orders sync automatically
   - (Requires backend sync endpoint)
   - Status changes from PENDING_SYNC to SYNCED

### Storage:

- **Cart:** `localStorage.offlineCart`
- **Orders:** `localStorage.offlineOrders`

### Sync (Future Phase):

Backend endpoint: `POST /api/sync/offline-orders`

- Sends all pending orders
- Marks as synced
- Clears local cache

---

## 🎨 UI/UX Details

### Layout

**3-Column Layout (Desktop):**

```
[Sidebar 64px] [Main Content 2/3] [Cart 1/3]
```

**Responsive Breakpoints:**

- Mobile: 1 column (main content full width, cart below)
- Tablet: 2 columns (content + cart side by side)
- Desktop: 3 columns (sidebar + content + cart)

### Color Scheme

| Element         | Color  | Meaning                      |
| --------------- | ------ | ---------------------------- |
| Primary Buttons | Blue   | Standard actions             |
| Success Buttons | Green  | Positive actions (add, save) |
| Warning Buttons | Red    | Dangerous actions (delete)   |
| Info Buttons    | Yellow | Secondary actions            |

### Dark Mode Support

- Full dark mode support with `dark:` classes
- Automatic theme based on system preference
- Can be toggled per-user setting

### Accessibility

- All buttons have clear labels
- Icons + text for clarity
- Keyboard navigation supported
- Screen reader friendly
- Color not only indicator

---

## 📱 Mobile Experience

### Phone Layout (< 768px)

- Single column
- Sidebar hidden (menu button in header)
- Cart displayed below products
- Full-width input fields
- Large touch targets (44px minimum)

### Tablet Layout (768px - 1024px)

- Two columns
- Sidebar still visible but narrower
- Cart and products side by side
- Compact buttons

### Desktop Layout (> 1024px)

- Three columns (sidebar, main, cart)
- Cart sticky to viewport
- Horizontal product grid (2 columns)
- Full feature set visible

---

## 🔐 Security & Permissions

### Access Control

**ADMIN/SUPERADMIN:**

- ✅ View all products
- ✅ Scan/add products
- ✅ Create offline orders
- ✅ Print receipts
- ✅ Remove products (deactivate/delete)
- ✅ Generate QR codes

**Other Roles:**

- ❌ Cannot access offline shopping
- ❌ Cannot remove products
- ❌ Cannot view this page

### Data Security

- All data stored locally (no external sync by default)
- No sensitive data in cart/orders
- Product IDs and prices only
- User email logged for audit trail
- Timestamps for all operations

### Best Practices

1. **Don't Store Sensitive Data**

   - Avoid payment information
   - Don't include customer personal data
   - Use product IDs not names for serialization

2. **Audit Trail**

   - Operator email captured
   - Timestamps on all orders
   - Removals logged with method
   - User identifiable if needed

3. **Data Validation**
   - All inputs validated
   - Stock levels checked
   - Product existence verified
   - Quantities must be positive

---

## 🧪 Testing Guide

### Test Case 1: Add Product by Barcode

**Steps:**

1. Navigate to offline shopping
2. Click "📱 Сканировать штрихкод"
3. Type: `gen-1`
4. Press Enter

**Expected:**

- Green Dress found
- Quantity = 1
- Added to cart
- Success message shown

### Test Case 2: Search & Add Multiple

**Steps:**

1. In search box type: `dress`
2. See results
3. Click "Add to Cart" on Green Dress
4. Click "Add to Cart" on another dress

**Expected:**

- Multiple dresses in cart
- Cart count updated
- Prices summed correctly

### Test Case 3: Modify Quantities

**Steps:**

1. Add product to cart
2. Click + button 3 times
3. Cart shows quantity 4
4. Total updated

**Expected:**

- Quantity increases
- Total recalculates
- ✓ Price × 4 = correct total

### Test Case 4: Remove Product

**Steps:**

1. Add product to cart
2. Click ✕ button
3. Confirm removal

**Expected:**

- Product removed
- Cart count decreases
- Total recalculated
- No items shown if last item removed

### Test Case 5: Save Offline Order

**Steps:**

1. Add items to cart
2. Click "✓ Сохранить оффлайн"
3. Confirm alert
4. Open DevTools > Application > LocalStorage

**Expected:**

- Cart saved to localStorage
- New item in offlineOrders array
- Cart cleared for next order
- Order has timestamp and operator

### Test Case 6: Print Receipt

**Steps:**

1. Add items to cart
2. Click "🖨️ Печать квитанция"
3. Print dialog opens

**Expected:**

- Dialog shows formatted receipt
- All items listed
- Correct totals
- Can preview or print

### Test Case 7: Generate QR Code

**Steps:**

1. Hover over product card
2. Click 🔲 button
3. Select format
4. Click "Generate & Print"

**Expected:**

- QR code generated
- Print dialog opens
- Shows QR image
- Can be printed/saved as PDF

### Test Case 8: Remove Product (Admin)

**Steps (Admin Only):**

1. Scroll to "⚙️ Управление товарами"
2. Click "Удалить" on product
3. Select deactivate
4. Confirm

**Expected:**

- Dialog closes
- Product removed from list
- Alert confirms removal
- Page refreshes

---

## 🐛 Troubleshooting

### Issue: Barcode Not Scanning

**Solution:**

1. Check scanner USB connection
2. Verify keyboard mode enabled on scanner
3. Test in Notepad (scanner should type)
4. Try manual entry: type product ID + Enter

### Issue: Cart Empty After Refresh

**Solution:**

1. Check localStorage is not cleared
2. No private/incognito mode?
3. Browser storage size not exceeded
4. Check browser storage settings

### Issue: QR Code Won't Print

**Solution:**

1. Check printer is connected and online
2. Try print preview first
3. Check browser print settings
4. Try saving as PDF instead

### Issue: Product Not Found When Scanning

**Solution:**

1. Verify product exists in inventory
2. Check product has `stock > 0`
3. Product not deactivated?
4. Check SKU/ID spelling
5. Product might be deleted

### Issue: Cannot Remove Product

**Solution:**

1. Verify you're logged in as ADMIN
2. Check product exists
3. Try deactivate first (safer)
4. Check browser console for errors

### Issue: Slow Performance with Many Products

**Solution:**

1. Use search to filter products
2. Pagination could be added (future phase)
3. Clear old offline orders from storage
4. Refresh page to reset search

---

## 🔄 Data Flow

### Adding Product via Barcode

```
Scanner/Manual Input
        ↓
QRCodeScanner Component
        ↓
posService.scanBarcode()
        ↓
POST /api/pos/qrcode/scan
        ↓
Backend finds product by ID/SKU/QR data
        ↓
Returns product details
        ↓
Frontend adds to cart
        ↓
localStorage.offlineCart updated
        ↓
Cart renders with new item
```

### Generating QR Code

```
Click 🔲 on product
        ↓
Show QRCodeGenerator Modal
        ↓
Click Generate & Print
        ↓
posService.generateQRCode(productId)
        ↓
GET /api/pos/qrcode?productId=...
        ↓
Backend generates QR image
        ↓
Returns as PNG data URL
        ↓
Frontend renders in modal
        ↓
window.print() opens print dialog
        ↓
User prints or saves as PDF
```

### Saving Offline Order

```
Click "✓ Сохранить оффлайн"
        ↓
Cart saved to offlineOrders array
        ↓
localStorage.offlineOrders = JSON
        ↓
Order given unique ID (timestamp)
        ↓
Operator email captured
        ↓
Cart cleared (reset to [])
        ↓
Ready for next customer
        ↓
(Later) POST /api/sync/offline-orders
        ↓
Orders synced to backend
        ↓
Status updated to SYNCED
```

---

## 📊 API Endpoints Used

### Barcode Scanning

```
POST /api/pos/qrcode/scan
Body: { barcode: "product_id|sku|qr_data" }
Response: { success: true, product: { ... } }
```

### QR Code Generation

```
GET /api/pos/qrcode?productId=ID&format=image|json
Response: { success: true, qrCode: "data:image/png;base64,..." }
```

### Product Removal

```
DELETE /api/pos/products/:id/remove?method=deactivate|delete
Response: { success: true, message: "Product removed" }
```

### Get All Products

```
GET /api/admin/products
Response: { success: true, data: [ ... ] }
```

---

## 🚀 Performance Tips

### For Admins:

1. **Use Barcode Scanner** - Faster than typing
2. **Use Search** - Filter grid before clicking
3. **Batch Removals** - Remove multiple at once (future)
4. **Clear Old Orders** - Periodically clear localStorage offlineOrders
5. **Offline Mode** - Turn off internet for faster scanning

### For Developers:

1. **Lazy Load Images** - Add to product grid
2. **Virtual Scrolling** - For large product lists
3. **Batch API Calls** - Group product fetches
4. **Cache Strategies** - Use React Query caching
5. **Worker Sync** - Background worker for order sync

---

## 📝 Future Enhancements (Phase 6)

- [ ] Bulk product removal
- [ ] Batch QR code printing
- [ ] Order history viewing
- [ ] Inventory counting
- [ ] Receipt templates
- [ ] Multiple payment methods
- [ ] Customer profiles
- [ ] Discount/coupon application
- [ ] Export to Excel
- [ ] Mobile app version

---

## 📚 Related Documentation

- [PHASE5_BARCODE_QR.md](./PHASE5_BARCODE_QR.md) - QR code technical specs
- [BARCODE_INSTALLATION.md](../BARCODE_INSTALLATION.md) - Installation guide
- [PHASE5_SUMMARY.md](../PHASE5_SUMMARY.md) - Feature overview
- [README-START.md](../README-START.md) - Getting started guide

---

## 📞 Support

### Common Questions

**Q: Can I use without internet?**
A: Yes! All features work offline. Orders sync when internet returns.

**Q: How many items can cart hold?**
A: Unlimited. Only limited by browser storage size (~5-10MB).

**Q: Can customers use this?**
A: No, this is admin-only. Customers use the public shop.

**Q: Where are offline orders stored?**
A: In browser LocalStorage. Device-specific, not synced.

**Q: Can I backup offline orders?**
A: Yes, export from DevTools > Application > LocalStorage.

---

**Status:** ✅ Complete  
**Last Updated:** January 3, 2026  
**Version:** 1.0.0
