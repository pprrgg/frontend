import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Chip, Backdrop, Tooltip, Fab } from "@mui/material";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// --- INTEGRACIÓN REACT-PDF ---
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;
let globalStatus = "local";

// --- CONFIGURACIÓN DE RECORTE (AJUSTA ESTOS % ) ---
// Usamos porcentajes para que el recorte sea uniforme en todas las páginas
const CROP_TOP_PERCENT = "10%";    // Cuánto recortar arriba
const CROP_BOTTOM_PERCENT = "10%"; // Cuánto recortar abajo

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

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

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
      } else {
        throw new Error("Offline");
      }
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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  return (
    <Box sx={{
      width: "100%", height: "85vh", position: "relative",
      bgcolor: "#ffffff",
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } }
    }}>

      {/* Chip Status */}
      <Box sx={{ position: "Fixed", top: 80, right: "40%", zIndex: 10 }}>
        <Chip
          label={status === "ready" ? "Actualizado" : status === "updating" ? "Actualizando..." : "Sin conexión"}
          color={status === "ready" ? "success" : status === "updating" ? "warning" : "error"}
          icon={status === "ready" ? <CloudDoneIcon /> : status === "updating" ? <SyncIcon sx={{ animation: 'spin 2s linear infinite' }} /> : <StorageIcon />}
          size="small"
          sx={{ height: '20px', fontSize: '10px', fontWeight: 'bold' }}
        />
      </Box>

      {/* Botón PDF Rojo Flotante - Versión Mini */}
      {status === "ready" && (
        <Tooltip title="Descargar PDF" placement="left">
          <Fab
            onClick={handleDownload}
            sx={{
              position: "fixed",
              top: 70,
              left: '70%',
              zIndex: 9999,
              // Tamaño reducido personalizado
              width: 32,
              height: 32,
              minHeight: 32,
              bgcolor: '#d32f2f',
              color: 'white',
              boxShadow: 2,
              '&:hover': {
                bgcolor: '#b71c1c',
                transform: 'scale(1.1)'
              }
            }}
          >
            <PictureAsPdfIcon sx={{ fontSize: 16 }} />
          </Fab>
        </Tooltip>
      )}
      <Backdrop open={loading} sx={{ zIndex: 5, color: "#fff", position: 'absolute' }}>
        <CircularProgress size={30} color="inherit" />
      </Backdrop>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress sx={{ mt: 10 }} />}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Box
              key={`page_${index + 1}`}
              sx={{
                mb: -10, // Margen negativo para compensar el espacio que deja el recorte
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                // TÉCNICA DE RECORTE DEFINITIVA:
                // inset(Arriba Derecha Abajo Izquierda)
                clipPath: `inset(${CROP_TOP_PERCENT} 0 ${CROP_BOTTOM_PERCENT} 0)`,
                // Desplazamos el contenido hacia arriba para que no haya huecos blancos
                transform: `translateY(-${CROP_TOP_PERCENT})`,
              }}
            >
              <Page
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={Math.min(window.innerWidth * 0.9, 850)}
              />
            </Box>
          ))}
        </Document>
      </Box>
    </Box>
  );
});


export default PdfViewerContent;