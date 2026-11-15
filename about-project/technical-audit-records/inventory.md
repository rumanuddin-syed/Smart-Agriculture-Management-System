# Project Inventory & Codebase Metrics

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  
**Git Repository Status:** NOT AVAILABLE (Directory is not a Git repository; `.git` directory is absent).

---

## 1. Directory Tree (Depth 3)
*Excluding: `node_modules`, `venv`, `.venv`, `dist`, `build`, `__pycache__`, `.git`*

```text
.
├── client
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── public
│   │   └── assets
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   ├── context
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── pages
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs
│   ├── files
│   │   ├── Smart_Agriculture_Assistant_6page_Corrected.pdf
│   │   ├── Smart_Agriculture_Assistant_Full_Report.pdf
│   │   └── Smart_Agriculture_Assistant_Presentation.pptx
│   ├── project-documentation
│   │   ├── 01_Complete_Project_Report.md
│   │   ├── 02_ML_Models_Technical_Documentation.md
│   │   ├── 03_Plant_Disease_Detection_Pipeline.md
│   │   ├── 04_Crop_Recommendation_Model.md
│   │   ├── 05_MERN_Architecture_API_Documentation.md
│   │   ├── 06_MongoDB_Database_and_ER_Diagram.md
│   │   ├── 07_Feature_Workflows_and_User_Guides.md
│   │   ├── 08_Experimental_Results_and_Testing.md
│   │   ├── 09_Research_Paper_Draft.md
│   │   ├── 10_Research_Gap_and_Future_Work.md
│   │   ├── 11_Project_Viva_and_Presentation_Notes.md
│   │   ├── 12_Evidence_and_Verification_Register.md
│   │   └── Full_Project_Documentation.md
│   └── project-documentation.zip
├── evidence
│   ├── calibration.json
│   ├── manifest_ORIGINAL.csv
│   ├── output
│   │   ├── calibration_summary.json
│   │   ├── EVIDENCE.md
│   │   ├── generate_evidence.py
│   │   ├── metrics.json
│   │   ├── model_facts.json
│   │   └── versions.json
│   ├── predictions.csv
│   ├── real_photos
│   │   └── [80 leaf test images: Apple, Cherry, Grape, Orange, Peach, Pepper, Soybean, Squash, Tomato]
│   ├── report.json
│   └── test_metrics_final.json
├── ml-services
│   ├── crop-recommendation
│   │   ├── app.py
│   │   ├── crop_model.pkl
│   │   └── requirements.txt
│   ├── plant-pipeline
│   │   ├── artifacts
│   │   ├── common
│   │   ├── requirements-serve.txt
│   │   └── service
│   └── plant-pipeline-training
│       ├── configs
│       └── README.md
├── project-resources
│   ├── disease_info.json
│   ├── final_backup
│   │   ├── artifacts
│   │   └── data
│   └── final_backup.zip
├── README.md
├── server
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── app.js
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── scripts
│   │   └── services
│   └── uploads
│       ├── payments
│       └── products
└── start.sh
```

---

## 2. Lines of Code per Top-Level Folder (by Language)
*Measured using `find` and `wc -l` over source files excluding `node_modules`, `venv`, `.venv`, `dist`, `build`, and `__pycache__`.*

| Folder | Language | Files | Lines of Code |
|---|---|:---:|:---:|
| `client` | JavaScript (React JSX) | 28 | 5,591 |
| `client` | JavaScript | 3 | 47 |
| `client` | CSS | 1 | 47 |
| `client` | HTML | 1 | 19 |
| `client` | JSON | 2 | 5,538 |
| **client Subtotal** | | **35** | **11,242** |
| `server` | JavaScript | 41 | 4,998 |
| `server` | JSON | 2 | 2,353 |
| **server Subtotal** | | **43** | **7,351** |
| `ml-services` | Python | 16 | 1,030 |
| `ml-services` | JSON | 4 | 1,500 |
| `ml-services` | YAML | 3 | 65 |
| `ml-services` | Markdown | 2 | 61 |
| `ml-services` | Text / Requirements | 2 | 20 |
| **ml-services Subtotal** | | **27** | **2,676** |
| `docs` | Markdown | 13 | 1,434 |
| `evidence` | Python | 1 | 320 |
| `evidence` | JSON | 7 | 964 |
| `evidence` | Markdown | 1 | 98 |
| `project-resources` | JSON | 8 | 1,533 |
| **Root scripts** | Shell (`start.sh`) | 1 | 37 |
| **Root docs** | Markdown (`README.md`) | 1 | 120 |

---

## 3. Node and Python Versions from Project Configuration

