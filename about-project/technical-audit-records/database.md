# Database Architecture & Mongoose Schema Specifications

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  
**Database Driver:** Mongoose 8.3.1 (`server/src/config/db.js`)  

---

## 1. Mongoose Model Specifications

### 1.1 `User`
- **File & Definition:** [server/src/models/User.js:4-37](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/User.js#L4-L37)
- **Collection Name:** `users`
- **Fields:**
  - `name`: `String`, required `[true, 'Please provide your full name']`, `trim: true`
  - `email`: `String`, required `[true, 'Please provide an email address']`, `unique: true`, `lowercase: true`, `trim: true` (Unique Index)
  - `password`: `String`, required `[true, 'Please provide a password']`, `minlength: 6`
  - `phone`: `String`, `default: ''`
  - `role`: `String`, `enum: ['farmer', 'consumer', 'admin']`, `default: 'farmer'`
  - `location`:
    - `city`: `String`, `default: 'Green Valley'`
    - `state`: `String`, `default: 'Agricultural Region'`
    - `lat`: `Number`, `default: 20.5937`
    - `lng`: `Number`, `default: 78.9629`
  - Timestamps: `true` (`createdAt`, `updatedAt`)
- **Pre-Save Middleware:** [server/src/models/User.js:40-45](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/User.js#L40-L45) — Hashes password with `bcryptjs.genSalt(10)` if modified.
- **Instance Methods:** `comparePassword(enteredPassword)` via [server/src/models/User.js:48-50](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/User.js#L48-L50).

### 1.2 `FarmerProfile`
- **File & Definition:** [server/src/models/FarmerProfile.js:4-46](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/FarmerProfile.js#L4-L46)
- **Collection Name:** `farmerprofiles`
- **Fields:**
  - `farmerId`: `ObjectId`, `ref: 'User'`, `required: true`, `unique: true`, `index: true`
  - `farmName`: `String`, required `[true, 'Farm name is required']`, `trim: true`
  - `farmDescription`: `String`, `default: ''`, `trim: true`
  - `village`: `String`, `default: ''`, `trim: true`
  - `district`: `String`, required `[true, 'District is required']`, `trim: true`
  - `state`: `String`, required `[true, 'State is required']`, `trim: true`
  - `pincode`: `String`, required `[true, 'Pincode is required']`, `trim: true`
  - `contactPhone`: `String`, `default: ''`
  - `profileImage`: `String`, `default: ''`
  - `cropsCultivated`: `[String]`, `default: []`
  - `farmingMethod`: `String`, `enum: ['organic', 'conventional', 'natural', 'mixed']`, `default: 'organic'`
  - `deliveryAreas`: `[String]`, `default: []`
  - `pickupAvailable`: `Boolean`, `default: true`
  - `deliveryAvailable`: `Boolean`, `default: true`
  - Timestamps: `true`

### 1.3 `Product`
- **File & Definition:** [server/src/models/Product.js:3-75](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/Product.js#L3-L75)
- **Collection Name:** `products`
- **Fields:**
  - `farmerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `name`: `String`, required `[true, 'Product name is required']`, `trim: true`, `index: true`
  - `category`: `String`, `enum: ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses', 'Spices', 'Dairy', 'Other']`, required `[true, 'Category is required']`, `index: true`
  - `description`: `String`, `default: ''`, `trim: true`
  - `images`: `[String]`, `default: []`
  - `pricePerUnit`: `Number`, required `[true, 'Price per unit is required']`, `min: [0.01, 'Price must be greater than zero']`
  - `unit`: `String`, `enum: ['kg', 'gram', 'quintal', 'litre', 'piece', 'bundle']`, `default: 'kg'`
  - `stock`: `Number`, required `[true, 'Available stock is required']`, `min: [0, 'Stock cannot be negative']`, `index: true`
  - `minOrderQty`: `Number`, `default: 1`, `min: [1, 'Minimum order quantity must be at least 1']`
  - `maxOrderQty`: `Number`, `default: 1000`
  - `isOrganic`: `Boolean`, `default: false`, `index: true`
  - `farmingMethod`: `String`, `default: 'organic'`
  - `harvestDate`: `Date`
  - `freshnessDuration`: `String`, `default: '3-5 days'`
  - `location`:
    - `village`: `String`, `default: ''`
    - `district`: `String`, `default: ''`
    - `state`: `String`, `default: ''`
    - `pincode`: `String`, `default: ''`
  - `deliveryOptions`:
    - `pickup`: `Boolean`, `default: true`
    - `localDelivery`: `Boolean`, `default: true`
  - `status`: `String`, `enum: ['active', 'inactive', 'sold_out']`, `default: 'active'`, `index: true`
  - Timestamps: `true`

### 1.4 `CheckoutOrder`
- **File & Definition:** [server/src/models/CheckoutOrder.js:3-44](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/CheckoutOrder.js#L3-L44)
- **Collection Name:** `checkoutorders`
- **Fields:**
  - `orderNumber`: `String`, `required: true`, `unique: true`, `index: true`
  - `consumerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `deliveryAddress`:
    - `fullName`: `String`, `required: true`
    - `phone`: `String`, `required: true`
    - `street`: `String`, `required: true`
    - `city`: `String`, `required: true`
    - `district`: `String`, `default: ''`
    - `state`: `String`, `required: true`
    - `pincode`: `String`, `required: true`
  - `deliveryMethod`: `String`, `enum: ['delivery', 'pickup']`, `default: 'delivery'`
  - `grandTotal`: `Number`, `required: true`, `min: 0`
  - `suborders`: `[{ type: ObjectId, ref: 'FarmerSuborder' }]`
  - Timestamps: `true`

### 1.5 `FarmerSuborder`
- **File & Definition:** [server/src/models/FarmerSuborder.js:3-82](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/FarmerSuborder.js#L3-L82)
- **Collection Name:** `farmersuborders`
- **Fields:**
  - `suborderNumber`: `String`, `required: true`, `unique: true`, `index: true`
  - `parentOrderId`: `ObjectId`, `ref: 'CheckoutOrder'`, `required: true`, `index: true`
  - `farmerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `consumerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `items`: `[{ productId: { type: ObjectId, ref: 'Product', required: true }, name: String (req), price: Number (req), unit: String (req), quantity: Number (req), subtotal: Number (req), imageSnapshot: String }]`
  - `subtotal`: `Number`, `required: true`, `min: 0`
  - `paymentStatus`: `String`, `enum: ['PENDING_PAYMENT', 'PROOF_SUBMITTED', 'APPROVED_DEMO', 'REJECTED_PROOF', 'CANCELLED']`, `default: 'PENDING_PAYMENT'`, `index: true`
  - `fulfilmentStatus`: `String`, `enum: ['PLACED', 'ACCEPTED', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 'REJECTED_BY_FARMER', 'CANCELLED']`, `default: 'PLACED'`, `index: true`
  - `paymentProof`: `ObjectId`, `ref: 'PaymentProof'`
  - `deliveryMethod`: `String`, `enum: ['delivery', 'pickup']`, `default: 'delivery'`
  - `deliveryAddress`: `{ fullName, phone, street, city, district, state, pincode }`
  - `cancellationReason`: `String`, `default: ''`
  - `isStockRestored`: `Boolean`, `default: false`
  - `statusHistory`: `[{ status: String, timestamp: Date (default: Date.now), note: String, changedBy: { type: ObjectId, ref: 'User' } }]`
  - Timestamps: `true`

### 1.6 `PaymentProof`
- **File & Definition:** [server/src/models/PaymentProof.js:3-45](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/PaymentProof.js#L3-L45)
- **Collection Name:** `paymentproofs`
- **Fields:**
  - `suborderId`: `ObjectId`, `ref: 'FarmerSuborder'`, `required: true`, `index: true`
  - `farmerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `consumerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `screenshotUrl`: `String`, required `[true, 'Payment screenshot is required']`
  - `paymentReference`: `String`, `default: ''`, `trim: true`
  - `paymentMethod`: `String`, `default: 'DEMO_UPI'`
  - `status`: `String`, `enum: ['SUBMITTED', 'APPROVED_DEMO', 'REJECTED']`, `default: 'SUBMITTED'`, `index: true`
  - `reviewNote`: `String`, `default: ''`
  - `reviewedAt`: `Date`
  - `reviewedBy`: `ObjectId`, `ref: 'User'`
  - Timestamps: `true`

### 1.7 `CultivationExpense`
- **File & Definition:** [server/src/models/CultivationExpense.js:3-48](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/CultivationExpense.js#L3-L48)
- **Collection Name:** `cultivationexpenses`
- **Fields:**
  - `farmerId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `category`: `String`, `enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Organic Treatments', 'Irrigation', 'Labour', 'Equipment', 'Transport', 'Packaging', 'Land Preparation', 'Other']`, required `[true, 'Expense category is required']`, `index: true`
  - `amount`: `Number`, required `[true, 'Expense amount is required']`, `min: [0, 'Amount cannot be negative']`
  - `date`: `Date`, `default: Date.now`, `index: true`
  - `cropName`: `String`, `default: ''`, `trim: true`
  - `description`: `String`, `default: ''`, `trim: true`
  - `receiptUrl`: `String`, `default: ''`
  - Timestamps: `true`

### 1.8 `Notification`
- **File & Definition:** [server/src/models/Notification.js:3-23](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/Notification.js#L3-L23)
- **Collection Name:** `notifications`
- **Fields:**
  - `userId`: `ObjectId`, `ref: 'User'`, `required: true`, `index: true`
  - `title`: `String`, `required: true`
  - `message`: `String`, `required: true`
  - `type`: `String`, `enum: ['ORDER_UPDATE', 'PAYMENT_RECEIVED', 'PAYMENT_REVIEW', 'ORDER_DISPATCHED', 'SYSTEM']`, `default: 'SYSTEM'`
  - `data`: `mongoose.Schema.Types.Mixed`, `default: {}`
  - `isRead`: `Boolean`, `default: false`, `index: true`
  - Timestamps: `true`

### 1.9 `CropRecommendation`
- **File & Definition:** [server/src/models/CropRecommendation.js:3-33](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/CropRecommendation.js#L3-L33)
- **Collection Name:** `croprecommendations`
- **Fields:**
  - `userId`: `ObjectId`, `ref: 'User'`, `required: true`
  - `input`:
    - `N`: `Number`, `required: true`
    - `P`: `Number`, `required: true`
    - `K`: `Number`, `required: true`
    - `temperature`: `Number`, `required: true`
    - `humidity`: `Number`, `required: true`
    - `ph`: `Number`, `required: true`
    - `rainfall`: `Number`, `required: true`
  - `recommendedCrop`: `String`, `required: true`
  - `confidence`: `Number`, `default: 0.95`
  - Timestamps: `true`

### 1.10 `DiseasePrediction`
- **File & Definition:** [server/src/models/DiseasePrediction.js:3-36](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/DiseasePrediction.js#L3-L36)
- **Collection Name:** `diseasepredictions`
- **Fields:**
  - `userId`: `ObjectId`, `ref: 'User'`, `required: true`
  - `imageUrl`: `String`, `required: true`
  - `predictedClass`: `String`, `required: true`
  - `cropName`: `String`, `required: true`
  - `diseaseName`: `String`, `required: true`
  - `confidence`: `Number`, `required: true`
  - `advisory`:
    - `treatment_guidance`: `String`
    - `organic_eco_management`: `String`
    - `remedy_status`: `String`
    - `source_name`: `String`
  - Timestamps: `true`

### 1.11 `Disease`
- **File & Definition:** [server/src/models/Disease.js:3-44](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/Disease.js#L3-L44)
- **Collection Name:** `diseases`
- **Fields:**
  - `class_id`: `Number`, `required: true`, `unique: true`
  - `class_name`: `String`, `required: true`, `unique: true`, `trim: true`
  - `crop_name`: `String`, `required: true`
  - `disease_name`: `String`, `required: true`
  - `is_healthy`: `Boolean`, `default: false`
  - `treatment_guidance`: `String`, `default: 'No chemical treatment guidance provided.'`
  - `organic_eco_management`: `String`, `default: 'No organic management guidance provided.'`
  - `remedy_status`: `String`, `default: 'verified'`
  - `source_name`: `String`, `default: 'Agricultural Advisory Board'`
  - `source_url`: `String`, `default: ''`
  - `source_note`: `String`, `default: ''`
  - Timestamps: `true`

---

## 2. Model Relationship Graph

```text
User (PK: _id)
  ├── 1 : 1 ──► FarmerProfile (FK: farmerId -> User._id)
  ├── 1 : N ──► Product (FK: farmerId -> User._id)
  ├── 1 : N ──► CultivationExpense (FK: farmerId -> User._id)
  ├── 1 : N ──► CheckoutOrder (FK: consumerId -> User._id)
  │               └── 1 : N ──► FarmerSuborder (FK: parentOrderId -> CheckoutOrder._id)
  │                               ├── FK: farmerId -> User._id
  │                               ├── FK: consumerId -> User._id
  │                               ├── items: [{ productId -> Product._id }]
  │                               └── 1 : 1 ──► PaymentProof (FK: suborderId -> FarmerSuborder._id)
  │                                               ├── FK: farmerId -> User._id
  │                                               ├── FK: consumerId -> User._id
  │                                               └── FK: reviewedBy -> User._id
  ├── 1 : N ──► Notification (FK: userId -> User._id)
  ├── 1 : N ──► CropRecommendation (FK: userId -> User._id)
  └── 1 : N ──► DiseasePrediction (FK: userId -> User._id)

Disease (Independent Knowledge Base table: 38 legacy pathology records)
```

---

## 3. Seed Scripts Inventory & Seeded Data

### 3.1 `server/src/scripts/resetAndSeedDatabase.js`
- **File:** [server/src/scripts/resetAndSeedDatabase.js:1-1385](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/scripts/resetAndSeedDatabase.js#L1-L1385)
- **Invoked Via:** `npm run db` or `node src/scripts/resetAndSeedDatabase.js`
- **Behavior:**
  1. Clears existing collections: `User`, `FarmerProfile`, `Product`, `CheckoutOrder`, `FarmerSuborder`, `PaymentProof`, `CultivationExpense`, `Notification`, `CropRecommendation`, `DiseasePrediction`. Preserves `Disease` knowledgebase.
  2. Seeds **7 Interconnected User Accounts**:
     - 1 Admin: `admin@gmail.com`
     - 3 Farmers: `user1@gmail.com` (Ramesh Kumar), `user2@gmail.com` (Suresh Reddy), `user3@gmail.com` (Lakshmi Devi)
     - 3 Consumers: `consumer1@gmail.com` (Arjun Sharma), `consumer2@gmail.com` (Priya Reddy), `consumer3@gmail.com` (Rahul Verma)
  3. Seeds **3 Farmer Profiles** with farm descriptions, districts, and crop varieties.
  4. Seeds **24 Verified Agricultural Products** (8 products per farmer across vegetables, grains, pulses, fruits, and dairy).
  5. Seeds an end-to-end **30-Day Order Network**:
     - **8 Master CheckoutOrders**
     - **11 FarmerSuborders** spanning realistic fulfillment stages (`PLACED`, `ACCEPTED`, `PROCESSING`, `READY_FOR_DISPATCH`, `DISPATCHED`, `DELIVERED`).
     - Corresponding **PaymentProof** screenshot records with audit review notes.
  6. Seeds **15 Cultivation Expense Entries** across seed, fertilizer, labor, and irrigation categories for farmer P&L calculations.
  7. Seeds **6 Contextual In-App Notifications** for order and fulfillment status changes.

### 3.2 `server/src/scripts/seedMarketplace.js`
- **File:** [server/src/scripts/seedMarketplace.js:1-350](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/scripts/seedMarketplace.js#L1-L350)
- **Behavior:** Standalone marketplace-only seeder that creates 2 demo farmers and 12 produce items without clearing user consultation history.

### 3.3 `server/src/scripts/importDiseases.js`
- **File:** [server/src/scripts/importDiseases.js:1-75](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/scripts/importDiseases.js#L1-L75)
- **Invoked Via:** `npm run seed:diseases`
- **Behavior:** Imports 38 disease records from `data/phase1_disease_advisory_38_classes_verified_sources.csv` into the `diseases` MongoDB collection.

