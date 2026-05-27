import os
from pdf2image import convert_from_path
from PIL import Image

# Cambiar al directorio del script para rutas relativas coherentes
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Carpeta base (ajustada a tu estructura)
base_dir = "../public/routers"

# Márgenes de recorte (en píxeles)
MARGIN_LEFT = 200
MARGIN_TOP = 250
MARGIN_RIGHT = 200
MARGIN_BOTTOM = 1400

def recortar_imagen(imagen, m_left, m_top, m_right, m_bottom):
    """Recorta la imagen quitando los márgenes especificados."""
    width, height = imagen.size
    
    # Definir los puntos de corte: (izq, superior, derecho, inferior)
    # El método crop de PIL usa: x0, y0, x1, y1
    left = m_left
    top = m_top
    right = width - m_right
    bottom = height - m_bottom

    # Validación mínima para evitar errores si el recorte es mayor que la imagen
    if right <= left or bottom <= top:
        print("⚠️ Advertencia: Los márgenes de recorte son mayores que la imagen. Saltando recorte.")
        return imagen

    return imagen.crop((left, top, right, bottom))

def generar_imagen(pdf_path):
    try:
        # Nota: first_page=2 indica que empezamos en la página 2.
        # Si el PDF solo tiene 1 página, esto fallará. 
        # Si quieres la SEGUNDA página, mantén 2. Si quieres la PRIMERA, usa 1.
        pages = convert_from_path(
            pdf_path, 
            first_page=2, 
            last_page=2, 
            dpi=200,
            thread_count=2 # Optimización de velocidad
        )

        if not pages:
            print(f"⚠️ El PDF '{pdf_path}' no tiene la página 2 o está vacío.")
            return

        page = pages[0]

        # Recortar imagen
        page_recortada = recortar_imagen(page, MARGIN_LEFT, MARGIN_TOP, MARGIN_RIGHT, MARGIN_BOTTOM)

        # Generar ruta de salida: mismo nombre pero .png
        output_path = os.path.splitext(pdf_path)[0] + ".png"
        
        # Guardar la imagen optimizada
        page_recortada.save(output_path, "PNG", optimize=True)
        print(f"✅ Imagen creada: {os.path.basename(output_path)}")

    except Exception as e:
        print(f"❌ Error procesando {os.path.basename(pdf_path)}: {e}")

def recorrer_carpeta(carpeta):
    if not os.path.exists(carpeta):
        print(f"❌ La carpeta base '{carpeta}' no existe.")
        return

    print(f"🚀 Iniciando procesamiento en: {os.path.abspath(carpeta)}")
    
    for root, _, files in os.walk(carpeta):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_path = os.path.join(root, file)
                generar_imagen(pdf_path)

if __name__ == "__main__":
    recorrer_carpeta(base_dir)
