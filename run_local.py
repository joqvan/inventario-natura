# run_local.py
import os, sys, time, threading
from pathlib import Path
import webbrowser

IS_FROZEN = getattr(sys, "frozen", False)

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
DATA.mkdir(exist_ok=True)

# En desarrollo, usa DB local ./data
# En .exe, deja que backend/database.py elija %LOCALAPPDATA%\InventarioNatura
if not IS_FROZEN:
    os.environ.setdefault("BACKEND_DB_URL", f"sqlite:///{(DATA/'inventario_natura.db').as_posix()}")
    os.environ.setdefault("FLASK_ENV", "development")
    os.environ.setdefault("FLASK_DEBUG", "1")

# Asegura que Python vea backend/
if str(BASE) not in sys.path:
    sys.path.insert(0, str(BASE))

from backend.app import app
from flask import request

# Inicializa DB
try:
    from backend.database import init_db
    init_db()
except Exception as e:
    print("[AVISO] init_db() no se pudo ejecutar:", e)

APP_URL = "http://127.0.0.1:5000"

def open_default_tab():
    """Abre SIEMPRE en el navegador predeterminado, como pestaña normal."""
    def _open():
        time.sleep(1)
        try:
            # new=2 -> nueva pestaña en el navegador predeterminado
            webbrowser.open(APP_URL, new=2, autoraise=True)
        except Exception as e:
            print("[open_default_tab] No se pudo abrir el navegador:", e)
    threading.Thread(target=_open, daemon=True).start()

@app.route("/__shutdown", methods=["POST", "GET", "OPTIONS"])
def __shutdown():
    """Apaga el servidor; NO intentamos cerrar la pestaña (los navegadores lo bloquean)."""
    def _bye():
        time.sleep(0.25)
        os._exit(0)
    threading.Thread(target=_bye, daemon=True).start()
    return ("", 204)

# Abre en pestaña del navegador predeterminado
open_default_tab()

if __name__ == "__main__":
    from waitress import serve
    print(f"Sirviendo en {APP_URL}")
    serve(app, host="127.0.0.1", port=5000)
