"""Datasets, augmentation and samplers shared by all training scripts."""
from __future__ import annotations

import io
import random

import numpy as np
import pandas as pd
import torch
from PIL import Image, ImageOps
from torch.utils.data import Dataset, WeightedRandomSampler
from torchvision import transforms as T

MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)
IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}


def load_rgb(path) -> Image.Image:
    with Image.open(path) as im:
        return ImageOps.exif_transpose(im).convert("RGB")


class RandomJPEG:
    """Re-compress like WhatsApp/social-media uploads."""
    def __init__(self, p=0.3, quality=(35, 90)):
        self.p, self.quality = p, quality

    def __call__(self, img):
        if random.random() > self.p:
            return img
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=random.randint(*self.quality))
        buf.seek(0)
        return Image.open(buf).convert("RGB")


class RandomDownUp:
    """Simulate low-resolution phone / cropped images."""
    def __init__(self, p=0.25, scale=(0.3, 0.7)):
        self.p, self.scale = p, scale

    def __call__(self, img):
        if random.random() > self.p:
            return img
        w, h = img.size
        s = random.uniform(*self.scale)
        small = img.resize((max(8, int(w * s)), max(8, int(h * s))), Image.BILINEAR)
        return small.resize((w, h), Image.BILINEAR)


def train_transform(size: int):
    return T.Compose([
        T.RandomResizedCrop(size, scale=(0.35, 1.0), ratio=(0.75, 1.33)),
        T.RandomHorizontalFlip(),
        T.RandomVerticalFlip(0.3),
        T.RandomApply([T.RandomRotation(30)], p=0.5),
        T.RandomApply([T.RandomPerspective(0.25, p=1.0)], p=0.2),
        # hue jitter kept tiny on purpose: colour is diagnostic for many diseases
        T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.03),
        RandomDownUp(0.25),
        RandomJPEG(0.3),
        T.RandomApply([T.GaussianBlur(5, (0.1, 2.0))], p=0.15),
        T.ToTensor(),
        T.Normalize(MEAN, STD),
        T.RandomErasing(p=0.2, scale=(0.02, 0.12), value=0),
    ])


def eval_transform(size: int):
    return T.Compose([T.Resize((size, size)), T.ToTensor(), T.Normalize(MEAN, STD)])


class ManifestDataset(Dataset):
    def __init__(self, df: pd.DataFrame, label_col: str, classes: list[str], transform):
        self.paths = df["path"].tolist()
        c2i = {c: i for i, c in enumerate(classes)}
        self.targets = np.array([c2i[v] for v in df[label_col]], dtype=np.int64)
        self.transform = transform

    def __len__(self):
        return len(self.paths)

    def __getitem__(self, i):
        return self.transform(load_rgb(self.paths[i])), int(self.targets[i])


class PathDataset(Dataset):
    """Unlabelled images (inference / embedding extraction)."""
    def __init__(self, paths, transform):
        self.paths, self.transform = list(paths), transform

    def __len__(self):
        return len(self.paths)

    def __getitem__(self, i):
        return self.transform(load_rgb(self.paths[i]))


def make_sampler(df: pd.DataFrame, label_col: str, field_boost: float = 1.0, num_samples: int | None = None):
    """Class-balanced sampler; optionally up-weights real-world ('field') images so the
    (much larger) lab-style PlantVillage portion doesn't drown them out."""
    counts = df[label_col].value_counts()
    w = df[label_col].map(lambda c: 1.0 / counts[c]).to_numpy(dtype=np.float64)
    if "field" in df.columns:
        w = w * np.where(df["field"].to_numpy(dtype=bool), field_boost, 1.0)
    return WeightedRandomSampler(torch.as_tensor(w), num_samples=num_samples or len(df), replacement=True)


def class_weights(df: pd.DataFrame, label_col: str, classes: list[str]) -> torch.Tensor:
    counts = df[label_col].value_counts()
    w = np.array([1.0 / np.sqrt(counts[c]) for c in classes], dtype=np.float32)
    return torch.as_tensor(w / w.mean())
