"""
AgroAI — AI Chatbot Router (Claude API)
=========================================
ЖИ чат-боты — Anthropic Claude негізіндегі техникалық қолдау
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import anthropic
import os
from typing import Optional

from models.database import get_db, ChatMessage
from models.schemas import ChatMessageIn, ChatMessageOut
from routers.auth import get_current_user, User

router = APIRouter()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# System prompt — bilingual livestock expert
SYSTEM_PROMPT = """Сен AgroAI жүйесінің ЖИ кеңесшісісің — жылыжай мал шаруашылығы жүйесіне арналған техникалық қолдау чат-боты.

Сенің рөліңдер:
1. 🐄 МАЛ ДЕНСАУЛЫҒЫ КЕҢЕСШІСІ: Ауру белгілері, алдын алу шаралары, қашан ветеринарға барату керек
2. 💻 ЖҮЙЕ НҰСҚАУШЫСЫ: AgroAI веб-жүйесін қалай пайдалану, функциялар, баптаулар
3. 📊 АНАЛИТИКА САРАПШЫСЫ: Деректерді оқу, KPI түсіндіру, есептер
4. 🌿 ЖЫЛЫЖАЙ САРАПШЫСЫ: Климат бақылауы, аквапоника, вертикальды фермалар

ТІЛ ЕРЕЖЕСІ:
- Пайдаланушы қазақша жазса → қазақша жауап бер
- Пайдаланушы орысша жазса → орысша жауап бер  
- Пайдаланушы ағылшынша жазса → ағылшынша жауап бер

ЖҮЙЕ ТУРАЛЫ АҚПАРАТ (AgroAI v1.0):
- Мал тіркеу: Dashboard → Livestock → "+ Жаңа мал" батырмасы
- ЖИ санау: AI Detection бетіне барып, сурет/видео жүктеу
- Денсаулық жазбасы: Health Records → "+ Жазба қосу"
- GPS карта: Map бетінде барлық фермалар мен малдар
- Есеп жасау: Reports → PDF немесе Excel таңдау

МАЛ АУРУЛАРЫ (ЖИІЛІК):
- Мастит (сиыр): желін ісуі, сүт түсінің өзгеруі → ветеринар шақыру
- Ламинит: аяқ ауруы, жорғалау → сим карбонат ванна, ветеринар
- Пневмония: жөтел, температура 40°C+ → антибиотик, ветеринар
- Bloat (желіну): іш кебуі, тез шешу керек → ветеринар ШҰҒЫЛ

МАҢЫЗДЫ: Ауру жайлы кеңес берсең, ӘРДАЙЫМ ветеринарды шақыруды ұсын.
МАҢЫЗДЫ: Дәрі дозасын нақты белгілеме — ветеринарға бағыттай.

Жауаптарыңда emoji пайдалан, қысқа және нақты бол. Техникалық терминдерді қарапайым тілмен түсіндір."""


def get_language(text: str) -> str:
    """Detect language from text"""
    # Simple heuristic based on character sets
    kazakh_chars = set("әіңғүұқөһ")
    russian_chars = set("ёъыьэюяийцшщчхжзф")
    text_lower = text.lower()
    
    kz_count = sum(1 for c in text_lower if c in kazakh_chars)
    ru_count = sum(1 for c in text_lower if c in russian_chars)
    
    if kz_count > 0:
        return "kk"
    elif ru_count > 2:
        return "ru"
    return "en"


@router.post("", response_model=ChatMessageOut)
async def send_message(
    data: ChatMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = None,
):
    """
    ЖИ чат-ботына хабарлама жіберу (Claude API)
    
    - **message**: Пайдаланушы хабарламасы
    - **session_id**: Сессия идентификаторы (UUID ұсынылады)
    - **language**: Тіл (kk/ru/en, автоматты анықталады)
    """
    if not ANTHROPIC_API_KEY:
        raise HTTPException(503, "Chatbot service unavailable. Set ANTHROPIC_API_KEY.")

    # Detect language automatically
    lang = get_language(data.message) if data.language == "auto" else data.language

    # Get conversation history (last 10 messages)
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == data.session_id)
        .order_by(desc(ChatMessage.created_at))
        .limit(10)
    )
    history = list(reversed(result.scalars().all()))

    # Build messages for Claude
    messages = []
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": data.message})

    # Call Claude API
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        reply_text = response.content[0].text
        tokens_used = response.usage.input_tokens + response.usage.output_tokens

    except anthropic.AuthenticationError:
        raise HTTPException(401, "Invalid Anthropic API key")
    except anthropic.RateLimitError:
        raise HTTPException(429, "Rate limit exceeded. Try again later.")
    except Exception as e:
        raise HTTPException(500, f"AI service error: {str(e)}")

    # Save messages to DB
    user_msg = ChatMessage(
        user_id=current_user.id if current_user else None,
        session_id=data.session_id,
        role="user",
        content=data.message,
        language=lang,
    )
    assistant_msg = ChatMessage(
        user_id=current_user.id if current_user else None,
        session_id=data.session_id,
        role="assistant",
        content=reply_text,
        language=lang,
    )
    db.add_all([user_msg, assistant_msg])
    await db.commit()

    return ChatMessageOut(
        reply=reply_text,
        session_id=data.session_id,
        language=lang,
        tokens_used=tokens_used,
    )


@router.get("/history/{session_id}")
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Сессия тарихы"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]


@router.delete("/history/{session_id}")
async def clear_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Сессия тарихын тазалау"""
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id)
    )
    messages = result.scalars().all()
    for m in messages:
        await db.delete(m)
    await db.commit()
    return {"deleted": len(messages)}
