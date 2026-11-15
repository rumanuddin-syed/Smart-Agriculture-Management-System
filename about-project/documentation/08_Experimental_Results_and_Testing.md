# EXPERIMENTAL RESULTS & SOFTWARE TESTING REPORT

This document presents all verified experimental evaluations, benchmark metrics, integration test outputs, and live database statistics collected across the Smart Agriculture Assistant codebase.

---

## 1. Machine Learning Experimental Evaluation

### 1.1 Plant Disease Pipeline Deep Learning Benchmark
Evaluated on the Kaggle `plant-models` evaluation benchmark ($N = 2,608$ field evaluation samples) using empirical Platt temperature scaling:

| Stage / Component | Neural Backbone | Input Size | Uncalibrated Accuracy | Calibrated ECE (Expected Calibration Error) | Selective Accuracy | Operating Confidence Gate |
|---|---|---|---|---|---|---|
| **Crop Identification** | `tf_efficientnet_b3` | $300 \times 300$ | $81.48\%$ | $4.01\%$ | **$90.02\%$** | $\tau \ge 0.7997$ (Coverage: $79.95\%$) |
| **Health Classification** | `tf_efficientnet_b3` | $300 \times 300$ | $93.94\%$ | $2.38\%$ | **$95.00\%$** | $\tau \ge 0.7364$ (Coverage: $97.47\%$) |
| **Disease Model 1** | `tf_efficientnet_b3` | $300 \times 300$ | $85.43\%$ | $2.89\%$ | — | $T = 1.3477$ |
| **Disease Model 2** | `convnext_tiny` | $224 \times 224$ | $85.43\%$ | $4.44\%$ | — | $T = 1.5364$ |
| **Dual Neural Ensemble** | Weighted Average | Multi-scale | **$86.35\%$** | **$4.09\%$** | **$94.96\%$** | $\tau \ge 0.8190$ (Coverage: $69.54\%$) |

*Inter-Model Agreement*: The dual backbones achieved an agreement rate of **$87.06\%$** across the test suite.

### 1.2 Out-of-Distribution (OOD) Validation Benchmark
- **Corpus**: $42,652$ reference embeddings ($768$-dimensional vectors).
- **Index Architecture**: FAISS `IndexFlatIP`.
- **In-Distribution Threshold**: Maximum cosine similarity $\ge 0.5783$ ensures $\ge 95\%$ retention of genuine in-distribution agricultural samples while filtering background objects and irrelevant non-plant imagery.

---

## 2. Full-Stack Software Testing Matrix

All test cases below were executed against the live application and database:

| Test ID | Module | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|:---:|
| **AUTH-01** | Authentication | Register with valid credentials | User created, password hashed with bcrypt, JWT returned | HTTP 201 Created, token returned | **PASSED** |
| **AUTH-02** | Authentication | Register duplicate email | Request rejected with conflict message | HTTP 400 "An account with this email already exists" | **PASSED** |
| **AUTH-03** | Authentication | Login with wrong password | Access denied | HTTP 400 "Invalid email or password" | **PASSED** |
| **RBAC-01** | Role Security | Consumer attempts to access `/api/marketplace/farmer/analytics` | Access blocked by RBAC middleware | HTTP 403 Forbidden | **PASSED** |
| **CROP-01** | Crop ML | Valid soil N-P-K & climate parameters | Predicts top crop with confidence | HTTP 200 OK, returns `rice` (conf: 0.96) | **PASSED** |
| **PATH-01** | Disease ML | Upload non-image file (`README.md`) | Multer reject non-image file formats | HTTP 400 "Only image files... are allowed!" | **PASSED** |
| **PATH-02** | Disease ML | Upload valid leaf photo | Returns status, prediction, top-k, disease info | HTTP 200 OK with calibrated confidence | **PASSED** |
| **MKT-01** | Marketplace | Atomic multi-farmer checkout | Atomically decrements stock and creates separate suborders | HTTP 201 Created, suborders split per farmer | **PASSED** |
| **MKT-02** | Marketplace | Insufficient inventory checkout | Request rejected without modifying stock | HTTP 400 "Insufficient stock..." | **PASSED** |
| **PAY-01** | Simulated Pay | Consumer uploads payment screenshot | Suborder updates to `PROOF_SUBMITTED` | HTTP 201 Created, proof recorded | **PASSED** |
| **PAY-02** | Simulated Pay | Farmer reviews and approves proof | Suborder updates to `APPROVED_DEMO` / `ACCEPTED` | HTTP 200 OK, notifications emitted | **PASSED** |
| **ORD-01** | Fulfillment | Farmer marks order `DELIVERED` | Order marked delivered, counted in P&L | HTTP 200 OK, recognized revenue updated | **PASSED** |
| **EXP-01** | Expense / P&L | Log cultivation cost | Record saved and reflected in P&L ledger | HTTP 201 Created, profit margin updated | **PASSED** |

---

## 3. Live Demonstration Marketplace Statistics

Directly queried from the MongoDB Atlas `smart_agri` database:
- **Total Registered Characters**: $7$ (1 Admin, 3 Farmers, 3 Consumers)
- **Total Published Agricultural Products**: $24$ (8 items per farmer)
- **Total Master Checkouts**: $8$
- **Total Farmer Suborders**: $16$ across the 30-day timeline:
  - `DELIVERED`: 10 suborders
  - `DISPATCHED`: 1 suborder
  - `READY_FOR_DISPATCH`: 1 suborder
  - `PROCESSING`: 1 suborder
  - `PROOF_SUBMITTED`: 2 suborders (actively awaiting farmer review)
  - `PENDING_PAYMENT`: 1 suborder (ready for consumer screenshot upload)
- **Total Payment Proofs Recorded**: $15$
- **Total Cultivation Expense Entries**: $15$ entries across all 3 farmers
  - Ramesh Kumar (`Green Valley Farms`): ₹18,100 input costs
  - Suresh Reddy (`Sunrise Organic Farms`): ₹26,700 input costs
  - Lakshmi Devi (`Lakshmi Fresh Produce`): ₹14,800 input costs
- **Total In-App Contextual Notifications**: $6$ alerts

