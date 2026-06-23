import os
import shutil

origen = '/home/pk/Desktop/backend/fastapi/app/routers'
destino = '../public/routers'

if os.path.exists(destino):
    shutil.rmtree(destino)

MAX_DEPTH = 2  # raíz + 2 niveles

def ignore_deep_folders(current_dir, names):
    # Profundidad relativa respecto al origen
    rel_path = os.path.relpath(current_dir, origen)

    if rel_path == '.':
        depth = 0
    else:
        depth = len(rel_path.split(os.sep))

    ignored = []

    for name in names:
        full_path = os.path.join(current_dir, name)

        # Ignorar carpetas con '__'
        if '__' in name:
            ignored.append(name)

        # Ignorar subcarpetas que superen la profundidad máxima
        elif os.path.isdir(full_path) and depth >= MAX_DEPTH:
            ignored.append(name)

    return ignored

shutil.copytree(
    origen,
    destino,
    ignore=ignore_deep_folders
)
