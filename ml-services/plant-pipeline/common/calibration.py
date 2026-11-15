"""Temperature scaling + threshold selection (Phase F)."""
from __future__ import annotations

import numpy as np

from .naming import crop_of


def softmax(logits: np.ndarray, T: float = 1.0) -> np.ndarray:
    z = logits / T
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)


def mask_logits(logits: np.ndarray, classes: list[str], crops: list[str]) -> np.ndarray:
    """Restrict a disease head to the classes belonging to each row's crop."""
    out = logits.copy()
    cls_crop = np.array([crop_of(c) for c in classes])
    for i, crop in enumerate(crops):
        out[i, cls_crop != crop] = -1e9
    return out


def fit_temperature(logits: np.ndarray, labels: np.ndarray, max_iter: int = 200) -> float:
    """Fit a single scalar T minimising NLL on held-out logits (Guo et al., 2017)."""
    import torch
    import torch.nn.functional as F
    lg = torch.as_tensor(logits, dtype=torch.float32).clamp(min=-1e4)
    y = torch.as_tensor(labels, dtype=torch.long)
    log_t = torch.zeros(1, requires_grad=True)
    opt = torch.optim.LBFGS([log_t], lr=0.1, max_iter=max_iter)

    def closure():
        opt.zero_grad()
        loss = F.cross_entropy(lg / log_t.exp(), y)
        loss.backward()
        return loss

    opt.step(closure)
    return float(log_t.exp().clamp(0.05, 20.0).detach())


def nll(probs: np.ndarray, labels: np.ndarray) -> float:
    return float(-np.log(np.clip(probs[np.arange(len(labels)), labels], 1e-12, 1)).mean())


def ece(conf: np.ndarray, correct: np.ndarray, n_bins: int = 15) -> float:
    edges = np.linspace(0, 1, n_bins + 1)
    total = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            total += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return float(total)


def threshold_for_precision(conf: np.ndarray, correct: np.ndarray, target: float = 0.95) -> dict:
    """Lowest confidence threshold whose *accepted* predictions are >= `target` accurate
    (maximises coverage subject to the precision target). If no threshold reaches the
    target, accept nothing (threshold just above the max) and say so."""
    conf, correct = np.asarray(conf, float), np.asarray(correct, float)
    n = len(conf)
    if n == 0:
        return dict(threshold=1.01, coverage=0.0, selective_accuracy=float("nan"), target_met=False, n=0)
    order = np.argsort(-conf, kind="stable")
    c_sorted, ok_sorted = conf[order], correct[order]
    cum_acc = np.cumsum(ok_sorted) / np.arange(1, n + 1)
    good = np.flatnonzero(cum_acc >= target)
    if len(good) == 0:
        return dict(threshold=float(conf.max()) + 1e-6, coverage=0.0, selective_accuracy=float("nan"),
                    target_met=False, n=int(n))
    thr = float(c_sorted[good.max()])
    acc_mask = conf >= thr
    return dict(threshold=thr, coverage=float(acc_mask.mean()),
                selective_accuracy=float(correct[acc_mask].mean()), target_met=True, n=int(n))


def ood_threshold(in_scores: np.ndarray, ood_scores: np.ndarray | None = None, min_keep: float = 0.95) -> dict:
    """Similarity threshold (higher score = more in-distribution; accept if score >= thr).

    - With known-OOD examples: pick the threshold maximising (keep_rate - false_accept_rate)
      subject to keeping >= `min_keep` of in-distribution images.
    - Without: keep `min_keep` of in-distribution images (a weaker, purely one-sided choice)."""
    in_scores = np.asarray(in_scores, float)
    out = dict(n_in=int(len(in_scores)), min_keep=min_keep)
    base = float(np.quantile(in_scores, 1 - min_keep))
    if ood_scores is None or len(ood_scores) == 0:
        out.update(threshold=base, method="in_distribution_quantile", auroc=None)
        return out
    from sklearn.metrics import roc_auc_score
    ood_scores = np.asarray(ood_scores, float)
    cands = np.unique(np.concatenate([in_scores, ood_scores]))
    best = (-9, base)
    for t in cands:
        keep = (in_scores >= t).mean()
        if keep < min_keep:
            continue
        j = keep - (ood_scores >= t).mean()
        if j > best[0]:
            best = (j, float(t))
    thr = best[1]
    y = np.r_[np.ones(len(in_scores)), np.zeros(len(ood_scores))]
    out.update(threshold=thr, method="youden_with_keep_constraint", n_ood=int(len(ood_scores)),
               keep_rate=float((in_scores >= thr).mean()),
               false_accept_rate=float((ood_scores >= thr).mean()),
               auroc=float(roc_auc_score(y, np.r_[in_scores, ood_scores])))
    return out
