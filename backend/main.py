from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import FastAPI, HTTPException, Request, Response, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from pwdlib import PasswordHash


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="frontend"), name="static")

client = MongoClient("mongodb://localhost:27017")
db = client["turnos_db"]
coleccion = db["turnos"]
usuarios = db["usuarios"]

# =========================
# SEGURIDAD
# =========================
SECRET_KEY = "cambiame-por-una-clave-larga-y-secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()


class Turno(BaseModel):
    nombre: str
    apellido: str
    dia: str
    hora: str
    contacto: str
    email: str

class LoginData(BaseModel):
    username: str
    password: str

class AdminUpdateCredentials(BaseModel):
    username_actual: str
    nuevo_username: str
    nueva_password: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

        user = usuarios.find_one({"username": username})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )

        return user

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )


def crear_admin_inicial(username: str, password: str):
    existente = usuarios.find_one({"username": username})

    if not existente:
        usuarios.insert_one({
            "username": username,
            "hashed_password": get_password_hash(password)
        })


crear_admin_inicial("admin", "1234")

# =========================
# PÁGINAS
# =========================
@app.get("/")
def home():
    return FileResponse("frontend/pages/index.html")


@app.get("/admin")
def admin_page():
    return FileResponse("frontend/pages/admin.html")


@app.get("/dashboard")
def dashboard_page(request: Request):
    get_current_admin(request)
    return FileResponse("frontend/pages/dashboard.html")


# =========================
# AUTH
# =========================
@app.post("/login")
def login(data: LoginData, response: Response):
    user = usuarios.find_one({"username": data.username})

    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    access_token = create_access_token(data={"sub": user["username"]})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,   # en producción con HTTPS -> True
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {"mensaje": "Login correcto"}


@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"mensaje": "Logout correcto"}


@app.get("/me")
def me(request: Request):
    user = get_current_admin(request)
    return {"username": user["username"]}


# =========================
# TURNOS PÚBLICOS
# =========================
@app.post("/turno")
def crear_turno(turno: Turno):
    try:
        coleccion.insert_one(turno.model_dump())
        return {"mensaje": "Turno solicitado correctamente"}
    except DuplicateKeyError:
        return {"error": "Turno ya ocupado"}


@app.get("/turnos/{dia}")
def obtener_turnos_por_dia(dia: str):
    turnos = list(coleccion.find({"dia": dia}, {"_id": 0, "hora": 1}))
    return turnos


# =========================
# TURNOS ADMIN
# =========================
@app.get("/turnos")
def ver_turnos(request: Request):
    get_current_admin(request)
    return list(
        coleccion.find({}, {"_id": 0}).sort([("dia", 1), ("hora", 1)])
    )


@app.delete("/turno")
def eliminar_turno(data: dict, request: Request):
    get_current_admin(request)

    resultado = coleccion.delete_one({
        "dia": data["dia"],
        "hora": data["hora"]
    })

    if resultado.deleted_count == 0:
        return {"error": "Turno no encontrado"}

    return {"mensaje": "Turno eliminado"}

# =========================
# ADMIN
# =========================
@app.get("/configuracion")
def configuracion_page(request: Request):
    get_current_admin(request)
    return FileResponse("frontend/pages/configuracion.html")

@app.put("/admins/credenciales")
def cambiar_credenciales_admin(data: AdminUpdateCredentials, request: Request):
    admin_actual = get_current_admin(request)

    if admin_actual["username"] != data.username_actual:
        return {"error": "Solo podés modificar tu propio usuario desde este formulario"}

    if not data.nuevo_username or not data.nueva_password:
        return {"error": "Completá todos los campos"}

    existente = usuarios.find_one({
        "username": data.nuevo_username
    })

    if existente and existente["username"] != data.username_actual:
        return {"error": "Ese nuevo usuario ya está en uso"}

    usuarios.update_one(
        {"username": data.username_actual},
        {
            "$set": {
                "username": data.nuevo_username,
                "hashed_password": get_password_hash(data.nueva_password)
            }
        }
    )

    return {"mensaje": "Credenciales actualizadas correctamente"}