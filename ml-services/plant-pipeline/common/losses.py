import torch
import torch.nn as nn
import torch.nn.functional as F


class FocalLoss(nn.Module):
    """Focal loss with optional class weights and label smoothing.
    Use only if imbalance remains after sampler-based balancing."""
    def __init__(self, gamma: float = 2.0, weight=None, label_smoothing: float = 0.0):
        super().__init__()
        self.gamma, self.ls = gamma, label_smoothing
        self.register_buffer("weight", weight if weight is not None else None)

    def forward(self, logits, target):
        ce = F.cross_entropy(logits, target, weight=self.weight, reduction="none", label_smoothing=self.ls)
        pt = torch.exp(-F.cross_entropy(logits, target, reduction="none"))
        return ((1.0 - pt) ** self.gamma * ce).mean()
