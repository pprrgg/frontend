import os
import shutil
from pathlib import Path

os.chdir(os.path.dirname(os.path.abspath(__file__)))

origen = '/home/pk/Desktop/backend/fastapi/app/routers'
destino = '../public'
destino_completo = os.path.join(destino, 'routers')
# Eliminar la carpeta de destino si existe
if os.path.exists(destino_completo):
    shutil.rmtree(destino_completo)

# Función para excluir carpetas que contienen '__' en su nombre
def exclude_folders_with_double_underscore(dir, dirs):
    return [d for d in dirs if '__'  in d]

# Copiar la carpeta completa, excluyendo carpetas con '__' en el nombre
shutil.copytree(origen, destino_completo, ignore=exclude_folders_with_double_underscore)

