# Client Pages & Navigation Index for Screenshot Capture

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  
**Client Dev Server Base URL:** `http://localhost:5173` ([client/vite.config.js:8](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/vite.config.js#L8))  
**Route Definitions File:** [client/src/App.jsx:62-97](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/App.jsx#L62-L97)  

---

## 1. Public Pages (Accessible to All Users)

| # | Page Name | URL Path | Full Local URL | Implementing Component File |
|---|---|---|---|---|
| 1 | **Landing Page** | `/` | `http://localhost:5173/` | [client/src/pages/Home.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Home.jsx) |
| 2 | **User Login** | `/login` | `http://localhost:5173/login` | [client/src/pages/Login.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Login.jsx) |
| 3 | **User Registration** | `/register` | `http://localhost:5173/register` | [client/src/pages/Register.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Register.jsx) |
| 4 | **Marketplace Catalog** | `/marketplace` | `http://localhost:5173/marketplace` | [client/src/pages/Marketplace.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Marketplace.jsx) |
| 5 | **Product Detail** | `/marketplace/product/:id` | `http://localhost:5173/marketplace/product/<productId>` | [client/src/pages/ProductDetail.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ProductDetail.jsx) |
| 6 | **Farmers Directory** | `/marketplace/farmers` | `http://localhost:5173/marketplace/farmers` | [client/src/pages/FarmersDirectory.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmersDirectory.jsx) |
| 7 | **Public Farm Storefront** | `/marketplace/farmers/:farmerId` | `http://localhost:5173/marketplace/farmers/<farmerId>` | [client/src/pages/FarmerProfileView.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerProfileView.jsx) |
| 8 | **Shopping Cart & Checkout** | `/cart` | `http://localhost:5173/cart` | [client/src/pages/Cart.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Cart.jsx) |

---

## 2. Core Diagnostic & Account Pages (Authenticated Users)

| # | Page Name | URL Path | Full Local URL | Implementing Component File |
|---|---|---|---|---|
| 9 | **Main Dashboard** | `/dashboard` | `http://localhost:5173/dashboard` | [client/src/pages/Dashboard.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Dashboard.jsx) |
| 10 | **Crop Recommendation** | `/crop-recommendation` | `http://localhost:5173/crop-recommendation` | [client/src/pages/CropRecommendation.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/CropRecommendation.jsx) |
| 11 | **Disease Diagnosis Pipeline** | `/disease-detection` | `http://localhost:5173/disease-detection` | [client/src/pages/DiseaseDetection.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx) |
| 12 | **Nearby Agro-Services Map** | `/nearby` | `http://localhost:5173/nearby` | [client/src/pages/NearbyServices.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/NearbyServices.jsx) |
| 13 | **Consultation History** | `/history` | `http://localhost:5173/history` | [client/src/pages/History.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/History.jsx) |
| 14 | **User Account Settings** | `/profile` | `http://localhost:5173/profile` | [client/src/pages/Profile.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/Profile.jsx) |

---

## 3. Consumer Order Pages (Consumer / Admin Role)

| # | Page Name | URL Path | Full Local URL | Implementing Component File |
|---|---|---|---|---|
| 15 | **Consumer Orders List** | `/consumer/orders` | `http://localhost:5173/consumer/orders` | [client/src/pages/ConsumerOrders.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ConsumerOrders.jsx) |
| 16 | **Consumer Order Detail & Payment Upload** | `/consumer/orders/:orderId` | `http://localhost:5173/consumer/orders/<orderId>` | [client/src/pages/OrderDetails.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/OrderDetails.jsx) |

---

## 4. Farmer Business Suite Pages (Farmer / Admin Role)

| # | Page Name | URL Path | Full Local URL | Implementing Component File |
|---|---|---|---|---|
| 17 | **Farmer Dashboard** | `/farmer/dashboard` | `http://localhost:5173/farmer/dashboard` | [client/src/pages/FarmerDashboard.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerDashboard.jsx) |
| 18 | **Farmer Produce Inventory** | `/farmer/products` | `http://localhost:5173/farmer/products` | [client/src/pages/FarmerProducts.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerProducts.jsx) |
| 19 | **Create Produce Listing** | `/farmer/products/new` | `http://localhost:5173/farmer/products/new` | [client/src/pages/ProductForm.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ProductForm.jsx) |
| 20 | **Edit Produce Listing** | `/farmer/products/edit/:id` | `http://localhost:5173/farmer/products/edit/<productId>` | [client/src/pages/ProductForm.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ProductForm.jsx) |
| 21 | **Farmer Orders & Payment Review** | `/farmer/orders` | `http://localhost:5173/farmer/orders` | [client/src/pages/FarmerOrders.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerOrders.jsx) |
| 22 | **Cultivation Expenses Tracker** | `/farmer/expenses` | `http://localhost:5173/farmer/expenses` | [client/src/pages/CultivationExpenses.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/CultivationExpenses.jsx) |
| 23 | **Profit & Loss (P&L) Ledger** | `/farmer/profit-loss` | `http://localhost:5173/farmer/profit-loss` | [client/src/pages/ProfitAndLoss.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/ProfitAndLoss.jsx) |
| 24 | **Farmer Estate Settings** | `/farmer/profile` | `http://localhost:5173/farmer/profile` | [client/src/pages/FarmerSettingsProfile.jsx](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/FarmerSettingsProfile.jsx) |

