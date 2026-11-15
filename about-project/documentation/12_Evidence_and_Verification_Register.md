# EVIDENCE & VERIFICATION REGISTER

This register maps every major technical claim made in the documentation, project reports, and research paper directly to verified source code files, configurations, model weights, and live database queries.

---

## 1. Technical Claims Verification Matrix

| Claim / Specification | Source File / Artifact | Exact Code / Line Reference | Verification Evidence |
|---|---|---|---|
| **Crop Model uses Random Forest with 100 trees & max depth 10** | `ml-services/crop-recommendation/crop_model.pkl` | Serialized scikit-learn estimator attributes | Inspected via Joblib: `n_estimators=100`, `max_depth=10`, `n_features_in_=7`, `classes_` len=22 |
| **Plant pipeline uses 4 checkpoints & FAISS index** | `ml-services/plant-pipeline/artifacts/` | `crop_effb3.pt`, `health_effb3.pt`, `disease_effb3.pt`, `disease_convnext_tiny.pt`, `embeddings.faiss` | Files exist on disk totaling $>370\text{ MB}$; verified via `torch.load` and FAISS CPU |
| **Disease knowledge base contains exactly 116 classes** | `ml-services/plant-pipeline/artifacts/disease_info.json` | JSON dictionary keys | Validated via `jq` / Python: exactly 116 keys matching model output classes |
| **Platt calibration temperatures and selective accuracy** | `ml-services/plant-pipeline/artifacts/calibration.json` | JSON keys: `temperatures`, `thresholds`, `metrics` | Verified: $T_{\text{convnext}}=1.5364$, $T_{\text{effb3}}=1.3477$; ensemble selective accuracy $94.96\%$ at threshold $0.8190$ |
| **Quality gate uses Laplacian variance threshold of 62.29** | `ml-services/plant-pipeline/common/quality.py` | `eval_quality()` | Code computes `cv2.Laplacian(gray, cv2.CV_64F).var() < blur_min` (where `blur_min = 62.29`) |
| **OOD detection uses 768-d ConvNeXt embeddings against 42,652 references** | `ml-services/plant-pipeline/artifacts/embedder.json` & `embeddings.faiss` | `embedder.json`: `{"embedder": "disease_convnext_tiny", "dim": 768, "n_reference": 42652}` | Validated via `faiss.read_index()`: `d=768`, `ntotal=42652` |
| **User role enumeration supports farmer, consumer, admin** | `server/src/models/User.js` | Lines 27–31: `enum: ['farmer', 'consumer', 'admin']` | Checked in schema; registration controller defaults or assigns accordingly |
| **Atomic stock deduction prevents overselling** | `server/src/controllers/orderController.js` | `Product.findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })` | Inspected query in `createCheckout`; tested in E2E integration script |
| **Multi-farmer orders partitioned into suborders** | `server/src/models/CheckoutOrder.js`, `FarmerSuborder.js` | Schema relationship: `CheckoutOrder.suborders` refs `FarmerSuborder` | Verified in database: 8 master checkouts map to 16 farmer suborders |
| **Simulated payment verification requires farmer inspection** | `server/src/controllers/paymentAndFulfilmentController.js` | `submitPaymentProof()` and `reviewPaymentProof()` | Verified state transitions: `PENDING_PAYMENT` $\to$ `PROOF_SUBMITTED` $\to$ `APPROVED_DEMO` / `REJECTED_PROOF` |
| **Delivered orders strictly determine recognized sales in P&L** | `server/src/controllers/analyticsAndExpenseController.js` | `getFarmerDashboardAnalytics()`: `if (s.fulfilmentStatus === 'DELIVERED') recognizedSales += s.subtotal;` | Verified financial formula in backend analytics controller |
| **Cultivation expenses categorize 11 distinct input types** | `server/src/models/CultivationExpense.js` | `category` enum: `Seeds`, `Fertilizers`, `Pesticides`, `Organic Treatments`, `Irrigation`, `Labour`, `Equipment`, `Transport`, `Packaging`, `Land Preparation`, `Other` | Schema validated |
| **Exact 7 demo characters populated in live MongoDB Atlas** | MongoDB database `smart_agri` | `User.find({}, 'name email role')` | Live query confirmed: 1 Admin, 3 Farmers, 3 Consumers |
| **24 agricultural products owned by verified farmers** | MongoDB database `smart_agri` | `Product.countDocuments()` | Live query confirmed: 24 active products, 8 per farmer |

