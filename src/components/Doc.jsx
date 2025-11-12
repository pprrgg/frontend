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

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

const fuchsiaColor = "#D100D1";

const Doc = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // 🔹 nuevo estado
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiDisponible, setApiDisponible] = useState(null);
  const [navValue, setNavValue] = useState(0);
  const pdfContainerRef = useRef(null);
  const renderingRef = useRef(false);
  const pdfIntentado = useRef(false);
  const currentPdfBlobRef = useRef(null);

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
  const pdfPath = `/routers/${ep.grupo}/${ep.sector}/${ep.cod}.pdf`;

  const fetchLocalPdf = useCallback(async () => {
    try {
      const response = await fetch(pdfPath);
      if (!response.ok) throw new Error("No se encontró el PDF local.");
      const pdfData = new Uint8Array(await response.arrayBuffer());

      const blob = new Blob([pdfData], { type: "application/pdf" });
      currentPdfBlobRef.current = blob;

      return pdfData;
    } catch (err) {
      console.error("Error cargando PDF local:", err);
      throw err;
    }
  }, [pdfPath]);

  const fetchPdfData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const parametros = sessionStorage.getItem("excelData")
      ? JSON.parse(sessionStorage.getItem("excelData"))
      : {};

    const PDF_API_URL = `${config.API_URL}/${ENDPOINT}?timestamp=${new Date().getTime()}`;

    try {
      const localPdfData = await fetchLocalPdf();

      renderPdfWithPdfJs(localPdfData);
      setApiDisponible(false);

      try {
        setUpdating(true); // 🔹 mostrar "Actualizando..." mientras llama API
        const response = await axios.post(PDF_API_URL, parametros, {
          responseType: "arraybuffer",
          timeout: 20000,
        });

        if (response.status === 200 && response.data) {
          setApiDisponible(true);
          const apiPdfData = new Uint8Array(response.data);

          const blob = new Blob([apiPdfData], { type: "application/pdf" });
          currentPdfBlobRef.current = blob;

          await renderPdfWithPdfJs(apiPdfData);
          return apiPdfData;
        } else {
          throw new Error("Error al obtener PDF desde API");
        }
      } catch (apiErr) {
        console.warn("API no disponible, usando PDF local...", apiErr);
        setApiDisponible(false);
        return localPdfData;
      }
    } catch (localErr) {
      console.error("No se pudo cargar PDF local:", localErr);
      setError("No se pudo cargar el PDF.");
      throw localErr;
    } finally {
      setLoading(false);
      setUpdating(false); // 🔹 ocultar "Actualizando..."
    }
  }, [ENDPOINT, ep, fetchLocalPdf]);

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
        marginTop = 80,
        marginBottom = 80;

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

        finalCtx.fillStyle = "white";
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

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
        card.style.marginBottom = "20px";
        card.appendChild(finalCanvas);

        container.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      setError(`Error al renderizar PDF: ${err.message}`);
    } finally {
      renderingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pdfIntentado.current) return;
    pdfIntentado.current = true;

    fetchPdfData().catch((err) => {
      console.error("Fallo al cargar PDF:", err);
      setError("No se pudo cargar el PDF.");
      setLoading(false);
    });
  }, [fetchPdfData, renderPdfWithPdfJs]);

  const handleDownload = async () => {
    try {
      if (!currentPdfBlobRef.current) {
        throw new Error("No hay PDF disponible para descargar");
      }

      const url = URL.createObjectURL(currentPdfBlobRef.current);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${ep.cod}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      setError("Error al descargar el PDF");
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
      {/* 🔹 SPINNER CARGA INICIAL */}
      <Backdrop
        open={loading}
        sx={{
          zIndex: 1201,
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end", // alinea verticalmente al fondo
          pb: 3, // padding-bottom (ajusta la distancia desde el borde inferior)
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* 🔹 MENSAJE ACTUALIZANDO */}
      {updating && (
        <Box
          position="fixed"
          bottom="24px"
          left="50%"
          sx={{
            transform: "translateX(-50%)",
            zIndex: 1400,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress color="inherit" sx={{ color: "black" }} />
        </Box>
      )}


      {error && (
        <Typography align="center" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* 🔹 CONTENEDOR PDF */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
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

      {/* 🔹 BOTTOM NAVIGATION */}
      {apiDisponible === true && isMobile && !updating && (
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
            label="Datos"
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
              setUpdating(true); // 🔹 mostrar mensaje mientras actualiza
              const pdfData = await fetchPdfData();
              await renderPdfWithPdfJs(pdfData);
            } catch (err) {
              console.error("Error al recalcular:", err);
              setError("Error al recalcular PDF.");
            } finally {
              setUpdating(false);
            }
          }}
        />
      </Drawer>

      <ToastContainer />

      {apiDisponible === false && !loading && (
        <Typography align="center" color="error">
          API no disponible, se está usando el PDF local.
        </Typography>
      )}
    </>
  );
});

export default Doc;
