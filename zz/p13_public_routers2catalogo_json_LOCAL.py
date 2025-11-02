import os
import re
import json
import ast

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def parse_filename(filename):
    # Nombre completo sin extensión
    cod = os.path.splitext(filename)[0]

    # Copia recortada para analizar mayúsculas y co
    name_recortado = cod.rstrip("_")

    mayus_indices = [i for i, c in enumerate(name_recortado) if c.isupper()]
    if len(mayus_indices) < 2:
        return cod, cod.upper(), None  # Siempre devolver cod

    second_upper_index = mayus_indices[1]
    i = second_upper_index + 1
    while i < len(name_recortado) and (name_recortado[i].isdigit() or name_recortado[i].isupper()):
        i += 1

    co = name_recortado[:i]
    palabras = re.findall(r"[A-ZÁÉÍÓÚÑ][a-záéíóúñ0-9]*", cod)
    codigo_legible = " ".join(palabras).upper()

    return cod, codigo_legible, co.upper()



def process_directory(base_dir):
    resultado = []
    for root, _, files in os.walk(base_dir):
        for file in files:

            if not file.endswith(".py"):
                continue
            if file == "__init__.py":
                continue
            if "copy" in file:
                continue

            full_path = os.path.join(root, file)
            grupo = os.path.basename(os.path.dirname(root))
            sector = os.path.basename(root)

            cod, codigo, co = parse_filename(file)
            if not cod:
                continue

            # ⚠️ Excluir si alguno contiene "__"
            if "__" in cod or "__" in grupo or "__" in sector:
                continue



            resultado.append(
                {
                    "sector": sector,
                    "grupo": grupo,
                    "cod": cod,
                    "descripcion": 'nuestras vidas son los rios...',
                }
            )
    return resultado



# Directorio raíz a analizar
base_directory = "../public/routers"

# Procesar y guardar
data = process_directory(base_directory)

with open("../src/components/Catalogo.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("JSON generado correctamente.")
