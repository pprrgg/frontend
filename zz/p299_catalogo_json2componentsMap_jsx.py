#!/usr/bin/env python3

import json
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Ruta del catálogo y salida
catalogo_path = "../src/components/Catalogo.json"
output_path = '../src/components/componentsMap.jsx'

# Cargar el catálogo
with open(catalogo_path, 'r', encoding='utf-8') as f:
    catalogo = json.load(f)

lines = []
map_entries = []

for item in catalogo:
    cod = item['cod']
    grupo = item['grupo']
    sector = item['sector']
    
    # Construcción del path relativo
    import_path = f'./docs/{grupo}/{sector}/{cod}.jsx'
    
    # Línea de importación
    import_line = f"import {cod} from '{import_path}';"
    lines.append(import_line)
    
    # Entrada del objeto
    map_entries.append(f'  {cod},')

# Construir el archivo final
output = '\n'.join(lines)
output += '\n\nconst componentsMap = {\n' + '\n'.join(map_entries) + '\n};\n\nexport default componentsMap;\n'

# Crear directorio si no existe
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Guardar el archivo
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"✅ componentsMap.js generado con {len(map_entries)} entradas.")
