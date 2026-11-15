"""Canonical label naming shared by training and serving.

A canonical disease label is  <crop>___<disease>  (three underscores, lower snake_case),
e.g.  tomato___early_blight,  tomato___healthy.
Keeping the crop as a prefix lets the service mask the disease head by crop with a
simple prefix check (no extra lookup table needed at inference time).
"""
import re

SEP = "___"


def slug(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "_", str(s).strip().lower())
    return s.strip("_")


def make_label(crop: str, disease: str) -> str:
    return f"{slug(crop)}{SEP}{slug(disease)}"


def norm_key(label: str) -> str:
    """Normalise any label style so old keys like 'Tomato___Early_blight' still match."""
    if SEP in label:
        crop, dis = label.split(SEP, 1)
        return make_label(crop, dis)
    return slug(label)


def crop_of(label: str) -> str:
    return label.split(SEP, 1)[0]


def pretty(label: str) -> str:
    return label.replace(SEP, " - ").replace("_", " ").title()
