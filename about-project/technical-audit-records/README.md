# Smart Agriculture Management — Static Codebase Analysis Records

**Date of Audit:** 2026-11-10  
**Audit Mode:** Read-Only Static Analysis (no servers, databases, or ML services were started; no files were modified or deleted outside `project-records/app/`).  
**Output Directory:** `project-records/app/`  

---

## 1. Directory Index of Produced Records

| # | File Name | Format | Primary Contents & Focus Area |
|---|---|:---:|---|
| 1 | [**`inventory.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/inventory.md) | Markdown | Depth-3 folder tree, LOC counts per folder/language, config versions, complete dependency inventory with versions, file modification timestamps, and ML artifacts size register. |
| 2 | [**`architecture.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/architecture.md) | Markdown | Service topology (Client -> Server -> Microservices -> Database), ports, interconnect flow diagram, environment variable names, and exact startup commands. |
| 3 | [**`api.csv`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/api.csv) | CSV | Complete catalog of 43 backend routes: HTTP method, path, auth/role guards, request fields, response shape, and controller file:line references. |
| 4 | [**`database.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/database.md) | Markdown | 11 Mongoose model definitions (fields, types, required flags, enums, defaults, refs, indexes), entity relationship diagram, and seed script breakdowns. |
| 5 | [**`features.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/features.md) | Markdown | 24 client pages with their route paths, implementing components, and APIs called; state management architecture; features implemented per role (consumer, farmer, admin). |
| 6 | [**`security.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/security.md) | Markdown | Password hashing (bcryptjs 10 rounds), JWT token lifecycle, RBAC middleware, upload size/type constraints, CORS posture, and an honest vulnerability gap analysis. |
| 7 | [**`crop_model.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/crop_model.md) | Markdown | Crop recommendation model audit: training script & dataset provenance, serving script code quotations, request/response schema, and artifact size. |
| 8 | [**`disease_integration.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/disease_integration.md) | Markdown | Deep dive into plant disease pipeline integration: Node adapter timeouts, upstream error mappings, database persistence rule (only confident saves), and client UI handling per status (`confident`, `uncertain`, `retake`, `rejected`). |
| 9 | [**`tests.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/tests.md) | Markdown | Automated testing audit: analysis of unit test framework absence and detailed step-by-step breakdown of `server/src/scripts/testMarketplaceE2E.js`. |
| 10 | [**`issues.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/issues.md) | Markdown | Known issues, hardcoded ports/secrets/thresholds, missing numerical bounds validation, and leftover legacy references to the old disease detection service. |
| 11 | [**`pages.md`**](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/project-records/app/pages.md) | Markdown | Exhaustive URL index of all 24 client pages grouped by role (Public, Authenticated Core Tools, Consumer Orders, Farmer Business Suite) for manual screenshot capture. |

---

## 2. Commands Executed During Static Analysis

All analyses were executed using standard, non-destructive Linux utilities:

```bash
# 1. Folder tree depth 3 (excluding ignored build/dependency directories)
find . -maxdepth 3 -not -path '*/.*' -not -path '*node_modules*' -not -path '*venv*' -not -path '*__pycache__*' -not -path '*dist*' -not -path '*build*' | sort

# 2. Lines of code per folder and language
# Executed via Python subprocess invoking 'find' and 'wc -l' across source extensions (.js, .jsx, .py, .css, .html, .json, .yaml, .md, .txt)

# 3. Model artifacts and file size verification
ls -la ml-services/plant-pipeline/artifacts
ls -la project-resources/final_backup/artifacts/
ls -la ml-services/crop-recommendation/

# 4. Git status check
git rev-list --count HEAD # Confirmed: fatal: not a git repository

# 5. Timestamp inspection
# Executed via Python os.path.getmtime across source and generated files

# 6. Service start commands & environment variable audit
grep -rn "process\.env" server/src/
grep -rn -E "os\.getenv|os\.environ" ml-services/ --exclude-dir=venv --exclude-dir=.venv

# 7. Training scripts and datasets search
find . -not -path '*/.*' -not -path '*node_modules*' -not -path '*venv*' -not -path '*__pycache__*' \( -name "*crop*" -o -name "*train*" -o -name "*.ipynb" -o -name "*dataset*" \)
grep -rn "crop_model" . --exclude-dir=node_modules --exclude-dir=venv --exclude-dir=.venv

# 8. Route mapping and controller function line discovery
# Executed via Python regex extracting exports.<function> across server/src/controllers/*.js

# 9. Test suite search
find . -not -path '*/.*' -not -path '*node_modules*' -not -path '*venv*' -not -path '*__pycache__*' -name "*test*"

# 10. TODO and FIXME search
grep -rn -i "TODO" client/src/ server/src/ ml-services/ --exclude-dir=venv --exclude-dir=.venv
grep -rn -i "FIXME" client/src/ server/src/ ml-services/ --exclude-dir=venv --exclude-dir=.venv

# 11. Dependency usage verification
# Executed via Python subprocess searching require(...) and import ... from ... across client and server source files
```

---

## 3. Register of Items Marked "NOT AVAILABLE"

In accordance with academic honesty principles, every item that could not be verified directly from existing repository files is explicitly cataloged below with its reason:

| Item Description | Relevant Record File | Status | Reason & Evidence |
|---|---|:---:|---|
| **Git Commit History & Commit Counts** | `inventory.md` | **NOT AVAILABLE** | The project directory does not contain a `.git` folder (`fatal: not a git repository`). |
| **Node / Python Version Lockfiles (`.nvmrc`, `runtime.txt`)** | `inventory.md` | **NOT AVAILABLE** | Neither `.nvmrc`, `.node-version`, `.python-version`, nor `runtime.txt` exists on disk. Versions are documented only as text guidelines in `README.md:38-39`. |
| **`engines` Field in `package.json`** | `inventory.md` | **NOT AVAILABLE** | Neither `client/package.json` nor `server/package.json` includes an `engines` block. |
| **Old Disease Detection Service (`ml-services/disease-detection/`)** | `inventory.md` | **NOT AVAILABLE** | Directory does not exist on disk; it was superseded by `ml-services/plant-pipeline/`. |
| **Crop Recommendation Service Environment Variables** | `architecture.md` | **NOT AVAILABLE** | `ml-services/crop-recommendation/app.py` does not call `os.getenv` or `os.environ`; port 5001 and artifact path are hardcoded in lines 6 and 26. |
| **Crop Model Training Script / Notebook** | `crop_model.md` | **NOT AVAILABLE** | No training script (e.g. `train.py`) or Jupyter notebook (`*.ipynb`) for crop recommendation exists in the workspace. |
| **Crop Recommendation Tabular Dataset File** | `crop_model.md` | **NOT AVAILABLE** | No raw or processed tabular dataset file (e.g. `crop.csv`) exists in the repository. |
| **Crop Model Training Split, Seed & Training Scope** | `crop_model.md` | **NOT AVAILABLE** | Cannot be verified from codebase files because the training script is absent. |
| **Automated Unit Testing Frameworks & Unit Test Files** | `tests.md` | **NOT AVAILABLE** | No test framework packages (`jest`, `mocha`, `pytest`) are installed, and no unit test files exist. |
| **Dedicated Admin UI Pages** | `features.md` | **NOT AVAILABLE** | No dedicated administrative routes (`/admin/*`) exist in `client/src/App.jsx`. Admin privileges operate via role check bypasses on farmer pages. |
| **Backend Rate Limiting** | `security.md`, `issues.md` | **NOT AVAILABLE** | No rate-limiting middleware package (`express-rate-limit`) is installed or implemented in `server/src/app.js`. |
| **Phase 1 Disease CSV Dataset Referenced by Seed Script** | `issues.md` | **NOT AVAILABLE** | `server/src/scripts/importDiseases.js:10` references `data/phase1_disease_advisory_38_classes_verified_sources.csv`, which does not exist in the repository. |

