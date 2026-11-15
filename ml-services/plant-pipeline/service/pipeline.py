"""The full decision pipeline, in the order of the design diagram:

 image -> quality -> plant detected? -> crop -> healthy/diseased -> disease (ensemble, crop-masked)
       -> confidence check -> OOD / similarity (FAISS) -> FINAL: confident | uncertain | retake | rejected

Every stage's evidence is returned in the response so a wrong answer can be debugged.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

import cv2
import faiss
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from PIL import Image, ImageOps

from common import quality
from common.calibration import mask_logits, softmax
from common.data import eval_transform
from common.models import load_checkpoint, logits_and_embedding
from common.naming import SEP, make_label, pretty
from service.detector import LeafDetector
from service.knowledge import Knowledge

VERSION = "2.0.0"
Image.MAX_IMAGE_PIXELS = 60_000_000

# Used only when artifacts/calibration.json is missing. NOT validated - run training.f_calibrate.
DEFAULT_TH = dict(crop_conf=0.80, health_conf=0.80, disease_conf=0.80, ood_similarity=0.55, ood_topk=10,
                  neighbor_crop_agreement=0.5, neighbor_label_agreement=0.2)

REASON_TEXT = {
    "crop_low_confidence": "The crop could not be identified confidently (it may not be a supported crop).",
    "health_low_confidence": "The leaf could not be confidently classified as healthy or diseased.",
    "no_disease_model_for_crop": "No disease model coverage exists for this crop yet.",
    "models_disagree": "The two disease models disagree with each other.",
    "disease_low_confidence": "The disease prediction confidence is below the reliability threshold.",
    "neighbors_disagree_crop": "Similar reference images belong to a different crop.",
    "neighbors_disagree_label": "Similar reference images do not support this diagnosis.",
}


class PlantPipeline:
    def __init__(self, artifacts_dir="artifacts", device=None, require_calibration=False):
        art = Path(artifacts_dir)
        self.art = art
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))

        cal_path = art / "calibration.json"
        self.cal = json.load(open(cal_path)) if cal_path.exists() else None
        if self.cal is None and require_calibration:
            raise FileNotFoundError(f"{cal_path} missing. Run `python -m training.f_calibrate` first.")
        self.th = {**DEFAULT_TH, **(self.cal or {}).get("thresholds", {})}
        self.T = (self.cal or {}).get("temperatures", {})
        self.qcfg = {**quality.DEFAULTS, **(self.cal or {}).get("quality", {})}

        self.models = {}
        for stem in sorted(p.stem for p in art.glob("*.pt") if p.stem.split("_")[0] in ("crop", "health", "disease")):
            self.models[stem] = load_checkpoint(art / f"{stem}.pt", self.device)
        self.crop_key = self._first("crop_")
        self.health_key = self._first("health_")
        self.disease_keys = sorted(k for k in self.models if k.startswith("disease_"))
        if not (self.crop_key and self.health_key and self.disease_keys):
            raise FileNotFoundError(f"need crop_*, health_* and disease_* checkpoints in {art} (found {list(self.models)})")
        cls0 = self.models[self.disease_keys[0]][1]["classes"]
        for k in self.disease_keys[1:]:
            assert self.models[k][1]["classes"] == cls0, "disease models were trained on different class lists"
        self.disease_classes = cls0

        emb = json.load(open(art / "embedder.json"))
        self.embedder_key = emb["embedder"]
        assert self.embedder_key in self.models, f"embedder {self.embedder_key} not among loaded models"
        self.index = faiss.read_index(str(art / "embeddings.faiss"))
        meta = pd.read_csv(art / "reference_meta.csv")
        assert len(meta) == self.index.ntotal, "reference_meta.csv and embeddings.faiss are out of sync"
        self.ref_disease, self.ref_crop = meta["disease"].to_numpy(), meta["crop"].to_numpy()

        self.detector = LeafDetector(art / "leaf_yolo.pt", device=None if self.device.type == "cpu" else str(self.device))
        self.knowledge = Knowledge(Path(__file__).with_name("disease_info.json"), art / "disease_info.json")
        self._tfs = {}

    def _first(self, prefix):
        ks = [k for k in self.models if k.startswith(prefix)]
        return ks[0] if ks else None

    def info(self) -> dict:
        return dict(version=VERSION, device=str(self.device), calibrated=self.cal is not None,
                    detector=self.detector.method, models=list(self.models), embedder=self.embedder_key,
                    n_reference=int(self.index.ntotal), n_disease_classes=len(self.disease_classes),
                    thresholds=self.th,
                    disease_classes_without_info=self.knowledge.missing(self.disease_classes))

    # ------------------------------------------------------------------------------------
    def _run(self, key, img, cache):
        if key not in cache:
            model, meta = self.models[key]
            s = meta["img_size"]
            tf = self._tfs.setdefault(s, eval_transform(s))
            lg, emb = logits_and_embedding(model, tf(img).unsqueeze(0).to(self.device))
            cache[key] = (lg[0].float().cpu().numpy(), F.normalize(emb.float(), dim=1)[0].cpu().numpy())
        return cache[key]

    def _T(self, key):
        return float(self.T.get(key, 1.0))

    @torch.no_grad()
    def predict(self, image: Image.Image) -> dict:
        t0 = time.time()
        res = dict(pipeline_version=VERSION, calibrated=self.cal is not None, status=None, stage=None,
                   message=None, needs_human_review=False, reasons=[], prediction=None, confidence=None,
                   top_k=[], disease_info=None)

        def finish(status, stage, message, review=False):
            res.update(status=status, stage=stage, message=message, needs_human_review=review,
                       latency_ms=int((time.time() - t0) * 1000))
            return res

        img = ImageOps.exif_transpose(image).convert("RGB")
        orig_min_side = min(img.size)
        if max(img.size) > 2048:
            img.thumbnail((2048, 2048))

        # 1. image quality (OpenCV) --------------------------------------------------------
        q = quality.assess(cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR), self.qcfg, orig_min_side)
        res["quality"] = q
        if not q["ok"]:
            msg = " ".join(i["message"] for i in q["issues"] if i["blocking"])
            return finish("retake", "quality", msg)

        # 2. plant detected? (YOLO or fallback) ---------------------------------------------
        det = self.detector.detect(img)
        res["detection"] = det
        if not det["found"]:
            if det.get("reason") == "too_small":
                return finish("retake", "plant_detection", "The leaf is too small in the frame. Move closer and retake the photo.")
            return finish("rejected", "plant_detection", "No plant leaf was detected in this image.")

        cache = {}
        # 3. crop ---------------------------------------------------------------------------
        lg, _ = self._run(self.crop_key, img, cache)
        crop_classes = self.models[self.crop_key][1]["classes"]
        p = softmax(lg, self._T(self.crop_key))
        i = int(p.argmax())
        crop, crop_conf = crop_classes[i], float(p[i])
        res["crop"] = dict(name=crop, confidence=round(crop_conf, 4))
        reasons = res["reasons"]
        if crop_conf < self.th["crop_conf"]:
            reasons.append("crop_low_confidence")

        final_label, final_conf, condition = None, None, None
        if not reasons:
            # 4. healthy / diseased ----------------------------------------------------------
            lg, _ = self._run(self.health_key, img, cache)
            hcls = self.models[self.health_key][1]["classes"]
            p = softmax(lg, self._T(self.health_key))
            j = int(p.argmax())
            condition, hconf = hcls[j], float(p[j])
            res["health"] = dict(label=condition, confidence=round(hconf, 4))
            if hconf < self.th["health_conf"]:
                reasons.append("health_low_confidence")
            elif condition == "healthy":
                final_label, final_conf = make_label(crop, "healthy"), hconf
            else:
                # 5. disease classifier ensemble, masked to the identified crop ------------------
                probs, argmaxes = [], []
                for k in self.disease_keys:
                    lg, _ = self._run(k, img, cache)
                    m = mask_logits(lg[None], self.disease_classes, [crop])[0]
                    if m.max() < -1e8:
                        break
                    pk = softmax(m, self._T(k))
                    probs.append(pk); argmaxes.append(int(pk.argmax()))
                if len(probs) != len(self.disease_keys):
                    reasons.append("no_disease_model_for_crop")
                else:
                    pe = np.mean(probs, axis=0)
                    order = np.argsort(-pe)[:3]
                    top = [(self.disease_classes[o], round(float(pe[o]), 4)) for o in order]
                    d = int(pe.argmax())
                    agree = all(a == d for a in argmaxes)
                    res["disease"] = dict(name=self.disease_classes[d], confidence=round(float(pe[d]), 4),
                                          models_agree=agree, top_k=top,
                                          per_model={k: self.disease_classes[a] for k, a in zip(self.disease_keys, argmaxes)})
                    res["top_k"] = [list(t) for t in top]
                    # 6. confidence check ------------------------------------------------------
                    if not agree:
                        reasons.append("models_disagree")
                    if pe[d] < self.th["disease_conf"]:
                        reasons.append("disease_low_confidence")
                    final_label, final_conf = self.disease_classes[d], float(pe[d])

        # 7. OOD / similarity (FAISS over training-set embeddings) ---------------------------
        _, emb = self._run(self.embedder_key, img, cache)
        k = int(self.th["ood_topk"])
        D, I = self.index.search(emb[None].astype("float32"), k)
        sim = float(D[0].mean())
        nb = I[0][I[0] >= 0]
        crop_agree = float((self.ref_crop[nb] == crop).mean()) if len(nb) else 0.0
        lbl_agree = float((self.ref_disease[nb] == final_label).mean()) if (len(nb) and final_label) else None
        is_ood = sim < self.th["ood_similarity"]
        res["ood"] = dict(similarity=round(sim, 4), threshold=round(float(self.th["ood_similarity"]), 4), is_ood=is_ood,
                          neighbor_crop_agreement=round(crop_agree, 3),
                          neighbor_label_agreement=None if lbl_agree is None else round(lbl_agree, 3))
        if not is_ood:
            if crop_agree < self.th["neighbor_crop_agreement"] and "crop_low_confidence" not in reasons:
                reasons.append("neighbors_disagree_crop")
            if lbl_agree is not None and lbl_agree < self.th["neighbor_label_agreement"]:
                reasons.append("neighbors_disagree_label")

        # 8. final decision ---------------------------------------------------------------------
        if is_ood:
            return finish("rejected", "ood", "This image does not look like any crop leaf this system was trained on. "
                                             "Please photograph a single leaf clearly.")
        if reasons:
            res["candidate"] = final_label
            return finish("uncertain", "confidence", " ".join(REASON_TEXT[r] for r in reasons)
                          + " Please retake the image or send it for human review.", review=True)

        res.update(prediction=final_label, confidence=round(final_conf, 4))
        if condition == "healthy":
            res["disease_info"] = self.knowledge.healthy(crop)
            return finish("confident", "final", f"{pretty(final_label)}: the leaf looks healthy.")
        res["disease_info"] = self.knowledge.disease(final_label)
        return finish("confident", "final", f"Detected: {pretty(final_label)}.")
