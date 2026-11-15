"""Stage 1a - cheap OpenCV image-quality gate (blur / exposure / contrast / resolution).

All metrics are computed on a copy resized to <=512 px on the long side so thresholds don't
depend on the camera's resolution. Default thresholds are only starting points:
`training.f_calibrate` derives blur/brightness limits from your own validation images.
"""
from __future__ import annotations

import cv2
import numpy as np

DEFAULTS = dict(min_side=224, blur_min=40.0, brightness_min=40.0, brightness_max=225.0,
                dark_frac_max=0.5, bright_frac_max=0.4, contrast_min=15.0)

MESSAGES = {
    "too_small": "The image resolution is too low. Please use a photo at least {min_side}px on the short side.",
    "blurry": "The image is blurry. Hold the phone steady, tap to focus on the leaf and retake the photo.",
    "too_dark": "The image is too dark. Retake it in daylight or shade without a strong shadow on the leaf.",
    "overexposed": "The image is overexposed. Avoid direct glare and retake it in soft daylight.",
    "low_contrast": "The image has very low contrast (fog, haze or dirty lens?). A clearer photo will help.",
}
BLOCKING = {"too_small", "blurry", "too_dark", "overexposed"}


def metrics(bgr: np.ndarray) -> dict:
    h, w = bgr.shape[:2]
    s = 512.0 / max(h, w)
    small = cv2.resize(bgr, (max(1, int(w * s)), max(1, int(h * s))), interpolation=cv2.INTER_AREA) if s < 1 else bgr
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    return dict(
        blur=float(cv2.Laplacian(gray, cv2.CV_64F).var()),
        brightness=float(gray.mean()),
        contrast=float(gray.std()),
        dark_frac=float((gray < 25).mean()),
        bright_frac=float((gray > 245).mean()),
        min_side=int(min(h, w)),
    )


def assess(bgr: np.ndarray, cfg: dict | None = None, orig_min_side: int | None = None) -> dict:
    c = {**DEFAULTS, **(cfg or {})}
    m = metrics(bgr)
    if orig_min_side is not None:
        m["min_side"] = int(orig_min_side)
    codes = []
    if m["min_side"] < c["min_side"]:
        codes.append("too_small")
    if m["blur"] < c["blur_min"]:
        codes.append("blurry")
    if m["brightness"] < c["brightness_min"] or m["dark_frac"] > c["dark_frac_max"]:
        codes.append("too_dark")
    if m["brightness"] > c["brightness_max"] or m["bright_frac"] > c["bright_frac_max"]:
        codes.append("overexposed")
    if m["contrast"] < c["contrast_min"]:
        codes.append("low_contrast")
    issues = [dict(code=k, blocking=k in BLOCKING, message=MESSAGES[k].format(**c)) for k in codes]
    return dict(metrics={k: round(v, 3) for k, v in m.items()}, issues=issues,
                ok=not any(i["blocking"] for i in issues))
