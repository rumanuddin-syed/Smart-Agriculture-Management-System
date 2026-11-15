"""Near-duplicate clustering with perceptual hashes (flip-aware).

Why this exists: PlantVillage (and especially the "augmented" Kaggle copy) contains many
near-identical shots of the same leaf. A plain random train/val split puts siblings on both
sides, so validation accuracy looks like 99% while real-world accuracy is poor. We cluster
near-duplicates first and split by *cluster*, so no leaf can straddle train and test.

Limits: pHash catches exact/near-exact copies, re-compressions, small crops/brightness
changes and flips. It will NOT catch heavy rotations/zooms or different photos of the same
leaf. That is still a large improvement over a random split; see README for details.
"""
from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor

import cv2
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

_U = np.uint64
_M1, _M2, _M4, _H01 = _U(0x5555555555555555), _U(0x3333333333333333), _U(0x0F0F0F0F0F0F0F0F), _U(0x0101010101010101)


def _popcount(x: np.ndarray) -> np.ndarray:
    x = x - ((x >> _U(1)) & _M1)
    x = (x & _M2) + ((x >> _U(2)) & _M2)
    x = (x + (x >> _U(4))) & _M4
    return ((x * _H01) >> _U(56)).astype(np.int16)


def _hash_one(path: str):
    """Return 4 64-bit pHashes (identity, h-flip, v-flip, both) or None if unreadable."""
    try:
        buf = np.fromfile(path, dtype=np.uint8)  # np.fromfile: safe for unicode paths on Windows
        im = cv2.imdecode(buf, cv2.IMREAD_REDUCED_GRAYSCALE_4)
        if im is None or im.size == 0:
            return None
        g = cv2.resize(im, (32, 32), interpolation=cv2.INTER_AREA).astype(np.float32)
        out = []
        for v in (g, g[:, ::-1], g[::-1, :], g[::-1, ::-1]):
            d = cv2.dct(np.ascontiguousarray(v))[:8, :8].ravel()
            bits = d > np.median(d[1:])
            out.append(int.from_bytes(np.packbits(bits).tobytes(), "big"))
        return out
    except Exception:
        return None


def cluster_near_duplicates(paths, threshold: int = 4, flip_aware: bool = True, workers: int = 4):
    """Returns (group_id[n], valid[n]). Unreadable images get valid=False.

    Uses multi-index hashing: split each 64-bit hash into (threshold+1) blocks; two hashes
    within `threshold` bits must agree exactly on at least one block (pigeonhole), so we only
    compare hashes that share a block value.
    """
    n = len(paths)
    if workers > 1 and n > 200:
        with ProcessPoolExecutor(workers) as ex:
            res = list(ex.map(_hash_one, paths, chunksize=64))
    else:
        res = [_hash_one(p) for p in paths]
    valid = np.array([r is not None for r in res])
    H = np.zeros((n, 4), dtype=np.uint64)
    for i, r in enumerate(res):
        if r is not None:
            H[i] = np.array(r, dtype=np.uint64)
    n_var = 4 if flip_aware else 1
    vi = np.flatnonzero(valid)
    nb = threshold + 1
    bounds = np.linspace(0, 64, nb + 1).astype(int)
    ea, eb = [], []
    for b in range(nb):
        lo, hi = int(bounds[b]), int(bounds[b + 1])
        mask, shift = _U((1 << (hi - lo)) - 1), _U(64 - hi)
        k0 = (H[vi, 0] >> shift) & mask
        order = np.argsort(k0, kind="stable")
        sk, si = k0[order], vi[order]
        uniq, first, cnt = np.unique(sk, return_index=True, return_counts=True)
        for v in range(n_var):
            kv = (H[vi, v] >> shift) & mask
            pos = np.searchsorted(uniq, kv)
            pos_c = np.minimum(pos, len(uniq) - 1)
            ok = uniq[pos_c] == kv
            q_idx, q_b = vi[ok], pos_c[ok]
            qo = np.argsort(q_b, kind="stable")
            q_idx, q_b = q_idx[qo], q_b[qo]
            ub, ustart = np.unique(q_b, return_index=True)
            uend = np.append(ustart[1:], len(q_b))
            for bk, s, e in zip(ub, ustart, uend):
                members = si[first[bk]:first[bk] + cnt[bk]]
                qs = q_idx[s:e]
                if len(members) == 1 and len(qs) == 1 and members[0] == qs[0]:
                    continue
                mh = H[members, 0]
                step = max(1, 4_000_000 // max(1, len(members)))
                for r0 in range(0, len(qs), step):
                    qc = qs[r0:r0 + step]
                    d = _popcount(H[qc, v][:, None] ^ mh[None, :])
                    a, m = np.nonzero(d <= threshold)
                    if len(a):
                        ea.append(qc[a]); eb.append(members[m])
    if ea:
        a, b = np.concatenate(ea), np.concatenate(eb)
        g = coo_matrix((np.ones(len(a), dtype=np.int8), (a, b)), shape=(n, n))
        _, labels = connected_components(g, directed=False)
    else:
        labels = np.arange(n)
    labels = labels.copy()
    labels[~valid] = -1
    return labels, valid
