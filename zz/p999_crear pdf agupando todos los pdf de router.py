import os
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

# ---------------- CONFIG ----------------
main_folder = "/home/pk/Desktop/frontend/public/routers"
output_pdf = os.path.join(main_folder, "PDF_final_triple_nivel.pdf")
offset_y = 14.17  # 0.5 cm
DOCUMENT_TITLE = "DOCUMENTO FINAL CON SECCIONES"
date_str = datetime.now().strftime("%Y-%m-%d")

# Portada
report_title = "Informe Técnico de Datos"
report_subtitle = "Análisis y consolidación de documentos"
author = "Equipo de Análisis"
department = "Departamento de Tecnología"
version = "Versión 1.0"

# ---------------- FUNCIONES AUXILIARES ----------------

def add_footer_overlay(page, page_num):
    """Agrega un pie de página gris con título, fecha y número."""
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=A4)
    width, height = A4

    rect_height = 25
    y_rect = 30 - offset_y

    # Fondo blanco para tapar pie anterior
    can.setFillColorRGB(1, 1, 1)
    can.rect(0, 0, width, y_rect + rect_height, fill=1, stroke=0)

    # Línea gris
    can.setStrokeColorRGB(0.8, 0.8, 0.8)
    can.setLineWidth(0.5)
    can.line(40, y_rect + rect_height - 5, width - 40, y_rect + rect_height - 5)

    # Texto gris
    can.setFont("Helvetica", 9)
    can.setFillColorRGB(0.4, 0.4, 0.4)
    can.drawString(40, 30 - offset_y, f"{DOCUMENT_TITLE}  |  {date_str}")
    can.drawRightString(width - 40, 30 - offset_y, str(page_num))

    can.save()
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    page.merge_page(overlay_pdf.pages[0])
    return page


def create_centered_page(title, font_size=20, max_width_ratio=0.8):
    """Crea una página con texto centrado vertical y horizontalmente (con wrap)."""
    packet = BytesIO()
    width, height = A4
    can = canvas.Canvas(packet, pagesize=A4)

    max_width = width * max_width_ratio
    words = title.split()
    lines, current_line = [], ""
    for w in words:
        test_line = (current_line + " " + w).strip()
        if can.stringWidth(test_line, "Helvetica-Bold", font_size) > max_width:
            lines.append(current_line)
            current_line = w
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)

    total_height = len(lines) * (font_size + 8)
    start_y = (height - total_height) / 2
    can.setFont("Helvetica-Bold", font_size)
    for i, line in enumerate(lines):
        y = start_y + (len(lines) - i - 1) * (font_size + 8)
        can.drawCentredString(width / 2, y, line)

    can.showPage()
    can.save()
    packet.seek(0)
    return PdfReader(packet).pages[0]

# ---------------- ESTRUCTURA DE CARPETAS ----------------
structure = {}
for chapter_folder in sorted(os.listdir(main_folder)):
    chapter_path = os.path.join(main_folder, chapter_folder)
    if not os.path.isdir(chapter_path):
        continue
    structure[chapter_folder] = {}
    for section_folder in sorted(os.listdir(chapter_path)):
        section_path = os.path.join(chapter_path, section_folder)
        if not os.path.isdir(section_path):
            continue
        pdfs = [os.path.join(section_path, f)
                for f in sorted(os.listdir(section_path)) if f.lower().endswith(".pdf")]
        if pdfs:
            structure[chapter_folder][section_folder] = pdfs

# ---------------- PORTADA ----------------
packet = BytesIO()
can = canvas.Canvas(packet, pagesize=A4)
width, height = A4

# Colores suaves y márgenes
can.setFillColorRGB(0, 0, 0)

# Distribución vertical centrada
y_center = height / 2
spacing = 40  # separación entre líneas

# Título principal
can.setFont("Helvetica-Bold", 30)
can.drawCentredString(width / 2, y_center + 3 * spacing, report_title)

# Subtítulo
can.setFont("Helvetica", 18)
can.drawCentredString(width / 2, y_center + spacing, report_subtitle)

# Línea decorativa
can.setStrokeColorRGB(0.6, 0.6, 0.6)
can.setLineWidth(1)
can.line(width * 0.25, y_center, width * 0.75, y_center)

# Información inferior (autor, departamento, versión, fecha)
can.setFont("Helvetica", 14)
can.drawCentredString(width / 2, y_center - 2 * spacing, f"Autor: {author}")
can.drawCentredString(width / 2, y_center - 3 * spacing, f"Departamento: {department}")
can.drawCentredString(width / 2, y_center - 4 * spacing, f"Versión: {version}")
can.drawCentredString(width / 2, y_center - 5 * spacing, f"Fecha: {date_str}")

