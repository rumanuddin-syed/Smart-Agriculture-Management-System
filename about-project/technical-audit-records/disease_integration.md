# Plant Disease Pipeline Integration Architecture

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  

---

## 1. Node.js Backend to Python Pipeline Communication

### 1.1 Microservice URL Resolution
- **File & Lines:** [server/src/services/mlDiseaseAdapter.js:5-11](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlDiseaseAdapter.js#L5-L11)
- **Environment Variable Name:** `PLANT_PIPELINE_URL`
- **Fallback URL:** `http://127.0.0.1:8000`
- **Target Endpoint:** `${base}/predict`

```javascript
const getPipelineUrl = () => {
  const base = (process.env.PLANT_PIPELINE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  return `${base}/predict`;
};

const ML_DISEASE_URL = getPipelineUrl();
```

### 1.2 Request Payload & Timeout Configuration
- **File & Lines:** [server/src/services/mlDiseaseAdapter.js:17-33](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlDiseaseAdapter.js#L17-L33)
- **Mock Bypass Check:** If `process.env.USE_MOCK_ML === 'true'`, calls local demo generator `getMockDiseasePrediction(filePath)` ([server/src/services/mlDiseaseAdapter.js:18-20](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/services/mlDiseaseAdapter.js#L18-L20)).
- **Form Data Field:** `file` (streams the disk file created by Multer).
- **Timeout Setting:** **60,000 milliseconds (60 seconds)** to accommodate multi-stage CPU inference:

```javascript
const formData = new FormData();
formData.append('file', fs.createReadStream(filePath));

const response = await axios.post(ML_DISEASE_URL, formData, {
  headers: formData.getHeaders(),
  timeout: 60000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

return response.data;
```

### 1.3 Error Handling & HTTP Status Code Mapping
- **File & Lines:** [server/src/controllers/diseaseController.js:36-54](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/diseaseController.js#L36-L54)
- **Temporary File Cleanup:** Unlinks temporary upload file if upstream communication fails ([server/src/controllers/diseaseController.js:38-40](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/diseaseController.js#L38-L40)).
- **Upstream HTTP Response Forwarding:** Forwards FastAPI error status and message if received:
  ```javascript
  if (upstreamErr.response) {
    const status = upstreamErr.response.status;
    const detail = upstreamErr.response.data?.detail || 'Upstream ML service error';
    return res.status(status).json({ message: detail });
  }
  ```
- **Timeout Mapping:** Maps `ECONNABORTED` or timeout message to **504 Gateway Timeout**:
  ```javascript
  if (upstreamErr.code === 'ECONNABORTED' || upstreamErr.message?.includes('timeout')) {
    return res.status(504).json({ message: 'Inference request timed out. Please try again.' });
  }
  ```
- **Service Unreachable Mapping:** Maps `ECONNREFUSED` to **503 Service Unavailable**:
  ```javascript
  if (upstreamErr.code === 'ECONNREFUSED') {
    return res.status(503).json({ message: 'Plant disease ML pipeline service is currently unavailable.' });
  }
  ```
- **Generic Fallback:** Returns **500 Internal Server Error** ([server/src/controllers/diseaseController.js:53](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/diseaseController.js#L53)).

---

## 2. Database Persistence for Disease Detection

### 2.1 Persistence Conditions & Saved Statuses
- **File & Lines:** [server/src/controllers/diseaseController.js:112-129](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/diseaseController.js#L112-L129)
- **Mongoose Model:** `DiseasePrediction` ([server/src/models/DiseasePrediction.js](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/models/DiseasePrediction.js))
- **Status Guard Rule:** Diagnoses are **ONLY saved under status `'confident'`**:

```javascript
let savedRecord = null;
if (req.user && req.user.id && status === 'confident' && predictedClassName) {
  savedRecord = await DiseasePrediction.create({
    userId: req.user.id,
    imageUrl,
    predictedClass: predictedClassName,
    cropName: advisory?.crop_name || cropName,
    diseaseName: advisory?.disease_name || diseaseName,
    confidence: confidence || 0.0,
    advisory: {
      treatment_guidance: advisory?.treatment_guidance || 'N/A',
      organic_eco_management: advisory?.organic_eco_management || 'N/A',
      remedy_status: advisory?.remedy_status || 'verified',
      source_name: advisory?.source_name || 'Plant Pipeline'
    }
  });
}
```

### 2.2 Unsaved Statuses
- Diagnoses returning status `'uncertain'`, `'retake'`, or `'rejected'`, as well as diagnoses performed by unauthenticated guest users, are **NEVER saved** to the database ([server/src/controllers/diseaseController.js:114](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/server/src/controllers/diseaseController.js#L114)).

---

## 3. Frontend Client Status Handling

- **Source File:** `client/src/pages/DiseaseDetection.jsx`
- **Status Variable Resolution:** [client/src/pages/DiseaseDetection.jsx:91](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L91):
  `const status = result?.status || (result?.prediction ? 'confident' : null);`

### 3.1 Status: `confident`
- **File & Lines:** [client/src/pages/DiseaseDetection.jsx:191-281](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L191-L281)
- **Visual Presentation:**
  - If healthy (`isHealthy === true`): Displays green badge (`bg-green-50`) with `CheckCircle` icon ([lines 193-195](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L193-L195)).
  - If diseased: Displays orange badge (`bg-orange-50`) with `ShieldAlert` icon ([lines 196-198](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L196-L198)).
  - Formatted diagnosis title (`formatTitle(result.prediction)`) and detected crop name ([lines 200-205](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L200-L205)).
  - Calibrated confidence pill: `Confidence: ${(Number(result.confidence || 0) * 100).toFixed(1)}%` ([lines 207-210](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L207-L210)).
- **Information Panels (from `result.disease_info`):**
  - *Characteristics & Symptoms:* Visual leaf manifestation ([lines 222-232](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L222-L232)).
  - *Preventive Measures:* Cultural farm practices ([lines 235-245](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L235-L245)).
  - *Treatment Guidance (Chemical):* Active chemical remedies (hidden if leaf is healthy) ([lines 248-258](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L248-L258)).
  - *Organic & Eco Management:* Bio-fungicides and neem oil treatments ([lines 261-271](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L261-L271)).
  - *Advisory:* Professional agronomist consultation warning ([lines 274-278](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L274-L278)).

### 3.2 Status: `uncertain`
- **File & Lines:** [client/src/pages/DiseaseDetection.jsx:284-308](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L284-L308)
- **Visual Presentation:**
  - Amber banner (`bg-amber-50 border-amber-200`) with `HelpCircle` icon.
  - Heading: `"Diagnosis Uncertain"` ([line 288](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L288)).
  - Message: `result.message` explaining why the model could not reach a confident diagnosis ([lines 289-291](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L289-L291)).
  - Next Steps box: Recommends expert agronomist review and retaking photo with clear single-leaf focus ([lines 293-299](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L293-L299)).
  - Action: `"Retake Photo"` button executing `resetForm()` ([lines 300-306](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L300-L306)).

### 3.3 Status: `retake`
- **File & Lines:** [client/src/pages/DiseaseDetection.jsx:311-336](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L311-L336)
- **Visual Presentation:**
  - Yellow banner (`bg-yellow-50 border-yellow-200`) with `RefreshCw` icon.
  - Heading: `"Photo Retake Needed"` ([line 315](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L315)).
  - Quality Explanation: `result.message` explaining quality failure (blur, brightness clipping, or insufficient vegetation) ([lines 316-318](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L316-L318)).
  - Tips Panel: "Avoid blur and camera shake", "Ensure adequate natural light", "Hold camera close enough so the leaf occupies most of the frame" ([lines 320-327](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L320-L327)).
  - Action: `"Retake Photo"` button executing `resetForm()` ([lines 328-334](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L328-L334)).

### 3.4 Status: `rejected`
- **File & Lines:** [client/src/pages/DiseaseDetection.jsx:339-359](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L339-L359)
- **Visual Presentation:**
  - Red banner (`bg-red-50 border-red-200`) with `XCircle` icon.
  - Heading: `"Image Not Recognized"` ([line 343](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L343)).
  - Out-of-Distribution Warning: `result.message` ("This image does not match any supported plant leaf in our database") ([lines 344-346](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L344-L346)).
  - Subtext: "Please submit a clear, focused photograph showing a single supported crop leaf." ([lines 348-350](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L348-L350)).
  - Action: `"Upload Another Photo"` button executing `resetForm()` ([lines 351-357](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/client/src/pages/DiseaseDetection.jsx#L351-L357)).

