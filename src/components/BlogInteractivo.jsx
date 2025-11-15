import React, { useMemo, useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardMedia,
  Drawer, List, ListItemButton, ListItemText, Collapse,
  TextField, InputAdornment, BottomNavigation, Box, Dialog,
  Typography, Link
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Menu, Close } from '@mui/icons-material';

import Catalogo from './Catalogo.json';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebase/firebaseConfig.jsx';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from './Home.jsx';
import { Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const NavigationBarDocs = () => {
  const [user] = useAuthState(auth);
  const [searchText, setSearchText] = useState(() => sessionStorage.getItem('searchText') || '');
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState(() => {
    const stored = sessionStorage.getItem('selectedFicha');
    return stored ? JSON.parse(stored) : null;
  });
  const [tempSheets, setTempSheets] = useState(() => {
    const storedSheets = sessionStorage.getItem('excelData');
    return storedSheets ? JSON.parse(storedSheets) : {};
  });
  const [fichaVersion, setFichaVersion] = useState(0);
  const [navValue, setNavValue] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const normalize = (str = '') =>
    str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  useEffect(() => { sessionStorage.setItem('searchText', searchText); }, [searchText]);

  const handleSearchChange = (event) => setSearchText(event.target.value.toLowerCase());

  // 🔍 Filtrado
  const filteredData = useMemo(() => {
    const normalizedSearch = normalize(searchText);
    return Catalogo.filter(item => {
      const cod = normalize(item.cod);
      const sector = normalize(item.sector);
      const grupo = normalize(item.grupo);
      return (!searchText || cod.includes(normalizedSearch) || sector.includes(normalizedSearch) || grupo.includes(normalizedSearch));
    });
  }, [searchText]);

  // ✅ Agrupar y ordenar alfabéticamente
  const groupedData = useMemo(() => {
    const grouped = {};
    filteredData.forEach(item => {
      if (!grouped[item.grupo]) grouped[item.grupo] = {};
      if (!grouped[item.grupo][item.sector]) grouped[item.grupo][item.sector] = [];
      grouped[item.grupo][item.sector].push(item);
    });

    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })) // grupos
      .reduce((acc, grupo) => {
        const sectores = grouped[grupo];
        const sortedSectores = Object.keys(sectores)
          .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })) // sectores
          .reduce((accSec, sector) => {
            const fichasOrdenadas = [...sectores[sector]].sort((a, b) =>
              a.cod.localeCompare(b.cod, 'es', { sensitivity: 'base' })
            );
            accSec[sector] = fichasOrdenadas;
            return accSec;
          }, {});
        acc[grupo] = sortedSectores;
        return acc;
      }, {});
    return sortedGrouped;
  }, [filteredData]);

  // 📂 Toggle del drawer
  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group);
    setOpenSector({});
  };

  const toggleSector = (group, sector) => {
    setOpenSector(prev => ({
      ...prev,
      [group]: prev[group] === sector ? null : sector
    }));
  };

  // 📘 Cargar ficha seleccionada
  const handleFichaClick = async (ficha) => {
    try {
      setSelectedFicha(ficha);
      sessionStorage.setItem('selectedFicha', JSON.stringify(ficha));

      const filePath = `routers/${ficha.grupo}/${ficha.sector}/${ficha.cod}.xlsx`;
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`No se pudo cargar el archivo: ${filePath}`);
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = workbook.SheetNames.reduce((acc, sheetName) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        acc[sheetName] = sheet.filter(row => row.some(cell => cell != null && cell !== ""));
        return acc;
      }, {});
      setTempSheets(sheetsData);
      sessionStorage.setItem("excelData", JSON.stringify(sheetsData));

      setFichaVersion(v => v + 1);
      setDrawerOpen(false);
      setOpenGroup(null);
      setOpenSector({});
      navigate("/doc");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar la ficha seleccionada.");
    }
  };

  // 

  const [open, setOpen] = useState(false);
  const [imgAspect, setImgAspect] = useState(16 / 9); // valor inicial por defecto

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // 🔍 Calcula la proporción real del GIF cuando carga
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setImgAspect(naturalWidth / naturalHeight);
    }
  };


  const handleOpenAyuda = () => {
    navigate('/ayuda');
  };


  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#fff' }}>
        {/* 🎨 Fondo blanco */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
            zIndex: -1,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Container
            disableGutters
            sx={{
              py: { xs: 8, sm: 8 },
              px: { xs: 0, sm: 2, md: 4 },
            }}
          >
            {/* 🏷 Título */}
            <Box sx={{ textAlign: 'center', mb: 1 }}>

              {/* 🏷 Título */}



    <Typography
      variant="h5"
      sx={{
        fontWeight: 600,
        color: "#222",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1.5,
        letterSpacing: "0.5px",
      }}
    >
      {/* Logo cuadrado negro con letras IT */}
      <Box
        sx={{
          width: 37,
          height: 37,
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          borderRadius: "1px",
          fontSize: "2.1rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        IT
      </Box>

      {/* Texto dentro de un recuadro negro con fondo blanco */}
      <Box
        sx={{
          backgroundColor: "#fff",
          color: "#000",
          border: "2px solid #000",
          borderRadius: "1px",
          px: 2,
          py: 0.5,
          fontWeight: 600,
          fontSize: "1.2rem",
          fontFamily: "'Poppins', sans-serif",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        Informe Técnico
      </Box>
    </Typography>


              {/* 🏷 Nombre del Blog */}
              {/* <Typography
                variant="h4"
                sx={{
                  fontWeight: 999,
                  background: "linear-gradient(90deg, #00f0ff, #0077ff)", // azul eléctrico elegante
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 0,
                  textShadow: "2px 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                IT
              </Typography> */}
              <>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0,0,0,0.7)" }}
                >
                  <Box
                    component="span"
                    onClick={handleOpenAyuda}
                    sx={{
                      color: "#031dadff",
                      fontWeight: 700,
                      borderBottom: "2px solid #031dadff",
                      paddingBottom: "2px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      "&:hover": {
                        color: "#031dadff",
                        borderColor: "#031dadff",
                      },
                    }}
                  >
                    Bienvenido. Selecciona un informe, personalizalo y descargalo.{"   "}

                  </Box>
                    

                </Typography>
                <Typography>
                                    <Link
                    href="https://creativecommons.org/licenses/by/4.0/deed.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: "#1976d2" }}
                  >
                    <img
                      src="https://licensebuttons.net/l/by/4.0/88x31.png"
                      alt="Creative Commons Attribution 4.0 License"
                      style={{ verticalAlign: "middle", height: 20 }}
                    />
                  </Link>
                </Typography>
              </>
            </Box>

            {/* ✅ Cards agrupadas */}
            {Object.entries(groupedData).map(([grupo, sectores]) => (
              <Box key={grupo} sx={{ mb: 0 }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #031dadff, #031dadff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0,
                    textTransform: "uppercase",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* {grupo.replaceAll('_', ' ')} */}
                  {/* {grupo.includes("_") ? grupo.split("_").slice(1).join("_").replaceAll("_", " ") : grupo} */}

                </Typography>

                {Object.entries(sectores).map(([sector, fichas]) => (
                  <Box key={sector} sx={{ mb: 4 }}>

                    <Typography
                      sx={{
                        textTransform: 'uppercase',
                        color: 'rgba(3, 29, 173, 1)', // mismo color sin transparencia
                        textAlign: 'center',          // centrado

                      }}
                    >
                      {grupo.includes("_")
                        ? grupo.split("_").slice(1).join("_").replaceAll("_", " ")
                        : grupo}{" "}
                      {sector.includes("_")
                        ? sector.split("_").slice(1).join("_").replaceAll("_", " ")
                        : sector}
                    </Typography>

                    <Box sx={{ position: "relative" }}>
                      {/* Carrusel horizontal */}
                      <Box
                        id={`scroll-container-${grupo}-${sector}`}
                        sx={{
                          display: "flex",
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          gap: 1,
                          pb: 2,
                          px: 1,
                          flexWrap: "nowrap",
                          scrollSnapType: "x mandatory",
                          "&::-webkit-scrollbar": { height: 6 },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#031dadff",
                            borderRadius: 4,
                          },
                          "&::-webkit-scrollbar-track": { backgroundColor: "#e0f7fa" },
                        }}
                      >
                        {fichas.map((ficha) => (
                          <Box
                            key={ficha.cod}
                            sx={{
                              flex: { xs: "0 0 103%", sm: "0 0 48%" }, // igual que el grid original
                              minWidth: { xs: "103%", sm: "48%" },
                              scrollSnapAlign: "start",
                            }}
                          >
                            <Card
                              onClick={() => handleFichaClick(ficha)}
                              sx={{
                                borderRadius: "12px",
                                overflow: "hidden",
                                cursor: "pointer",
                                backgroundColor: "#fff",
                                border: "2px solid #031dadff",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                transition: "all 0.3s ease",
                                position: "relative",
                                "&:hover": {
                                  transform: "translateY(-6px)",
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                  borderColor: "#031dadff",
                                },
                              }}
                            >
                              <Box sx={{ position: "relative", width: "100%", paddingTop: "55%" }}>
                                <CardMedia
                                  component="img"
                                  image={`/routers/${encodeURIComponent(grupo)}/${encodeURIComponent(
                                    sector
                                  )}/${encodeURIComponent(ficha.cod)}.png`}
                                  alt={ficha.cod}
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    backgroundColor: "#fafafa",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `/img/defecto.png`;
                                  }}
                                />
                              </Box>
                            </Card>
                          </Box>
                        ))}
                      </Box>

                      {/* Botones de navegación */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          transform: "translateY(-50%)",
                          zIndex: 10,
                        }}
                      >
                        <Box
                          onClick={() => {
                            const container = document.getElementById(
                              `scroll-container-${grupo}-${sector}`
                            );
                            if (container) container.scrollLeft -= container.clientWidth * 0.8;
                          }}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: "rgba(255,255,255,0.3)",
                            borderRadius: "50%",
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // backdropFilter: "blur(4px)",
                            transition: "0.3s",
                            ml: 1,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.6)" },
                          }}
                        >
                          <Typography variant="h3" sx={{ color: "#0077ff", fontWeight: "bold" }}>
                            ‹
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 0,
                          transform: "translateY(-50%)",
                          zIndex: 10,
                        }}
                      >
                        <Box
                          onClick={() => {
                            const container = document.getElementById(
                              `scroll-container-${grupo}-${sector}`
                            );
                            if (container) container.scrollLeft += container.clientWidth * 0.8;
                          }}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: "rgba(255,255,255,0.3)",
                            borderRadius: "50%",
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // backdropFilter: "blur(4px)",
                            transition: "0.3s",
                            mr: 1,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.6)" },
                          }}
                        >
                          <Typography variant="h3" sx={{ color: "#0077ff", fontWeight: "bold" }}>
                            ›
                          </Typography>
                        </Box>
                      </Box>
                    </Box>



                  </Box>
                ))}
              </Box>
            ))}

          </Container>

          <Home
            showSEO={true}
            showLanding={false}
            showCarrusel={false}
            showInicio={false}
            showDescripcion={false}
            showServicios={false}
            showFaq={false}
            showContacto={true}
            showPrivacyPolicy={false}
            showTermsOfUse={false}
            showAboutUs={false}
          />




          {/* 🧭 Drawer lateral (filtros) */}



        </Box>
      </Box>
    </>
  );
};

export default NavigationBarDocs;