# Línea inferior gris clara con título del estudio
can.setStrokeColorRGB(0.8, 0.8, 0.8)
# can.line(40, 60, width - 40, 60)
# can.setFont("Helvetica-Oblique", 10)
# can.setFillColorRGB(0.5, 0.5, 0.5)
# can.drawCentredString(width / 2, 45, DOCUMENT_TITLE)

can.showPage()
can.save()
packet.seek(0)
cover_pdf = PdfReader(packet)


# ---------------- ESTILOS PARA ÍNDICE ----------------
styles = getSampleStyleSheet()
styleN = styles['Normal']
styleChapterBold = ParagraphStyle('ChapterBold', parent=styleN, fontName='Helvetica-Bold', fontSize=14, leftIndent=0, spaceAfter=4)
styleSectionBold = ParagraphStyle('SectionBold', parent=styleN, fontName='Helvetica-Bold', fontSize=12, leftIndent=10, spaceAfter=2)
styleSubsection = ParagraphStyle('Subsection', parent=styleN, fontSize=12, leftIndent=20, spaceAfter=1)

# ---------------- PROCESAR PDFs ----------------
index_data = []
all_pages = []
page_counter = 2  # Portada = 1

for chapter, sections in structure.items():
    chapter_name_clean = chapter.replace("_", " ")
    index_data.append((chapter_name_clean, None))

    page = create_centered_page(f"Capítulo: {chapter_name_clean}", 22)
    page = add_footer_overlay(page, page_counter)
    all_pages.append(page)
    page_counter += 1

    for section, pdf_list in sections.items():
        section_name_clean = section.replace("_", " ")
        index_data.append((section_name_clean, page_counter))

        page = create_centered_page(f"Sección: {section_name_clean}", 18)
        page = add_footer_overlay(page, page_counter)
        all_pages.append(page)
        page_counter += 1

        for pdf_path in pdf_list:
            subsec_name_clean = os.path.basename(pdf_path).replace(".pdf", "").replace("_", " ")
            index_data.append((f"  {subsec_name_clean}", page_counter))
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                page = add_footer_overlay(page, page_counter)
                all_pages.append(page)
                page_counter += 1

# ---------------- CREAR ÍNDICE CON PLATYPUS (MULTIPÁGINA) ----------------
packet = BytesIO()
doc = SimpleDocTemplate(packet, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
elements = []
elements.append(Paragraph("ÍNDICE DE DOCUMENTOS", styles['Title']))
elements.append(Spacer(1, 20))

table_data = [["Capítulo/Subsección", "Página"]]
for name, page_no in index_data:
    if page_no is None:
        p = Paragraph(name, styleChapterBold)
        page_no_str = ""
    elif not name.startswith("  "):
        p = Paragraph(name, styleSectionBold)
        page_no_str = str(page_no)
    else:
        p = Paragraph(name, styleSubsection)
        page_no_str = str(page_no)
    table_data.append([p, page_no_str])

usable_width = A4[0] - doc.leftMargin - doc.rightMargin
col_widths = [usable_width * 0.85, usable_width * 0.15]

table = Table(table_data, colWidths=col_widths, hAlign='LEFT', repeatRows=1)
table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.grey),
    ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
    ('VALIGN',(0,0),(-1,-1),'TOP'),
    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.whitesmoke),
    ('BOX', (0,0), (-1,-1), 0.25, colors.whitesmoke),
    ('FONTSIZE', (0,0), (-1,-1), 12),
    ('LEFTPADDING', (0,0), (-1,-1), 5),
    ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ('ALIGN', (1,1), (1,-1), 'RIGHT'),
]))
elements.append(table)
doc.build(elements)
packet.seek(0)
index_pdf = PdfReader(packet)

# ---------------- CREAR PDF FINAL ----------------
final_pdf = PdfWriter()

# Portada sin pie de página
final_pdf.add_page(cover_pdf.pages[0])

page_idx = 2
# Índice sin pie de página
for p in index_pdf.pages:
    final_pdf.add_page(p)
    page_idx += 1

# Contenido con pie de página
for page in all_pages:
    final_pdf.add_page(page)


# ---------------- GUARDAR ----------------
with open(output_pdf, "wb") as f:
    final_pdf.write(f)

print(f"✅ PDF final con índice multipágina y pie de página creado: {output_pdf}")
