import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Backdrop, Typography, Tooltip, Fab } from "@mui/material";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UpdateIcon from '@mui/icons-material/Update';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;

const CROP = { top: 5, bottom: 5, left: 12, right: 10 };

export const PdfViewerContent = forwardRef(({ sector: propSector, grupo: propGrupo, cod: propCod }, ref) => {
  const params = useParams();
  const s = propSector || params.sector || "A0_Sistema_FV";
  const g = propGrupo || params.grupo || "A61_Conectado_a_red";
  const c = propCod || params.cod || "FV01_Autoconsumo_sin_excedentes";

  const currentFullUrl = `${s}/${g}/${c}`;
  const localPath = `/routers/${s}/${g}/${c}.pdf`;
  const storageKey = `pdf_scroll_pos_${currentFullUrl}`;

  // --- ESTADOS ---
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(() => (globalLastUrl === currentFullUrl && globalCachedBlob) ? globalCachedBlob : localPath);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // --- REFS ---
  const scrollContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const containerRef = useRef(null);
  const isRestoringRef = useRef(false);

  // --- 1. FUNCIÓN DE ACTUALIZACIÓN (Definida primero) ---
// --- 1. FUNCIÓN DE ACTUALIZACIÓN (API FETCH) ---
  const fetchApiUpdate = useCallback(async () => {
    if (isFetchingRef.current) return;
    const currentData = sessionStorage.getItem("excelData");
    
    isFetchingRef.current = true;
    setIsApiLoading(true);

    try {
      const API_BASE = (import.meta.env.MODE === "development"
        ? "http://localhost:8888"
        : "https://doctec.duckdns.org/fast").replace(/\/$/, "");

      const response = await fetch(`${API_BASE}/${s}/${g}/${c}/f?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: currentData || "{}"
      });

      if (!response.ok) throw new Error();

      const rawBlob = await response.blob();
      const newUrl = URL.createObjectURL(rawBlob);

      // Limpieza de memoria
      if (globalCachedBlob) URL.revokeObjectURL(globalCachedBlob);
      
      // ACTUALIZACIÓN DE FOTO DE REFERENCIA
      // Solo aquí actualizamos globalLastData para que el botón desaparezca
      globalCachedBlob = newUrl;
      globalLastData = currentData; 
      globalLastUrl = currentFullUrl;

      setPdfUrl(newUrl);
      setIsOffline(false);
      setHasPendingChanges(false); 
      
      console.log("PDF Actualizado y sincronizado con excelData");
    } catch (err) {
      console.error("Error en fetchApiUpdate:", err);
      setIsOffline(true);
    } finally {
      setIsApiLoading(false);
      isFetchingRef.current = false;
    }
  }, [s, g, c, currentFullUrl]);

  // --- 2. DETECCIÓN DE CAMBIOS (EL CORAZÓN DEL COMPONENTE) ---
  useEffect(() => {
    const checkChanges = () => {
      const currentData = sessionStorage.getItem("excelData");
      
      // Si los datos actuales de sesión son distintos a la última vez
      // que el PDF fue generado exitosamente, mostramos el botón.
      if (currentData !== globalLastData) {
        setHasPendingChanges(true);
      } else {
        setHasPendingChanges(false);
      }
    };

    // Escuchamos el evento disparado por el guardado de polígonos
    window.addEventListener("sessionStorageUpdate", checkChanges);
    // Escuchamos si el usuario vuelve a la pestaña
    window.addEventListener("focus", checkChanges);
    // Escuchamos cambios de otras pestañas (storage nativo)
    window.addEventListener('storage', checkChanges);

    // Comprobación de seguridad cada 2 segundos por si fallan los eventos
    const interval = setInterval(checkChanges, 2000);

    // Ejecución inmediata al montar/cambiar PDF
    checkChanges();

    return () => {
      window.removeEventListener("sessionStorageUpdate", checkChanges);
      window.removeEventListener("focus", checkChanges);
      window.removeEventListener('storage', checkChanges);
      clearInterval(interval);
    };
  }, [pdfUrl]); // Se reinicia cuando el PDF cambia para validar contra el nuevo globalLastData

  // --- 3. CAMBIO DE RUTA (LIMPIEZA Y RESET) ---
  useEffect(() => {
    const sessionData = sessionStorage.getItem("excelData");

    if (globalLastUrl !== currentFullUrl) {
      if (globalCachedBlob) {
        URL.revokeObjectURL(globalCachedBlob);
        globalCachedBlob = null;
      }

      // Al cambiar de ruta, establecemos los datos actuales como "base"
      globalLastUrl = currentFullUrl;
      globalLastData = sessionData; 

      setPdfUrl(localPath);
      setHasPendingChanges(false);
      setIsOffline(false);
      setNumPages(null);
      
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [currentFullUrl, localPath]);
  // --- 4. FUNCIONALIDADES AUXILIARES ---
  const saveScrollPosition = (e) => {
    if (!numPages || isRestoringRef.current || isFetchingRef.current) return;
    const scrollTop = e.target.scrollTop;
    if (scrollTop > 10) localStorage.setItem(storageKey, scrollTop.toString());
  };

  const restoreScrollPosition = useCallback(() => {
    const savedScroll = localStorage.getItem(storageKey);
    if (savedScroll && scrollContainerRef.current) {
      isRestoringRef.current = true;
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
          setTimeout(() => { isRestoringRef.current = false; }, 300);
        }
      }, 50);
    }
  }, [storageKey]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(Math.min(containerRef.current.offsetWidth, 900));
    };
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updateWidth();
    return () => resizeObserver.disconnect();
  }, []);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${c}_actualizado.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useImperativeHandle(ref, () => ({ refresh: () => fetchApiUpdate() }));

  return (
    <Box ref={containerRef} sx={{ width: "100%", height: "85vh", position: "relative", bgcolor: "#f5f5f5", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <style>{`
        @keyframes pulse-update {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
        }
      `}</style>

      <Backdrop open={isApiLoading} sx={{ position: 'absolute', zIndex: 2000, color: 'primary.main', backgroundColor: 'rgba(255, 255, 255, 0.6)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="button" sx={{ bgcolor: 'white', px: 2, py: 0.5, borderRadius: 2, boxShadow: 2, color: 'primary.main', fontWeight: 'bold' }}>
          Actualizando ...
        </Typography>
      </Backdrop>

      <Box sx={{ position: 'absolute', bottom: 24, right: "calc(50% - 480px)", zIndex: 1500, display: 'flex', flexDirection: 'column', gap: 2, '@media (max-width: 1000px)': { right: 24 } }}>
        {hasPendingChanges && (
          <Tooltip title="Sincronizar cambios recientes" placement="left">
            <Fab color="primary" onClick={fetchApiUpdate} sx={{ animation: 'pulse-update 2s infinite' }}>
              <UpdateIcon />
            </Fab>
          </Tooltip>
        )}
        <Tooltip title="Descargar" placement="left">
          <Fab color="error" onClick={handleDownload} disabled={isApiLoading}>
            <PictureAsPdfIcon />
          </Fab>
        </Tooltip>
      </Box>

      {isOffline && (
        <Box sx={{ position: "absolute", top: 16, right: "calc(50% - 450px)", zIndex: 1500, display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(211, 47, 47, 0.9)", color: "white", px: 2, py: 0.5, borderRadius: 5 }}>
          <WifiOffIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>MODO LOCAL</Typography>
        </Box>
      )}

      <Box ref={scrollContainerRef} onScroll={saveScrollPosition} sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: "900px", bgcolor: "#ffffff", boxShadow: "0 0 20px rgba(0,0,0,0.05)" }}>
          <Document
            key={currentFullUrl}
            file={pdfUrl}
            onLoadSuccess={({ numPages: total }) => { setNumPages(total); restoreScrollPosition(); }}
          >
            {Array.from(new Array(numPages), (el, index) => {
              const visibleWidthPct = 100 - CROP.left - CROP.right;
              const scaleFactor = 100 / visibleWidthPct;
              const effectiveWidth = Math.min(containerWidth, 900);
              const pdfFullWidth = effectiveWidth * scaleFactor;
              const pdfFullHeight = pdfFullWidth * 1.414;
              const finalVisibleHeight = (pdfFullHeight * (100 - CROP.top - CROP.bottom)) / 100;

              return (
                <Box key={`${currentFullUrl}_page_${index}`} sx={{ position: 'relative', width: "100%", height: `${finalVisibleHeight}px`, overflow: 'hidden', bgcolor: '#ffffff' }}>
                  <Box sx={{ position: 'absolute', top: `-${(CROP.top / 100) * pdfFullHeight}px`, left: `-${(CROP.left / 100) * pdfFullWidth}px`, width: `${pdfFullWidth}px` }}>
                    <Page pageNumber={index + 1} width={pdfFullWidth} renderTextLayer={true} renderAnnotationLayer={true} />
                  </Box>
                </Box>
              );
            })}
          </Document>
          <Box sx={{ height: '80px', width: '100%', bgcolor: '#ffffff' }} />
        </Box>
      </Box>
    </Box>
  );
});

export default PdfViewerContent;