#!/usr/bin/env python3

import os
import json
import shutil



# def obtener_contenido_jsx(carpeta, subcarpeta, nombre_archivo):
def obtener_contenido_jsx(NORMALIZED_GRUPO, NORMALIZED_SECTOR, nombre_archivo,NORMALIZED_API):

    return """
import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/firebaseConfig";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import AppBarComponent from "../../../NavigationBarDocumento";
import XLSXUploaderStoragePrecargaxDefectoHojaModal from "../../../XLSXUploaderStoragePrecargaxDefectoHojaModal";
import MapaModal from "../../../MapaModal";
import { Box, Backdrop, CircularProgress, Typography } from "@mui/material";
import config from "../../../configURL";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/3.11.174/pdf.worker.min.js`;

"""+f"""
const ENDPOINT = "{NORMALIZED_GRUPO}/{NORMALIZED_SECTOR}/{nombre_archivo}/{NORMALIZED_API}"
const HOJAEXCEL = "excel/{NORMALIZED_GRUPO}/{NORMALIZED_SECTOR}/{nombre_archivo}.xlsx"
"""+"""
const PDF_API_URL = `${config.API_URL}/${ENDPOINT}?timestamp=${new Date().getTime()}`;

const PDFRenderer = () => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [tempSheets, setTempSheets] = useState(null);
    const [open, setOpen] = useState(false);
    const [openx, setOpenx] = useState(false);

    const abrirModal = useCallback(() => setOpen(true), []);
    const cerrarModal = useCallback(() => setOpen(false), []);
    const abrirModalx = useCallback(() => setOpenx(true), []);
    const cerrarModalx = useCallback(() => setOpenx(false), []);

    const renderPdfFromUrl = useCallback(async () => {
        if (!tempSheets) return;
        setLoading(true);
        try {
            const response = await axios.post(PDF_API_URL, tempSheets, { responseType: "arraybuffer" });
            if (response.status !== 200) throw new Error("Error al obtener el PDF");

            const pdf = await pdfjsLib.getDocument({ data: response.data }).promise;
            if (pdf.numPages === 0) throw new Error("No se pudo cargar el PDF o no tiene páginas");

            const pages = await Promise.all(
                Array.from({ length: pdf.numPages }, async (_, i) => {
                    const page = await pdf.getPage(i + 1);
                    const viewport = page.getViewport({ scale: 2.5 });
                    const canvas = document.createElement("canvas");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
                    return canvas.toDataURL("image/png");
                })
            );

            setImages(pages);
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [tempSheets]);

    useEffect(() => {
        const loadDataFromSessionStorage = async () => {
            const storedData = sessionStorage.getItem("excelData");
            if (storedData) {
                const excelData = JSON.parse(storedData);
"""+f"""
                console.log('no recarga el excel si hay una hoja con el nombre')
                console.log(`{NORMALIZED_API}`)
                console.log(excelData)
                console.log('+++++==========================================================')
                if (excelData.{NORMALIZED_API})
"""+"""
                {                    setTempSheets(excelData);
                    return;
                }
            }

            try {
                const response = await fetch(`/${HOJAEXCEL}`);
                const data = await response.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });
                const sheetsData = workbook.SheetNames.reduce((acc, sheetName) => {
                    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                    acc[sheetName] = sheet.filter(row => row.some(cell => cell != null && cell !== ""));
                    return acc;
                }, {});

                sessionStorage.setItem("excelData", JSON.stringify(sheetsData));
                setTempSheets(sheetsData);
            } catch (err) {
                console.error("Error al cargar el archivo de la carpeta public", err);
            }
        };

        loadDataFromSessionStorage();
    }, []);

    useEffect(() => {
        if (tempSheets) renderPdfFromUrl();
    }, [tempSheets, renderPdfFromUrl]);

    const handleDownloadPdf = useCallback(async () => {
        setLoading(true);
        try {
            if (!tempSheets) throw new Error("No hay datos para descargar.");
            const response = await axios.post(PDF_API_URL, tempSheets, { responseType: "arraybuffer" });
            if (response.status !== 200) throw new Error("Error al obtener el PDF.");

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${ENDPOINT}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(`Error al descargar el PDF: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [tempSheets]);

    const handleRecalculate = () => {
        sessionStorage.setItem("modalOpen", "true");
        window.location.reload();
    };

    return (
        <div>
            <AppBarComponent
                filePath={HOJAEXCEL}
                abrirModal={abrirModal}
                abrirModalx={abrirModalx}
                handleRecalculate={handleRecalculate}
                handleDownloadPdf={handleDownloadPdf}
            />

            <Backdrop open={loading} style={{ zIndex: 1201, color: "#000" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CircularProgress color="inherit" sx={{ color: 'white' }} />
                    <Typography variant="h6" sx={{ color: 'white', marginTop: 2 }}>
                        Cargando...
                    </Typography>
                </div>
            </Backdrop>
            
            {error && <Typography align="center" color="error">{error}</Typography>}

            <Box display="flex" flexDirection="column" alignItems="flex-start">
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`PDF Page ${index + 1}`} style={{ width: "100%", borderRadius: "8px" }} />
                ))}
            </Box>

            <XLSXUploaderStoragePrecargaxDefectoHojaModal openx={openx} cerrarModalx={cerrarModalx} filePath={HOJAEXCEL}  handleRecalculate={handleRecalculate}/>

            <MapaModal open={open} cerrarModal={cerrarModal} />
        </div>
    );
};

export default PDFRenderer;


"""





def catalogojson2jsx():
    # Ruta al archivo JSON
    ruta_json = "../src/components/docs/Catalogo.json"

    # Leer los datos desde el JSON
    with open(ruta_json, "r", encoding="utf-8") as archivo:
        datos = json.load(archivo)

    # Ruta base donde se van a guardar los archivos JSX
    base_destino = "../src/components/docs"

    # Recolectar todas las rutas únicas a borrar
    rutas_para_borrar = set()
    for item in datos:
        grupo = item["grupo"]
        sector = item["sector"]
        ruta_relativa = os.path.join(grupo, sector)
        ruta_completa = os.path.join(base_destino, ruta_relativa)
        rutas_para_borrar.add(ruta_completa)

    # Borrar directorios existentes
    for ruta in rutas_para_borrar:
        if os.path.exists(ruta):
            shutil.rmtree(ruta)

    # Crear los archivos JSX
    for item in datos:
        grupo = item["grupo"]
        sector = item["sector"]
        cod = item["cod"]

        # Construir ruta
        ruta_directorio = os.path.join(base_destino, grupo, sector)
        ruta_archivo = os.path.join(ruta_directorio, f"{cod}.jsx")

        # Crear directorios (limpios)
        os.makedirs(ruta_directorio, exist_ok=True)

        ################################


        # Obtener el contenido a escribir en el archivo .jsx
        contenido = obtener_contenido_jsx(item["grupo"], item["sector"], item["cod"], item["co"].capitalize())
        ################################


        # Escribir archivo con contenido 'hola'
        with open(ruta_archivo, "w", encoding="utf-8") as f:
            f.write(contenido)

    print("Archivos creados correctamente.")



if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    catalogojson2jsx()
