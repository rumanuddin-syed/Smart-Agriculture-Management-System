# RESEARCH GAP ANALYSIS & FUTURE WORK DIRECTORY

This document identifies specific technical and scientific research gaps in the existing implementation and outlines recommended experiments to advance the system toward peer-reviewed publication and production deployment.

---

## 1. Research Gap Analysis Matrix

| # | Research Gap | Evidence in Existing Implementation | Existing Limitation | Proposed Architectural Improvement | Experiment Required |
|---|---|---|---|---|---|
| **1** | **Controlled vs. Uncontrolled Domain Shift** | Models trained primarily on laboratory benchmark datasets (PlantVillage/Kaggle `plant-models`) | Degraded accuracy on field imagery with natural soil, weeds, or multiple overlapping leaves | Domain-adversarial training (DANN) and synthetic data augmentation using real farm backgrounds | Collect $1,000$ real farmer-captured photos; evaluate baseline accuracy drop vs. domain-adapted model |
| **2** | **Multi-Label Pathology** | Pipeline assumes a single primary disease label per leaf | Real field leaves frequently exhibit co-occurring fungal and pest damage (e.g., blight + spider mites) | Multi-label sigmoid head with focal loss ($\gamma = 2.0$) replacing single-label Softmax | Benchmark multi-label classification mAP on co-infected field samples |
| **3** | **On-Device Edge Inference** | Models run as server-side PyTorch instances on CPU/GPU | Rural farmers in low-bandwidth areas suffer high latency or inability to diagnose offline | Export EfficientNet-B3 and ConvNeXt-Tiny to 8-bit quantized ONNX / TFLite models | Measure inference latency, memory footprint, and mAP degradation on low-end Android hardware |
| **4** | **Sensor Telemetry Integration** | Crop recommendation requires manual web-form entry of N-P-K and pH | High user friction and risk of erroneous data entry by smallholder farmers | Integrate MQTT broker and IoT LoRaWAN edge gateway connecting physical soil probes directly to backend | Pilot continuous soil moisture, N-P-K, and pH data ingestion over 14 days |
| **5** | **Automated Payment Gateway Integration** | Marketplace uses simulated screenshot review for college demonstration | Farmers must manually inspect each transaction screenshot; does not scale to thousands of orders | Integrate UPI Deep-linking / Razorpay webhook web services with automatic reconciliation | Test webhook idempotency, signature validation, and automatic order transitions |
| **6** | **Logistics & Cooperative Delivery Optimization** | Deliveries are manually marked without route optimization | Inefficient transportation costs for smallholder farmers dispatching individual orders | Capacitated Vehicle Routing Problem (CVRP) solver grouping multi-farmer consignments into shared vans | Benchmark delivery cost reduction using Google OR-Tools on Telangana regional cluster |

---

## 2. Recommended Experimental Protocol for Publication

To submit this research to high-tier agricultural informatics conferences or journals (e.g., *Computers and Electronics in Agriculture*, *IEEE Access*), conduct the following 3 empirical studies:

### Experiment A: Temperature Scaling vs. Deep Ensemble Calibration
- **Hypothesis**: Post-hoc Platt temperature scaling combined with dual-backbone averaging yields lower Expected Calibration Error (ECE) than uncalibrated Vision Transformers or single ResNet backbones.
- **Protocol**: Compare ECE, Brier Score, and Negative Log-Likelihood across ResNet-50, EfficientNet-B3, ConvNeXt-Tiny, and the Dual Ensemble on $5,000$ unseen test images.

### Experiment B: FAISS OOD Rejection Sensitivity Analysis
- **Hypothesis**: Cosine similarity against a dense representation space reliably rejects non-agricultural objects (animals, household items, synthetically corrupted leaves) without sacrificing in-distribution accuracy.
- **Protocol**: Construct an evaluation dataset containing $500$ in-distribution diseased leaves and $500$ out-of-distribution images (ImageNet random classes, human hands, tractor parts). Plot the AUROC curve of the OOD discriminator.

### Experiment C: Economic Impact of Direct Marketplace Supply Chains
- **Hypothesis**: The multi-farmer order decomposition and direct pricing model increase smallholder farmer net profit margins by $\ge 30\%$ relative to regional wholesale mandi pricing.
- **Protocol**: Compare the recognized net profit ledger from the simulated marketplace against historical wholesale market rate cards (APMC Mandi rates) for identical crop volumes.

