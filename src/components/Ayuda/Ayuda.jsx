import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import AyudaData from "../Catalogo.json";
import YouTubeChannelEmbed from "./Secciones/AyudaYouTubeChannelEmbed";
import InicioSectionAyuda from "./Secciones/InicioSectionAyuda";

const HomePage = () => {
  const ayudaExtra = [];

  const [openVideo, setOpenVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedSeccion, setExpandedSeccion] = useState(null);
  const [expandedSubseccion, setExpandedSubseccion] = useState({});
  const [expandedDocumento, setExpandedDocumento] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const ayudaCompleta = [...ayudaExtra, ...AyudaData];

  // Función para normalizar texto
  const normalize = (str = "") =>
    str
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Función para mostrar nombre sin prefijos
  const displayName = (name) =>
    (name.includes("_") ? name.split("_").slice(1).join("_") : name).replace(
      /_/g,
      " "
    );

  // Agrupar datos
  const groupedData = useMemo(() => {
    const grouped = {};
    ayudaCompleta.forEach((item) => {
      grouped[item.grupo] ??= {};
      grouped[item.grupo][item.sector] ??= [];
      grouped[item.grupo][item.sector].push({
        ...item,
        video: `/video/${item.grupo}/${item.sector}/${item.cod}.mp4`,
      });
    });

    // Ordenar
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
      .reduce((acc, grupo) => {
        const sectores = grouped[grupo];
        const sortedSectores = Object.keys(sectores)
          .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
          .reduce((accSec, sector) => {
            const sortedFichas = [...sectores[sector]].sort((a, b) =>
              a.cod.localeCompare(b.cod, "es", { sensitivity: "base" })
            );
            accSec[sector] = sortedFichas;
            return accSec;
          }, {});
        acc[grupo] = sortedSectores;
        return acc;
      }, {});

    return sortedGrouped;
  }, [ayudaCompleta]);

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return groupedData;

    const normalizedSearch = normalize(searchTerm);
    const filtered = {};

    Object.entries(groupedData).forEach(([grupo, sectores]) => {
      const filteredSectores = {};

      Object.entries(sectores).forEach(([sector, fichas]) => {
        const filteredFichas = fichas.filter(
          (ficha) =>
            normalize(ficha.cod).includes(normalizedSearch) ||
            normalize(ficha.sector).includes(normalizedSearch) ||
            normalize(ficha.grupo).includes(normalizedSearch) ||
            (Array.isArray(ficha.descripcion) &&
              ficha.descripcion.some((desc) =>
                normalize(desc).includes(normalizedSearch)
              )) ||
            (typeof ficha.descripcion === "string" &&
              normalize(ficha.descripcion).includes(normalizedSearch))
        );

        if (filteredFichas.length > 0) {
          filteredSectores[sector] = filteredFichas;
        }
      });

      if (Object.keys(filteredSectores).length > 0) {
        filtered[grupo] = filteredSectores;
      }
    });

    return filtered;
  }, [groupedData, searchTerm]);

  // Expandir primer sección por defecto
  useEffect(() => {
    if (
      filteredData &&
      Object.keys(filteredData).length > 0 &&
      !expandedSeccion
    ) {
      const firstGroup = Object.keys(filteredData)[0];
      setExpandedSeccion(firstGroup);
    }
  }, [filteredData, expandedSeccion]);

  // Calcular total por grupo
  const getTotalFichasByGroup = (grupo) => {
    if (!filteredData[grupo]) return 0;
    let total = 0;
    Object.values(filteredData[grupo]).forEach((fichas) => {
      total += fichas.length;
    });
    return total;
  };

  // Manejo de acordeones
  const handleSeccionChange = (seccion) => (event, isExpanded) => {
    setExpandedSeccion(isExpanded ? seccion : null);
    setExpandedSubseccion({});
    setExpandedDocumento({});
  };

  const handleSubseccionChange = (grupo, subseccion) => (event, isExpanded) => {
    setExpandedSubseccion((prev) => ({
      ...prev,
      [grupo]: isExpanded ? subseccion : null,
    }));
    setExpandedDocumento((prev) => ({
      ...prev,
      [`${grupo}-${subseccion}`]: null,
    }));
  };

  const handleDocumentoChange =
    (grupo, subseccion, cod) => (event, isExpanded) => {
      const key = `${grupo}-${subseccion}`;
      setExpandedDocumento((prev) => ({
        ...prev,
        [key]: isExpanded ? cod : null,
      }));
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
    <>
      <Box mb={5}></Box>
      <InicioSectionAyuda />

      {/* Contenido principal */}
      <Box sx={{ ml: { xs: 0 }, p: 2 }}>
        {/* Sección de YouTube */}
        <Container maxWidth={false} disableGutters>
          <Box mb={5} sx={{ width: "100%" }} />{" "}
          <Box
            sx={{
              borderRadius: "12px",
              p: 3,
              backgroundColor: "#f0f7ff",
              border: "2px solid darkblue",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "darkblue",
                mb: 2,
                textAlign: "center",
              }}
            >
              Tutoriales y Guías en Video
            </Typography>
            <YouTubeChannelEmbed playlistId="PLeJnia2uXXXAQHanxmCWMAuckSlcvynRn" />
          </Box>
        </Container>

        {/* Buscador */}
        <Container sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar tutoriales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                border: "2px solid darkblue",
                "&:hover": {
                  borderColor: "darkblue",
                },
              },
            }}
          />
        </Container>

        <Container maxWidth={false} disableGutters>
          <Box mb={5} sx={{ width: "100%" }} />{" "}
          {Object.keys(filteredData).length > 0 ? (
            Object.entries(filteredData).map(([grupo, sectores]) => {
              const totalGrupo = getTotalFichasByGroup(grupo);

              return (
                <Box key={grupo} sx={{ mb: 4 }}>
                  {/* Primer nivel: Grupo */}
                  <Accordion
                    expanded={expandedSeccion === grupo}
                    onChange={handleSeccionChange(grupo)}
                    sx={{
                      mb: 2,
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: "#f0f7ff",
                        borderRadius: "8px 8px 0 0",
                        "&.Mui-expanded": {
                          backgroundColor: "#e0f0ff",
                          borderRadius: "8px 8px 0 0",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          pr: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: "darkblue",
                            fontSize: "1.2rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {displayName(grupo)}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: "darkblue",
                              color: "white",
                              px: 2,
                              py: 0.5,
                              borderRadius: "20px",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              minWidth: "40px",
                              textAlign: "center",
                            }}
                          >
                            {totalGrupo}
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0 }}>
                      {/* Segundo nivel: Sectores */}
                      {Object.entries(sectores).map(([sector, fichas]) => {
                        const subseccionId = `${grupo}-${sector}`;
                        const isSubseccionExpanded =
                          expandedSubseccion[grupo] === sector;

                        return (
                          <Accordion
                            key={subseccionId}
                            expanded={isSubseccionExpanded}
                            onChange={handleSubseccionChange(grupo, sector)}
                            sx={{
                              borderRadius: "0",
                              boxShadow: "none",
                              border: "none",
                              "&:before": { display: "none" },
                              "&.Mui-expanded": {
                                margin: 0,
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                backgroundColor: isSubseccionExpanded
                                  ? "#e8f4ff"
                                  : "#f8fbff",
                                pl: 4,
                                "&.Mui-expanded": {
                                  minHeight: "48px",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  pr: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    color: "darkblue",
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  {displayName(sector)}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      backgroundColor: "primary.main",
                                      color: "white",
                                      px: 1.5,
                                      py: 0.25,
                                      borderRadius: "12px",
                                      fontSize: "0.875rem",
                                      fontWeight: "bold",
                                      minWidth: "32px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {fichas.length}
                                  </Box>
                                </Box>
                              </Box>
                            </AccordionSummary>

                            <AccordionDetails
                              sx={{ pt: 0, pb: 0, pl: 6, pr: 2 }}
                            >
                              {/* Tercer nivel: Fichas (acordeones verticales) */}
                              <Box sx={{ width: "100%" }}>
                                {fichas.map((ficha) => {
                                  const documentoKey = `${grupo}-${sector}`;
                                  const isDocumentoExpanded =
                                    expandedDocumento[documentoKey] ===
                                    ficha.cod;

                                  return (
                                    <Box
                                      key={ficha.cod}
                                      sx={{
                                        mb: 2,
                                        width: "100%",
                                      }}
                                    >
                                      {/* Acordeón de documento */}
                                      <Accordion
                                        expanded={isDocumentoExpanded}
                                        onChange={handleDocumentoChange(
                                          grupo,
                                          sector,
                                          ficha.cod
                                        )}
                                        sx={{
                                          borderRadius: "8px",
                                          boxShadow:
                                            "0 2px 8px rgba(0,0,0,0.1)",
                                          border: "2px solid darkblue",
                                          "&:before": { display: "none" },
                                          "&.Mui-expanded": {
                                            margin: 0,
                                          },
                                          width: "100%",
                                        }}
                                      >
                                        <AccordionSummary
                                          expandIcon={<ExpandMoreIcon />}
                                          sx={{
                                            backgroundColor: isDocumentoExpanded
                                              ? "#f0f7ff"
                                              : "white",
                                            borderRadius: "8px 8px 0 0",
                                            minHeight: "56px",
                                            "&.Mui-expanded": {
                                              minHeight: "56px",
                                              borderRadius: "8px 8px 0 0",
                                            },
                                          }}
                                        >
                                          <Typography
                                            variant="body1"
                                            sx={{
                                              fontWeight: "medium",
                                              color: "darkblue",
                                              width: "100%",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            {displayName(ficha.cod)}
                                          </Typography>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ p: 3 }}>
                                          {/* Descripción a todo ancho */}
                                          <Box
                                            sx={{
                                              mb: 3,
                                              width: "100%",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: "#444",
                                                fontSize: "0.95rem",
                                                lineHeight: 1.6,
                                                whiteSpace: "pre-line",
                                                width: "100%",
                                              }}
                                            >
                                              {Array.isArray(ficha.descripcion)
                                                ? ficha.descripcion.map(
                                                    (line, index) => (
                                                      <React.Fragment
                                                        key={index}
                                                      >
                                                        {line}
                                                        {index <
                                                          ficha.descripcion
                                                            .length -
                                                            1 && <br />}
                                                      </React.Fragment>
                                                    )
                                                  )
                                                : ficha.descripcion
                                                ? ficha.descripcion
                                                : "No hay descripción disponible."}
                                            </Typography>
                                          </Box>

                                          {/* Botón para ver video */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "flex-end",
                                              width: "100%",
                                            }}
                                          >
                                            <Button
                                              variant="contained"
                                              startIcon={
                                                <PlayCircleFilledIcon />
                                              }
                                              sx={{
                                                backgroundColor: "darkblue",
                                                color: "white",
                                                "&:hover": {
                                                  backgroundColor: "#000080",
                                                },
                                                borderRadius: "6px",
                                                textTransform: "none",
                                                fontWeight: "bold",
                                                minWidth: "180px",
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenVideo(ficha.video);
                                              }}
                                            >
                                              Ver Video Tutorial
                                            </Button>
                                          </Box>
                                        </AccordionDetails>
                                      </Accordion>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                </Box>
              );
            })
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "1.1rem",
                }}
              >
                No se encontraron tutoriales para "{searchTerm}"
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Dialog para videos */}
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
            backgroundColor: "#2e2e2e",
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
              height: "100vh",
              width: "auto",
              objectFit: "contain",
              maxWidth: "100vw",
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
                vid.play().catch(() => {});
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
    </>
  );
};

export default HomePage;
