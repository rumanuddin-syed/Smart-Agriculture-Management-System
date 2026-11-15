# Frontend Features, Page Inventory & Role Permissions

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  
**UI Framework:** React 18.2.0 (`client/package.json:15`) + Vite 5.2.0 (`client/package.json:27`)  
**Styling & Icons:** Tailwind CSS 3.4.3 (`client/package.json:26`), Lucide React 0.370.0 (`client/package.json:14`), Leaflet 1.9.4 (`client/package.json:13`)  

---

## 1. Client Page Inventory & API Mapping

| Route Path | Component File | Access Guard | Primary Purpose | APIs Called |
|---|---|:---:|---|---|
| `/` | `client/src/pages/Home.jsx` | Public | Platform landing page, feature highlights, and call-to-actions | None |
| `/login` | `client/src/pages/Login.jsx` | Public | User authentication form with demo account quick-fill buttons | `POST /api/auth/login` (via AuthContext) |
| `/register` | `client/src/pages/Register.jsx` | Public | Account creation form with Farmer vs Consumer role selector | `POST /api/auth/register` (via AuthContext) |
| `/dashboard` | `client/src/pages/Dashboard.jsx` | Authenticated | Command center launcher for diagnostic tools and direct marketplace | None |
| `/crop-recommendation` | `client/src/pages/CropRecommendation.jsx` | Authenticated | 7-feature soil parameter form (N, P, K, temp, humidity, pH, rain) | `POST /api/crop-recommendation/recommend` |
| `/disease-detection` | `client/src/pages/DiseaseDetection.jsx` | Authenticated | Leaf image upload and multi-stage pathology diagnosis presentation | `POST /api/disease-detection/detect` |
| `/nearby` | `client/src/pages/NearbyServices.jsx` | Authenticated | Interactive GIS Leaflet map for finding nearby agricultural vendors | `GET /api/nearby` |
| `/history` | `client/src/pages/History.jsx` | Authenticated | User consultation history for soil recommendations and disease tests | `GET, DELETE /api/crop-recommendation/history/*`, `GET, DELETE /api/disease-detection/history/*` |
| `/profile` | `client/src/pages/Profile.jsx` | Authenticated | User account details and location settings editor | `PUT /api/auth/profile` |
| `/marketplace` | `client/src/pages/Marketplace.jsx` | Public | Paginated farm-direct catalog with category pills, organic filter, sorting | `GET /api/marketplace/products` |
| `/marketplace/product/:id` | `client/src/pages/ProductDetail.jsx` | Public | Product details, farm provenance card, stock availability, and cart add | `GET /api/marketplace/products/:id` |
| `/marketplace/farmers` | `client/src/pages/FarmersDirectory.jsx` | Public | Directory of verified grower profiles, farm locations, and crop varieties | `GET /api/marketplace/farmers` |
| `/marketplace/farmers/:farmerId` | `client/src/pages/FarmerProfileView.jsx` | Public | Public farm storefront showing estate bio and all items grown by this farmer | `GET /api/marketplace/farmers/:farmerId` |
| `/cart` | `client/src/pages/Cart.jsx` | Public / Auth | Grouped multi-farmer shopping cart and atomic checkout placement | `POST /api/marketplace/checkout` |
| `/consumer/orders` | `client/src/pages/ConsumerOrders.jsx` | Authenticated | Consumer order history list showing master checkouts and suborder states | `GET /api/marketplace/consumer/orders` |
| `/consumer/orders/:orderId` | `client/src/pages/OrderDetails.jsx` | Authenticated | Suborder status timeline, simulated payment upload modal, cancellation | `GET /api/marketplace/consumer/orders/:orderId`, `POST /api/marketplace/payment/upload-proof`, `POST /api/marketplace/consumer/suborders/:suborderId/cancel` |
| `/farmer/dashboard` | `client/src/pages/FarmerDashboard.jsx` | Farmer | Producer overview: active listings, pending orders, revenue metrics | `GET /api/marketplace/farmer/analytics`, `GET /api/marketplace/farmer/suborders` |
| `/farmer/products` | `client/src/pages/FarmerProducts.jsx` | Farmer | Produce inventory table with active/inactive status toggle and deletion | `GET /api/marketplace/farmer/products`, `PATCH /api/marketplace/farmer/products/:id/toggle`, `DELETE /api/marketplace/farmer/products/:id` |
| `/farmer/products/new` | `client/src/pages/ProductForm.jsx` | Farmer | Form to publish new agricultural produce with image uploads | `POST /api/marketplace/farmer/products` |
| `/farmer/products/edit/:id` | `client/src/pages/ProductForm.jsx` | Farmer | Form to edit existing produce pricing, stock, images, and descriptions | `GET /api/marketplace/products/:id`, `PUT /api/marketplace/farmer/products/:id` |
| `/farmer/orders` | `client/src/pages/FarmerOrders.jsx` | Farmer | Suborder fulfillment management, payment proof inspection modal | `GET /api/marketplace/farmer/suborders`, `POST /api/marketplace/farmer/payment/review/:proofId`, `PATCH /api/marketplace/farmer/suborders/:suborderId/status` |
| `/farmer/expenses` | `client/src/pages/CultivationExpenses.jsx` | Farmer | Input expense tracker (seeds, fertilizer, labor, irrigation) with receipts | `GET, POST, DELETE /api/marketplace/farmer/expenses` |
| `/farmer/profit-loss` | `client/src/pages/ProfitAndLoss.jsx` | Farmer | P&L accounting ledger (Revenue, Costs, Margin) with CSV export | `GET /api/marketplace/farmer/analytics` |
| `/farmer/profile` | `client/src/pages/FarmerSettingsProfile.jsx` | Farmer | Farm estate profile editor (name, bio, location, delivery options) | `GET, PUT /api/marketplace/farmer/profile` |

