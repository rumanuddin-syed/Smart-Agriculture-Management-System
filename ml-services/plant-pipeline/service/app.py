"""FastAPI wrapper. Run from the project root:

    uvicorn service.app:app --host 0.0.0.0 --port 8000

POST /predict  (multipart field `file`)  - backwards-compatible with the old disease-detection service:
    `prediction`, `confidence`, `top_k`, `disease_info` are still returned, but they are only
    filled when `status == "confident"`. Handle the new `status` field in your Node backend:
        confident -> show result + treatment
        uncertain -> ask for a retake / route to human review
        retake    -> show `message` (image quality problem)
        rejected  -> not a supported plant image
"""
import io
import os
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from service.pipeline import PlantPipeline

MAX_BYTES = int(float(os.getenv("MAX_IMAGE_MB", "12")) * 1024 * 1024)
_lock = threading.Lock()  # one inference at a time; keeps CPU latency predictable


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pipe = PlantPipeline(os.getenv("ARTIFACTS_DIR", "artifacts"), os.getenv("DEVICE") or None,
                                   require_calibration=os.getenv("REQUIRE_CALIBRATION", "0") == "1")
    yield


app = FastAPI(title="Plant Disease Pipeline", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
                   allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"status": "ok", **app.state.pipe.info()}


@app.post("/predict")
def predict(file: UploadFile = File(...)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Uploaded file must be an image.")
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, f"Image larger than {MAX_BYTES // (1024 * 1024)} MB.")
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(400, "Could not read image file. Is it corrupted?")
    with _lock:
        return app.state.pipe.predict(img)
