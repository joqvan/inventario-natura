import os, sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

APP_NAME = "InventarioNatura"


def _is_frozen() -> bool:
    # True cuando corre como .exe de PyInstaller
    return getattr(sys, "frozen", False)


def _exe_dir() -> Path:
    return Path(sys.executable).parent if _is_frozen() else Path(__file__).resolve().parent


def get_persistent_data_dir() -> Path:
    """
    Carpeta de datos PERSISTENTE:
    - Windows: %LOCALAPPDATA%\InventarioNatura (o %APPDATA% si no hay LOCALAPPDATA)
    - Linux/macOS: ~/.local/share/InventarioNatura
    - Fallback: al lado del .exe en ./data (si es frozen) o ./data de la fuente en dev
    """
    # 1) Windows (USER profile)
    base = os.getenv("LOCALAPPDATA") or os.getenv("APPDATA")
    if base:
        d = Path(base) / APP_NAME
        d.mkdir(parents=True, exist_ok=True)
        return d

    # 2) Linux/macOS estándar
    home = Path.home()
    if home:
        d = home / ".local" / "share" / APP_NAME
        d.mkdir(parents=True, exist_ok=True)
        return d

    # 3) Fallback: junto al ejecutable/código
    d = _exe_dir() / "data"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _normalize_sqlite_url(path: Path) -> str:
    # Fuerza URL sqlite absoluta: sqlite:///C:/... en Windows o sqlite:////home/...
    # Usamos as_posix para evitar backslashes en URL.
    p = path.resolve()
    return f"sqlite:///{p.as_posix()}"


# 1) Intenta tomar la URL desde .env
DB_URL = os.getenv("BACKEND_DB_URL", "").strip()

if DB_URL:
    # Si el .env define SQLite pero con ruta relativa, la pasamos a persistente.
    if DB_URL.startswith("sqlite:///") and (":///./" in DB_URL or ":///" in DB_URL and not DB_URL[10:].startswith("/")):
        # Cualquier indicio de ruta relativa -> mover a persistente
        data_dir = get_persistent_data_dir()
        DB_URL = _normalize_sqlite_url(data_dir / "inventario_natura.db")
else:
    # 2) Sin .env -> usar carpeta persistente por defecto
    data_dir = get_persistent_data_dir()
    DB_URL = _normalize_sqlite_url(data_dir / "inventario_natura.db")

# Ajustes de conexión para sqlite en Flask + hilos
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}

engine = create_engine(DB_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def init_db():
    """
    Importa modelos y crea tablas si no existen.
    """
    # Debug útil: ver dónde queda la DB
    try:
        print(f"[InventarioNatura] DB_URL = {DB_URL}")
    except Exception:
        pass

    try:
        from . import models  # noqa: F401
    except Exception:
        try:
            import models  # noqa: F401
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)
