

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
import { PDFDocument, rgb, degrees } from 'pdf-lib'; // <--- IMPORTAR degrees TAMBIÉN

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      setShowScrollTop(false);

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [currentFullUrl, localPath]);

  // --- 4. FUNCIONALIDADES AUXILIARES ---
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollThreshold = 300;

    if (!numPages || isRestoringRef.current || isFetchingRef.current) return;
    if (scrollTop > 10) localStorage.setItem(storageKey, scrollTop.toString());

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
        setContainerWidth(Math.min(containerRef.current.offsetWidth, 900));
      }
    };
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updateWidth();
    return () => resizeObserver.disconnect();
  }, []);

  // --- 5. FUNCIÓN DE DESCARGA CON MARCA DE AGUA (CORREGIDA) ---
// --- 5. FUNCIÓN DE DESCARGA CON MARCA DE AGUA PROFESIONAL (SIN PRECIO) ---
const handleDownload = async () => {
  if (!pdfUrl || isDownloading) return;
  
  setIsDownloading(true);
  
  try {
    // 1. Cargar el PDF
    let pdfBlob;
    if (pdfUrl.startsWith('blob:')) {
      const response = await fetch(pdfUrl);
      pdfBlob = await response.blob();
    } else {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('No se pudo cargar el PDF');
      pdfBlob = await response.blob();
    }

    // 2. Cargar el PDF con pdf-lib
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // 3. Agregar marca de agua profesional (SIN PRECIO)
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      
      // === MARCA PRINCIPAL: "MUESTRA TÉCNICA" ===
      page.drawText('Borrador', {
        x: width / 2 - 260,
        y: height / 2 + 200,
        size: 150,
        color: rgb(0.55, 0.15, 0.15),
        opacity: 0.10,
        rotate: degrees(-28),
      });

      // === SUBTEXTO: Explicación profesional ===
      page.drawText('Documento para previsualización', {
        x: width / 2 - 115,
        y: height / 2,
        size: 16,
        color: rgb(0.3, 0.3, 0.3),
        opacity: 0.3,
        rotate: degrees(-28),
      });

      // === LLAMADA A LA ACCIÓN ELEGANTE: Solo contacto ===
      page.drawText('Para versión revisada y firmada, o documento a medida:', {
        x: width / 2 - 115,
        y: height / 2 - 60,
        size: 14,
        color: rgb(0.2, 0.2, 0.2),
        opacity: 0.35,
        rotate: degrees(-28),
      });

      // === CONTACTO PROFESIONAL ===
      page.drawText('contacto@proman.blog', {
        x: width / 2 - 100,
        y: height / 2 - 90,
        size: 16,
        color: rgb(0.1, 0.4, 0.7), // Azul profesional
        opacity: 0.4,
        rotate: degrees(-28),
      });

      // === MARCA EN ESQUINA INFERIOR DERECHA (sutil) ===
      page.drawText('Versión: Muestra ', {
        x: width - 230,
        y: 40,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
        opacity: 0.2,
        rotate: degrees(0),
      });

      // === MARCA EN ESQUINA SUPERIOR IZQUIERDA ===
      page.drawText('https://proman.blog/', {
        x: 40,
        y: height - 45,
        size: 13,
        color: rgb(0.4, 0.4, 0.4),
        opacity: 0.2,
        rotate: degrees(0),
      });

      // === SEGUNDA MARCA DIAGONAL (más pequeña, patrón) ===
      // page.drawText('MUESTRA', {
      //   x: width * 0.7,
      //   y: height * 0.3,
      //   size: 30,
      //   color: rgb(0.2, 0.2, 0.2),
      //   opacity: 0.08,
      //   rotate: degrees(-28),
      // });
    });

    // 4. Guardar y descargar
    const pdfBytes = await pdfDoc.save();
    const newBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(newBlob);
    link.download = `${c}_MUESTRA_TECNICA.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    // 5. Mostrar modal de contacto (opcional, ver abajo)

  } catch (error) {
    console.error('Error al agregar marca de agua:', error);
    // Fallback
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${c}_actualizado.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      console.error('Error en descarga de respaldo:', fallbackError);
      alert('No se pudo descargar el PDF. Intenta de nuevo.');
    }
  } finally {
    setIsDownloading(false);
  }
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
        <Tooltip title={isDownloading ? "Procesando..." : "Descargar PDF con marca de agua"} placement="left">
          <Fab 
            color="error" 
            onClick={handleDownload} 
            disabled={isApiLoading || isDownloading}
          >
            {isDownloading ? <CircularProgress size={24} color="inherit" /> : <PictureAsPdfIcon />}
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
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
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
            {numPages > 2 && Array.from(new Array(numPages - 2), (el, index) => (
              <CroppedPage 
                key={`${currentFullUrl}_page_${index + 2}`}
                pageNumber={index + 2}
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

