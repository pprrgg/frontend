import os
import shutil
from pathlib import Path

os.chdir(os.path.dirname(os.path.abspath(__file__)))

destino = '../public'
destino_completo = os.path.join(destino, 'routers')

print(99999999999999999999999999999999999999999999)
# Eliminar archivos que no terminen en .pdf o .xlsx
for root, dirs, files in os.walk(destino_completo):
    for file in files:
        print(file)
        # Si el archivo no termina en .pdf ni .xlsx, se elimina
        # if not (file.endswith('_.pdf') or file.endswith('.xlsx')):
        if not (file.endswith('.pdf') or file.endswith('.xlsx') or file.endswith('.json')):
            
            ruta_completa = os.path.join(root, file)
            print(f'Eliminando: {ruta_completa}')
            os.remove(ruta_completa)

    # Eliminar la carpeta assets si existe
    if 'assets' in dirs:
        ruta_assets = os.path.join(root, 'assets')
        print(f'Eliminando carpeta assets: {ruta_assets}')
        shutil.rmtree(ruta_assets)
