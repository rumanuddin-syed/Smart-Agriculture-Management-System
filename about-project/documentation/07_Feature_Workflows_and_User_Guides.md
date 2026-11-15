# FEATURE WORKFLOWS & USER INTERACTION GUIDES

This document provides user interaction guides, role permissions, and operational procedures for all platform features.

---

## 1. User Roles & Permission Matrix

| Feature / Action | Anonymous / Guest | Consumer (`consumer`) | Farmer (`farmer`) | Administrator (`admin`) |
|---|:---:|:---:|:---:|:---:|
| View Landing Page & Marketing Info | ✅ | ✅ | ✅ | ✅ |
| Browse Marketplace Products | ✅ | ✅ | ✅ | ✅ |
| View Public Farmer Profiles & Story | ✅ | ✅ | ✅ | ✅ |
| View Disease Advisory Knowledge Base | ✅ | ✅ | ✅ | ✅ |
| Use Soil Crop Recommendation Tool | ✅ | ✅ | ✅ | ✅ |
| Use Leaf Disease Detection Tool | ✅ | ✅ | ✅ | ✅ |
| Search Nearby Stores on Map | ✅ | ✅ | ✅ | ✅ |
| Add Products to Shopping Cart | ✅ | ✅ | ✅ | ✅ |
| Execute Multi-Farmer Checkout | ❌ (Prompts Login) | ✅ | ✅ | ✅ |
| Upload Demo Payment Screenshot | ❌ | ✅ | ❌ | ✅ |
| Cancel Eligible Orders | ❌ | ✅ | ❌ | ✅ |
| Publish New Produce Listings | ❌ | ❌ | ✅ | ✅ |
| Edit Prices & Stock Quantities | ❌ | ❌ | ✅ | ✅ |
| Review Payment Proofs | ❌ | ❌ | ✅ | ✅ |
| Update Order Fulfillment Stages | ❌ | ❌ | ✅ | ✅ |
| Log Cultivation Input Expenses | ❌ | ❌ | ✅ | ✅ |
| View P&L Ledger & Analytics | ❌ | ❌ | ✅ | ✅ |

---

## 2. Core User Guides

### 2.1 Guide 1: Leaf Disease Diagnosis & Pathology Advisory
1. Navigate to `/disease-detection`.
2. Drag and drop or browse to select a clear photograph of an infected or healthy plant leaf (JPG/PNG).
3. Click **"Run Diagnostic Pipeline"**.
4. The system executes the 6-stage neural pipeline:
   - If blurry or poorly illuminated $\to$ Prompts with `RETAKE` advice.
   - If healthy $\to$ Displays green confirmation with crop identification.
   - If diseased $\to$ Displays identified condition, calibrated diagnostic confidence, top-3 differential diagnoses, symptoms, preventive precautions, approved chemical remedies, and verified organic botanical treatments.
5. Diagnosis is automatically appended to the user's persistent consultation log (`/history`).

### 2.2 Guide 2: Soil-Based Crop Recommendation
1. Navigate to `/crop-recommendation`.
2. Enter laboratory or soil-sensor readings:
   - Soil macronutrients: Nitrogen ($N$), Phosphorus ($P$), Potassium ($K$)
   - Environmental factors: Ambient Temperature ($^{\circ}\text{C}$), Humidity ($\%$), Rainfall ($\text{mm}$)
   - Soil Reaction: pH value ($0-14$)
3. Click **"Analyze Soil & Recommend Crop"**.
4. The Random Forest model evaluates the 7-dimensional input against agronomic suitability thresholds and returns the recommended crop (e.g., Rice, Chickpea, Cotton, Watermelon) along with cultivation guidelines.

### 2.3 Guide 3: Consumer Direct Purchase & Payment Verification
1. Navigate to `/marketplace`.
2. Browse products or use category filters (`Vegetables`, `Fruits`, `Grains & Cereals`, `Pulses`, `Spices`, `Dairy`) or check the **"🌿 100% Organic Only"** toggle.
3. Click **"Add to Shopping Cart"**.
4. Open `/cart`. The cart automatically groups produce items by producer with individual farm subtotals.
5. Provide shipping details (Full Name, Phone, Street, City, State, PIN code) and select **"Local Delivery"** or **"Farm Pickup"**.
6. Click **"Place Multi-Farmer Order"**.
7. The consumer is redirected to the order detail view (`/consumer/orders/:orderId`) where simulated payment details are provided.
8. The consumer uploads a mock UPI/banking payment confirmation screenshot. The suborder status transitions to `PROOF_SUBMITTED`.

### 2.4 Guide 4: Farmer Order Fulfillment & Payment Review
1. The farmer logs in and visits the **Farmer Hub** (`/farmer/orders`).
2. Incoming customer orders appear under the **"Proofs to Review"** tab.
3. The farmer clicks **"Inspect Payment Proof"** to open the modal and inspect the consumer's uploaded payment screenshot.
4. The farmer clicks **"Approve (Demo)"** or enters a rejection note (e.g., "Blurry screenshot") and clicks **"Reject Proof"**.
5. Upon approval, the order transitions to `ACCEPTED`.
6. As the harvest is prepared, the farmer progresses the status:
   $$\text{ACCEPTED} \longrightarrow \text{PROCESSING} \longrightarrow \text{READY\_FOR\_DISPATCH} \longrightarrow \text{DISPATCHED} \longrightarrow \text{DELIVERED}$$
7. Once marked `DELIVERED`, the order value is officially recognized in the farmer's sales revenue.

### 2.5 Guide 5: Cultivation Expenses & Profit/Loss Accounting
1. Navigate to `/farmer/expenses`.
2. Click **"Log Cultivation Cost"**.
3. Select an expense category (e.g., `Seeds`, `Fertilizers`, `Irrigation`, `Labour`, `Transport`, `Packaging`), specify amount in INR, associated crop, date, and description. Click **"Save Expense Record"**.
4. Navigate to `/farmer/profit-loss`.
5. The system dynamically computes:
   - **Recognized Sales Revenue**: Sum of suborders marked `DELIVERED`.
   - **Total Cultivation Expenses**: Sum of all recorded input expenses.
   - **Estimated Net Profit**: Recognized Sales Revenue $-$ Cultivation Expenses.
   - **Profit Margin**: $\left(\frac{\text{Estimated Net Profit}}{\text{Recognized Sales}}\right) \times 100\%$.
   - **Crop-wise Sales**: Breakdown of revenue and physical volume sold per harvest variety.
6. Click **"Export P&L CSV"** to download an auditable accounting spreadsheet.

