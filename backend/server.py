from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Cookie, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import json
import re
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any
from datetime import datetime, timezone, timedelta
import httpx
from passlib.context import CryptContext
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
SESSION_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


def now_utc():
    return datetime.now(timezone.utc)


# ----------------------------- Models -----------------------------
class SignupInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: Optional[str] = None

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class GoogleSessionInput(BaseModel):
    session_id: str

class PublicUser(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    is_subscribed: bool = False
    on_trial: bool = False
    trial_days_left: int = 0
    auth_provider: str = "email"

TRIAL_DAYS = 14

def compute_sub(user_doc: dict) -> dict:
    """Return {is_subscribed, on_trial, trial_days_left} from a user doc."""
    if user_doc.get("is_subscribed"):
        return {"is_subscribed": True, "on_trial": False, "trial_days_left": 0}
    trial_ends = user_doc.get("trial_ends_at")
    if trial_ends:
        if isinstance(trial_ends, str):
            trial_ends = datetime.fromisoformat(trial_ends)
        if trial_ends.tzinfo is None:
            trial_ends = trial_ends.replace(tzinfo=timezone.utc)
        if trial_ends > now_utc():
            days = max(0, (trial_ends - now_utc()).days + 1)
            return {"is_subscribed": True, "on_trial": True, "trial_days_left": days}
    return {"is_subscribed": False, "on_trial": False, "trial_days_left": 0}

class ProfileInput(BaseModel):
    fitzpatrick: int
    undertone: str
    skinHex: str
    label: str
    eyeColour: Optional[str] = None
    faceShape: Optional[str] = None
    lighting: Optional[str] = None
    confidence: Optional[float] = None
    lightingNotes: Optional[str] = None

class FavouriteInput(BaseModel):
    brand: str
    product: str
    shade: str
    hex: Optional[str] = None
    priceUSD: Optional[float] = 0
    brandUrl: Optional[str] = None
    category: str

class ScanInput(BaseModel):
    brand: Optional[str] = None
    product: Optional[str] = None
    shade: Optional[str] = None
    shade_hex: Optional[str] = None
    verdict: str
    reason: Optional[str] = None
    store: Optional[str] = None

class AnalyzeInput(BaseModel):
    imageBase64: str

class BarcodeInput(BaseModel):
    barcode: str


# ----------------------------- Auth helpers -----------------------------
async def create_session(user_id: str) -> str:
    token = f"sess_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": now_utc() + timedelta(days=SESSION_DAYS),
        "created_at": now_utc(),
    })
    return token


def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token", value=token, httponly=True, secure=True,
        samesite="none", path="/", max_age=SESSION_DAYS * 24 * 3600,
    )


async def get_current_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
) -> PublicUser:
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid session")
    exp = sess["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.update(compute_sub(user))
    return PublicUser(**user)


async def optional_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
) -> Optional[PublicUser]:
    try:
        return await get_current_user(session_token, authorization)
    except HTTPException:
        return None


# ----------------------------- Auth routes -----------------------------
@api_router.post("/auth/signup")
async def signup(data: SignupInput, response: Response):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    await db.users.insert_one({
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name or data.email.split("@")[0],
        "picture": None,
        "password_hash": pwd_context.hash(data.password),
        "is_subscribed": False,
        "auth_provider": "email",
        "created_at": now_utc(),
    })
    token = await create_session(user_id)
    set_session_cookie(response, token)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    user.update(compute_sub(user))
    return {"token": token, "user": PublicUser(**user)}


@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not user.get("password_hash") or not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = await create_session(user["user_id"])
    set_session_cookie(response, token)
    clean = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    clean.update(compute_sub(clean))
    return {"token": token, "user": PublicUser(**clean)}


@api_router.post("/auth/google/session")
async def google_session(data: GoogleSessionInput, response: Response):
    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": data.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Google session exchange failed")
    info = r.json()
    email = (info.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=401, detail="No email from Google")
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": info.get("name") or email.split("@")[0],
            "picture": info.get("picture"),
            "password_hash": None,
            "is_subscribed": False,
            "auth_provider": "google",
            "created_at": now_utc(),
        })
    else:
        user_id = user["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": info.get("name") or user.get("name"), "picture": info.get("picture")}})
    token = await create_session(user_id)
    set_session_cookie(response, token)
    clean = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    clean.update(compute_sub(clean))
    return {"token": token, "user": PublicUser(**clean)}


