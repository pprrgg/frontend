import os
import json
os.chdir(os.path.dirname(os.path.abspath(__file__)))

def acumular_servicios(base_dir):
    servicios_acumulados = []

    # Iterar sobre las carpetas de primer nivel
    for carpeta in os.listdir(base_dir):
        carpeta_path = os.path.join(base_dir, carpeta)
        if os.path.isdir(carpeta_path):
            servicio_file = os.path.join(carpeta_path, "servicios.json")
            if os.path.exists(servicio_file):
                try:
                    with open(servicio_file, "r", encoding="utf-8") as sf:
                        data = json.load(sf)

                        # Agregar la clave 'directorio' con el nombre de la carpeta
                        if isinstance(data, list):
                            for item in data:
                                if isinstance(item, dict):
                                    item["group"] = carpeta
                            servicios_acumulados.extend(data)
                        else:
                            if isinstance(data, dict):
                                data["group"] = carpeta
                            servicios_acumulados.append(data)
                except Exception as e:
                    print(f"Error leyendo {servicio_file}: {e}")

    return servicios_acumulados


if __name__ == "__main__":
    # Directorio raíz a analizar
    base_directory = "../public/routers"  # Ajusta si es necesario

    # Procesar y acumular servicios.json
    servicios = acumular_servicios(base_directory)

    # Guardar en pp.json
    salida = "../src/components/cardsData.json"
    os.makedirs(os.path.dirname(salida), exist_ok=True)
    with open(salida, "w", encoding="utf-8") as f:
        json.dump(servicios, f, ensure_ascii=False, indent=4)

    print(f"Archivo pp.json generado con {len(servicios)} entradas.")
