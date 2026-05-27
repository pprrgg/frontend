#!/usr/bin/env python3

import shutil
import os
import subprocess

SCRIPTS_TO_RUN = [
    "p12_fastapi_pdfs_2_react_public.py",
    "p13_public_routers2catalogo_json.py",
    # "p13_public_routers2servicios_json.py"
]
# Ejecutar scripts

os.chdir(os.path.dirname(os.path.abspath(__file__)))

for script in SCRIPTS_TO_RUN:
    if os.path.isfile(f"./{script}"):
        subprocess.run(["python3", f"./{script}"])
        print('='*222+f"\n\nEjecutado: {script}")
    else:
        print(f"No se encontró el script: {script}")



