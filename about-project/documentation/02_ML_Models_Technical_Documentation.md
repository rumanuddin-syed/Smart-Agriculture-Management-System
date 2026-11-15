# MACHINE LEARNING MODELS TECHNICAL SPECIFICATION & AUDIT

This document provides exact, evidence-backed technical documentation of all machine learning models implemented in the Smart Agriculture Assistant codebase.

---

## 1. Crop Recommendation Model (`crop_model.pkl`)

### 1.1 Model Identification
- **Model Name**: Soil-Climatic Multi-Class Crop Recommender
- **Task**: Multi-class supervised classification
- **Architecture**: Random Forest Classifier (`sklearn.ensemble._forest.RandomForestClassifier`)
- **Trained Artifact Location**: `ml-services/crop-recommendation/crop_model.pkl`
- **File Size**: $2,699,545\text{ bytes } (\approx 2.70\text{ MB})$
- **Framework & Version**: Scikit-Learn 1.6.1 / Joblib
- **Inference Runtime**: Flask REST Service (`ml-services/crop-recommendation/app.py`, port 5001)

### 1.2 Hyperparameters & Structural Configuration
Extracted directly from the serialized Python estimator:
| Parameter | Actual Value | Purpose & Meaning |
|---|---|---|
| `n_estimators` | `100` | Number of decision trees in the ensemble |
| `max_depth` | `10` | Maximum tree depth to prevent leaf over-fitting |
| `n_features_in_` | `7` | Exact number of continuous input features |
| `criterion` | `'gini'` | Gini impurity splitting criterion |
| `min_samples_split` | `2` | Minimum samples required to split an internal node |
| `min_samples_leaf` | `1` | Minimum samples required at a leaf node |
| `bootstrap` | `True` | Bootstrap sampling used when building trees |

### 1.3 Input Features (7 Features)
| Index | Feature | Dimension / Unit | Physical Meaning | Typical Range |
|---|---|---|---|---|
| 0 | `N` | $\text{kg/ha}$ or ratio | Soil Nitrogen content ratio | $0 - 140$ |
| 1 | `P` | $\text{kg/ha}$ or ratio | Soil Phosphorus content ratio | $5 - 145$ |
| 2 | `K` | $\text{kg/ha}$ or ratio | Soil Potassium content ratio | $5 - 205$ |
| 3 | `temperature` | $^{\circ}\text{C}$ | Ambient ambient temperature | $8.0 - 45.0$ |
| 4 | `humidity` | $\%$ | Relative air humidity | $14.0 - 100.0$ |
| 5 | `ph` | pH scale ($0-14$) | Soil acidity / alkalinity | $3.5 - 9.9$ |
| 6 | `rainfall` | $\text{mm}$ | Annual or seasonal precipitation | $20.0 - 300.0$ |

### 1.4 Output Classes (22 Crops)
`classes_`:
```python
[
  'apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee', 'cotton',
  'grapes', 'jute', 'kidneybeans', 'lentil', 'maize', 'mango', 'mothbeans',
  'mungbean', 'muskmelon', 'orange', 'papaya', 'pigeonpeas', 'pomegranate',
  'rice', 'watermelon'
]
```

### 1.5 Prediction Formulation
Given input vector $\mathbf{x} = [N, P, K, T, H, \text{pH}, R] \in \mathbb{R}^7$:
$$\hat{y} = \arg\max_{c \in \mathcal{C}} \frac{1}{B} \sum_{b=1}^{B} P_b(y = c \mid \mathbf{x})$$
where $B = 100$ trees, and $\mathcal{C}$ is the set of 22 agricultural crop classes.

---

## 2. Plant Disease Pipeline Deep Learning Models

The disease detection pipeline deploys 4 deep neural networks built on modern vision backbones (`timm` library), calibrated via empirical temperature scaling.

