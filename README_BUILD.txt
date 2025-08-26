PYINSTALLER KIT - INVENTARIO NATURA
====================================

Este kit asume la estructura del zip que compartiste:
inventario-natura/
  backend/
  frontend/
  static/
  run_local.py
  .env (opcional)
  ...

PASOS RÁPIDOS (Windows):
1) Extrae el proyecto en una carpeta SIN espacios raros. Ej: C:\proyectos\inventario-natura
2) Copia los archivos build_exe.bat y build_exe_console.bat a esa MISMA carpeta (junto a run_local.py).
3) Doble clic en build_exe.bat
   - Si algo falla y quieres ver errores, usa build_exe_console.bat.
4) Si todo va bien, tendrás: dist\InventarioNatura.exe
5) Entrega al usuario final SOLO el .exe de dist. (La DB SQLite se creará en tiempo de ejecución dentro de una carpeta "data" al lado del exe si hace falta).

CÓMO FUNCIONA EL EXE:
- Lanza un pequeño servidor Flask (Waitress) en http://127.0.0.1:5000
- Sirve el frontend empaquetado. Si tu app abre el navegador automáticamente, verás la UI. Si no, abre tú manualmente http://127.0.0.1:5000

TIPS Y PROBLEMAS COMUNES:
- Si el EXE "no hace nada", compílalo con build_exe_console.bat para ver el error en consola.
- Algunas antivirus pueden demorar o bloquear la primera ejecución del EXE. Marca "permitir".
- Si cambias archivos en frontend/static, vuelve a correr el build para re-empaquetarlos.
- .env: Si necesitas variables como BACKEND_DB_URL, colócalas en .env y el build lo incluirá en el paquete.
- Base de datos SQLite: se crea en una carpeta "data" automáticamente (lo maneja run_local.py/backend/database.py).

