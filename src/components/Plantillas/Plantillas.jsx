import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Fade
} from "@mui/material";


import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import * as XLSX from "xlsx";
import Catalogo from "../Catalogo.json";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InicioSectionPlantillas from "../Plantillas/Secciones/InicioSectionPlantillas";

const NavigationBarDocs = () => {
  const scrollRefs = useRef({});
  const navigate = useNavigate();

  // Estados para el manejo del arrastre (Drag)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const displayName = (name) =>
    (name.includes("_") ? name.split("_").slice(1).join("_") : name).replace(/_/g, " ");

  const sortedGroupedData = useMemo(() => {
    const sortedData = [...Catalogo].sort((a, b) => {
      const compareGrupo = a.grupo.localeCompare(b.grupo);
      if (compareGrupo !== 0) return compareGrupo;
      const compareSector = a.sector.localeCompare(b.sector);
      if (compareSector !== 0) return compareSector;
      return a.cod.localeCompare(b.cod);
    });

    const grouped = {};
    sortedData.forEach((item) => {
      grouped[item.grupo] ??= {};
      grouped[item.grupo][item.sector] ??= [];
      grouped[item.grupo][item.sector].push(item);
    });
    return grouped;
  }, []);

  const handleFichaClick = async (ficha) => {
    // Evitar click si se estaba arrastrando
    if (isDragging.current) return;

    try {
      sessionStorage.setItem("selectedFicha", JSON.stringify(ficha));
      const filePath = `/routers/${encodeURIComponent(ficha.grupo)}/${encodeURIComponent(ficha.sector)}/${encodeURIComponent(ficha.cod)}.xlsx`;
      const response = await fetch(filePath);
      if (!response.ok) throw new Error("Archivo no encontrado");
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = workbook.SheetNames.reduce((acc, name) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
        acc[name] = sheet.filter((row) => row.some((cell) => cell !== null && cell !== ""));
        return acc;
      }, {});
      sessionStorage.setItem("excelData", JSON.stringify(sheetsData));
      navigate(`/${ficha.grupo}/${ficha.sector}/${ficha.cod}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar la ficha");
    }
  };

  // --- Lógica de Arrastre con Mouse ---
  const onMouseDown = (e, id) => {
    const slider = scrollRefs.current[id];
    isDragging.current = false; // Reset al inicio
    const startMouseDown = true;

    const moveHandler = (moveEvent) => {
      if (!startMouseDown) return;
      if (!isDragging.current) {
        // Solo marcar como arrastre si se mueve más de 5px
        if (Math.abs(moveEvent.pageX - e.pageX) > 5) isDragging.current = true;
      }
      const x = moveEvent.pageX - slider.offsetLeft;
      const walk = (x - (e.pageX - slider.offsetLeft)) * 2; // Velocidad de scroll
      slider.scrollLeft = scrollLeftPos.current - walk;
    };

    const upHandler = () => {
      slider.style.cursor = "grab";
      slider.style.userSelect = "auto";
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
    };

    slider.style.cursor = "grabbing";
    slider.style.userSelect = "none";
    scrollLeftPos.current = slider.scrollLeft;

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
  };

  const scrollLeft = (id) => scrollRefs.current[id]?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = (id) => scrollRefs.current[id]?.scrollBy({ left: 320, behavior: "smooth" });

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Box p={{ xs: -8, md: -8 }}>
        <InicioSectionPlantillas />

        {Object.entries(sortedGroupedData).map(([grupo, sectores]) => (
          <Box key={grupo} mb={12}>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 3, color: "#1a237e", textTransform: 'uppercase', mb: 0.5 }}>
                {displayName(grupo)}
              </Typography>
              <Box sx={{ width: 60, height: 4, bgcolor: "#1a237e", borderRadius: 2 }} />
            </Box>

            {Object.entries(sectores).map(([sector, fichas]) => {
              const id = `${grupo}-${sector}`;
              return (
                <Box key={id} mb={8}>

                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#646060", letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      {displayName(grupo)}.
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", letterSpacing: 1.5, textTransform: 'uppercase', ml: 0.5 }}>
                      {displayName(sector)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', px: { md: 6 } }}>

                    {/* Botón Izquierdo siempre visible */}
                    <IconButton
                      onClick={() => scrollLeft(id)}
                      sx={{
                        position: 'absolute', left: 0, zIndex: 10, bgcolor: 'white',
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", '&:hover': { bgcolor: '#fff' }
                      }}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>

                    <Box
                      ref={(el) => (scrollRefs.current[id] = el)}
                      onMouseDown={(e) => onMouseDown(e, id)}
                      sx={{
                        display: "flex",
                        overflowX: "auto",
                        scrollBehavior: 'smooth',
                        gap: 3,
                        py: 4,
                        px: 2,
                        cursor: "grab",
                        // "Snap" para centrar cards automáticamente al soltar
                        scrollSnapType: "x mandatory",
                        WebkitOverflowScrolling: "touch",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" }
                      }}
                    >

                      {fichas.map((ficha) => {
                        // Extraer el precódigo (ej: "01" de "01_Nombre_Ficha")
                        const preCodigo = ficha.cod.split("_")[0];
                        const nombreFicha = displayName(ficha.cod);

                        return (
                          <Fade in={true} key={ficha.cod}>
                            <Box sx={{ scrollSnapAlign: "center" }}>
                              <Card
                                onClick={() => handleFichaClick(ficha)}
                                sx={{
                                  minWidth: { xs: "280px", md: "400px" },
                                  maxWidth: { xs: "280px", md: "400px" },
                                  flexShrink: 0,
                                  transition: 'all 0.3s ease',
                                  borderRadius: "12px",
                                  border: "1px solid #f0f0f0",
                                  '&:hover': {
                                    transform: { md: 'scale(1.02)' },
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                  }
                                }}
                              >
                                <Box sx={{ bgcolor: "#f1f4f9", p: 1.5, textAlign: 'center' }}>
                                  {/* Tag de Precódigo */}
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      color: "#1a237e",
                                      fontSize: "0.36rem",
                                      mb: 0.5,
                                      opacity: 0.8
                                    }}
                                  >
                                    {preCodigo}
                                  </Typography>

                                  <Typography sx={{ fontWeight: 700, color: "#557596", fontSize: "0.475rem", textTransform: 'uppercase' }}>
                                    {displayName(ficha.grupo)}
                                  </Typography>

                                  <Typography sx={{ fontWeight: 700, color: "#9e9e9e", fontSize: "0.375rem", textTransform: 'uppercase', mb: 0.5 }}>
                                    {displayName(ficha.sector)}
                                  </Typography>

                                  <Typography sx={{ fontWeight: 700, color: "#2c3e50", fontSize: "0.85rem", textTransform: 'uppercase', lineHeight: 1.2 }}>
                                    {nombreFicha}
                                  </Typography>
                                </Box>

                                <CardMedia
                                  component="img"
                                  sx={{ width: '100%', aspectRatio: '210 / 297', objectFit: 'cover', pointerEvents: 'none' }}
                                  image={`/routers/${encodeURIComponent(ficha.grupo)}/${encodeURIComponent(ficha.sector)}/${encodeURIComponent(ficha.cod)}.png`}
                                  alt={ficha.cod}
                                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x560?text=Ficha"; }}
                                />
                              </Card>
                            </Box>
                          </Fade>
                        );
                      })}

                    </Box>

                    {/* Botón Derecho siempre visible */}
                    <IconButton
                      onClick={() => scrollRight(id)}
                      sx={{
                        position: 'absolute', right: 0, zIndex: 10, bgcolor: 'white',
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", '&:hover': { bgcolor: '#fff' }
                      }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default NavigationBarDocs;

