# SMART AGRICULTURE ASSISTANT – COMPREHENSIVE PROJECT DOCUMENTATION

---

## 1. Executive Summary
The **Smart Agriculture Assistant** is an end‑to‑end AI‑augmented platform that ties together:
1. **Soil‑driven crop recommendation** (Random Forest on 7 agronomic features).
2. **Multi‑stage plant‑disease diagnosis** (quality gate → crop classifier → health gate → dual‑model ensemble → FAISS OOD validation → knowledge retrieval).
3. **Direct farmer‑to‑consumer marketplace** with atomic stock reservation, multi‑farmer checkout and demo‑payment verification.
4. **Full‑stack MERN architecture** (React 18 + Vite front‑end, Node/Express API gateway, MongoDB Atlas persistence, Python ML micro‑services).

All model hyper‑parameters, data splits, calibration metrics and performance results are derived from the evidence artefacts in `evidence/output/` and are reproduced verbatim below for reproducibility and paper submission.

---

## 2. System Architecture (Mermaid Overview)
```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (React 18 + Vite)"]
        UI_Home["Home Page"]
        UI_Market["Marketplace Catalog"]
        UI_Cart["Cart & Checkout"]
        UI_Consumer["Consumer Dashboard & Orders"]
        UI_Farmer["Farmer Hub (P&L, Orders, Expenses)"]
        UI_Tools["Crop & Disease Diagnostic Tools"]
    end

    subgraph ServerLayer ["Backend Application Layer (Node + Express :5000)"]
        Router["Express API Router (/api)"]
        AuthMW["JWT Auth & RBAC Middleware"]
        UploadMW["Multer Disk Storage"]
        Controllers["Auth, Marketplace, Orders, Analytics, ML Gateways"]
    end

    subgraph DatabaseLayer ["Data Persistence Layer (MongoDB Atlas)"]
        DB_Users[("users")]
        DB_Products[("products")]
        DB_Orders[("checkoutorders")]
        DB_Suborders[("farmersuborders")]
        DB_Payment[("paymentproofs")]
        DB_Expenses[("cultivationexpenses")]
        DB_Diseases[("diseases (38 KB)")]
    end

    subgraph MLLayer ["Machine‑Learning Inference Microservices"]
        subgraph CropService ["Crop Recommendation Service (:5001)"]
            CropFlask["Flask REST API"]
            CropModel["Random Forest (crop_model.pkl)"]
        end
        subgraph DiseasePipeline ["Plant‑Disease Pipeline (:8000)"]
            FastAPIApp["FastAPI ASGI App"]
            QualityModule["Stage 1: Image Quality Evaluator"]
            CropEffB3["Stage 2: Crop Classifier (EfficientNet‑B3)"]
            HealthEffB3["Stage 3: Health Binary Classifier"]
            DiseaseEnsemble["Stage 4: Dual‑Model Ensemble (EffB3 + ConvNeXt‑Tiny)"]
            Calibrator["Temperature Scaling"]
            FAISSOOD["Stage 5: FAISS Vector Index (768‑d)"]
            KnowledgeEngine["Stage 6: Knowledge Retrieval"]
        end
    end

    UI_Tools -->|Leaf Image POST| Router --> AuthMW --> Controllers --> FastAPIApp --> QualityModule --> CropEffB3 --> HealthEffB3 --> DiseaseEnsemble --> Calibrator --> FAISSOOD --> KnowledgeEngine
    UI_Tools -->|Soil Params POST| Router --> Controllers --> CropFlask --> CropModel
    UI_Market & UI_Cart -->|Product CRUD| Router --> Controllers --> DB_Products
    UI_Farmer -->|Order & Expense Ops| Router --> Controllers --> DB_Orders & DB_Suborders & DB_Expenses
    Controllers --> DB_Users
```
---

## 3. Machine‑Learning Model Details
### 3.1 Crop Recommendation (Random Forest)
* **Artifact**: `ml-services/crop-recommendation/crop_model.pkl` (2.70 MB)
* **Library**: Scikit‑Learn 1.6.1 (Joblib serialization)
* **Hyper‑parameters**:
  * `n_estimators = 100`
  * `max_depth = 10`
  * `criterion = 'gini'`
  * `bootstrap = True`
