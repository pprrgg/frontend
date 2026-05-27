import os
from pdf2image import convert_from_path
from PIL import Image

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(88888888888888888888888888888888888888)
# Carpeta base
base_dir = "../public/routers"

# Márgenes de recorte (en píxeles)
MARGIN_LEFT = 200
MARGIN_TOP = 250
MARGIN_RIGHT = 200
MARGIN_BOTTOM = 1400

def recortar_imagen(imagen, left, top, right, bottom):
    """Recorta la imagen quitando los márgenes especificados."""
    width, height = imagen.size
    return imagen.crop((
        left,                    # desde la izquierda
        top,                     # desde arriba
        width - right,           # hasta la derecha
        height - bottom          # hasta abajo
    ))

def generar_imagen(pdf_path):
    try:
        # Convertir la primera página con buena resolución (dpi=200)
        pages = convert_from_path(pdf_path, first_page=2, last_page=2, dpi=200)

        if not pages:
            print(f"⚠️ El PDF '{pdf_path}' no tiene páginas.")
            return

        page = pages[0]

        # Recortar imagen
        page_recortada = recortar_imagen(page, MARGIN_LEFT, MARGIN_TOP, MARGIN_RIGHT, MARGIN_BOTTOM)

        # Guardar con el mismo nombre que el PDF pero extensión .png
        output_path = os.path.splitext(pdf_path)[0] + ".png"
        page_recortada.save(output_path, "PNG")
        print(f"✅ Imagen creada: {output_path}")

    except Exception as e:
        print(f"❌ Error procesando {pdf_path}: {e}")


def recorrer_carpeta(carpeta):
    for root, _, files in os.walk(carpeta):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_path = os.path.join(root, file)
                generar_imagen(pdf_path)


if __name__ == "__main__":
    recorrer_carpeta(base_dir)
