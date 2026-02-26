"""AgroAI — Health Records Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from models.database import get_db, HealthRecord, Livestock, HealthStatus
from models.schemas import HealthRecordCreate, HealthRecordOut
from routers.auth import get_current_user, User

router = APIRouter()


@router.post("", response_model=HealthRecordOut, status_code=201)
async def create_health_record(
    data: HealthRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Денсаулық жазбасын қосу"""
    # Update livestock health status if diagnosis given
    if data.diagnosis:
        result = await db.execute(select(Livestock).where(Livestock.id == data.livestock_id))
        livestock = result.scalar_one_or_none()
        if livestock:
            livestock.health_status = HealthStatus.monitoring

    record = HealthRecord(**data.model_dump(), vet_id=current_user.id)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return HealthRecordOut.model_validate(record)


@router.get("/livestock/{livestock_id}", response_model=List[HealthRecordOut])
async def get_livestock_health(
    livestock_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Жануардың денсаулық тарихы"""
    result = await db.execute(
        select(HealthRecord)
        .where(HealthRecord.livestock_id == livestock_id)
        .order_by(HealthRecord.record_date.desc())
    )
    return [HealthRecordOut.model_validate(r) for r in result.scalars().all()]