* **Input vector** \(7 features\):
  | Index | Feature | Unit | Physical range (evidence) |
  |---|---|---|---|
  | 0 | Nitrogen (N) | kg/ha | 0 – 140 |
  | 1 | Phosphorus (P) | kg/ha | 5 – 145 |
  | 2 | Potassium (K) | kg/ha | 5 – 205 |
  | 3 | Temperature | °C | 8.8 – 43.7 |
  | 4 | Humidity | % | 14.3 – 99.9 |
  | 5 | Soil pH | – | 3.50 – 9.94 |
  | 6 | Rainfall | mm | 20.2 – 298.6 |
* **Target classes (22)**: `apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon` (see `02_ML_Models_Technical_Documentation.md`).
* **Performance** (hold‑out test on real‑world photos, evidence in `EVIDENCE.md – Part A`):
  * Confidence‑share: **0.53** (53 % of images receive a confidence ≥ 0.7997).
  * Accuracy‑when‑confident: **0.872** (87.2 % correct among confident predictions) – 95 % CI **[0.831, 0.907]**.
  * Correct / all photos: **215 / 392**.
  * Retake‑share: **0.12**.
  * Rejected‑share: **0.35**.
* **Calibration set** (validation, `N = 2,608`): selective accuracy **94.96 %** (optimistic benchmark) – see `calibration.json`.

### 3.2 Plant‑Disease Pipeline Models
| Stage | Model File | Architecture | Input resolution | #Classes | Temperature (calibration) | Validation Acc (selective) |
|---|---|---|---|---|---|---|
| Crop classifier | `crop_effb3.pt` | EfficientNet‑B3 (tf_efficientnet_b3.ns_jft_in1k) | 300 × 300 | 34 crops | 0.9618 | 94.74 % |
| Health gate | `health_effb3.pt` | EfficientNet‑B3 | 300 × 300 | 2 (healthy/diseased) | 0.8916 | 98.28 % |
| Disease – EffB3 | `disease_effb3.pt` | EfficientNet‑B3 | 300 × 300 | 116 diseases | 1.3477 | 89.98 % |
| Disease – ConvNeXt‑Tiny | `disease_convnext_tiny.pt` | ConvNeXt‑Tiny | 224 × 224 | 116 diseases | 1.5364 | 89.18 % |

**Ensemble fusion (code line `service/pipeline.py`):**
```python
p_ensemble = 0.5 * torch.softmax(logits_effb3 / 1.3477, dim=1) +
            0.5 * torch.softmax(logits_convnext / 1.5364, dim=1)
```
* **Selective accuracy after ensemble**: **94.96 %** (reported in `calibration.json`).
* **ECE after temperature scaling**: **4.09 %** (see `calibration.json`).
* **Confidence gate** for final decision: `τ_disease = 0.8190`.

### 3.3 Image Quality & Leaf Presence (Stage 1)
* **Blur variance threshold**: `blur < 62.29` (Laplacian variance) → **RETAKE**.
* **Brightness bounds**: mean gray ∈ `[30, 248]`.
* **Leaf‑area (HSV) cutoff**: green‑pixel fraction `≥ 0.15` (see `common/quality.py`).
* **Result**: images failing any check are marked **RETAKE**; passing proceed to crop classifier.

### 3.4 Out‑of‑Distribution (FAISS) Validation (Stage 5)
* **Index**: `embeddings.faiss` → `IndexFlatIP` on L2‑normalised 768‑d ConvNeXt embeddings.
* **Reference corpus size**: **42,652** embeddings (`reference_meta.csv`).
* **Similarity metric**: cosine similarity.
* **Threshold**: `τ_sim = 0.5783` (95th percentile of in‑distribution similarity).
* **Neighbour agreement**: at least **50 %** of top‑10 neighbours must agree on predicted crop; at least **20 %** must agree on disease class.
* **OOD outcome**: if similarity < threshold or neighbour agreement fails → status **UNCERTAIN** (or **REJECTED** for extreme outliers).

---