### 2.1 Model Artifact Inventory
| Checkpoint File | Size | Architecture | Output Classes | Checkpoint Epoch | Primary Metric (from metadata) |
|---|---|---|---|---|---|
| `crop_effb3.pt` | $43.5\text{ MB}$ | `tf_efficientnet_b3.ns_jft_in1k` | 34 plant types | Epoch 19 | Validation Acc: $94.74\%$, Macro F1: $0.8616$ |
| `health_effb3.pt` | $43.3\text{ MB}$ | `tf_efficientnet_b3.ns_jft_in1k` | 2 (diseased, healthy) | Epoch 14 | Validation Acc: $98.28\%$, Macro F1: $0.9812$ |
| `disease_effb3.pt` | $44.0\text{ MB}$ | `tf_efficientnet_b3.ns_jft_in1k` | 116 condition classes | Epoch 15 | Validation Acc: $89.98\%$, Macro F1: $0.7650$ |
| `disease_convnext_tiny.pt` | $111.7\text{ MB}$ | `convnext_tiny` | 116 condition classes | Epoch 21 | Validation Acc: $89.18\%$, Macro F1: $0.7209$ |
| `embeddings.faiss` | $131.0\text{ MB}$ | Flat / Euclidean Index | 768 dimensions | N/A | $42,652$ reference embeddings |

---

## 3. Neural Backbone Architectures

### 3.1 EfficientNet-B3 (`tf_efficientnet_b3.ns_jft_in1k`)
- **Type**: Convolutional Neural Network with Compound Scaling
- **Input Resolution**: $300 \times 300 \times 3$ RGB
- **Backbone Building Blocks**: Mobile Inverted Bottleneck Convolutions (MBConv) with Squeeze-and-Excitation (SE) optimization
- **Feature Pooling**: Global Average Pooling ($\mathbb{R}^{1536}$)
- **Classification Head Structure**:
  $$\mathbf{z} = \mathbf{W}_2 \cdot \text{SiLU}(\text{Dropout}_{0.3}(\mathbf{W}_1 \cdot \text{GAP}(\mathbf{F})))$$
- **Total State Dict Keys**: 574 tensor parameters

### 3.2 ConvNeXt-Tiny (`convnext_tiny`)
- **Type**: Modernized Pure Convolutional Network (re-engineered along Vision Transformer principles)
- **Input Resolution**: $224 \times 224 \times 3$ RGB
- **Core Mechanism**: Inverted Bottleneck with $7 \times 7$ Depthwise Convolutions, LayerNorm instead of BatchNorm, and GELU activations.
- **Embedding Output**: 768-dimensional penultimate feature representation (also powers the FAISS reference vector store).
- **Classification Head**: `Linear(in_features=768, out_features=116)`
- **Total State Dict Keys**: 182 tensor parameters

---

## 4. Temperature Scaling & Platt Calibration Engine

To prevent uncalibrated, over-confident deep learning predictions, Platt temperature scaling is evaluated on validation logits $\mathbf{z}$:

$$p_i = \frac{\exp(z_i / T)}{\sum_{j=1}^{K} \exp(z_j / T)}$$

Empirically calibrated parameters from `calibration.json` ($N = 2,608$ validation samples):
| Model | Temperature ($T$) | NLL Before | NLL After | ECE Before | ECE After (Calibrated) | Selective Accuracy Target |
|---|---|---|---|---|---|---|
| `crop_effb3` | $0.9618$ | $0.8160$ | $0.8139$ | $5.34\%$ | **$4.01\%$** | $90.02\%$ @ threshold $0.7997$ |
| `health_effb3` | $0.8916$ | $0.1865$ | $0.1841$ | $3.87\%$ | **$2.38\%$** | $95.00\%$ @ threshold $0.7364$ |
| `disease_convnext_tiny` | $1.5364$ | $0.5394$ | $0.4763$ | $8.74\%$ | **$4.44\%$** | — |
| `disease_effb3` | $1.3477$ | $0.4761$ | $0.4481$ | $6.33\%$ | **$2.89\%$** | — |
| **Disease Ensemble** | Weighted Avg | — | — | — | **$4.09\%$** | **$94.96\%$** @ threshold $0.8190$ |

---

## 5. FAISS Vector Search & Out-of-Distribution (OOD) Validation

- **Embedder**: `disease_convnext_tiny` penultimate layer ($768$ dimensions).
- **Index Type**: `IndexFlatIP` (Inner Product on $L_2$-normalized vectors $\equiv$ Cosine Similarity).
- **Reference Corpus**: $N = 42,652$ verified agricultural pathology images.
- **Decision Parameters**:
  - `ood_similarity_threshold`: $0.5783$ (95th percentile in-distribution boundary).
  - `top_k_neighbors`: $10$.
  - `neighbor_crop_agreement`: $\ge 50\%$ of nearest neighbors must belong to the predicted crop.
  - `neighbor_label_agreement`: $\ge 20\%$ of nearest neighbors must match the exact disease class.
- If maximum neighbor cosine similarity $< 0.5783$, the image is classified as `uncertain` or `rejected` with OOD flags.