@api_router.get("/auth/me", response_model=PublicUser)
async def auth_me(user: PublicUser = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(default=None), authorization: Optional[str] = Header(default=None)):
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ----------------------------- Subscription -----------------------------
@api_router.get("/subscription")
async def get_subscription(user: PublicUser = Depends(get_current_user)):
    return {"is_subscribed": user.is_subscribed, "on_trial": user.on_trial, "trial_days_left": user.trial_days_left}

@api_router.post("/start-trial")
async def start_trial(user: PublicUser = Depends(get_current_user)):
    doc = await db.users.find_one({"user_id": user.user_id})
    status = compute_sub(doc)
    # Only start a trial once, and only if not already unlocked.
    if not status["is_subscribed"] and not doc.get("trial_ends_at"):
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {"trial_ends_at": now_utc() + timedelta(days=TRIAL_DAYS)}},
        )
    doc = await db.users.find_one({"user_id": user.user_id})
    return compute_sub(doc)

@api_router.post("/subscribe")
async def subscribe(user: PublicUser = Depends(get_current_user)):
    await db.users.update_one({"user_id": user.user_id}, {"$set": {"is_subscribed": True}})
    return {"is_subscribed": True, "on_trial": False, "trial_days_left": 0}

@api_router.post("/unsubscribe")
async def unsubscribe(user: PublicUser = Depends(get_current_user)):
    await db.users.update_one({"user_id": user.user_id}, {"$set": {"is_subscribed": False}})
    return {"is_subscribed": False}


# ----------------------------- Profiles -----------------------------
@api_router.get("/profiles")
async def list_profiles(user: PublicUser = Depends(get_current_user)):
    rows = await db.skin_profiles.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return rows

@api_router.post("/profiles")
async def create_profile(data: ProfileInput, user: PublicUser = Depends(get_current_user)):
    count = await db.skin_profiles.count_documents({"user_id": user.user_id})
    if count >= 2:
        oldest = await db.skin_profiles.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", 1).to_list(1)
        if oldest:
            await db.skin_profiles.delete_one({"profile_id": oldest[0]["profile_id"]})
    doc = data.dict()
    doc.update({"profile_id": f"prof_{uuid.uuid4().hex[:12]}", "user_id": user.user_id, "created_at": now_utc()})
    await db.skin_profiles.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str, user: PublicUser = Depends(get_current_user)):
    await db.skin_profiles.delete_one({"profile_id": profile_id, "user_id": user.user_id})
    return {"ok": True}


# ----------------------------- Favourites -----------------------------
@api_router.get("/favourites")
async def list_favourites(user: PublicUser = Depends(get_current_user)):
    rows = await db.favourites.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return rows

@api_router.post("/favourites/toggle")
async def toggle_favourite(data: FavouriteInput, user: PublicUser = Depends(get_current_user)):
    q = {"user_id": user.user_id, "brand": data.brand, "product": data.product, "shade": data.shade, "category": data.category}
    existing = await db.favourites.find_one(q)
    if existing:
        await db.favourites.delete_one(q)
        return {"added": False}
    doc = data.dict()
    doc.update({"fav_id": f"fav_{uuid.uuid4().hex[:12]}", "user_id": user.user_id, "created_at": now_utc()})
    await db.favourites.insert_one(doc)
    return {"added": True}


# ----------------------------- Shopping scans -----------------------------
@api_router.get("/scans")
async def list_scans(user: PublicUser = Depends(get_current_user)):
    rows = await db.shopping_scans.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(6)
    return rows

@api_router.post("/scans")
async def create_scan(data: ScanInput, user: PublicUser = Depends(get_current_user)):
    doc = data.dict()
    doc.update({"scan_id": f"scan_{uuid.uuid4().hex[:12]}", "user_id": user.user_id, "created_at": now_utc()})
    await db.shopping_scans.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/scans/{scan_id}")
async def delete_scan(scan_id: str, user: PublicUser = Depends(get_current_user)):
    await db.shopping_scans.delete_one({"scan_id": scan_id, "user_id": user.user_id})
    return {"ok": True}