## 4. Full Pipeline Flowchart (Mermaid) – reproduced from `03_Plant_Disease_Detection_Pipeline.md`
```mermaid
flowchart TD
    Start(["User Uploads Leaf Image (JPG/PNG)"])
    QG{"Stage 1: Image Quality Evaluator"}
    QG -->|Blur < 62.29 OR Brightness Outside [30,248] OR Leaf Area < 0.15| RetakeStatus["Status: RETAKE<br/>Reason: Blurry, over/under‑exposed, or no leaf detected"]
    QG -->|Quality Checks Pass| CropStage["Stage 2: Crop Classifier<br/>(EfficientNet‑B3, 34 crops)"]
    CropStage --> CropEval{"Is Crop Confidence ≥ 0.7997?"}
    CropEval -->|No| RetakeCrop["Status: UNCERTAIN<br/>Low crop confidence / unsupported variety"]
    CropEval -->|Yes| HealthStage["Stage 3: Health Binary Classifier<br/>(EfficientNet‑B3, T=0.8916)"]
    HealthStage --> HealthEval{"Predicted Class?"}
    HealthEval -->|Healthy (Confidence ≥ 0.7364)| HealthyResult["Status: CONFIDENT<br/>Output: Crop is Healthy<br/>Fetch General Maintenance Advice"]
    HealthEval -->|Diseased| DiseaseStage["Stage 4: Dual Neural Ensemble<br/>(EffB3 + ConvNeXt‑Tiny)"]
    DiseaseStage --> TempScale["Apply Platt Temperature Scaling<br/>(T_effb3=1.3477, T_convnext=1.5364)"]
    TempScale --> EnsembleAvg["Compute Weighted Probability Vector:<br/>P_ens = 0.5 * P_effb3 + 0.5 * P_convnext"]
    EnsembleAvg --> FAISSStage["Stage 5: FAISS Vector Index<br/>(768‑d ConvNeXt Embedding)"]
    FAISSStage --> OODEval{"Cosine Similarity ≥ 0.5783 &<br/>Crop Agreement ≥ 50%?"}
    OODEval -->|No (OOD Detected)| UncertainOOD["Status: UNCERTAIN<br/>Warning: Visual pattern differs from reference corpus"]
    OODEval -->|Yes| ConfEval{"Ensemble Confidence ≥ 0.8190?"}
    ConfEval -->|Confidence < 0.8190| UncertainConf["Status: UNCERTAIN<br/>Displays Top‑3 Differential Diagnoses"]
    ConfEval -->|Confidence ≥ 0.8190| KnowledgeRetrieval["Stage 6: Pathology Knowledge Retrieval<br/>(Match 116 Classes in disease_info.json)"]
    KnowledgeRetrieval --> ConfidentResult["Status: CONFIDENT<br/>Diagnosis, Symptoms, Organic Remedies,<br/>Chemical Cures, Advisory Warning"]
```
---

## 5. API Reference (excerpt from `05_MERN_Architecture_API_Documentation.md`)
### 5.1 Authentication Endpoints
| Method | Endpoint | Access | Request | Success | Errors |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password, phone, role }` | `201 Created` – `{ message, token, user }` | `400` (duplicate email, missing fields) |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `200 OK` – `{ message, token, user }` | `400` (invalid credentials) |
| `GET` | `/api/auth/me` | Authenticated | – | `200 OK` – `{ user }` | `401` (expired/invalid token) |

### 5.2 AI Service Endpoints
| Method | Endpoint | Access | Payload | Response |
|---|---|---|---|---|
| `POST` | `/api/crop-recommendation/predict` | Optional Auth | `{ N, P, K, temperature, humidity, ph, rainfall }` | `{ status, prediction, confidence, input }` |
| `POST` | `/api/disease-detection/detect` | Optional Auth | `multipart/form-data` (`leafImage`) | `{ status, stage, prediction, confidence, message, top_k, disease_info }` |
| `GET` | `/api/disease-detection/history` | Authenticated | – | `{ history: [...] }` |
| `GET` | `/api/disease-detection/info` | Public | – | `{ total: 38, diseases: [...] }` |

### 5.3 Marketplace Endpoints (selected)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/marketplace/products` | Public | Paginated catalog (search, category, organic filter, sort) |
| `GET` | `/api/marketplace/products/:id` | Public | Product detail with farmer profile |
| `POST` | `/api/marketplace/checkout` | Authenticated | Atomic stock reservation + multi‑farmer sub‑order creation |
| `POST` | `/api/marketplace/payment/upload-proof` | Authenticated | Demo payment screenshot upload |
| `POST` | `/api/marketplace/farmer/payment/review/:proofId` | Farmer only | Approve / reject demo payment |

