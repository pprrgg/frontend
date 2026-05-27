import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Chip, Backdrop } from "@mui/material";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';

// --- INTEGRACIÓN REACT-PDF ---
import { Document, Page, pdfjs } from 'react-pdf';

// Estilos necesarios para evitar que el PDF se vea mal o sin texto
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Usamos el CDN sincronizado con la versión de la librería para evitar el error de carga
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;
let globalStatus = "local"; 

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

  // ESTADOS
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(() => {
    return (globalLastUrl === currentFullUrl && globalCachedBlob) ? globalCachedBlob : localPath;
  });
  const [status, setStatus] = useState(globalLastUrl === currentFullUrl ? globalStatus : "local");

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const fetchApiDocument = async (isUpdate = false) => {
    const currentData = sessionStorage.getItem("excelData");
    
    if (!isUpdate && globalLastUrl === currentFullUrl && globalLastData === currentData && globalCachedBlob) {
      return; 
    }

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
        
        // CORRECCIÓN CLAVE: Forzar el tipo MIME a application/pdf
        const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
        
        if (globalCachedBlob && globalCachedBlob.startsWith("blob:")) {
          URL.revokeObjectURL(globalCachedBlob);
        }
        
        globalCachedBlob = URL.createObjectURL(pdfBlob);
        globalStatus = "ready";
        setPdfUrl(globalCachedBlob);
        setStatus("ready");
      } else {
        throw new Error("Respuesta API no satisfactoria");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Fallo fetch API, usando local:", err);
        globalStatus = "local";
        setStatus("local");
        setPdfUrl(localPath);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
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
      if (currentData !== globalLastData && !isFetchingRef.current) {
        fetchApiDocument(true); 
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentFullUrl]);

  useImperativeHandle(ref, () => ({ refresh: () => fetchApiDocument(true) }));

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const getChipProps = () => {
    switch (status) {
      case "ready": return { label: " Actualizado", color: "success", icon: <CloudDoneIcon sx={{ fontSize: '14px !important' }} /> };
      case "updating": return { label: " Actualizando...", color: "warning", icon: <SyncIcon sx={{ fontSize: '14px !important', animation: 'spin 2s linear infinite' }} /> };
      default: return { label: "Sin conexión", color: "error", icon: <StorageIcon sx={{ fontSize: '14px !important' }} /> };
    }
  };

  return (
    <Box sx={{ 
      width: "100%", height: "85vh", position: "relative", bgcolor: "#323639",
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } }
    }}>
      
      <Box sx={{ position: "absolute", top: 8, right: "40%", zIndex: 10 }}>
        <Chip 
          {...getChipProps()}
          size="small"
          variant="filled"
          sx={{ height: '20px', fontSize: '10px', fontWeight: 'bold', opacity: 0.9, boxShadow: 2 }}
        />
      </Box>

      <Backdrop open={loading} sx={{ zIndex: 5, color: "#fff", position: 'absolute' }}>
        <CircularProgress size={30} color="inherit" />
      </Backdrop>
      
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", justifyContent: "center", bgcolor: "#525659" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error("Error de PDF.js:", error)}
          loading={<CircularProgress color="inherit" size={40} sx={{ mt: 10 }} />}
          error={
            <Box sx={{ color: '#ffcdd2', mt: 10, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.5)', p: 3, borderRadius: 2 }}>
              <strong>Error al cargar el PDF</strong>
              <br />
              <small>Origen: {pdfUrl.startsWith('blob') ? 'Respuesta API' : 'Archivo Local'}</small>
              <br />
              <small>Verifica la consola (F12) para más detalles.</small>
            </Box>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Box key={`page_${index + 1}`} sx={{ mb: 2, boxShadow: '0px 4px 15px rgba(0,0,0,0.6)' }}>
              <Page 
                pageNumber={index + 1} 
                renderTextLayer={true} 
                renderAnnotationLayer={true}
                width={Math.min(window.innerWidth * 0.9, 900)}
              />
            </Box>
          ))}
        </Document>
      </Box>
    </Box>
  );
});

export default PdfViewerContent;