# ----------------------------- Product lookup (curated) -----------------------------
CURATED_PRODUCTS = {
    "3600530000000": {"kind": "makeup", "brand": "L'Or\u00e9al", "product": "True Match", "shade": "W3 Nude Beige", "shadeHex": "#D8B08C", "shadeUndertone": "warm", "category": "foundation"},
    "3614272049283": {"kind": "makeup", "brand": "Maybelline", "product": "Fit Me Matte", "shade": "220 Natural Beige", "shadeHex": "#D8B08C", "shadeUndertone": "warm", "category": "foundation"},
    "816657020000": {"kind": "makeup", "brand": "Fenty Beauty", "product": "Pro Filt'r Soft Matte", "shade": "240", "shadeHex": "#DDB394", "shadeUndertone": "neutral", "category": "foundation"},
    "773602384204": {"kind": "makeup", "brand": "MAC", "product": "Studio Fix Fluid", "shade": "NC42", "shadeHex": "#C69574", "shadeUndertone": "warm", "category": "foundation"},
    "607845027201": {"kind": "makeup", "brand": "NARS", "product": "Radiant Creamy Concealer", "shade": "Vanilla", "shadeHex": "#EBCBB2", "shadeUndertone": "neutral", "category": "concealer"},
    "609332824201": {"kind": "makeup", "brand": "e.l.f.", "product": "Camo Concealer", "shade": "Light Sand", "shadeHex": "#E6C6A8", "shadeUndertone": "neutral", "category": "concealer"},
}
# Fallback demo products (returned for unrecognised-but-plausible barcodes)
DEMO_FALLBACK = [
    {"kind": "makeup", "brand": "Rare Beauty", "product": "Liquid Blush", "shade": "Joy", "shadeHex": "#C56A6A", "shadeUndertone": "cool", "category": "blush"},
    {"kind": "makeup", "brand": "NYX", "product": "Can't Stop Won't Stop", "shade": "Light Ivory", "shadeHex": "#EAD1B8", "shadeUndertone": "neutral", "category": "foundation"},
]

@api_router.post("/product-lookup")
async def product_lookup(data: BarcodeInput):
    code = re.sub(r"\D", "", data.barcode or "")
    if code in CURATED_PRODUCTS:
        return CURATED_PRODUCTS[code]
    # Deterministic fallback so a real scanned code always resolves to a demo product
    if code and len(code) >= 8:
        idx = int(code[-1]) % len(DEMO_FALLBACK)
        return DEMO_FALLBACK[idx]
    return {"kind": "not_found", "message": "Couldn't find that product. Try another barcode."}


# ----------------------------- Skin analysis (GPT-4o vision) -----------------------------
SKIN_SYSTEM = (
    "You are a professional makeup shade-matching assistant. Analyse the skin visible in the photo "
    "(cheek, forehead, wrist or inner arm) and return ONLY strict JSON, no prose, with keys: "
    "fitzpatrick (integer 1-6), undertone ('warm'|'cool'|'neutral'), skinHex (hex like '#DDB394' of the average skin tone), "
    "label (short human label e.g. 'Light Medium'), eyeColour ('brown'|'blue'|'green'|'hazel'|'grey' or null if not visible), "
    "faceShape ('oval'|'round'|'square'|'heart'|'oblong'|'diamond' or null if not a full face), "
    "lighting ('daylight'|'warm_indoor'|'cool_indoor'|'mixed'|'low_light'|'overexposed'), "
    "confidence (0-1 float), lightingNotes (one short sentence). "
    "Base skinHex on the actual pixels. If you truly cannot see any skin, return {\"error\":\"no_skin\"}."
)


def _strip_b64(data_url: str) -> str:
    if ";base64," in data_url:
        return data_url.split(";base64,", 1)[1]
    if data_url.startswith("data:") and "," in data_url:
        return data_url.split(",", 1)[1]
    return data_url


def _parse_json(text: str) -> dict:
    text = text.strip()
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        text = m.group(0)
    return json.loads(text)


