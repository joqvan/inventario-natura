# backend/app.py
import os, sys
from pathlib import Path
from flask import Flask, send_from_directory

# ---- Utilidad: rutas válidas en dev y en .exe (PyInstaller) ----
def resource_path(rel: str) -> Path:
    """
    Devuelve una ruta que funciona tanto en desarrollo como dentro del EXE.
    - En EXE, toma como base _MEIPASS (carpeta temporal del bundle).
    - En dev, toma la carpeta de este archivo (backend/).
    """
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).parent))
    return (base / rel).resolve()

# Rutas reales para templates/static si los empaquetas
TPL_DIR = resource_path("templates")
ST_DIR  = resource_path("static")

# Flask: usa templates/static si existen; si no, desactívalos sin romper
app = Flask(
    __name__,
    template_folder=str(TPL_DIR) if TPL_DIR.exists() else None,
    static_folder=str(ST_DIR) if ST_DIR.exists() else None,
)

# CORS (opcional; si no está instalado, no rompe)
try:
    from flask_cors import CORS
    CORS(app)
except Exception:
    pass

# ---- DB ----
from .database import Base, engine, init_db
init_db()                          # crea tablas si faltan
Base.metadata.create_all(bind=engine)

# ---- Blueprints ----
from .routes.productos import productos_bp
app.register_blueprint(productos_bp)

# ---- Servir FRONTEND (index.html / nuevo.html) ----
def get_frontend_dir() -> Path | None:
    # 1) carpeta "frontend" empaquetada junto al EXE
    cand = resource_path("frontend")
    if cand.exists():
        return cand
    # 2) carpeta frontend del proyecto (dev): ../frontend respecto a backend/
    dev = (Path(__file__).parent / ".." / "frontend").resolve()
    return dev if dev.exists() else None

FRONTEND_DIR = get_frontend_dir()

if FRONTEND_DIR:
    @app.route("/")
    def index():
        return send_from_directory(str(FRONTEND_DIR), "index.html")

    @app.route("/nuevo.html")
    def nuevo():
        return send_from_directory(str(FRONTEND_DIR), "nuevo.html")

    @app.route("/<path:path>")
    def assets(path: str):
        return send_from_directory(str(FRONTEND_DIR), path)
else:
    @app.route("/")
    def index_placeholder():
        return "<h3>No se encontró la carpeta 'frontend'.</h3>"

# opcional: healthcheck
@app.get("/health")
def health():
    return {"status": "ok"}
