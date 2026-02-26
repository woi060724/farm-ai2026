"""AgroAI — Farms Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from models.database import get_db, Farm
from models.schemas import FarmCreate, FarmOut
from routers.auth import get_current_user, User

router = APIRouter()


@router.get("", response_model=List[FarmOut])
async def list_farms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Farm).where(Farm.owner_id == current_user.id))
    return [FarmOut.model_validate(f) for f in result.scalars().all()]


@router.post("", response_model=FarmOut, status_code=201)
async def create_farm(
    data: FarmCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farm = Farm(**data.model_dump(), owner_id=current_user.id)
    db.add(farm)
    await db.commit()
    await db.refresh(farm)
    return FarmOut.model_validate(farm)


@router.get("/map")
async def get_map_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """GeoJSON форматтағы ферма деректері"""
    result = await db.execute(select(Farm))
    farms = result.scalars().all()
    features = []
    for farm in farms:
        if farm.latitude and farm.longitude:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [farm.longitude, farm.latitude]},
                "properties": {"id": farm.id, "name": farm.name, "area_ha": farm.area_ha},
            })
    return {"type": "FeatureCollection", "features": features}