---

## 2. State Management Architecture & UI Libraries

### 2.1 State Management Approach
- **Global Authentication State:** `client/src/context/AuthContext.jsx`
  - Stores `user` object and `token` in React state.
  - Persists token in browser `localStorage.getItem('token')`.
  - Configures default Axios authorization header: `axios.defaults.headers.common['Authorization'] = 'Bearer ' + token` ([client/src/context/AuthContext.jsx:19](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/context/AuthContext.jsx#L19)).
- **Shopping Cart State:** `client/src/context/CartContext.jsx`
  - Manages multi-farmer items array `items: [{ product, quantity }]`.
  - Persists state in `localStorage.getItem('agri_cart')`.
  - Provides `addToCart(product, quantity)`, `removeFromCart(productId)`, `updateQuantity(productId, quantity)`, and `clearCart()`.
- **Local Component State:**
  - Standard React hooks: `useState`, `useEffect`, `useRef`, `useMemo`.
  - No external Redux, MobX, or Zustand libraries are used.

### 2.2 UI & Presentation Libraries
- **CSS Utility Framework:** Tailwind CSS 3.4.3 (`client/tailwind.config.js`) with custom green agricultural palette (`agri-emerald`, `agri-forest`, `agri-mint`, `agri-dark`, `agri-light`).
- **Icons:** Lucide React 0.370.0 (e.g., `Microscope`, `Leaf`, `ShoppingBag`, `Store`, `CheckCircle2`, `RefreshCw`, `AlertCircle`).
- **GIS Mapping:** Leaflet 1.9.4 and React-Leaflet 4.2.1 used in `client/src/pages/NearbyServices.jsx`.

---

## 3. Features Implemented per User Role

### 3.1 Consumer Features
- **Browse Marketplace Catalog:** Search, filter by category (`Vegetables`, `Fruits`, `Grains & Cereals`, `Pulses`, `Spices`, `Dairy`), filter 100% organic, sort by newest or price. Implemented in [client/src/pages/Marketplace.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Marketplace.jsx).
- **Public Farmer Profiles:** View cultivator profile, location, farming methods, and current produce listings. Implemented in [client/src/pages/FarmerProfileView.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerProfileView.jsx).
- **Multi-Farmer Cart & Checkout:** Adds items from different growers, displays independent farm subtotals, and places atomic checkout. Implemented in [client/src/pages/Cart.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Cart.jsx).
- **Simulated Payment Verification:** Uploads mock UPI/banking payment screenshot for farmer verification. Implemented in [client/src/pages/OrderDetails.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/OrderDetails.jsx).
- **Order Tracking & Cancellation:** Live timeline tracking and suborder cancellation before dispatch with automated stock restoration. Implemented in [client/src/pages/OrderDetails.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/OrderDetails.jsx).
- **AI Diagnostics:** Full access to soil crop recommendations and plant disease detection.

### 3.2 Farmer Features
- **Farmer Command Dashboard:** Overview of total sales, active listings, order statuses, and recent notifications. Implemented in [client/src/pages/FarmerDashboard.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerDashboard.jsx).
- **Produce Inventory CRUD:** Add, update, toggle active status, and delete crop listings with multiple image uploads. Implemented in [client/src/pages/FarmerProducts.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerProducts.jsx) and [client/src/pages/ProductForm.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ProductForm.jsx).
- **Payment Proof Inspection & Review:** Dedicated review modal to inspect consumer payment screenshot, approve (transitions status to `ACCEPTED`), or reject with feedback note. Implemented in [client/src/pages/FarmerOrders.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerOrders.jsx).
- **Fulfillment Pipeline Progression:** Stepwise transition of customer suborders: `ACCEPTED -> PROCESSING -> READY_FOR_DISPATCH -> DISPATCHED -> DELIVERED`. Implemented in [client/src/pages/FarmerOrders.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerOrders.jsx).
- **Cultivation Cost Accounting:** Categorized tracking of input expenses (seeds, fertilizers, pesticides, irrigation, labor, transport) with receipt attachments. Implemented in [client/src/pages/CultivationExpenses.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/CultivationExpenses.jsx).
- **Profit & Loss (P&L) Analytics:** Dynamic calculation of Net Profit (Delivered Sales minus Cultivation Expenses), profit margin percentages, crop-wise revenue, and CSV export. Implemented in [client/src/pages/ProfitAndLoss.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ProfitAndLoss.jsx).
- **Farm Profile Management:** Customization of farm bio, contact phone, delivery coverage, and pickup options. Implemented in [client/src/pages/FarmerSettingsProfile.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerSettingsProfile.jsx).

### 3.3 Administrator Features
- **Global Role Guard Privilege:** An account with role `'admin'` passes all farmer role checks in backend middleware (`req.user.role !== 'admin'` in [server/src/middleware/role.js:13](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/role.js#L13)) and frontend route protection (`user.role !== 'admin'` in [client/src/App.jsx:48](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/App.jsx#L48)).
- **Dedicated Admin UI / Management Pages:** **NOT AVAILABLE**  
  *Finding:* There are no standalone admin-specific UI routes (e.g. `/admin/users` or `/admin/system`) implemented in the codebase. Admin accounts operate as super-users across farmer and diagnostic tools.

