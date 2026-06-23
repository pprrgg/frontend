import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Backdrop, Typography, Tooltip, Fab } from "@mui/material";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UpdateIcon from '@mui/icons-material/Update';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;

// Porcentajes de recorte
const CROP = { top: 8, bottom: 7, left: 9, right: 4 };

// Componente interno para gestionar las dimensiones reales de cada página individualmente
const CroppedPage = ({ pageNumber, containerWidth, currentFullUrl }) => {
  const [pageSize, setPageSize] = useState(null);

  const handlePageLoadSuccess = (page) => {
    // page.view contiene [x, y, width, height] original del PDF
    const [, , originalWidth, originalHeight] = page.view;
    setPageSize({ width: originalWidth, height: originalHeight });
  };

  // Ancho útil visible (en porcentaje)
  const visibleWidthPct = 100 - CROP.left - CROP.right;
  // Multiplicador para escalar el PDF original y que la zona visible ocupe el 100% del contenedor
  const scaleFactor = 100 / visibleWidthPct;
  const pdfFullWidth = containerWidth * scaleFactor;

  // Calculamos la altura total proporcional basándonos en la relación de aspecto real del PDF
  const aspectRatio = pageSize ? pageSize.height / pageSize.width : 1.4142; // Fallback a A4 (1:√2)
  const pdfFullHeight = pdfFullWidth * aspectRatio;

  // Altura final visible aplicando los crops superior e inferior
  const visibleHeightPct = 100 - CROP.top - CROP.bottom;
  const finalVisibleHeight = (pdfFullHeight * visibleHeightPct) / 100;

  return (
    <Box
      sx={{
        position: 'relative',
        width: "100%",
        height: pageSize ? `${finalVisibleHeight}px` : "auto",
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: `-${(CROP.top / 100) * pdfFullHeight}px`,
          left: `-${(CROP.left / 100) * pdfFullWidth}px`,
          width: `${pdfFullWidth}px`
        }}
      >
        <Page
          pageNumber={pageNumber}
          width={pdfFullWidth}
          onLoadSuccess={handlePageLoadSuccess}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Box>
      {/* Marcador de posición mientras carga el tamaño real para evitar saltos bruscos */}
      {!pageSize && <Box sx={{ height: "1000px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
    </Box>
  );
};

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
  const [showScrollTop, setShowScrollTop] = useState(false); // Nuevo estado para mostrar/ocultar flecha

  // --- REFS ---
  const scrollContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const containerRef = useRef(null);
  const isRestoringRef = useRef(false);

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

      if (globalCachedBlob) URL.revokeObjectURL(globalCachedBlob);

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

  // --- 2. DETECCIÓN DE CAMBIOS ---
  useEffect(() => {
    const checkChanges = () => {
      const currentData = sessionStorage.getItem("excelData");
      if (currentData !== globalLastData) {
        setHasPendingChanges(true);
      } else {
        setHasPendingChanges(false);
      }
    };

    window.addEventListener("sessionStorageUpdate", checkChanges);
    window.addEventListener("focus", checkChanges);
    window.addEventListener('storage', checkChanges);

    const interval = setInterval(checkChanges, 2000);
    checkChanges();

    return () => {
      window.removeEventListener("sessionStorageUpdate", checkChanges);
      window.removeEventListener("focus", checkChanges);
      window.removeEventListener('storage', checkChanges);
      clearInterval(interval);
    };
  }, [pdfUrl]);

  // --- 3. CAMBIO DE RUTA ---
  useEffect(() => {
    const sessionData = sessionStorage.getItem("excelData");

    if (globalLastUrl !== currentFullUrl) {
      if (globalCachedBlob) {
        URL.revokeObjectURL(globalCachedBlob);
        globalCachedBlob = null;
      }

      globalLastUrl = currentFullUrl;
      globalLastData = sessionData;

      setPdfUrl(localPath);
      setHasPendingChanges(false);
      setIsOffline(false);
      setNumPages(null);
      setShowScrollTop(false); // Resetear estado de flecha al cambiar de ruta

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [currentFullUrl, localPath]);

  // --- 4. FUNCIONALIDADES AUXILIARES ---
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollThreshold = 300; // Mostrar flecha después de 300px de scroll

    // Guardar posición
    if (!numPages || isRestoringRef.current || isFetchingRef.current) return;
    if (scrollTop > 10) localStorage.setItem(storageKey, scrollTop.toString());

    // Mostrar/ocultar flecha según posición del scroll
    setShowScrollTop(scrollTop > scrollThreshold);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
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
      if (containerRef.current) {
        // Obtenemos el ancho real del contenedor donde se renderizan las páginas
        setContainerWidth(Math.min(containerRef.current.offsetWidth, 900));
      }
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
    <Box ref={containerRef} sx={{ width: "100%", height: "85vh", position: "relative", bgcolor: "#ffffff", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <style>{`
        @keyframes pulse-update {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>

      <Backdrop open={isApiLoading} sx={{ position: 'absolute', zIndex: 2000, color: 'primary.main', backgroundColor: 'rgba(255, 255, 255, 0.6)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="button" sx={{ bgcolor: 'white', px: 2, py: 0.5, borderRadius: 2, color: 'primary.main', fontWeight: 'bold' }}>
          Actualizando ...
        </Typography>
      </Backdrop>

      <Box sx={{ position: 'absolute', bottom: 111, right: "calc(50% - 480px)", zIndex: 1500, display: 'flex', flexDirection: 'column', gap: 2, '@media (max-width: 1000px)': { right: 24 } }}>
        {hasPendingChanges && (
          <Tooltip title="Sincronizar cambios recientes" placement="left">
            <Fab color="primary" onClick={fetchApiUpdate} sx={{ animation: 'pulse-update 2s infinite' }}>
              <UpdateIcon />
            </Fab>
          </Tooltip>
        )}
        <Tooltip title="Descargar en PDF" placement="left">
          <Fab color="error" onClick={handleDownload} disabled={isApiLoading}>
            <PictureAsPdfIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Flecha para volver al inicio - Centrada horizontalmente */}
      {showScrollTop && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 111,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            animation: showScrollTop ? 'fadeInUp 0.3s ease-out' : 'fadeOutDown 0.3s ease-out'
          }}
        >
          <Tooltip title="Volver al inicio" placement="top">
            <Fab
              onClick={scrollToTop}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.5)', // Negro semitransparente
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.4)', // Más opaco al hacer hover
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              <ArrowUpwardIcon />
            </Fab>
          </Tooltip>
        </Box>
      )}

      {isOffline && (
        <Box sx={{ position: "absolute", top: 16, right: "calc(50% - 450px)", zIndex: 1500, display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(211, 47, 47, 0.9)", color: "white", px: 2, py: 0.5, borderRadius: 5 }}>
          <WifiOffIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>MODO LOCAL</Typography>
        </Box>
      )}

      <Box ref={scrollContainerRef} onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: "100%", maxWidth: "900px", bgcolor: "#ffffff" }}>
<Document
  key={currentFullUrl}
  file={pdfUrl}
  onLoadSuccess={({ numPages: total }) => { setNumPages(total); restoreScrollPosition(); }}
>
  {/* 1. Si numPages es mayor a 2, creamos un array con (numPages - 2) elementos.
     2. Usamos el índice para empezar a renderizar desde la página 3 (index + 3).
  */}
  {numPages > 2 && Array.from(new Array(numPages - 2), (el, index) => (
    <CroppedPage 
      key={`${currentFullUrl}_page_${index + 2}`}
      pageNumber={index + 2} // Sumamos 3 porque 'index' empieza en 0
      containerWidth={containerWidth}
      currentFullUrl={currentFullUrl}
    />
  ))}
</Document>
          <Box sx={{ height: '80px', width: '100%', bgcolor: '#ffffff' }} />
        </Box>
      </Box>
    </Box>
  );
});

export default PdfViewerContent;