| Environment / Runtime | Version Specification | Source File and Line |
|---|---|---|
| **Node.js** | `v18+ with npm` | [README.md:38](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/README.md#L38) |
| **Python** | `3.10+ with pip and venv` | [README.md:39](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/README.md#L39) |
| **`.nvmrc` / `.node-version`** | NOT AVAILABLE | File does not exist in repository root or subfolders. |
| **`.python-version` / `runtime.txt`** | NOT AVAILABLE | File does not exist in repository root or subfolders. |
| **`engines` field in package.json** | NOT AVAILABLE | Neither `server/package.json` nor `client/package.json` specifies an `engines` block. |

---

## 4. Dependencies and Pinned Versions

### 4.1 Backend Dependencies (`server/package.json`)
*Source:* [server/package.json:11-26](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/package.json#L11-L26)

```json
"dependencies": {
  "axios": "^1.6.8",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "csv-parser": "^3.0.0",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "jsonwebtoken": "^9.0.2",
  "mongodb-memory-server": "^9.2.0",
  "mongoose": "^8.3.1",
  "multer": "^1.4.5-lts.1",
  "form-data": "^4.0.0"
},
"devDependencies": {
  "nodemon": "^3.1.0"
}
```

### 4.2 Frontend Dependencies (`client/package.json`)
*Source:* [client/package.json:11-28](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/package.json#L11-L28)

```json
"dependencies": {
  "axios": "^1.6.8",
  "leaflet": "^1.9.4",
  "lucide-react": "^0.370.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-leaflet": "^4.2.1",
  "react-router-dom": "^6.23.0"
},
"devDependencies": {
  "@types/react": "^18.2.66",
  "@types/react-dom": "^18.2.22",
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.19",
  "eslint": "^8.57.0",
  "eslint-plugin-react": "^7.34.1",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.6",
  "postcss": "^8.4.38",
  "tailwindcss": "^3.4.3",
  "vite": "^5.2.0"
}
```

### 4.3 Crop Recommendation Service Dependencies (`ml-services/crop-recommendation/requirements.txt`)
*Source:* [ml-services/crop-recommendation/requirements.txt:1-4](file:///home/syed-rumanuddin/E4/SEM%201/major project/Smart Agriculture Mangement/ml-services/crop-recommendation/requirements.txt#L1-L4)

```text
flask
scikit-learn
joblib
numpy
```

### 4.4 Plant Disease Pipeline Inference Dependencies (`ml-services/plant-pipeline/requirements-serve.txt`)
*Source:* [ml-services/plant-pipeline/requirements-serve.txt:6-16](file:///home/syed-rumanuddin/E4/SEM%201/major project/Smart Agriculture Mangement/ml-services/plant-pipeline/requirements-serve.txt#L6-L16)

```text
fastapi==0.141.1
uvicorn==0.54.0
python-multipart==0.0.32
torch==2.13.0+cpu
torchvision==0.28.0+cpu
timm==1.0.30
faiss-cpu==1.15.1
opencv-python-headless==5.0.0.93
pandas==3.1.0
numpy==2.5.2
pillow==10.2.0
```

---

## 5. File Modification Timestamps (File Modification Times, Not Commits)
*Measured via filesystem `os.path.getmtime` on non-ignored source and project files:*

- **Earliest Source File Modification:**  
  `server/src/config/db.js` — **2026-08-31T15:29:14.430023**
- **Latest Source File Modification:**  
  `client/src/pages/Marketplace.jsx` — **2026-11-02T20:02:50.083192**
- **Earliest File Across Entire Repository:**  
  `server/src/config/db.js` — **2026-08-31T15:29:14.430023**
- **Latest File Across Entire Repository (Generated outputs):**  
  `evidence/output/versions.json` — **2026-11-10T14:11:23.497535**

---

## 6. Machine Learning Services & Artifacts Verification

### 6.1 `ml-services/disease-detection/` (Old Service)
- **Status:** **NOT AVAILABLE**  
- **Finding:** Directory `ml-services/disease-detection/` does not exist. It has been replaced by `ml-services/plant-pipeline/`.

### 6.2 `ml-services/plant-pipeline/` (Current Pipeline Service)
- **Status:** **EXISTS**
- **Artifacts Folder:** `ml-services/plant-pipeline/artifacts/`

| File Name | Exact Size (Bytes) | Human-Readable Size | Description |
|---|:---:|:---:|---|
| `calibration.json` | 2,532 | ~2.53 KB | Temperature scaling & threshold parameters |
| `crop_effb3.pt` | 43,516,431 | ~43.52 MB | EfficientNet-B3 crop classifier checkpoint |
| `disease_convnext_tiny.pt` | 111,700,507 | ~111.70 MB | ConvNeXt-Tiny disease model & embedder |
| `disease_effb3.pt` | 44,025,371 | ~44.03 MB | EfficientNet-B3 disease model checkpoint |
| `disease_info.json` | 78,905 | ~78.9 KB | 116 disease condition metadata & treatments |
| `embedder.json` | 76 | 76 Bytes | Embedder architecture reference name |
| `embeddings.faiss` | 131,026,989 | ~131.03 MB | 768-d FAISS index (42,652 reference vectors) |
| `health_effb3.pt` | 43,320,343 | ~43.32 MB | Binary healthy/diseased classifier checkpoint |
| `README.md` | 1,652 | ~1.65 KB | Artifact provenance & validation notes |
| `reference_meta.csv` | 7,525,595 | ~7.53 MB | Metadata for the 42,652 reference images |

### 6.3 Crop Recommendation Model Artifact
- **Path:** `ml-services/crop-recommendation/crop_model.pkl`
- **Exact Size:** **2,699,545 bytes** (~2.70 MB)
- **Serving Script:** `ml-services/crop-recommendation/app.py`

