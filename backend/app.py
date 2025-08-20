from flask import Flask, send_from_directory
from flask_cors import CORS
from .database import engine, Base
from backend.routes.productos import productos_bp
import os

app = Flask(__name__)
CORS(app)

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# Registrar blueprint de productos
app.register_blueprint(productos_bp)

# Ruta para servir index.html
@app.route("/")
def index():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "../frontend"), "index.html")

# Ruta para servir nuevo.html
@app.route("/nuevo.html")
def nuevo():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "../frontend"), "nuevo.html")

# Ruta para archivos estáticos como JS y CSS
@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), "../frontend"), filename)

# Solo necesario si ejecutas directamente app.py (no con -m backend)
if __name__ == "__main__":
    app.run(debug=True)
