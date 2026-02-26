"""AgroAI — Pydantic Schemas"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from models.database import HealthStatus, UserRole, Species


# ─── Auth ───
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=6)
    role: UserRole = UserRole.farmer


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Farm ───
class FarmCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_ha: Optional[float] = None
    is_greenhouse: bool = True


class FarmOut(FarmCreate):
    id: int
    owner_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── Livestock ───
class LivestockCreate(BaseModel):
    farm_id: int
    tag_number: Optional[str] = None
    name: Optional[str] = None
    species: Species
    breed: Optional[str] = None
    sex: Optional[str] = None
    birth_date: Optional[date] = None
    weight_kg: Optional[float] = None
    health_status: HealthStatus = HealthStatus.healthy
    notes: Optional[str] = None


class LivestockUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    weight_kg: Optional[float] = None
    health_status: Optional[HealthStatus] = None
    notes: Optional[str] = None


class LivestockOut(LivestockCreate):
    id: int
    photo_url: Optional[str] = None
    last_ai_check: Optional[datetime] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class LivestockList(BaseModel):
    items: List[LivestockOut]
    total: int
    page: int
    size: int


# ─── Health ───
class HealthRecordCreate(BaseModel):
    livestock_id: int
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    medicine: Optional[str] = None
    temperature: Optional[float] = None
    notes: Optional[str] = None
    record_date: date


class HealthRecordOut(HealthRecordCreate):
    id: int
    vet_id: Optional[int] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── AI Detection ───
class DetectionResult(BaseModel):
    total_count: int
    cattle_count: int
    sheep_count: int
    goat_count: int
    other_count: int
    confidence_avg: float
    processing_ms: int
    model_version: str
    detections: List[dict]


# ─── Chat ───
class ChatMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str
    language: str = "kk"  # kk | ru | en


class ChatMessageOut(BaseModel):
    reply: str
    session_id: str
    language: str
    tokens_used: Optional[int] = None


# ─── Weight Log ───
class WeightLogCreate(BaseModel):
    livestock_id: int
    weight_kg: float
    method: str = "manual"


class WeightLogOut(WeightLogCreate):
    id: int
    measured_at: datetime
    model_config = {"from_attributes": True}


# ─── Stats ───
class DashboardStats(BaseModel):
    total_livestock: int
    sick_count: int
    monitoring_count: int
    counted_today: int
    farms_count: int
    weekly_counts: List[dict]
    species_breakdown: List[dict]
