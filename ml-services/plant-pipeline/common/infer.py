"""Batch inference helpers used by calibration / index-building / evaluation."""
from __future__ import annotations

import numpy as np
import torch
from torch.utils.data import DataLoader

from .data import PathDataset, eval_transform
from .models import logits_and_embedding


@torch.no_grad()
def run_model(model, paths, img_size, device, batch_size=64, workers=4, want_emb=False):
    """Returns logits (N,C) and, if want_emb, L2-normalised embeddings (N,D)."""
    ds = PathDataset(paths, eval_transform(img_size))
    dl = DataLoader(ds, batch_size=batch_size, shuffle=False, num_workers=workers)
    model.eval().to(device)
    L, E = [], []
    for x in dl:
        lg, emb = logits_and_embedding(model, x.to(device))
        L.append(lg.float().cpu())
        if want_emb:
            E.append(torch.nn.functional.normalize(emb.float(), dim=1).cpu())
    logits = torch.cat(L).numpy()
    return (logits, torch.cat(E).numpy()) if want_emb else logits
