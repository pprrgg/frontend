# import os
# import re
# import json

# os.chdir(os.path.dirname(os.path.abspath(__file__)))


# def parse_filename(filename):
#     # Quitar la extensión y guión bajo final
#     name = os.path.splitext(filename)[0].rstrip("_")

#     # Buscar el índice donde termina el "co": de inicio hasta la segunda mayúscula
#     mayus_indices = [i for i, c in enumerate(name) if c.isupper()]
#     if len(mayus_indices) < 2:
#         return None, None, None  # No hay suficientes mayúsculas para delimitar "co"

#     # Índice final del segundo grupo de mayúsculas (co)
#     second_upper_index = mayus_indices[1]

#     # Buscar hasta que termine el bloque de dígitos tras esa segunda mayúscula
#     i = second_upper_index + 1
#     while i < len(name) and (name[i].isdigit() or name[i].isupper()):
#         i += 1

#     co = name[:i]
#     cod = name
#     palabras = re.findall(r"[A-ZÁÉÍÓÚÑ][a-záéíóúñ0-9]*", cod)
#     codigo_legible = " ".join(palabras).upper()

#     return cod, codigo_legible, co.upper()


# def process_directory(base_dir):
#     resultado = []
#     for root, _, files in os.walk(base_dir):
#         for file in files:
#             if file.endswith((".pdf")):
#                 print(file)
#                 full_path = os.path.join(root, file)
#                 grupo = os.path.basename(os.path.dirname(root))
#                 sector = os.path.basename(root)

#                 cod, codigo, co = parse_filename(file)
#                 # if not cod:
#                 #     continue
#                 if not cod:
#                     continue  # Salta archivos sin cod válido

#                 resultado.append(
#                     {
#                         "categoria": "libre",
#                         "sector": sector,
#                         "grupo": grupo,
#                         "cod": cod,
#                     }
#                 )
#     return resultado


# # Directorio raíz a analizar
# base_directory = "../public/routers"  # Cambia esto si es necesario

# # Procesar y guardar
# data = process_directory(base_directory)

# with open("../src/components/Catalogo.json", "w", encoding="utf-8") as f:
#     json.dump(data, f, ensure_ascii=False, indent=4)

# print("JSON generado correctamente.")

import shutil
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Definir rutas

origen = '../public/routers/Catalogo.json'
destino = '../src/components/Catalogo.json'

# Crear la carpeta destino si no existe
os.makedirs(os.path.dirname(destino), exist_ok=True)

# Mover el archivo
try:
    shutil.move(origen, destino)
    # print(f"Archivo movido a: {destino}")
except FileNotFoundError:
    print("El archivo de origen no existe.")
except Exception as e:
    print(f"Error al mover el archivo: {e}")
