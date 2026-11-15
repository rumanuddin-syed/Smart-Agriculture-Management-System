# System Architecture & Service Interconnects

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  

---

## 1. Services Inventory

| Service | Technology / Framework | Default Port | Primary Role | Source Verification |
|---|---|:---:|---|---|
| **Client Frontend** | React 18, Vite 5, Tailwind CSS | `5173` | Single-page user interface for consumers, farmers, and diagnostic tools | [client/vite.config.js:8](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/vite.config.js#L8), [start.sh:22](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/start.sh#L22) |
| **Backend API Gateway** | Node.js 18, Express 4.19 | `5000` | REST API routes, JWT authentication, RBAC authorization, Multer file storage, MongoDB persistence, ML proxies | [server/src/app.js:52](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/app.js#L52), [server/.env:12](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/.env#L12) |
| **Plant Disease Pipeline** | FastAPI 0.141, PyTorch, FAISS | `8000` | Calibrated multi-stage leaf pathology diagnostic pipeline & out-of-distribution detection | [start.sh:10-14](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/start.sh#L10-L14), [ml-services/plant-pipeline/service/app.py:1-48](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L1-L48) |
| **Crop Recommendation Service** | Flask 3.0, Scikit-Learn 1.6 | `5001` | Supervised Random Forest classifier evaluating 7 soil/climatic features across 22 crops | [ml-services/crop-recommendation/app.py:25-26](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/crop-recommendation/app.py#L25-L26) |
| **Database Tier** | MongoDB (Mongoose ODM) | Remote Atlas / In-Memory | Data persistence for users, marketplace listings, orders, payments, expenses, and history | [server/src/config/db.js:9-37](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/config/db.js#L9-L37) |

---

## 2. End-to-End Interconnection Architecture

```text
[ Browser / User Agent ]
       │
       ▼ (HTTP :5173)
[ React SPA Client (Vite Dev Server) ]
       │
       │ (Proxy /api -> http://localhost:5000 via client/vite.config.js:9-14)
       ▼
[ Node.js + Express API Gateway (:5000) ]
       │
       ├─── (Mongoose 8.3 Connection) ───────────────────────────► [ MongoDB Atlas / MongoMemoryServer ]
       │
       ├─── (HTTP POST /predict with 60s timeout) ──────────────► [ FastAPI Plant Pipeline (:8000) ]
       │    via server/src/services/mlDiseaseAdapter.js:25             ├── Image Quality Check (Laplacian Blur & HSV)
       │                                                               ├── Crop Classifier (EfficientNet-B3)
       │                                                               ├── Health Binary Gate (EfficientNet-B3)
       │                                                               ├── Dual Disease Ensemble (EffB3 + ConvNeXt)
       │                                                               ├── Temperature Scaling Calibrator
       │                                                               ├── FAISS Vector Similarity (768-d Index)
       │                                                               └── disease_info.json Pathology Retrieval
       │
       └─── (HTTP POST /predict JSON) ──────────────────────────► [ Flask Crop Service (:5001) ]
            via server/src/services/mlCropAdapter.js:22                └── Random Forest Estimator (crop_model.pkl)
```

---

## 3. Environment Variable Names (by Service)
*In compliance with security rules, only environment variable NAMES are listed; secrets, passwords, and tokens are omitted.*

### 3.1 Backend Server (`server/.env`, read in `server/src/`)
- `PORT` — Port number for Node.js API server (default `5000`). Verified at [server/src/app.js:52](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/app.js#L52).
- `MONGO_URI` — Connection URI for MongoDB database (Atlas URI or `'memory'`). Verified at [server/src/config/db.js:11](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/config/db.js#L11).
- `JWT_SECRET` — Symmetric signing key for user authentication tokens. Verified at [server/src/controllers/authController.js:4](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/authController.js#L4) and [server/src/middleware/auth.js:3](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/auth.js#L3).
- `ML_CROP_API_URL` — Full URL to the Crop Recommendation Microservice endpoint. Verified at [server/src/services/mlCropAdapter.js:3](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlCropAdapter.js#L3).
- `PLANT_PIPELINE_URL` — Base URL of the FastAPI Plant Disease Pipeline service. Verified at [server/src/services/mlDiseaseAdapter.js:7](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlDiseaseAdapter.js#L7).
- `USE_MOCK_ML` — Boolean toggle (`'true'` / `'false'`) to switch between live ML microservice communication and local mock inference. Verified at [server/src/services/mlCropAdapter.js:10](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlCropAdapter.js#L10) and [server/src/services/mlDiseaseAdapter.js:18](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlDiseaseAdapter.js#L18).

### 3.2 Plant Disease Pipeline (`ml-services/plant-pipeline/service/app.py`)
- `ARTIFACTS_DIR` — Directory path storing PyTorch checkpoints, `embeddings.faiss`, and `calibration.json` (defaults to `"artifacts"`). Verified at [ml-services/plant-pipeline/service/app.py:30](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L30).
- `DEVICE` — Execution device (`"cpu"` or `"cuda"`, defaults to auto-detected CPU/CUDA). Verified at [ml-services/plant-pipeline/service/app.py:30](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L30).
- `REQUIRE_CALIBRATION` — Strict validation flag requiring `calibration.json` to be present (defaults to `"0"`). Verified at [ml-services/plant-pipeline/service/app.py:31](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L31).
- `MAX_IMAGE_MB` — Maximum permitted image payload size in megabytes (defaults to `"12"`). Verified at [ml-services/plant-pipeline/service/app.py:24](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L24).
- `CORS_ORIGINS` — Comma-separated list of permitted CORS origins (defaults to `"*"`). Verified at [ml-services/plant-pipeline/service/app.py:36](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L36).

### 3.3 Crop Recommendation Service (`ml-services/crop-recommendation/app.py`)
- **Status:** **NOT AVAILABLE**  
- **Finding:** No environment variables are read by `ml-services/crop-recommendation/app.py`. The model filename (`'crop_model.pkl'`) and port number (`5001`) are hardcoded in lines 6 and 26.

---

## 4. Exact Service Startup Commands

### 4.1 Automated Full-Stack Orchestration Script (`start.sh`)
*Source:* [start.sh:9-27](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/start.sh#L9-L27)

```bash
# 1. Disease Pipeline (port 8000)
(
  cd "$SCRIPT_DIR/ml-services/plant-pipeline"
  source venv/bin/activate
  python3 -m uvicorn service.app:app --host 127.0.0.1 --port 8000
) &

# 2. Node.js Backend Server (port 5000)
(
  cd "$SCRIPT_DIR/server"
  npm start
) &

# 3. React Frontend Client (port 5173)
(
  cd "$SCRIPT_DIR/client"
  npm run dev
) &
```

### 4.2 Individual Service Startup Commands (from README.md & package.json)

| Service | Working Directory | Command | Source Reference |
|---|---|---|---|
| **Disease Pipeline** | `ml-services/plant-pipeline` | `source venv/bin/activate && python3 -m uvicorn service.app:app --host 127.0.0.1 --port 8000` | [README.md:49](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/README.md#L49) |
| **Crop ML Service** | `ml-services/crop-recommendation` | `python3 app.py` | [README.md:50](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/README.md#L50) |
| **Node.js Backend (Production)** | `server` | `npm start` (executes `node src/app.js`) | [server/package.json:7](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L7) |
| **Node.js Backend (Development)** | `server` | `npm run dev` (executes `nodemon src/app.js`) | [server/package.json:8](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L8) |
| **Database Reset & Seed** | `server` | `npm run db` (executes `node src/scripts/resetAndSeedDatabase.js`) | [server/package.json:10](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L10) |
| **Disease KB Import** | `server` | `npm run seed:diseases` (executes `node src/scripts/importDiseases.js`) | [server/package.json:9](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L9) |
| **React Client (Development)** | `client` | `npm run dev` (executes `vite`) | [client/package.json:6](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/package.json#L6) |
| **React Client (Production Build)** | `client` | `npm run build` (executes `vite build`) | [client/package.json:7](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/package.json#L7) |

