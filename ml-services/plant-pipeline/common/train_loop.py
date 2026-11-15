"""Generic fine-tuning loop: warm-up, cosine LR, head/backbone LR split, optional backbone
freezing, AMP, early stopping on macro-F1, best-checkpoint saving, LR range test."""
from __future__ import annotations

import copy
import json
import math
import time

import numpy as np
import torch
from sklearn.metrics import f1_score

from .models import save_checkpoint


@torch.no_grad()
def evaluate(model, loader, device, criterion=None):
    model.eval()
    all_logits, all_y, loss_sum, n = [], [], 0.0, 0
    for x, y in loader:
        x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
        lg = model(x)
        if criterion is not None:
            loss_sum += float(criterion(lg, y)) * len(y)
        n += len(y)
        all_logits.append(lg.float().cpu()); all_y.append(y.cpu())
    logits = torch.cat(all_logits).numpy(); y = torch.cat(all_y).numpy()
    pred = logits.argmax(1)
    return dict(loss=loss_sum / max(n, 1), acc=float((pred == y).mean()),
                macro_f1=float(f1_score(y, pred, average="macro", zero_division=0))), logits, y


def lr_find(model, loader, criterion, device, start=1e-7, end=1.0, steps=80):
    """LR range test. Returns (lrs, smoothed_losses, suggested_lr). Restores model weights."""
    state = copy.deepcopy(model.state_dict())
    model.to(device).train()
    opt = torch.optim.AdamW(model.parameters(), lr=start)
    gamma = (end / start) ** (1 / steps)
    lrs, losses, smooth, it = [], [], None, iter(loader)
    for i in range(steps):
        try:
            x, y = next(it)
        except StopIteration:
            it = iter(loader); x, y = next(it)
        lr = start * gamma ** i
        for g in opt.param_groups:
            g["lr"] = lr
        opt.zero_grad()
        loss = criterion(model(x.to(device)), y.to(device))
        loss.backward(); opt.step()
        v = float(loss)
        smooth = v if smooth is None else 0.9 * smooth + 0.1 * v
        lrs.append(lr); losses.append(smooth)
        if i > 10 and (not math.isfinite(smooth) or smooth > 4 * min(losses)):
            break
    model.load_state_dict(state)
    best = int(np.argmin(losses))
    return lrs, losses, lrs[best] / 10.0


def fit(model, train_loader, val_loader, criterion, *, device, epochs, lr, out_path, arch, classes, img_size,
        head_lr_mult=10.0, weight_decay=0.02, warmup_epochs=1, freeze_epochs=1, patience=6,
        amp=True, min_delta=1e-4, extra=None, log=print):
    model.to(device)
    head = list(model.get_classifier().parameters())
    head_ids = {id(p) for p in head}
    backbone = [p for p in model.parameters() if id(p) not in head_ids]
    opt = torch.optim.AdamW([{"params": backbone, "lr": lr}, {"params": head, "lr": lr * head_lr_mult}],
                            weight_decay=weight_decay)
    spe = len(train_loader)
    total, warm = max(1, epochs * spe), warmup_epochs * spe

    def lr_lambda(step):
        if step < warm:
            return (step + 1) / max(1, warm)
        prog = (step - warm) / max(1, total - warm)
        return 0.01 + 0.99 * 0.5 * (1 + math.cos(math.pi * min(1.0, prog)))

    sched = torch.optim.lr_scheduler.LambdaLR(opt, lr_lambda)
    use_amp = amp and device.type == "cuda"
    scaler = torch.amp.GradScaler("cuda", enabled=use_amp)
    best, bad, history = -1.0, 0, []

    for epoch in range(epochs):
        for p in backbone:
            p.requires_grad_(epoch >= freeze_epochs)
        model.train()
        t0, run = time.time(), 0.0
        for x, y in train_loader:
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            opt.zero_grad(set_to_none=True)
            with torch.autocast(device_type=device.type, dtype=torch.float16, enabled=use_amp):
                loss = criterion(model(x), y)
            scaler.scale(loss).backward()
            scaler.unscale_(opt)
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            scaler.step(opt); scaler.update(); sched.step()
            run += float(loss.detach()) * len(y)
        m, _, _ = evaluate(model, val_loader, device, criterion)
        rec = dict(epoch=epoch + 1, train_loss=run / max(1, len(train_loader.dataset)), **m, secs=round(time.time() - t0, 1))
        history.append(rec)
        log(json.dumps(rec))
        if m["macro_f1"] > best + min_delta:
            best, bad = m["macro_f1"], 0
            save_checkpoint(out_path, model, arch, classes, img_size, epoch=epoch + 1,
                            metrics={k: float(v) for k, v in m.items()}, extra=extra or {})
            log(f"  saved best -> {out_path} (macro_f1={best:.4f})")
        else:
            bad += 1
            if bad >= patience:
                log(f"early stopping at epoch {epoch + 1}")
                break
    with open(str(out_path) + ".history.json", "w") as f:
        json.dump(history, f, indent=1)
    return best, history
