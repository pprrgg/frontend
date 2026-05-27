import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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

  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(() => (globalLastUrl === currentFullUrl && globalCachedBlob) ? globalCachedBlob : localPath);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  
  // El botón nace siempre apagado
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const scrollContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const containerRef = useRef(null);
  const isRestoringRef = useRef(false);

  // --- LÓGICA DE SINCRONIZACIÓN ---
  const fetchApiUpdate = async () => {
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

      if (globalCachedBlob) URL.revokeObjectURL(globalCachedBlob);
      globalCachedBlob = newUrl;
      
      // Actualizamos la "foto" de referencia con lo que acabamos de procesar
      globalLastData = currentData;
      globalLastUrl = currentFullUrl;

      setPdfUrl(newUrl);
      setIsOffline(false);
      setHasPendingChanges(false); 
    } catch (err) {
      setIsOffline(true);
    } finally {
      setIsApiLoading(false);
      isFetchingRef.current = false;
    }
  };

// 1. EFECTO DE MONTAJE Y CAMBIO DE RUTA: 
// Captura el estado actual de los datos y lo marca como "Punto Cero"
// ... (resto de imports y variables globales igual)

  // 1. EFECTO DE MONTAJE Y CAMBIO DE RUTA
  useEffect(() => {
    const sessionData = sessionStorage.getItem("excelData");

    // Si la ruta ha cambiado
    if (globalLastUrl !== currentFullUrl) {
      // 1. Limpiamos cualquier URL de objeto previa para evitar fugas de memoria
      if (globalCachedBlob) {
        URL.revokeObjectURL(globalCachedBlob);
        globalCachedBlob = null;
      }

      // 2. Sincronizamos las referencias globales al estado inicial de esta nueva ruta
      globalLastUrl = currentFullUrl;
      globalLastData = sessionData; 

      // 3. Forzamos el PDF local de la nueva ruta inmediatamente
      setPdfUrl(localPath);
      
      // 4. Reseteamos estados visuales
      setHasPendingChanges(false);
      setIsOffline(false);
      setNumPages(null);
      
      // 5. Scroll al inicio
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [currentFullUrl, localPath]); // Añadimos localPath como dependencia

// ... (resto del componente igual)
  // 2. INTERVALO DE DETECCIÓN: 
  // Solo compara contra globalLastData. Si son iguales, no hace nada.
  useEffect(() => {
    const checkChanges = () => {
      const currentData = sessionStorage.getItem("excelData");
      
      // IMPORTANTE: Solo activamos si hay una diferencia real con la última foto guardada
      if (currentData !== globalLastData) {
        setHasPendingChanges(true);
      } else {
        setHasPendingChanges(false);
      }
    };

    const interval = setInterval(checkChanges, 800);
    window.addEventListener('storage', checkChanges); // Detecta cambios manuales o de otros scripts
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkChanges);
    };
  }, [pdfUrl]); // Se reinicia si cambia el PDF para asegurar coherencia

  // --- RESTO DE FUNCIONALIDADES (SCROLL, RESIZE, ETC) ---
  const saveScrollPosition = (e) => {
    if (!numPages || isRestoringRef.current || isFetchingRef.current) return;
    const scrollTop = e.target.scrollTop;
    if (scrollTop > 10) localStorage.setItem(storageKey, scrollTop.toString());
  };

  const restoreScrollPosition = () => {
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
  };

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
            onLoadSuccess={({ numPages }) => { setNumPages(numPages); restoreScrollPosition(); }}
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