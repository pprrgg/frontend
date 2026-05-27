import os
import ast
import openpyxl

# Carpeta raíz donde buscar
ROOT_FOLDER = "/home/pk/Desktop/frontend/public/routers"


def extract_parametros(py_file):
    """Extrae la variable Parametros de un script Python"""
    with open(py_file, "r", encoding="utf-8") as f:
        source = f.read()

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return None

    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "ParametrosXdefecto":
                    try:
                        return ast.literal_eval(node.value)
                    except Exception:
                        return None
    return None


def create_excel(parsed_data, output_file):
    """Crea un Excel a partir de un diccionario como parsed_data"""
    wb = openpyxl.Workbook()
    default_sheet = wb.active
    wb.remove(default_sheet)

    for sheet_name, rows in parsed_data.items():
        # Nombre de hoja seguro (máx. 31 caracteres en Excel)
        safe_name = sheet_name[:31]
        ws = wb.create_sheet(title=safe_name)
        for row in rows:
            ws.append(row)

    wb.save(output_file)
    print(f"✅ Archivo '{output_file}' creado con éxito.")


def process_folder(root_folder):
    for dirpath, _, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.endswith(".py"):
                py_path = os.path.join(dirpath, filename)
                parsed_data = extract_parametros(py_path)

                if parsed_data:
                    excel_name = os.path.splitext(filename)[0] + ".xlsx"
                    excel_path = os.path.join(dirpath, excel_name)
                    create_excel(parsed_data, excel_path)


if __name__ == "__main__":
    process_folder(ROOT_FOLDER)