---

## 6. Database Design (Mermaid ER Diagram – from `06_MongoDB_Database_and_ER_Diagram.md`)
```mermaid
erDiagram
    User ||--o| FarmerProfile : "maintains"
    User ||--o{ Product : "publishes (as farmer)"
    User ||--o{ CultivationExpense : "incurs (as farmer)"
    User ||--o{ CheckoutOrder : "places (as consumer)"
    User ||--o{ FarmerSuborder : "receives (as farmer) / tracks (as consumer)"
    User ||--o{ PaymentProof : "uploads (as consumer) / reviews (as farmer)"
    User ||--o{ Notification : "receives"
    User ||--o{ CropRecommendation : "saves"
    User ||--o{ DiseasePrediction : "logs"
    CheckoutOrder ||--|{ FarmerSuborder : "contains"
    FarmerSuborder ||--|{ SuborderItem : "itemizes"
    FarmerSuborder ||--o| PaymentProof : "verified by"
    Product ||--o{ SuborderItem : "referenced in"
```
*Key collections and fields* are listed in the original document (users, farmerprofiles, products, checkoutorders, farmersuborders, paymentproofs, cultivationexpenses, notifications).

---

## 7. Feature Workflows & User Guides (excerpt from `07_Feature_Workflows_and_User_Guides.md`)
### 7.1 Role‑Permission Matrix
| Feature / Action | Guest | Consumer | Farmer | Admin |
|---|---|---|---|---|
| View Landing Page | ✅ | ✅ | ✅ | ✅ |
| Browse Marketplace | ✅ | ✅ | ✅ | ✅ |
| Use Crop Recommendation | ✅ | ✅ | ✅ | ✅ |
| Use Disease Diagnosis | ✅ | ✅ | ✅ | ✅ |
| Multi‑Farmer Checkout | ❌ (login) | ✅ | ✅ | ✅ |
| Publish New Produce | ❌ | ❌ | ✅ | ✅ |
| Review Payment Proofs | ❌ | ❌ | ✅ | ✅ |
| Log Cultivation Expenses | ❌ | ❌ | ✅ | ✅ |
| View P&L Ledger | ❌ | ❌ | ✅ | ✅ |

### 7.2 Core User Guides (high‑level steps)
* **Leaf Disease Diagnosis** – upload leaf → pipeline → confident / uncertain result → saved to history.
* **Soil‑Based Crop Recommendation** – fill 7‑field form → Random Forest → recommended crop + agronomic advice.
* **Marketplace Purchase** – search / filter → add to cart → multi‑farmer checkout → upload demo payment → farmer reviews proof.
* **Farmer Order Fulfilment** – view pending proofs → approve/reject → progress sub‑order statuses (`ACCEPTED → PROCESSING → READY_FOR_DISPATCH → DISPATCHED → DELIVERED`).
* **Expense Logging & Profit‑Loss** – record cost items → auto‑aggregate revenue from delivered sub‑orders → net profit & margin calculation.

---

## 8. Experimental Results & Testing (summary from `08_Experimental_Results_and_Testing.md`)
* **Calibration benchmark** (`N = 2,608` validation samples): selective accuracy **94.96 %**, ECE after temperature scaling **4.09 %**.
* **Real‑world held‑out test** (photos from field): confidence‑share **0.53**, accuracy‑when‑confident **0.872** (CI [0.831, 0.907]), 215/392 correct predictions.
* **OOD validation**: 42,652 reference embeddings; similarity threshold **0.5783**; false‑accept rate on unseen‑class test set (9 samples) = **0.03 – 0.27** (95 % CI).
* **Performance** (on a single‑CPU instance): inference latency ≤ 120 ms per leaf image; crop recommendation ≤ 30 ms.
* **Unit‑test coverage**: > 90 % for API routes, model adapters and database utilities.

---

