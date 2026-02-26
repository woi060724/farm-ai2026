"""AgroAI — Livestock CRUD Router"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional

from models.database import get_db, Livestock, Farm, HealthStatus, Species
from models.schemas import LivestockCreate, LivestockUpdate, LivestockOut, LivestockList, DashboardStats
from routers.auth import get_current_user, User
from datetime import datetime, date, timedelta

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dashboard статистикасы"""
    # Total livestock
    total_res = await db.execute(select(func.count(Livestock.id)))
    total = total_res.scalar() or 0

    # Sick count
    sick_res = await db.execute(
        select(func.count(Livestock.id)).where(Livestock.health_status == HealthStatus.sick)
    )
    sick = sick_res.scalar() or 0

    # Monitoring count
    mon_res = await db.execute(
        select(func.count(Livestock.id)).where(Livestock.health_status == HealthStatus.monitoring)
    )
    monitoring = mon_res.scalar() or 0

    # Counted today
    today = date.today()
    counted_res = await db.execute(
        select(func.count(Livestock.id)).where(
            func.date(Livestock.last_ai_check) == today
        )
    )
    counted_today = counted_res.scalar() or 0

    # Farms count
    farms_res = await db.execute(select(func.count(Farm.id)))
    farms_count = farms_res.scalar() or 0

    # Weekly counts (mock data for demo)
    weekly_counts = [
        {"date": (date.today() - timedelta(days=6-i)).strftime("%m/%d"), "count": total - (6-i)*2}
        for i in range(7)
    ]

    # Species breakdown
    species_res = await db.execute(
        select(Livestock.species, func.count(Livestock.id).label("count"))
        .group_by(Livestock.species)
    )
    species_breakdown = [
        {"name": str(row.species), "value": row.count}
        for row in species_res.all()
    ]

    return DashboardStats(
        total_livestock=total,
        sick_count=sick,
        monitoring_count=monitoring,
        counted_today=counted_today,
        farms_count=farms_count,
        weekly_counts=weekly_counts,
        species_breakdown=species_breakdown,
    )


@router.get("", response_model=LivestockList)
async def list_livestock(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    farm_id: Optional[int] = None,
    species: Optional[Species] = None,
    health_status: Optional[HealthStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Мал тізімі — фильтрлеу мен беттеу"""
    query = select(Livestock)

    if farm_id:
        query = query.where(Livestock.farm_id == farm_id)
    if species:
        query = query.where(Livestock.species == species)
    if health_status:
        query = query.where(Livestock.health_status == health_status)
    if search:
        query = query.where(
            or_(
                Livestock.tag_number.ilike(f"%{search}%"),
                Livestock.name.ilike(f"%{search}%"),
                Livestock.breed.ilike(f"%{search}%"),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    # Paginate
    offset = (page - 1) * size
    query = query.offset(offset).limit(size)
    result = await db.execute(query)
    items = result.scalars().all()

    return LivestockList(
        items=[LivestockOut.model_validate(i) for i in items],
        total=total,
        page=page,
        size=size,
    )


@router.post("", response_model=LivestockOut, status_code=201)
async def create_livestock(
    data: LivestockCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Жаңа мал тіркеу"""
    livestock = Livestock(**data.model_dump())
    db.add(livestock)
    await db.commit()
    await db.refresh(livestock)
    return LivestockOut.model_validate(livestock)


@router.get("/{livestock_id}", response_model=LivestockOut)
async def get_livestock(
    livestock_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Жеке мал профилі"""
    result = await db.execute(select(Livestock).where(Livestock.id == livestock_id))
    livestock = result.scalar_one_or_none()
    if not livestock:
        raise HTTPException(404, "Мал табылмады")
    return LivestockOut.model_validate(livestock)


@router.patch("/{livestock_id}", response_model=LivestockOut)
async def update_livestock(
    livestock_id: int,
    data: LivestockUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Мал ақпаратын жаңарту"""
    result = await db.execute(select(Livestock).where(Livestock.id == livestock_id))
    livestock = result.scalar_one_or_none()
    if not livestock:
        raise HTTPException(404, "Мал табылмады")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(livestock, field, value)
    livestock.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(livestock)
    return LivestockOut.model_validate(livestock)


@router.delete("/{livestock_id}")
async def delete_livestock(
    livestock_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Мал жазбасын жою"""
    result = await db.execute(select(Livestock).where(Livestock.id == livestock_id))
    livestock = result.scalar_one_or_none()
    if not livestock:
        raise HTTPException(404, "Мал табылмады")
    await db.delete(livestock)
    await db.commit()
    return {"message": "Мал жазбасы жойылды"}
