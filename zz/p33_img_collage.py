#!/home/pk/Desktop/frontend/venv/bin/python3

import os
import random
from PIL import Image, ImageOps

def crear_collage_grid(carpeta_raiz, salida, ancho_final=4096, alto_final=5000):
    # 1. Buscar imágenes .png recursivamente
    rutas = [
        os.path.join(r, f)
        for r, d, archivos in os.walk(carpeta_raiz)
        for f in archivos
        if f.lower().endswith(".png") and "ahorro" not in r.lower()
    ]

    if not rutas:
        print("No se encontraron imágenes PNG.")
        return

    random.shuffle(rutas)

    # 2. Crear lienzo blanco
    collage = Image.new('RGBA', (ancho_final, alto_final), (255, 255, 255, 255))

    # 3. CONFIGURACIÓN GRID
    cols = 4
    rows = 2

    cell_w = ancho_final // cols
    cell_h = alto_final // rows

    # 🔧 Menos padding → imágenes más grandes
    padding = int(min(cell_w, cell_h) * 0.05)

    # 🔧 Factor para agrandar imágenes
    scale_extra = 1.25

    # 🔧 Orden aleatorio de capas (más natural)
    indices = list(range(len(rutas)))
    random.shuffle(indices)

    for i in indices:
        ruta = rutas[i]

        try:
            with Image.open(ruta).convert('RGBA') as img:

                # Limitar a tamaño base de celda
                max_w = cell_w - padding
                max_h = cell_h - padding

                # 🔥 Aumentar tamaño real
                ratio = min(max_w / img.width, max_h / img.height) * scale_extra

                new_w = int(img.width * ratio)
                new_h = int(img.height * ratio)

                img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

                # Borde blanco tipo foto
                borde = int(new_w * 0.02)
                img_foto = ImageOps.expand(img_resized, border=borde, fill='white')

                # Rotación suave
                angulo = random.uniform(-10, 10)
                img_rotada = img_foto.rotate(
                    angulo,
                    expand=True,
                    resample=Image.Resampling.BICUBIC
                )

                # Posición en grid (según índice original)
                row = i // cols
                col = i % cols

                if row >= rows:
                    continue

                base_x = col * cell_w
                base_y = row * cell_h

                # 🔥 Más desplazamiento → solapamiento
                max_jitter_x = int(cell_w * 0.35)
                max_jitter_y = int(cell_h * 0.35)

                offset_x = random.randint(-max_jitter_x, max_jitter_x)
                offset_y = random.randint(-max_jitter_y, max_jitter_y)

                x = base_x + offset_x + (cell_w - img_rotada.width) // 2
                y = base_y + offset_y + (cell_h - img_rotada.height) // 2

                collage.alpha_composite(img_rotada, (x, y))

        except Exception as e:
            print(f"Error procesando {ruta}: {e}")

    # 4. Guardar imagen final
    collage.convert('RGB').save(salida, quality=95)
    print(f"Collage tipo grid creado: {salida}")


# --- EJECUCIÓN ---
crear_collage_grid(
    '/home/pk/Desktop/frontend/public/routers/',
    '/home/pk/Desktop/frontend/public/img/1.png',
    ancho_final=3096,
    alto_final=2000
)