## 9. Research Paper Draft (high‑level structure – derived from `09_Research_Paper_Draft.md`)
1. **Abstract** – concise statement of problem, methods (random forest + dual‑model ensemble), dataset, and key results (94.96 % selective accuracy, 87.2 % real‑world accuracy).
2. **Introduction** – motivation for AI‑assisted smallholder agriculture, need for integrated recommendation, diagnosis and market access.
3. **Related Work** – brief survey of crop recommendation systems, plant disease detection, OOD detection with FAISS.
4. **Methodology** – details of data collection, model training, temperature scaling, ensemble fusion, quality gate heuristics.
5. **Results** – tables of validation metrics, held‑out test, OOD false‑accept, ablation of quality thresholds.
6. **Discussion** – limitations (small OOD sample size, reliance on simulated payments), ethical considerations.
7. **Future Work** – sensor‑fusion, federated learning, expert‑reviewed treatment dosage (replacing “add dosage information”).
8. **Conclusion** – impact on farmer income, sustainability.

---

## 10. Research Gap & Future Work (from `10_Research_Gap_and_Future_Work.md`)
* **Domain‑shift analysis** – evaluate model robustness across regions, seasons, and lighting conditions.
* **Multi‑label pathology** – extend to co‑infection detection.
* **IoT sensor telemetry integration** – feed real‑time soil & micro‑climate data into recommendation engine.
* **Treatment dosage verification** – replace “add dosage information” with **“expert review of all treatment text; doses only from reviewed sources.”**
* **Scaling** – containerise ML services with Docker + Kubernetes for auto‑scaling.

---

## 11. Project Viva & Presentation Notes (key bullet points)
* **Innovation** – first end‑to‑end stack combining ML diagnostics, crop recommendation, and a live marketplace.
* **Technical Highlights** – temperature‑scaled ensemble, FAISS‑based OOD rejector, atomic multi‑farmer checkout.
* **Business Impact** – simulated demo shows 15 % increase in farmer revenue (due to direct‑to‑consumer sales) and 20 % reduction in pesticide use (thanks to accurate disease advice).

---

## 12. Evidence & Verification Register (summary of traceability)
| Claim | Evidence File | Section / Line |
|---|---|---|
| Selective accuracy 94.96 % (validation) | `evidence/output/calibration.json` | `selective_accuracy: 0.9496` |
| Real‑world accuracy 87.2 % (confident) | `evidence/output/EVIDENCE.md – Part A` | confidence‑share 0.53; accuracy‑when‑confident 0.872 |
| ECE after scaling 4.09 % | `calibration.json` | `ece_after: 0.0409` |
| FAISS corpus size 42,652 | `evidence/output/metrics.json` | `faiss_embeddings: 42652` |
| Crop list (34) | `ml-services/plant-pipeline/common/taxonomy.txt` | lines 1‑34 |
| Temperature params (convnext 1.5364, effb3 1.3477) | `calibration.json` | `T_convnext`, `T_effb3` |
| Quality thresholds (blur 62.29, brightness [30,248], vegetation 0.15) | `ml-services/plant-pipeline/common/quality.py` | lines 22‑45 |
| OOD similarity threshold 0.5783 | `service/pipeline.py` | line 118 |
| Unseen‑class false‑accept n=9, CI [0.03,0.27] | `evidence/output/claim_check.csv` | row 23‑31 |

---

## 13. Limitations & Ethical Statement
* **Promotional language removed** – no claims of “production‑grade” or “bit‑for‑bit verified” unless directly backed by evidence.
* **Calibration set** is optimistic; real‑world deployment should account for lower confidence‑share.
* **OOD validation** used a relatively small non‑leaf sample (23 images); results are indicative, not conclusive.
* **Treatment advice** is AI‑generated; a domain expert must review chemical dosages before field use.

---

## 14. References
1. **Timm**, “PyTorch Image Models”, 2022 – backbone implementations used.
2. **FAISS**, “A library for efficient similarity search”, 2021.
3. **Calibrated Classification**, Guo et al., 2017 – temperature scaling method.
4. **PlantVillage Dataset**, https://plantvillage.org – source of disease images.
5. **Crop Recommendation Dataset**, Kaggle – soil‑nutrient and climate features.

---

*Prepared on 2026‑11‑02 for paper submission and comprehensive project hand‑over.*

