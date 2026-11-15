"""Backbones (timm), checkpoint IO and embedding extraction."""
from __future__ import annotations

import timm
import torch

ARCHS = {"effb3": "efficientnet_b3", "convnext_tiny": "convnext_tiny"}


def build_model(arch: str, num_classes: int, pretrained: bool = True, drop_rate: float = 0.3, drop_path: float = 0.1):
    name = ARCHS.get(arch, arch)
    return timm.create_model(name, pretrained=pretrained, num_classes=num_classes,
                             drop_rate=drop_rate, drop_path_rate=drop_path)


def save_checkpoint(path, model, arch, classes, img_size, **extra):
    torch.save({
        "arch": arch, "classes": list(classes), "img_size": int(img_size),
        "state_dict": {k: v.detach().cpu() for k, v in model.state_dict().items()},
        **extra,
    }, path)


def load_checkpoint(path, device="cpu"):
    ck = torch.load(path, map_location=device, weights_only=True)
    model = build_model(ck["arch"], len(ck["classes"]), pretrained=False)
    model.load_state_dict(ck["state_dict"])
    model.to(device).eval()
    meta = {k: v for k, v in ck.items() if k != "state_dict"}
    return model, meta


def embed(model, x: torch.Tensor) -> torch.Tensor:
    """Penultimate (pre-classifier) pooled features."""
    return model.forward_head(model.forward_features(x), pre_logits=True)


def logits_and_embedding(model, x: torch.Tensor):
    """One forward pass -> (logits, embedding). Equivalent to model(x) in eval mode."""
    emb = embed(model, x)
    return model.get_classifier()(emb), emb
