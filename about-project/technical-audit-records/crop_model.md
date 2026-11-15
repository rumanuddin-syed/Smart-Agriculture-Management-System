# Crop Recommendation Model Specification & Training Provenance

**Generated on:** 2026-11-10  
**Repository Scope:** Static read-only codebase analysis  
**Artifact Status:** Read-only inspection (model was NOT loaded into memory)  

---

## 1. Model Artifact Inventory

- **Artifact File Path:** `ml-services/crop-recommendation/crop_model.pkl`
- **File Size:** **2,699,545 bytes** (~2.70 MB)
- **Serving Script Path:** `ml-services/crop-recommendation/app.py`
- **Requirements File:** `ml-services/crop-recommendation/requirements.txt`

---

## 2. Training Script, Notebook & Dataset Provenance

### 2.1 Training Script or Notebook Location
- **Status:** **NOT AVAILABLE**
- **Evidence & Reason:** Exhaustive filesystem search across the repository (`find . -name "*.ipynb" -o -name "*crop*" -o -name "*train*"`) confirms that no training script (e.g., `train_crop.py`, `train.py`) or Jupyter notebook (`*.ipynb`) exists in `ml-services/crop-recommendation/` or anywhere else in the workspace.

### 2.2 Dataset File Location
- **Status:** **NOT AVAILABLE**
- **Evidence & Reason:** No tabular dataset file (e.g., `Crop_recommendation.csv`, `crop.csv`) is present in `ml-services/crop-recommendation/` or any data directory in the workspace.

### 2.3 Training Code, Split, Hyperparameters, Random Seed & Training Scope
- **Status:** **NOT AVAILABLE**
- **Evidence & Reason:** Because no training script or notebook exists in the repository, the exact training code (train/test split ratio, train-test random seed, cross-validation strategy, and whether the final saved model was fitted on all rows or on a training split) cannot be determined from repository files.

---

## 3. Microservice Request & Response Format

*Quoted verbatim from the live serving script in [ml-services/crop-recommendation/app.py:8-23](file:///home/syed-rumanuddin/E4/SEM%201/major%20project/Smart%20Agriculture%20Mangement/ml-services/crop-recommendation/app.py#L8-L23):*

```python
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = np.array([[
        data['N'], data['P'], data['K'],
        data['temperature'], data['humidity'],
        data['ph'], data['rainfall']
    ]])
    prediction = model.predict(features)
    probabilities = model.predict_proba(features)
    confidence = float(np.max(probabilities))

    return jsonify({
        'crop': prediction[0],
        'confidence': round(confidence, 4)
    })
```

### 3.1 Expected Request Format
- **HTTP Method & Path:** `POST /predict`
- **Header:** `Content-Type: application/json`
- **Payload Schema:**
  ```json
  {
    "N": 90.0,
    "P": 42.0,
    "K": 43.0,
    "temperature": 20.87,
    "humidity": 82.00,
    "ph": 6.50,
    "rainfall": 202.93
  }
  ```

### 3.2 Response Format
- **Status Code:** `200 OK`
- **Header:** `Content-Type: application/json`
- **Payload Schema:**
  ```json
  {
    "crop": "rice",
    "confidence": 0.9654
  }
  ```

