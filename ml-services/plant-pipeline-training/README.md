# Plant Pipeline — Training Code

This folder contains configuration files, training scripts, and test utilities used **only for retraining** the plant disease detection models. They are not needed to run the inference service.

## Contents

- `configs/` — Dataset aliases, label maps, and example dataset configuration.

## Prerequisites for Retraining

1. The `common/` package from `../plant-pipeline/common/` must be importable. Either:
   - Add `../plant-pipeline` to your `PYTHONPATH`, or
   - Symlink `common/` into this folder.

2. Trained artifacts (`.pt` checkpoints, FAISS index, calibration, disease info) are stored in `../plant-pipeline/artifacts/`.

3. Install training-specific dependencies in addition to `../plant-pipeline/requirements-serve.txt`.

## Source

Model artifacts were trained on the Kaggle `plant-models` dataset. See `../plant-pipeline/artifacts/README.md` for the exact file list.

