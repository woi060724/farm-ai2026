"""AgroAI — YOLOv8 AI Detection Router"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import time
import io
from PIL import Image
import json

from models.database import get_db, AIDetection
from models.schemas import DetectionResult
from routers.auth import get_current_user, User

router = APIRouter()

# Global model holder
_model = None


def get_model():
    """Lazy-load YOLOv8 model"""
    global _model
    if _model is None:
        try:
            from ultralytics import YOLO
            import os
            model_path = os.getenv("YOLO_MODEL_PATH", "models/yolov8n.pt")
            _model = YOLO(model_path)
        except Exception as e:
            # Return None if model not available (demo mode)
            return None
    return _model


def mock_detection(image_size: tuple) -> dict:
    """Mock detection for demo without actual model"""
    import random
    cattle = random.randint(3, 12)
    sheep = random.randint(2, 8)
    goat = random.randint(0, 4)
    total = cattle + sheep + goat
    detections = []
    w, h = image_size
    for i in range(total):
        species = "cattle" if i < cattle else ("sheep" if i < cattle + sheep else "goat")
        detections.append({
            "species": species,
            "confidence": round(random.uniform(0.85, 0.99), 3),
            "bbox": [
                random.randint(0, w//2), random.randint(0, h//2),
                random.randint(w//2, w), random.randint(h//2, h),
            ]
        })
    return {
        "cattle": cattle, "sheep": sheep, "goat": goat,
        "total": total, "detections": detections,
        "confidence_avg": round(sum(d["confidence"] for d in detections) / max(len(detections), 1), 3)
    }


@router.post("/detect", response_model=DetectionResult)
async def detect_livestock(
    farm_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    YOLOv8 арқылы малды автоматты санау
    
    - Суретті жүктеңіз (JPEG/PNG, макс 10MB)
    - Жүйе автоматты мал санап, нәтижені қайтарады
    """
    # Validate file
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(400, "Тек JPEG/PNG форматтар қабылданады")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Файл 10MB-тан аспауы тиіс")

    start_time = time.time()

    try:
        image = Image.open(io.BytesIO(content))
        image_size = image.size
    except Exception:
        raise HTTPException(400, "Сурет оқу қатесі")

    model = get_model()

    if model is not None:
        # Real YOLOv8 detection
        import numpy as np
        img_array = np.array(image)
        results = model(img_array, conf=0.45, iou=0.5, verbose=False)

        counts = {"cattle": 0, "sheep": 0, "goat": 0, "other": 0}
        detections = []
        confidences = []

        for r in results:
            for box, cls, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
                name = model.names[int(cls)]
                conf_val = float(conf)
                confidences.append(conf_val)

                if name in counts:
                    counts[name] += 1
                else:
                    counts["other"] += 1

                detections.append({
                    "species": name,
                    "confidence": round(conf_val, 3),
                    "bbox": [round(x) for x in box.tolist()],
                })

        total = sum(counts.values())
        confidence_avg = round(sum(confidences) / max(len(confidences), 1), 3)
    else:
        # Demo mode — mock results
        mock = mock_detection(image_size)
        counts = {"cattle": mock["cattle"], "sheep": mock["sheep"],
                  "goat": mock["goat"], "other": 0}
        detections = mock["detections"]
        total = mock["total"]
        confidence_avg = mock["confidence_avg"]

    processing_ms = int((time.time() - start_time) * 1000)

    # Save detection to DB
    detection = AIDetection(
        farm_id=farm_id,
        total_count=total,
        cattle_count=counts.get("cattle", 0),
        sheep_count=counts.get("sheep", 0),
        goat_count=counts.get("goat", 0),
        other_count=counts.get("other", 0),
        confidence_avg=confidence_avg,
        model_version="YOLOv8n" if model else "YOLOv8n-demo",
        processing_ms=processing_ms,
    )
    db.add(detection)
    await db.commit()

    return DetectionResult(
        total_count=total,
        cattle_count=counts.get("cattle", 0),
        sheep_count=counts.get("sheep", 0),
        goat_count=counts.get("goat", 0),
        other_count=counts.get("other", 0),
        confidence_avg=confidence_avg,
        processing_ms=processing_ms,
        model_version=detection.model_version,
        detections=detections,
    )


@router.get("/history/{farm_id}")
async def get_detection_history(
    farm_id: int,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ЖИ санау тарихы"""
    from sqlalchemy import select, desc
    result = await db.execute(
        select(AIDetection)
        .where(AIDetection.farm_id == farm_id)
        .order_by(desc(AIDetection.detected_at))
        .limit(limit)
    )
    detections = result.scalars().all()
    return [
        {
            "id": d.id,
            "total_count": d.total_count,
            "cattle_count": d.cattle_count,
            "sheep_count": d.sheep_count,
            "confidence_avg": d.confidence_avg,
            "processing_ms": d.processing_ms,
            "model_version": d.model_version,
            "detected_at": d.detected_at,
        }
        for d in detections
    ]
