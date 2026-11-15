"""Stage 1b - "is there a plant / leaf in this image?"

Preferred: a YOLO detector fine-tuned for a single class `leaf` (see training/train_yolo_leaf.py),
stored as artifacts/leaf_yolo.pt.

Fallback when no YOLO weights exist: a coarse vegetation-colour heuristic. It is a WEAK gate
(it can pass green non-crop scenes and can under-count badly diseased brown leaves), and the
response says `method: "hsv_fallback"` so nobody mistakes it for the trained detector.
The similarity (FAISS) check later in the pipeline is the real safety net.
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


class LeafDetector:
    def __init__(self, weights: str | Path | None, conf: float = 0.25, min_area: float = 0.03,
                 min_vegetation: float = 0.08, device: str | None = None):
        self.conf, self.min_area, self.min_veg, self.device = conf, min_area, min_vegetation, device
        self.model = None
        if weights and Path(weights).exists():
            from ultralytics import YOLO  # imported lazily: only needed when weights exist
            self.model = YOLO(str(weights))
        self.method = "yolo" if self.model is not None else "hsv_fallback"

    def detect(self, img: Image.Image) -> dict:
        return self._yolo(img) if self.model is not None else self._hsv(img)

    # -- YOLO ----------------------------------------------------------------------------
    def _yolo(self, img: Image.Image) -> dict:
        W, H = img.size
        r = self.model.predict(np.asarray(img), conf=self.conf, verbose=False, device=self.device)[0]
        boxes = [] if r.boxes is None else [(*b.xyxy[0].tolist(), float(b.conf[0])) for b in r.boxes]
        if not boxes:
            return dict(found=False, reason="no_plant", method="yolo", n_boxes=0)
        boxes.sort(key=lambda b: (b[2] - b[0]) * (b[3] - b[1]), reverse=True)
        x1, y1, x2, y2, c = boxes[0]
        area = ((x2 - x1) * (y2 - y1)) / float(W * H)
        found = area >= self.min_area
        return dict(found=found, reason=None if found else "too_small", method="yolo", n_boxes=len(boxes),
                    box=[round(v, 1) for v in (x1, y1, x2, y2)], area_ratio=round(area, 4), score=round(c, 3))

    # -- fallback --------------------------------------------------------------------------
    def _hsv(self, img: Image.Image) -> dict:
        a = np.asarray(img.resize((256, 256)))
        hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV)
        h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
        r, g, b = [a[..., i].astype(np.int16) for i in range(3)]
        green = ((h >= 25) & (h <= 95) & (s >= 40) & (v >= 40)) | ((2 * g - r - b) > 25)
        frac = float(green.mean())
        found = frac >= self.min_veg
        return dict(found=found, reason=None if found else "no_plant", method="hsv_fallback",
                    vegetation_fraction=round(frac, 4))
