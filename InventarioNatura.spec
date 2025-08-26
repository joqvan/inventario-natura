# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_data_files
from PyInstaller.utils.hooks import collect_submodules

datas = [('frontend', 'frontend'), ('static', 'static'), ('.env', '.')]
hiddenimports = ['sqlalchemy.dialects.sqlite', 'sqlalchemy.sql.default_comparator', 'sqlalchemy.ext.baked', 'sqlalchemy']
datas += collect_data_files('sqlalchemy')
datas += collect_data_files('flask')
datas += collect_data_files('flask_cors')
datas += collect_data_files('dotenv')
datas += collect_data_files('werkzeug')
datas += collect_data_files('jinja2')
datas += collect_data_files('markupsafe')
hiddenimports += collect_submodules('sqlalchemy')


a = Analysis(
    ['run_local.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='InventarioNatura',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['icono.ico'],
)
