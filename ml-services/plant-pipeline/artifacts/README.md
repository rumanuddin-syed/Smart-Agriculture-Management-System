# Plant Pipeline — Required Artifacts

This folder must contain the following files for the inference service to start.
They are **not checked into version control** (too large). Download them from the
Kaggle `plant-models` dataset or extract from `final_backup.zip`.

## Required Files

| File | Size (approx.) | Description |
|------|-----------------|-------------|
| `health_effb3.pt` | ~40 MB | EfficientNet-B3 healthy/diseased binary classifier |
| `crop_effb3.pt` | ~40 MB | EfficientNet-B3 crop identifier |
| `disease_effb3.pt` | ~40 MB | EfficientNet-B3 disease classifier |
| `disease_convnext_tiny.pt` | ~100 MB | ConvNeXt-Tiny disease classifier (ensemble partner) |
| `embeddings.faiss` | ~5 MB | FAISS similarity index for OOD / confidence checks |
| `reference_meta.csv` | ~200 KB | Metadata for FAISS reference embeddings |
| `calibration.json` | ~2 KB | Temperature-scaling calibration parameters (tracked in git) |
| `disease_info.json` | ~79 KB | Disease descriptions, precautions, treatments (tracked in git) |
| `embedder.json` | ~1 KB | Embedder configuration (tracked in git) |

## Tracked vs Untracked

- **Git-tracked** (small JSON/config): `calibration.json`, `disease_info.json`, `embedder.json`
- **Git-ignored** (large binary): `*.pt`, `*.faiss`, `reference_meta.csv`

## Verification

Run the health check after placing all files:

```bash
cd ml-services/plant-pipeline
source venv/bin/activate
python3 -m uvicorn service.app:app --host 127.0.0.1 --port 8000
# In another terminal:
curl -s http://127.0.0.1:8000/health | python3 -m json.tool
```

The response should show `"calibrated": true` and all 4 models loaded.

