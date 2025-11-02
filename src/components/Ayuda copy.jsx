import React, { useState } from "react";
import {
  Container, Typography, Box, Button, Dialog,
  Accordion, AccordionSummary, AccordionDetails, TextField
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

// Importa tu JSON
import AyudaData from "./Catalogo.json";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

const HomePage = () => {



  const ayudaExtra = [
    {
      sector: "B1_Energía_solar",
      grupo: "B1_Instalación_y_mantenimiento",
      cod: "B11_Instalación_paneles_solares",
      descripcion: [
        "1. Verifica la orientación de los paneles.",
        "2. Limpieza periódica para mantener eficiencia.",
        "3. Revisión de conexiones cada 6 meses."
      ]
    },
    {
      sector: "B2_Eficiencia_energética",
      grupo: "B2_Ahorro_energético",
      cod: "B21_Medición_consumo",
      descripcion: ["1. Instalar medidores inteligentes.", "2. Analizar patrones de consumo."]
    }
  ];




  const [openVideo, setOpenVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedSeccion, setExpandedSeccion] = useState(null);
  const [expandedSubseccion, setExpandedSubseccion] = useState(null);
  const [expandedDocumento, setExpandedDocumento] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const ayudaCompleta = [...ayudaExtra, ...AyudaData];

  // Agrupar por sección > subsección > cod
  const estructura = ayudaCompleta.reduce((acc, item) => {
    const { sector, grupo, cod, descripcion } = item;
    const seccion = grupo;
    const subseccion = sector;

    if (!acc[seccion]) acc[seccion] = {};
    if (!acc[seccion][subseccion]) acc[seccion][subseccion] = [];

    acc[seccion][subseccion].push({
      cod,
      descripcion: Array.isArray(descripcion)
        ? descripcion
        : descripcion
          ? [descripcion]
          : ["(Sin descripción disponible)"],
      video: `${cod}.webm`,
    });

    return acc;
  }, {});

  // Filtrado por búsqueda
  const filtrado = Object.entries(estructura)
    .map(([seccion, subsecciones]) => {
      const subseccionesFiltradas = Object.entries(subsecciones)
        .map(([subseccion, documentos]) => {
          const documentosFiltrados = documentos.filter(
            (doc) =>
              doc.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.descripcion.some((d) =>
                d.toLowerCase().includes(searchTerm.toLowerCase())
              )
          );
          if (
            subseccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            documentosFiltrados.length > 0
          ) {
            return [subseccion, documentosFiltrados];
          }
          return null;
        })
        .filter(Boolean);

      if (
        seccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subseccionesFiltradas.length > 0
      ) {
        return [seccion, Object.fromEntries(subseccionesFiltradas)];
      }
      return null;
    })
    .filter(Boolean);

  // Manejo de acordeones
  const handleSeccionChange = (seccion) => (event, isExpanded) => {
    setExpandedSeccion(isExpanded ? seccion : null);
    setExpandedSubseccion(null);
    setExpandedDocumento(null);
  };

  const handleSubseccionChange = (subseccion) => (event, isExpanded) => {
    setExpandedSubseccion(isExpanded ? subseccion : null);
    setExpandedDocumento(null);
  };

  const handleDocumentoChange = (cod) => (event, isExpanded) => {
    setExpandedDocumento(isExpanded ? cod : null);
  };

  // Manejo de video
  const handleOpenVideo = (video) => {
    setCurrentVideo(video);
    setOpenVideo(true);
  };

  const handleCloseVideo = () => {
    setOpenVideo(false);
    setCurrentVideo(null);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "white", py: 6 }}>
      <Container>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4, color: "#000", textAlign: "center" }}
        >
          Ayuda
        </Typography>

        {/* Buscador */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <SearchIcon sx={{ color: "action.active", mr: 1 }} />
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* Estructura jerárquica */}
        {filtrado.length > 0 ? (
          filtrado.map(([seccion, subsecciones]) => (
            <Accordion
              key={seccion}
              expanded={expandedSeccion === seccion}
              onChange={handleSeccionChange(seccion)}
              disableGutters
              elevation={0}
              sx={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                mb: 1,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                sx={{
                  minHeight: 36,           // altura mínima
                  "& .MuiAccordionSummary-content": {
                    margin: 0,             // elimina márgenes internos
                    "&.Mui-expanded": {
                      margin: 0,           // margen al expandirse
                    }
                  },
                  paddingY: 0.5             // padding vertical reducido
                }}
              >                <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#1976d2", // azul eléctrico
                  textTransform: "uppercase"
                }}
              >
                  {seccion.includes("_") ? seccion.split("_").slice(1).join("_").replaceAll("_", " ") : seccion}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pl: 2 }}>
                {Object.entries(subsecciones).map(([subseccion, documentos]) => (
                  <AccordionDetails sx={{ pl: 2 }}>
                    {documentos.map((doc) => (
                      <Accordion
                        key={doc.cod}
                        expanded={expandedDocumento === doc.cod}
                        onChange={handleDocumentoChange(doc.cod)}
                        disableGutters
                        elevation={0}
                        sx={{
                          background: "transparent",
                          border: "none",
                          boxShadow: "none",
                          mb: 1,
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                          sx={{
                            minHeight: 36,
                            "& .MuiAccordionSummary-content": {
                              margin: 0,
                              "&.Mui-expanded": { margin: 0 },
                            },
                            paddingY: 0.5,
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                            {doc.cod.includes("_") ? doc.cod.split("_").slice(1).join("_").replaceAll("_", " ") : doc.cod}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails sx={{ pl: 2, pr: 2, pb: 1.5 }}>
                          <Typography sx={{ whiteSpace: "pre-wrap", mb: 1.5, fontSize: "0.9rem", color: "#444" }}>
                            {Array.isArray(doc.descripcion)
                              ? doc.descripcion.join("\n")
                              : "(Sin descripción disponible)"}
                          </Typography>

                          {/* Botón más discreto y alineado a la derecha */}
                          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              variant="text"
                              size="small"
                              color="primary"
                              startIcon={<PlayCircleFilledIcon />}
                              onClick={() => handleOpenVideo(doc.video)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                borderRadius: 2,
                                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                              }}
                            >
                              Ver video
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </AccordionDetails>

                ))}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography sx={{ mt: 4, textAlign: "center", color: "gray" }}>
            No se encontraron resultados para "{searchTerm}".
          </Typography>
        )}

        {/* Diálogo de video */}
        <Dialog
          open={openVideo}
          onClose={handleCloseVideo}
          maxWidth={false}
          PaperProps={{
            sx: {
              height: "100vh",
              aspectRatio: "9 / 18.3",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "auto",
            },
          }}
        >
          {/* Usamos currentVideo como nombre preferido; si es falsy usamos '' y onError pondrá el fallback */}
          <video
            // si currentVideo es null/undefined/cadena vacía, pondremos '' para que onError actúe
            src={(currentVideo && currentVideo.trim()) || ""}
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const vid = e.target; // elemento video
              try {
                // Obtenemos el nombre de archivo actual (termina en .../file.mp4)
                const src = vid.currentSrc || vid.src || "";
                // Si ya estamos en el fallback, no hacer nada (evitar bucle)
                if (src.endsWith("img/1.mp4") || src.endsWith("1.mp4")) {
                  // opcional: mostrar un mensaje o dejar el poster
                  console.warn("El vídeo por defecto '1.mp4' también no está disponible.");
                  return;
                }
                // Sustituimos por el fallback relativo (colocar 1.mp4 en /public)
                vid.src = "img/1.mp4";
                // Forzamos recarga y reproducción (si se puede)
                vid.load();
                const playPromise = vid.play();
                if (playPromise && typeof playPromise.then === "function") {
                  playPromise.catch(() => {
                    // no hacer nada si el autoplay está bloqueado por el navegador
                  });
                }
              } catch (err) {
                console.error("Error gestionando fallback de vídeo:", err);
              }
            }}
          />
          {/* Botón de cerrar */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleCloseVideo();
            }}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(255,0,0,0.9)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Box>
        </Dialog>

      </Container>
    </Box>
  );
};

export default HomePage;
