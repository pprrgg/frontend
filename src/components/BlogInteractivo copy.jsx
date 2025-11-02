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
          <Container sx={{ py: 8 }}>
            {/* 🏷 Título */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>

              {/* 🏷 Título */}
              <Typography
                variant="h9"
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  mb: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Blog de Plantilas Técnicas 'Personalizables'


              </Typography>


              {/* 🏷 Nombre del Blog */}
              <Typography
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
                Vatiaco
              </Typography>



              <>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(0,0,0,0.7)",
                    // fontStyle: "italic",
                  }}
                >

                  <Box
                    component="span"
                    onClick={handleOpen}
                    sx={{
                      color: "#1976d2",
                      fontWeight: "900",
                      borderBottom: "2px solid #1976d2",
                      paddingBottom: "2px",
                      cursor: "pointer",
                      "&:hover": { color: "#00b0ff", borderColor: "#00b0ff" },
                    }}
                  >
                    Personaliza 🤔
                  </Box>
                  , descarga y comparte.{" "}
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

                {/* 🖼️ Dialog con GIF grande - Altura automática */}
                <Dialog
                  open={open}
                  onClose={handleClose}
                  maxWidth="xl"
                  PaperProps={{
                    sx: {
                      width: "auto",
                      maxWidth: "90vw",
                      height: "auto",
                      maxHeight: "90vh",
                      borderRadius: "16px",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#000",
                      position: "relative",
                      cursor: "pointer", // 🖱 permite clic en el fondo
                    },
                  }}
                  // 👉 Esto permite cerrar al hacer clic en cualquier parte del fondo (fuera del contenido)
                  onClick={handleClose}
                >
                  {/* 🖼 Imagen principal */}
                  <img
                    src="/img/1.gif"
                    alt="GIF de personalización"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "90vh",
                      height: "auto",
                      width: "auto",
                      display: "block",
                      pointerEvents: "none", // ⚠️ evita que el GIF bloquee el clic
                    }}
                  />

                  {/* ❌ Botón de Cerrar */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation(); // 🔒 evita que el clic cierre dos veces
                      handleClose();
                    }}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      borderRadius: "50%",
                      width: 60,
                      height: 60,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 0, 0, 0.8)", // 🔴 fondo rojo al hover
                      },
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
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


            </Box>



            {/* ✅ Cards agrupadas */}
            {Object.entries(groupedData).map(([grupo, sectores]) => (
              <Box key={grupo} sx={{ mb: 6 }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #00f0ff, #0077ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 3,
                    textTransform: "uppercase",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {grupo.replaceAll('_', ' ')}
                </Typography>

                {Object.entries(sectores).map(([sector, fichas]) => (
                  <Box key={sector} sx={{ mb: 4 }}>
                    <Typography
                      variant="h7"
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        background: "linear-gradient(90deg, #00f0ff, #0077ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 2,
                        textTransform: "capitalize",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      {sector.replaceAll('_', ' ')}
                    </Typography>

                    <Box sx={{ position: "relative" }}>
                      {/* Carrusel horizontal */}
                      <Box
                        id={`scroll-container-${grupo}-${sector}`}
                        sx={{
                          display: "flex",
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          gap: 3,
                          pb: 2,
                          px: 1,
                          flexWrap: "nowrap",
                          scrollSnapType: "x mandatory",
                          "&::-webkit-scrollbar": { height: 6 },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#00b0ff",
                            borderRadius: 4,
                          },
                          "&::-webkit-scrollbar-track": { backgroundColor: "#e0f7fa" },
                        }}
                      >
                        {fichas.map((ficha) => (
                          <Box
                            key={ficha.cod}
                            sx={{
                              flex: { xs: "0 0 90%", sm: "0 0 48%" }, // igual que el grid original
                              minWidth: { xs: "90%", sm: "48%" },
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
                                border: "2px solid #00b0ff",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                transition: "all 0.3s ease",
                                position: "relative",
                                "&:hover": {
                                  transform: "translateY(-6px)",
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                  borderColor: "#0091ea",
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

          {/* 🧭 Drawer lateral (filtros) */}


          <Home
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
        </Box>
      </Box>
    </>
  );
};

export default NavigationBarDocs;
