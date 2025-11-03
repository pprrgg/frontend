import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import AyudaData from "./Catalogo.json";

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
      descripcion: [
        "1. Instalar medidores inteligentes.",
        "2. Analizar patrones de consumo."
      ]
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
      video: `/video/${seccion}/${subseccion}/${cod}.mp4`
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

    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "white",
        py: 4,
        maxWidth: "1200px", // límite máximo del ancho del contenido
        mx: "auto",         // centra horizontalmente
        px: 0               // un poco de padding lateral en pantallas pequeñas
      }}
    >    {/* Contenedor ancho completo */}
      <Container maxWidth={false} disableGutters sx={{ px: 0 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 3,
            color: "#000",
            textAlign: "center",
          }}
        >
        </Typography>

        {/* Buscador */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
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
                mb: 0.5,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#000", fontSize: "1.1rem" }} />}
                sx={{
                  minHeight: 32,
                  py: 0,
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    "&.Mui-expanded": { margin: 0 },
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "#1976d2",
                    textTransform: "uppercase",
                    width: "100%",
                  }}
                >
                  {seccion.includes("_")
                    ? seccion.split("_").slice(1).join("_").replaceAll("_", " ")
                    : seccion}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 0 }}>
                {Object.entries(subsecciones).map(([subseccion, documentos]) => (
                  <AccordionDetails sx={{ px: 0 }} key={subseccion}>
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
                          mb: 0.5,
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ color: "#000", fontSize: "1rem" }} />}
                          sx={{
                            minHeight: 28,
                            py: 1,
                            "& .MuiAccordionSummary-content": {
                              margin: 0,
                              "&.Mui-expanded": { margin: 0 },
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              width: "100%",
                            }}
                          >
                            {doc.cod.includes("_")
                              ? doc.cod
                                .split("_")
                                .slice(1)
                                .join("_")
                                .replaceAll("_", " ")
                              : doc.cod}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails sx={{ px: 1, py: 0.5 }}>
                          <Typography
                            sx={{
                              width: "100%",
                              whiteSpace: "pre-wrap",
                              mb: 0.5,
                              fontSize: "0.85rem",
                              color: "#444",
                            }}
                          >
                            {Array.isArray(doc.descripcion)
                              ? doc.descripcion.join("\n")
                              : "(Sin descripción disponible)"}
                          </Typography>

                          {/* Botón de video */}
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
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                                },
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

        <Dialog
          open={openVideo}
          onClose={handleCloseVideo}
          fullScreen
          PaperProps={{
            sx: {
              width: "100vw",
              height: "100vh",
              borderRadius: 0,
              overflow: "hidden",
              backgroundColor: "#2e2e2e", // Fondo oscuro
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: 0,
              p: 0,
            },
          }}
        >
          <Box
            sx={{
              width: "100vw",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <video
              src={currentVideo || ""}
              controls
              autoPlay
              loop
              muted
              playsInline
              style={{
                height: "100vh", // ocupa toda la altura
                width: "auto", // mantiene proporción
                objectFit: "contain", // sin recortes ni deformación
                maxWidth: "100vw", // no exceder ancho
                backgroundColor: "#2e2e2e",
              }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                const vid = e.target;
                if (!vid.dataset.fallback) {
                  console.warn(
                    `No se encontró el video: ${currentVideo}. Se usará el video por defecto.`
                  );
                  vid.dataset.fallback = "true";
                  vid.src = "/video/1.mp4";
                  vid.load();
                  vid.play().catch(() => { });
                }
              }}
            />
          </Box>

          {/* Botón de cerrar */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleCloseVideo();
            }}
            sx={{
              position: "absolute",
              bottom: 33,
              right: 16,
              backgroundColor: "rgba(255,0,0,0.9)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
