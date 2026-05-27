import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Backdrop, Typography, Tooltip, Fab } from "@mui/material";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;

// --- CONFIGURACIÓN DE RECORTE INDEPENDIENTE (%) ---
const CROP = {
  top: 7,
  bottom: 5,
  left: 16,
  right: 8 // Por ejemplo, un recorte mayor a la derecha
};

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

  const scrollContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const containerRef = useRef(null);
  const isRestoringRef = useRef(false);

  // --- LÓGICA DE DESCARGA ---
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${c}_actualizado.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const fetchApiUpdate = async () => {
    if (isFetchingRef.current) return;
    const currentData = sessionStorage.getItem("excelData");
    if (currentData === globalLastData) return;

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

      if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 10) {
        localStorage.setItem(storageKey, scrollContainerRef.current.scrollTop.toString());
      }

      if (globalCachedBlob) URL.revokeObjectURL(globalCachedBlob);
      globalCachedBlob = newUrl;
      globalLastData = currentData;
      globalLastUrl = currentFullUrl;

      setPdfUrl(newUrl);
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
    } finally {
      setIsApiLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (globalLastUrl !== currentFullUrl) {
      globalLastUrl = currentFullUrl;
      globalLastData = sessionStorage.getItem("excelData");
      if (globalCachedBlob) URL.revokeObjectURL(globalCachedBlob);
      globalCachedBlob = null;
      setIsOffline(false);
      localStorage.removeItem(storageKey);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      setPdfUrl(localPath);
      setNumPages(null);
    }
  }, [currentFullUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentData = sessionStorage.getItem("excelData");
      if (currentData !== globalLastData) fetchApiUpdate();
    }, 400);
    return () => clearInterval(interval);
  }, [currentFullUrl]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Ajustamos el ancho base considerando el recorte lateral para que el PDF no se vea pequeño
        setContainerWidth(Math.min(containerRef.current.offsetWidth, 900));
      }
    };
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updateWidth();
    return () => resizeObserver.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({ refresh: () => fetchApiUpdate() }));

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%", maxWidth: "1100px", height: "85vh", margin: "0 auto",
        position: "relative", bgcolor: "#ffffff", display: 'flex',
        flexDirection: 'column', overflow: 'hidden'
      }}
    >
      {isOffline && (
        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 12, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #d32f2f' }}>
          <WifiOffIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>SIN CONEXIÓN</Typography>
        </Box>
      )}

      {pdfUrl && pdfUrl.startsWith('blob:') && (
        <Tooltip title="Descargar versión actualizada" placement="left">
          <Fab
            onClick={handleDownload}
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 12,
              width: 40,
              height: 40,
              bgcolor: '#d32f2f',
              color: 'white',
              '&:hover': { bgcolor: '#b71c1c' }
            }}
          >
            <PictureAsPdfIcon />
          </Fab>
        </Tooltip>
      )}

      <Backdrop
        open={isApiLoading}
        sx={{
          zIndex: 11, color: "#fff", position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.15)', transition: 'all 0.3s ease'
        }}
      >
        <CircularProgress size={40} thickness={4} />
      </Backdrop>

      <Box
        ref={scrollContainerRef}
        onScroll={saveScrollPosition}
        sx={{
          flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
          alignItems: "center", bgcolor: "#ffffff",
          opacity: isApiLoading ? 0.4 : 1,
          filter: isApiLoading ? 'grayscale(0.5)' : 'none',
          transition: 'opacity 0.3s ease, filter 0.3s ease',
          overflowAnchor: "none"
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            restoreScrollPosition();
          }}
          loading={null}
        >

          {Array.from(new Array(numPages), (el, index) => {
            // Calculamos cuánto ancho real "sobrevive"
            const visibleWidthPercent = 100 - CROP.left - CROP.right;
            const visibleHeightPercent = 100 - CROP.top - CROP.bottom;

            return (
              <Box
                key={`page_${index + 1}`}
                sx={{
                  position: 'relative',
                  // El contenedor mide exactamente lo que queremos que se vea
                  width: `${containerWidth * (visibleWidthPercent / 100)}px`,
                  height: `${(containerWidth * 1.41) * (visibleHeightPercent / 100)}px`, // 1.41 es el ratio A4 aprox
                  overflow: 'hidden', // Esto hace el recorte real
                  marginBottom: '20px',
                  border: '0px solid #eee',
                  display: 'block'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    // Desplazamos el PDF hacia la izquierda y arriba para ocultar los márgenes
                    top: `-${CROP.top}%`,
                    left: `-${CROP.left}%`,
                    // El ancho debe ser el original para que no se deforme
                    width: `${containerWidth}px`,
                    lineHeight: 0,
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={containerWidth}
                  />
                </Box>
              </Box>
            );
          })}
        </Document>
        <Box sx={{ height: '200px', width: '100%' }} />
      </Box>
    </Box>
  );
});

export default PdfViewerContent;