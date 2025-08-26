@echo off
REM ===============================================================
REM  Build EXE (modo consola para depurar)
REM ===============================================================
call .venv\Scripts\activate
pyinstaller --noconfirm --clean --onefile --name "InventarioNatura_console" ^
  --add-data "frontend;frontend" ^
  --add-data "static;static" ^
  --add-data ".env;." ^
  --hidden-import "sqlalchemy.dialects.sqlite" ^
  --collect-submodules "sqlalchemy" ^
  --console ^
  run_local.py
echo EXE: dist\InventarioNatura_console.exe
pause