@api_router.post("/analyze-skin")
async def analyze_skin(data: AnalyzeInput):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    raw_b64 = _strip_b64(data.imageBase64)
    if not raw_b64 or len(raw_b64) < 100:
        raise HTTPException(status_code=400, detail="Invalid image")
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"skin_{uuid.uuid4().hex[:8]}",
            system_message=SKIN_SYSTEM,
        ).with_model("openai", "gpt-4o")
        msg = UserMessage(
            text="Analyse the skin in this photo and return only the JSON described.",
            file_contents=[ImageContent(image_base64=raw_b64)],
        )
        reply = await chat.send_message(msg)
        result = _parse_json(reply if isinstance(reply, str) else str(reply))
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Could not read skin tone \u2014 try a clearer, well-lit photo.")
    except Exception as e:
        logger.exception("analyze-skin failed")
        raise HTTPException(status_code=502, detail="Skin analysis failed. Please try again.")

    if result.get("error") == "no_skin":
        raise HTTPException(status_code=422, detail="Couldn't read your skin tone \u2014 try a clearer, well-lit photo of your skin.")

    # Normalise / clamp
    try:
        fitz = int(result.get("fitzpatrick", 3))
    except Exception:
        fitz = 3
    fitz = max(1, min(6, fitz))
    undertone = result.get("undertone", "neutral")
    if undertone not in ("warm", "cool", "neutral"):
        undertone = "neutral"
    skin_hex = result.get("skinHex") or "#DDB394"
    if not re.match(r"^#?[0-9a-fA-F]{6}$", str(skin_hex)):
        skin_hex = "#DDB394"
    if not skin_hex.startswith("#"):
        skin_hex = "#" + skin_hex
    return {
        "fitzpatrick": fitz,
        "undertone": undertone,
        "skinHex": skin_hex,
        "label": result.get("label") or "Skin tone",
        "eyeColour": result.get("eyeColour") if result.get("eyeColour") in ("brown", "blue", "green", "hazel", "grey") else None,
        "faceShape": result.get("faceShape") if result.get("faceShape") in ("oval", "round", "square", "heart", "oblong", "diamond") else None,
        "lighting": result.get("lighting") or "mixed",
        "confidence": result.get("confidence", 0.8),
        "lightingNotes": result.get("lightingNotes") or "",
    }


@api_router.get("/")
async def root():
    return {"message": "The Face Muse API"}


# ----------------------------- Stripe payments -----------------------------
import stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

class CheckoutRequest(BaseModel):
    lookup_key: str = "pro_monthly"
    origin_url: str
    user_id: Optional[str] = None

@api_router.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest):
    prices = stripe.Price.list(lookup_keys=[req.lookup_key], active=True, limit=1).data
    if not prices:
        raise HTTPException(500, f"Price not found: {req.lookup_key}")
    price = prices[0]
    kwargs = dict(
        line_items=[{"price": price.id, "quantity": 1}],
        mode="subscription" if price.recurring else "payment",
        success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{req.origin_url}/payment/cancel",
        metadata={"user_id": req.user_id or "", "lookup_key": req.lookup_key},
    )
    try:
        session = stripe.checkout.Session.create(**kwargs, managed_payments={"enabled": True})
    except stripe.error.InvalidRequestError as e:
        msg = (getattr(e, "user_message", "") or "").lower()
        if "managed payments" in msg or "ineligible" in msg:
            session = stripe.checkout.Session.create(**kwargs, automatic_tax={"enabled": True}, billing_address_collection="required")
        else:
            raise
    await db.payment_transactions.insert_one({
        "session_id": session.id, "user_id": req.user_id, "lookup_key": req.lookup_key,
        "amount": (price.unit_amount or 0) / 100.0, "currency": price.currency,
        "status": "initiated", "payment_status": "pending",
        "created_at": now_utc(), "updated_at": now_utc(),
    })
    return {"checkout_url": session.url, "session_id": session.id}

async def _mark_paid(session_id: str, subscription=None, payment_intent=None, payment_status="paid"):
    rec = await db.payment_transactions.find_one({"session_id": session_id})
    if not rec or rec.get("payment_status") == "paid":
        return
    await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": payment_status,
                  "stripe_subscription_id": subscription, "stripe_payment_intent_id": payment_intent,
                  "updated_at": now_utc()}},
    )
    uid = rec.get("user_id")
    if uid:
        await db.users.update_one({"user_id": uid}, {"$set": {"is_subscribed": True}})

@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not record:
        raise HTTPException(404, "Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _mark_paid(session_id, s.subscription, s.payment_intent, "paid")
                record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except stripe.error.StripeError:
            pass
    return {"session_id": record["session_id"], "status": record["status"], "payment_status": record["payment_status"]}

@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await _mark_paid(obj["id"], obj.get("subscription"), obj.get("payment_intent"), obj.get("payment_status", "paid"))
    elif t == "checkout.session.async_payment_succeeded":
        await _mark_paid(obj["id"], obj.get("subscription"), obj.get("payment_intent"), "paid")
    return {"status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
