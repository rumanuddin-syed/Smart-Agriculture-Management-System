# Known Issues, Code Gaps, Hardcoded Values & Leftover References

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  

---

## 1. TODO and FIXME Comments Search

- **Findings:** **ZERO occurrences found.**
- **Verification Command:** `grep -rn -i "TODO" client/src/ server/src/ ml-services/` and `grep -rn -i "FIXME" client/src/ server/src/ ml-services/` (both exited with return code 1, 0 matches).

---

## 2. Hardcoded Values & Network Configuration

| Category | Hardcoded Value | Source File & Line | Impact & Risk |
|---|---|---|---|
| **Microservice Port** | `port=5001` | [ml-services/crop-recommendation/app.py:26](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/crop-recommendation/app.py#L26) | `app.run(port=5001)` hardcodes port 5001. No environment variable is read to override port on multi-tenant hosts. |
| **Model Filename** | `'crop_model.pkl'` | [ml-services/crop-recommendation/app.py:6](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/crop-recommendation/app.py#L6) | `joblib.load('crop_model.pkl')` relies on current working directory. Fails if executed from repository root without `cd ml-services/crop-recommendation`. |
| **JWT Secret Fallback** | `'super_secret_green_agri_key_2026'` | [server/src/controllers/authController.js:4](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/authController.js#L4), [server/src/middleware/auth.js:3](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/auth.js#L3) | If `JWT_SECRET` is not set in `.env`, the system defaults to a public repository secret string. |
| **Inference Timeout** | `60000` (60 seconds) | [server/src/services/mlDiseaseAdapter.js:27](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlDiseaseAdapter.js#L27) | Hardcoded Axios timeout cannot be adjusted for slower CPU machines without code modification. |
| **Confidence Fallback** | `0.95` (95%) | [server/src/controllers/cropController.js:41, 48](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/cropController.js#L41) | `confidence: mlResult.confidence || 0.95` assigns an optimistic 95% default confidence if the Python response omits confidence. |
| **Upload Size Limits** | `10 * 1024 * 1024` (10 MB) | [server/src/middleware/upload.js:35](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/upload.js#L35), [server/src/middleware/marketplaceUpload.js:39](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/marketplaceUpload.js#L39) | Multer file limits are hardcoded in JavaScript rather than configured via environment variables. |
| **Client Dev Proxy** | `target: 'http://localhost:5000'` | [client/vite.config.js:11](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/vite.config.js#L11) | Vite dev server hardcodes local Node port 5000. |

---

## 3. Leftover References to Old Disease-Detection Service

| Location | Quoted Reference | Description |
|---|---|---|
| [ml-services/plant-pipeline/service/app.py:5](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/plant-pipeline/service/app.py#L5) | `POST /predict (multipart field file) - backwards-compatible with the old disease-detection service:` | Docstring comment documenting compatibility shim with the legacy single-model service. |
| [server/src/app.js:30](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/app.js#L30) | `app.use('/api/disease-detection', diseaseRoutes);` | Express route retains the historical endpoint namespace `/api/disease-detection` even though it proxies the new multi-stage `plant-pipeline`. |
| [server/src/controllers/diseaseController.js:65-68](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/diseaseController.js#L65-L68) | `// Normalize pipeline status (defaulting gracefully if legacy service structure is encountered)`<br>`const status = mlResult.status || (mlResult.prediction ? 'confident' : 'uncertain');` | Compatibility fallback parser in controller to support responses from the old service schema. |
| [server/src/scripts/importDiseases.js:10](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/scripts/importDiseases.js#L10) | `path.join(__dirname, '../../../data/phase1_disease_advisory_38_classes_verified_sources.csv')` | Script targets old Phase 1 38-class CSV file which is missing from the workspace root. |

---

## 4. Input Validation & Robustness Gaps

1. **Crop Feature Range Boundaries Unenforced:**  
   In [server/src/controllers/cropController.js:9-29](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/cropController.js#L9-L29), the code checks `if (N === undefined ...)` and converts inputs to `Number(...)`. It does not reject:
   - Non-numeric strings (which become `NaN`).
   - Physically impossible soil pH (e.g. `ph: -5` or `ph: 25`).
   - Negative rainfall or macronutrient values.
2. **MIME-Type Only Upload Validation:**  
   In [server/src/middleware/upload.js:24-28](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/upload.js#L24-L28) and [server/src/middleware/marketplaceUpload.js:28-32](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/middleware/marketplaceUpload.js#L28-L32), file checking relies on `file.mimetype.startsWith('image/')` provided by client request headers. File magic numbers / headers are not inspected prior to disk storage.
3. **No Rate Limiting:**  
   No rate-limiting middleware is present in `server/src/app.js`, leaving login and image inference routes unthrottled.
4. **Missing Missing File in Seed Script:**  
   `server/src/scripts/importDiseases.js` references `data/phase1_disease_advisory_38_classes_verified_sources.csv` which does not exist on disk, causing the standalone script to exit with error code 1 if invoked.

