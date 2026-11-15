"""Disease information (characteristics / precautions / cure / organic remedy)."""
from __future__ import annotations

import json
from pathlib import Path

from common.naming import make_label, norm_key, pretty

ADVISORY = ("Confirm the diagnosis with a local agricultural extension officer / agronomist before "
            "applying any chemical treatment. Follow the product label and local regulations.")


class Knowledge:
    def __init__(self, *paths):
        self.db = {}
        for p in paths:
            if p and Path(p).exists():
                for k, v in json.load(open(p)).items():
                    self.db[norm_key(k)] = v

    def disease(self, label: str) -> dict:
        info = self.db.get(norm_key(label))
        if info is None:
            return dict(available=False,
                        characteristics=f"Detailed guidance for {pretty(label)} is not available yet.",
                        precautions="N/A", cure="N/A", organic_remedy="N/A", advisory=ADVISORY)
        return dict(available=True, **info, advisory=ADVISORY)

    def healthy(self, crop: str) -> dict:
        return dict(available=True, characteristics=f"The {crop.replace('_', ' ')} leaf appears healthy.",
                    precautions="Keep monitoring regularly, avoid overhead watering late in the day, and remove "
                                "fallen debris to reduce disease pressure.",
                    cure="Not needed.", organic_remedy="Not needed.", advisory=ADVISORY)

    def missing(self, disease_labels):
        return [c for c in disease_labels if norm_key(c) not in self.db and not c.endswith("___healthy")]
