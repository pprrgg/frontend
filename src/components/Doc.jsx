import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebaseConfig";
import axios from "axios";
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
  Drawer,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from "@mui/material";
import config from "./configURL";
import XLSXUploaderStoragePrecargaxDefectoHojaModal from "./XLSXUploaderStoragePrecargaxDefectoHojaModal";
import TuneIcon from "@mui/icons-material/Tune";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/web/pdf_viewer.css";
import Home from "./Home.jsx"; // Ajusta la ruta según la ubicación real de tu Home.jsx

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

const fuchsiaColor = "#D100D1";

const Doc = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiDisponible, setApiDisponible] = useState(null);
  const [textoActual, setTextoActual] = useState(
    "Conectando al servidor, por favor espere..."
  );
  const [navValue, setNavValue] = useState(0);
  const pdfContainerRef = useRef(null);
  const renderingRef = useRef(false);
  const pdfIntentado = useRef(false);

  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const isMobile = true;

  const ep = JSON.parse(sessionStorage.getItem("selectedFicha") || "null");
  if (!ep) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography color="error">
          No se encontró ninguna ficha seleccionada. Regrese al catálogo y elija
          un documento.
        </Typography>
      </Box>
    );
  }

  const ENDPOINT = `${ep.grupo}/${ep.sector}/${ep.cod}/f`;
  const mensajes = [
    "Conectando al servidor, por favor espere...",
    "Calculando, por favor espere...",
    "Aplicando formato y realizando validaciones...",
    "Cargando las primeras configuraciones...",
    "Inicializando el proceso de simulación...",
    "Verificando los datos iniciales...",
    "Generando el documento solicitado...",
    "Aplicando formato y realizando validaciones...",
    "Finalizando tareas pendientes y liberando recursos...",
  ];

  // 🔹 animación de textos mientras carga
  useEffect(() => {
    if (!loading) return;
    let index = 0;
    let timeoutId;

    const cambiarTexto = () => {
      index = (index + 1) % mensajes.length;
      setTextoActual(mensajes[index]);
      timeoutId = setTimeout(cambiarTexto, Math.floor(Math.random() * 3000) + 10);
    };

    cambiarTexto();
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // 🔹 función para obtener PDF desde API o fallback local
  const fetchPdfData = useCallback(async () => {
    setLoading(true); // ✅ Mostrar spinner desde que inicia la petición
    setError(null);

    const parametros = sessionStorage.getItem("excelData")
      ? JSON.parse(sessionStorage.getItem("excelData"))
      : {};

    const PDF_API_URL = `${config.API_URL}/${ENDPOINT}?timestamp=${new Date().getTime()}`;

    try {
      const response = await axios.post(PDF_API_URL, parametros, {
        responseType: "arraybuffer",
        timeout: 10000,
      });

      if (response.status === 200 && response.data) {
        setApiDisponible(true);
        return new Uint8Array(response.data);
      } else {
        throw new Error("Error al obtener PDF desde API");
      }
    } catch (err) {
      console.warn("API no disponible, cargando PDF local...", err);
      setApiDisponible(false);

      try {
        const pdfPath = `/routers/${ep.grupo}/${ep.sector}/${ep.cod}.pdf`;
        const fallbackResponse = await fetch(pdfPath);
        if (!fallbackResponse.ok) throw new Error("No se encontró el PDF local.");

        const pdfData = new Uint8Array(await fallbackResponse.arrayBuffer());
        return pdfData;
      } catch (fallbackErr) {
        console.error("No se pudo cargar PDF local:", fallbackErr);
        setError("No se pudo cargar PDF local.");
        throw fallbackErr;
      }
    }
  }, [ENDPOINT, ep]);

  // 🔹 renderizado del PDF
  const renderPdfWithPdfJs = useCallback(async (pdfData) => {
    renderingRef.current = true;
    setError(null);

    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const container = pdfContainerRef.current;
      if (!container) return;
      container.innerHTML = "";

      const renderScaleFactor = 2;
      const marginLeft = 70,
        marginRight = 70,
        marginTop = 50,
        marginBottom = 50;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = viewport.width * renderScaleFactor;
        tempCanvas.height = viewport.height * renderScaleFactor;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.setTransform(renderScaleFactor, 0, 0, renderScaleFactor, 0, 0);

        await page.render({ canvasContext: tempCtx, viewport }).promise;

        const croppedWidth = viewport.width - marginLeft - marginRight;
        const croppedHeight = viewport.height - marginTop - marginBottom;

        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = croppedWidth * renderScaleFactor;
        finalCanvas.height = croppedHeight * renderScaleFactor;
        const finalCtx = finalCanvas.getContext("2d");

        finalCtx.drawImage(
          tempCanvas,
          marginLeft * renderScaleFactor,
          marginTop * renderScaleFactor,
          croppedWidth * renderScaleFactor,
          croppedHeight * renderScaleFactor,
          0,
          0,
          croppedWidth * renderScaleFactor,
          croppedHeight * renderScaleFactor
        );

        finalCanvas.style.width = "100%";
        finalCanvas.style.height = "auto";
        finalCanvas.style.display = "block";

        const card = document.createElement("div");
        card.style.boxShadow = "0 4px 4px rgba(0,0,0,0.1)";
        card.style.background = "white";
        card.appendChild(finalCanvas);

        container.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      setError(`Error al renderizar PDF: ${err.message}`);
    } finally {
      setLoading(false); // ✅ Ocultar spinner solo cuando termina todo
      renderingRef.current = false;
    }
  }, []);

  // 🔹 inicializa renderizado
  useEffect(() => {
    if (pdfIntentado.current) return;
    pdfIntentado.current = true;

    fetchPdfData()
      .then((pdfData) => renderPdfWithPdfJs(pdfData))
      .catch((err) => {
        console.error("Fallo al cargar PDF:", err);
        setError("No se pudo cargar el PDF.");
        setLoading(false);
      });
  }, [fetchPdfData, renderPdfWithPdfJs]);

  // 🔹 descarga del PDF
  const handleDownload = async () => {
    try {
      setLoading(true);
      const pdfData = await fetchPdfData();
      const blob = new Blob([pdfData], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${ep.cod}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    abrirModalx: () => setDrawerOpen(true),
    handleDownload,
  }));

  const handleNavigationChange = (event, newValue) => {
    setNavValue(newValue);
    if (newValue === 0) {
      setDrawerOpen(true);
    } else if (newValue === 1) {
      handleDownload();
    } else if (newValue === 2) {
      navigate("/Blog");
    }
  };

  return (
    <>
      {/* 🔹 SPINNER */}
      <Backdrop open={loading} style={{ zIndex: 1201, color: "#000" }}>
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <CircularProgress color="inherit" sx={{ color: "white" }} />
          <Typography variant="h6" sx={{ color: "white", marginTop: 2 }}>
            {textoActual}
          </Typography>
        </div>
      </Backdrop>

      {error && (
        <Typography align="center" color="error">
          {error}
        </Typography>
      )}

      {/* 🔹 CONTENEDOR PDF */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        position="relative"
        sx={{ pb: apiDisponible ? "56px" : 0 }}
      >
        <div
          ref={pdfContainerRef}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "1200px",
            margin: "120px auto 0 auto",
            width: "100%",
            cursor: apiDisponible && isMobile ? "pointer" : "default",
          }}
          onClick={() => {
            if (apiDisponible && isMobile) setDrawerOpen(true);
          }}
        />
      </Box>

      {apiDisponible === null && (
        <Typography align="center">
          Verificando disponibilidad de la API...
        </Typography>
      )}

      {apiDisponible === true && isMobile && (
        <BottomNavigation
          value={navValue}
          onChange={handleNavigationChange}
          sx={{
            width: "100%",
            position: "fixed",
            bottom: 0,
            bgcolor: "white",
            borderTop: "1px solid #ddd",
            zIndex: 1300,
          }}
          showLabels
        >
          <BottomNavigationAction
            label="Personalizar"
            icon={<TuneIcon />}
            sx={{
              color: navValue === 0 ? fuchsiaColor : "gray",
              "&.Mui-selected": { color: fuchsiaColor },
            }}
          />
          <BottomNavigationAction
            label="Descargar"
            icon={<PictureAsPdfIcon />}
            sx={{
              color: navValue === 1 ? "#d32f2f" : "gray",
              "&.Mui-selected": { color: "#d32f2f" },
            }}
          />
          <BottomNavigationAction
            label="Cerrar"
            icon={<CloseIcon />}
            onClick={() => navigate("/Blog")}
            sx={{
              color: "gray",
              "&:hover": { color: "#000" },
            }}
          />
        </BottomNavigation>
      )}

      {/* 🔹 MODAL DE PERSONALIZACIÓN */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: "0%" } }}
      >
        <Typography variant="h6" gutterBottom>
          Ajustes
        </Typography>
        <XLSXUploaderStoragePrecargaxDefectoHojaModal
          openx={drawerOpen}
          cerrarModalx={() => setDrawerOpen(false)}
          handleRecalculate={async () => {
            setDrawerOpen(false);
            try {
              setLoading(true); // ✅ Spinner también en recalcular
              const pdfData = await fetchPdfData();
              await renderPdfWithPdfJs(pdfData);
            } catch (err) {
              console.error("Error al recalcular:", err);
              setError("Error al recalcular PDF.");
            } finally {
              setLoading(false);
            }
          }}
        />
      </Drawer>

      <ToastContainer />

      {apiDisponible === false && (
        <Typography align="center" color="error">
          API no disponible, se está usando el PDF local.
        </Typography>
      )}
    </>
  );
});

export default Doc;
