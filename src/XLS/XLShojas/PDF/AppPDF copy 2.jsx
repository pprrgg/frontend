import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Chip, Backdrop, Tooltip, Fab } from "@mui/material";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
// --- INTEGRACIÓN REACT-PDF ---
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;
let globalStatus = "local";

// --- CONFIGURACIÓN DE RECORTE (EN PORCENTAJE) ---
const CROP_VAL = 10; // Si es 10%, recortamos 10 arriba y 10 abajo
const CROP_TOP_PERCENT = `${CROP_VAL}%`;    
const CROP_BOTTOM_PERCENT = `${CROP_VAL}%`; 

export const PdfViewerContent = forwardRef(({ sector: propSector, grupo: propGrupo, cod: propCod }, ref) => {
  const params = useParams();

  const s = propSector || params.sector || "A0_Sistema_FV";
  const g = propGrupo || params.grupo || "A61_Conectado_a_red";
  const c = propCod || params.cod || "FV01_Autoconsumo_sin_excedentes";

  const currentFullUrl = `${s}/${g}/${c}`;
  const API_BASE = (import.meta.env.MODE === "development"
    ? "http://localhost:8888"
    : "https://doctec.duckdns.org/fast").replace(/\/$/, "");

  const remotePath = `${API_BASE}/${s}/${g}/${c}/f`;
  const localPath = `/routers/${s}/${g}/${c}.pdf`;

  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(() => (globalLastUrl === currentFullUrl && globalCachedBlob) ? globalCachedBlob : localPath);
  const [status, setStatus] = useState(globalLastUrl === currentFullUrl ? globalStatus : "local");
  
  const [containerWidth, setContainerWidth] = useState(800);
  
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);

  // Observer para el ancho responsivo
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth;
        setContainerWidth(Math.min(availableWidth, 900));
      }
    };
    const resizeObserver = new ResizeObserver(() => updateWidth());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updateWidth();
    return () => resizeObserver.disconnect();
  }, []);

  const fetchApiDocument = async (isUpdate = false) => {
    const currentData = sessionStorage.getItem("excelData");
    if (!isUpdate && globalLastUrl === currentFullUrl && globalLastData === currentData && globalCachedBlob) return;
    if (isFetchingRef.current) return;

    globalLastData = currentData;
    globalLastUrl = currentFullUrl;
    isFetchingRef.current = true;
    setStatus("updating");
    globalStatus = "updating";
    if (isUpdate) setLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const excelParams = currentData ? JSON.parse(currentData) : {};
      const response = await fetch(`${remotePath}?timestamp=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(excelParams),
        signal: abortControllerRef.current.signal
      });

      if (response.ok) {
        const rawBlob = await response.blob();
        const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
        if (globalCachedBlob && globalCachedBlob.startsWith("blob:")) URL.revokeObjectURL(globalCachedBlob);
        globalCachedBlob = URL.createObjectURL(pdfBlob);
        globalStatus = "ready";
        setPdfUrl(globalCachedBlob);
        setStatus("ready");
      } else { throw new Error("Offline"); }
    } catch (err) {
      if (err.name !== 'AbortError') {
        globalStatus = "local";
        setStatus("local");
        setPdfUrl(localPath);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${c}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (globalLastUrl !== currentFullUrl) {
      if (globalCachedBlob) URL.revokeObjectURL(globalCachedBlob);
      globalCachedBlob = null;
      globalLastData = null;
      globalStatus = "local";
      setPdfUrl(localPath);
      setStatus("local");
      setNumPages(null);
    }
    fetchApiDocument(false);
    return () => abortControllerRef.current?.abort();
  }, [currentFullUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentData = sessionStorage.getItem("excelData");
      if (currentData !== globalLastData && !isFetchingRef.current) fetchApiDocument(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [currentFullUrl]);

  useImperativeHandle(ref, () => ({ refresh: () => fetchApiDocument(true) }));

  return (
    <Box 
      ref={containerRef}
      sx={{
        width: "100%", 
        maxWidth: "1100px", 
        height: "85vh", 
        margin: "0 auto",   
        position: "relative",
        bgcolor: "#ffffff", // Fondo blanco total
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } }
      }}
    >
      {/* Status Chip */}
      <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <Chip
          label={status === "ready" ? "Actualizado" : status === "updating" ? "Actualizando..." : "Básico"}
          color={status === "ready" ? "success" : status === "updating" ? "warning" : "default"}
          icon={status === "ready" ? <CloudDoneIcon /> : status === "updating" ? <SyncIcon sx={{ animation: 'spin 2s linear infinite' }} /> : <StorageIcon />}
          size="small"
          sx={{ height: '20px', fontSize: '10px', fontWeight: 'bold', boxShadow: 1 }}
        />
      </Box>

      {/* Download Button */}
      {status === "ready" && (
        <Tooltip title="Descargar PDF" placement="right">
          <Fab
            onClick={handleDownload}
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 10,
              width: 32,
              height: 32,
              minHeight: 32,
              bgcolor: '#d32f2f',
              color: 'white',
              '&:hover': { bgcolor: '#b71c1c' }
            }}
          >
            <FileDownloadIcon sx={{ fontSize: 16 }} />
          </Fab>
        </Tooltip>
      )}

      <Backdrop open={loading} sx={{ zIndex: 5, color: "#fff", position: 'absolute' }}>
        <CircularProgress size={30} color="inherit" />
      </Backdrop>

      <Box sx={{ 
        flex: 1, 
        overflowY: "auto", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        bgcolor: "#ffffff" // Fondo blanco para el área de lectura
      }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => { setNumPages(numPages); setLoading(false); }}
          loading={<CircularProgress sx={{ mt: 10 }} />}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Box
              key={`page_${index + 1}`}
              sx={{
                position: 'relative',
                display: 'block', // Crucial para eliminar espacios inline
                lineHeight: 0,    // Elimina espacio vertical extra del texto
                // El margen negativo debe ser igual a la suma del recorte superior e inferior
                // para que la siguiente página suba y "tape" el hueco
                marginBottom: `calc(-${CROP_TOP_PERCENT} - ${CROP_BOTTOM_PERCENT})`,
                clipPath: `inset(${CROP_TOP_PERCENT} 0 ${CROP_BOTTOM_PERCENT} 0)`,
                transform: `translateY(-${CROP_TOP_PERCENT})`,
              }}
            >
              <Page
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={containerWidth}
              />
            </Box>
          ))}
        </Document>
        {/* Espaciador final para compensar el último margen negativo */}
        <Box sx={{ height: '100px', width: '100%' }} />
      </Box>
    </Box>
  );
});

export default PdfViewerContent;