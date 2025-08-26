@echo off
REM ===============================================================
REM  Build EXE for Inventario Natura (Windows, PyInstaller)
REM  Requisitos: Python 3.10/3.11 instalado y en PATH
REM ===============================================================

setlocal ENABLEDELAYEDEXPANSION

REM Ir a la carpeta del proyecto (donde está este .bat o ajusta la ruta)
cd /d "%~dp0"

REM ---- Crear venv limpia ----
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate

REM ---- Actualizar pip y deps ----
python -m pip install --upgrade pip wheel setuptools
REM Instala dependencias del backend + runtime del servidor + PyInstaller
pip install -r backend\requirements.txt waitress pyinstaller

REM ---- Limpieza de compilaciones previas ----
rmdir /s /q build 2>nul
rmdir /s /q dist 2>nul
del /q InventarioNatura.spec 2>nul

REM ---- Construcción (modo silencioso para el usuario final) ----
pyinstaller --noconfirm --clean --onefile --name "InventarioNatura" ^
  --icon "icono.ico" ^
  --add-data "frontend;frontend" ^
  --add-data "static;static" ^
  --add-data ".env;." ^
  --hidden-import "sqlalchemy.dialects.sqlite" ^
  --hidden-import "sqlalchemy.sql.default_comparator" ^
  --hidden-import "sqlalchemy.ext.baked" ^
  --hidden-import "sqlalchemy" ^
  --collect-submodules "sqlalchemy" ^
  --collect-data "sqlalchemy" ^
  --collect-data "flask" ^
  --collect-data "flask_cors" ^
  --collect-data "dotenv" ^
  --collect-data "werkzeug" ^
  --collect-data "jinja2" ^
  --collect-data "markupsafe" ^
  --noconsole ^
  run_local.py

echo.
echo ===============================================================
echo  EXE generado (si no hubo errores): dist\InventarioNatura.exe
echo  Copia tambiÃ©n la carpeta "data" en el mismo nivel del EXE si existe.
echo  Primer arranque puede tardar unos segundos mientras desempaqueta.
echo ===============================================================
echo.
pause
