"""
AgroAI — SQLAlchemy Database Models
"""
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, Boolean,
    ForeignKey, Text, Enum as SAEnum, func
)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker
import enum
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agroai.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ─────────────────── ENUMS ───────────────────
class HealthStatus(str, enum.Enum):
    healthy = "healthy"
    sick = "sick"
    monitoring = "monitoring"
    quarantine = "quarantine"
    deceased = "deceased"


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    farm_admin = "farm_admin"
    farmer = "farmer"
    veterinarian = "veterinarian"
    analyst = "analyst"


class Species(str, enum.Enum):
    cattle = "cattle"
    sheep = "sheep"
    goat = "goat"
    horse = "horse"
    pig = "pig"
    fish = "fish"
    other = "other"


# ─────────────────── MODELS ───────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.farmer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    farms = relationship("Farm", back_populates="owner")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    description = Column(Text)
    address = Column(String(500))
    latitude = Column(Float)
    longitude = Column(Float)
    area_ha = Column(Float)
    is_greenhouse = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="farms")
    livestock = relationship("Livestock", back_populates="farm")
    detections = relationship("AIDetection", back_populates="farm")


class Livestock(Base):
    __tablename__ = "livestock"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    tag_number = Column(String(50), unique=True, index=True)
    name = Column(String(100))
    species = Column(SAEnum(Species), nullable=False)
    breed = Column(String(100))
    sex = Column(String(1))  # M / F
    birth_date = Column(Date)
    weight_kg = Column(Float)
    health_status = Column(SAEnum(HealthStatus), default=HealthStatus.healthy)
    notes = Column(Text)
    photo_url = Column(String(500))
    last_ai_check = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    farm = relationship("Farm", back_populates="livestock")
    health_records = relationship("HealthRecord", back_populates="livestock")
    weight_logs = relationship("WeightLog", back_populates="livestock")


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    livestock_id = Column(Integer, ForeignKey("livestock.id"), nullable=False)
    vet_id = Column(Integer, ForeignKey("users.id"))
    diagnosis = Column(String(500))
    treatment = Column(Text)
    medicine = Column(String(300))
    temperature = Column(Float)
    notes = Column(Text)
    record_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    livestock = relationship("Livestock", back_populates="health_records")


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    livestock_id = Column(Integer, ForeignKey("livestock.id"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    method = Column(String(50), default="manual")  # manual, sensor, ai_estimate
    measured_by = Column(Integer, ForeignKey("users.id"))
    measured_at = Column(DateTime, server_default=func.now())

    livestock = relationship("Livestock", back_populates="weight_logs")


class AIDetection(Base):
    __tablename__ = "ai_detections"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    total_count = Column(Integer, default=0)
    cattle_count = Column(Integer, default=0)
    sheep_count = Column(Integer, default=0)
    goat_count = Column(Integer, default=0)
    other_count = Column(Integer, default=0)
    confidence_avg = Column(Float)
    image_url = Column(String(500))
    model_version = Column(String(50), default="YOLOv8n")
    processing_ms = Column(Integer)
    confirmed = Column(Boolean, default=False)
    detected_at = Column(DateTime, server_default=func.now())

    farm = relationship("Farm", back_populates="detections")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user / assistant
    content = Column(Text, nullable=False)
    language = Column(String(10), default="kk")
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="chat_messages")
