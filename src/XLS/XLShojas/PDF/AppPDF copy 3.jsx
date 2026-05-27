import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Backdrop, Typography } from "@mui/material";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let globalLastData = null;
let globalLastUrl = null;
let globalCachedBlob = null;

const CROP_VAL = 10;
const CROP_TOP_PERCENT = `${CROP_VAL}%`;    
const CROP_BOTTOM_PERCENT = `${CROP_VAL}%`; 

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
  
  // Ref para el PDF anterior (evita el salto visual)
  const prevPdfUrlRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const containerRef = useRef(null);
  const isRestoringRef = useRef(false);

  const saveScrollPosition = (e) => {
    if (!numPages || isRestoringRef.current || isFetchingRef.current) return;
    const scrollTop = e.target.scrollTop;
    if (scrollTop > 10) localStorage.setItem(storageKey, scrollTop.toString());
  };

  const restoreScrollPosition = () => {
    const savedScroll = localStorage.getItem(storageKey);
    if (savedScroll && scrollContainerRef.current) {
      isRestoringRef.current = true;
      // Usamos un pequeño delay para asegurar que el DOM es estable
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
          setTimeout(() => { isRestoringRef.current = false; }, 300);
        }
      }, 50); // Delay mínimo para evitar el amago visual
    }
  };

  const fetchApiUpdate = async () => {
    if (isFetchingRef.current) return;
    const currentData = sessionStorage.getItem("excelData");
    if (currentData === globalLastData) return;

    isFetchingRef.current = true;
    setIsApiLoading(true);
    // Guardamos el PDF actual como "previo" antes de actualizar
    prevPdfUrlRef.current = pdfUrl;

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
      prevPdfUrlRef.current = null;
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
      if (containerRef.current) setContainerWidth(Math.min(containerRef.current.offsetWidth, 900));
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
        <Box 
          sx={{ 
            position: "absolute", top: 10, right: 10, zIndex: 12, 
            display: 'flex', alignItems: 'center', gap: 0.5,
            bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f',
            px: 1, py: 0.5, borderRadius: 1, border: '1px solid #d32f2f'
          }}
        >
          <WifiOffIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>SIN CONEXIÓN</Typography>
        </Box>
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
          // CRÍTICO: Evita saltos de scroll al actualizar contenido
          overflowAnchor: "none" 
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => { 
            setNumPages(numPages); 
            restoreScrollPosition(); 
          }}
          // CRÍTICO: "loading" en null evita que el componente limpie la pantalla
          // y mantenga el contenido previo hasta que el nuevo esté listo.
          loading={null} 
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Box
              key={`page_${index + 1}`}
              sx={{
                position: 'relative',
                display: 'block',
                lineHeight: 0,
                marginBottom: `calc(-${CROP_TOP_PERCENT} - ${CROP_BOTTOM_PERCENT})`,
                clipPath: `inset(${CROP_TOP_PERCENT} 0 ${CROP_BOTTOM_PERCENT} 0)`,
                transform: `translateY(-${CROP_TOP_PERCENT})`,
              }}
            >
              <Page pageNumber={index + 1} renderTextLayer={true} renderAnnotationLayer={true} width={containerWidth} />
            </Box>
          ))}
        </Document>
        <Box sx={{ height: '200px', width: '100%' }} />
      </Box>
    </Box>
  );
});

export default PdfViewerContent;