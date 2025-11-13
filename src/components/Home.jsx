import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Chip, CardContent,
  Container, Typography, Grid, Card, CardMedia, Button, Box, Divider, Link, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Dialog,
  TextField, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "@mui/material/styles";
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Catalogo from "./Catalogo.json";

// Íconos (manteniendo tus imports)
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import BoltIcon from "@mui/icons-material/Bolt";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import CopyrightIcon from '@mui/icons-material/Copyright';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsRemoteIcon from "@mui/icons-material/SettingsRemote";
import WaterIcon from "@mui/icons-material/Water";
import PublicIcon from "@mui/icons-material/Public";
import LightModeIcon from "@mui/icons-material/LightMode";
import InventoryIcon from "@mui/icons-material/Inventory";
import PlumbingIcon from "@mui/icons-material/Plumbing";
import SensorsIcon from "@mui/icons-material/Sensors";
import VibrationIcon from "@mui/icons-material/Vibration";
import TrainIcon from "@mui/icons-material/Train";
import EvStationIcon from "@mui/icons-material/EvStation";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EngineeringIcon from '@mui/icons-material/Engineering';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const HomePage = ({
  showSEO = false,
  showAyuda = false,
  showLanding = true,
  showCarrusel = true,
  showInicio = true,
  showDescripcion = true,
  showServicios = true,
  showFaq = true,
  showContacto = true,
  showPrivacyPolicy = true,
  showTermsOfUse = true,
  showAboutUs = true
}) => {

  const navigate = useNavigate();
  const primaryColor = "#1976d2";
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();

  const servicios = [
    {
      titulo: "Estudio y Consultoría",
      icono: <EngineeringIcon />,
      color: "#4fc3f7",
      items: [
        "Estudios de Viabilidad Técnico-Económica",
        "Auditorías Energéticas y de Eficiencia",
        "Análisis de Necesidades",
        "Asesoramiento Técnico Especializado"
      ]
    },
    {
      titulo: "Proyección y Diseño",
      icono: <DesignServicesIcon />,
      color: "#81c784",
      items: [
        "Desarrollo de Proyectos Ejecutivos",
        "Cálculos y Simulaciones",
        "Planificación de Proyectos",
        "Obtención de Licencias y Permisos"
      ]
    },
    {
      titulo: "Instalación e Implementación",
      icono: <BuildIcon />,
      color: "#ffb74d",
      items: [
        "Dirección de Obra y Ejecución",
        "Gestión de Compras y Suministros",
        "Coordinación de Subcontratas",
        "Puesta en Marcha y Comisionado"
      ]
    },
    {
      titulo: "Mantenimiento y Soporte",
      icono: <SettingsIcon />,
      color: "#ba68c8",
      items: [
        "Planes de Mantenimiento Preventivo y Predictivo",
        "Mantenimiento Correctivo",
        "Monitoreo Remoto y Telemetría",
        "Servicio de Asistencia Técnica 24/7"
      ]
    },
    {
      titulo: "Gestión y Optimización",
      icono: <ManageAccountsIcon />,
      color: "#ff8a65",
      items: [
        "Gestión Integral de Proyectos (Project Management)",
        "Gestión de Activos",
        "Optimización de Procesos",
        "Gestión Documental"
      ]
    }
  ];

  const cardsData = [
    {
      id: 18,
      title_es: "Automatismos Industriales",
      description_es: "Sistemas de automatización y control para procesos industriales.",
      full_description_es: "Diseño, implementación y mantenimiento de sistemas de automatización industrial incluyendo control de procesos, robótica, SCADA, PLCs y sistemas de supervisión para optimizar la producción industrial.",
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/ai01.png",
      group: "Automatizacion_Industrial",
      sector: "Industria",
      searchtext: "automatismos industriales PLC SCADA robótica control procesos",
    },
    {
      id: 14,
      title_es: "Gestión y negociación de contratos de energía",
      description_es: "Análisis y gestión de contratos energéticos para reducir costes y maximizar eficiencia.",
      full_description_es: "Revisión de tarifas, análisis de consumo histórico, simulación de escenarios y recomendaciones para gestionar y \
      negociar de forma eficiente los contratos de suministro de energía (electricidad y \
       gas) necesarios en la industria, comercio o suministro residencial.",
      icon: <BoltIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/Optimización_de_contratos_de_energía.jpeg",
      group: "Optimización_Contratos_Energía",
      sector: "Energía",
      searchtext: "contratos energía optimización ahorro consumo",
    },
    {
      id: 12,
      title_es: "Comunidades Energéticas",
      description_es: "Estudio de diseño y viabilidad (técnica, económica y legal), creación y gestión de comunidades ciudadanas de energía y comunidades de energías renovables.",
      full_description_es: "Estudio de diseño y viabilidad (técnica, económica y legal), creación y gestión de comunidades ciudadanas de energía y comunidades de energías renovables.",
      icon: <GroupsIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/ce01.png",
      group: "Control_Comunidades_Autoconsumo",
      sector: "Energía",
      searchtext: "comunidades energéticas autoconsumo",
    },
    {
      id: 17,
      title_es: "Mantenimiento Preventivo",
      description_es: "Monitorización de maquinaria para prevenir fallos y optimizar su vida útil.",
      full_description_es: "Sensores, alertas tempranas de desgaste, análisis de rendimiento y reportes automáticos para planificar mantenimientos preventivos y reducir paradas no programadas.",
      icon: <VibrationIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/mp01.png",
      group: "Mantenimiento_Vibraciones",
      sector: "Mantenimiento / Industria",
      searchtext: "mantenimiento preventivo vibraciones maquinaria alertas",
    },
    {
      id: 13,
      title_es: "Auditorías Energéticas",
      description_es: "Supervisión y validación de auditorías energéticas para optimizar el consumo.",
      full_description_es: "Mapeado energético, análisis de consumo, propuesta de mejores energéticas, generación de informes, recomendaciones y seguimiento de medidas de eficiencia energética.",
      icon: <SearchIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/ae01.png",
      group: "Control_Auditorias_Energéticas",
      sector: "Eficiencia Energética",
      searchtext: "auditorías energéticas eficiencia control",
    },
    {
      id: 10,
      title_es: "Infraestructura de puntos de Recarga para Vehículos Eléctricos (IRVE)",
      description_es: "instalación y gestión de soluciones de carga para vehículos eléctricos.",
      full_description_es: "Instalación, mantenimiento y gestión de Infraestructura de puntos de Recarga para Vehículos Eléctricos (IRVE). Implementar los puntos de conexión necesarios para suministrar energía a estos vehículos, permitiendo su recarga de forma segura y eficiente supervisión de estaciones de recarga en parkings públicos, comunidades de vecinos y empresas.",
      icon: <EvStationIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/Recarga_de_vehículos_eléctricos.jpeg",
      group: "Control_Recarga_EV",
      sector: "Movilidad",
      searchtext: "vehículos eléctricos recarga parkings empresas comunidades",
    },
    {
      id: 11,
      title_es: "Automatización del control de invernaderos",
      description_es: "Monitoreo de riego, humedad del suelo, condiciones ambientales y consumos en agricultura.",
      full_description_es: "Incluye sensores de suelo, clima, control de riego automatizado e informes de eficiencia agrícola para maximizar el rendimiento.",
      icon: <AgricultureIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/g01.png",
      group: "Control_Agricultura",
      sector: "Agricultura",
      searchtext: "agricultura riego humedad cultivo",
    },
    {
      id: 15,
      title_es: "Tracking de Flotas y Animales",
      description_es: "Monitoreo en tiempo real de vehículos o ganado mediante dispositivos IoT.",
      full_description_es: "Incluye localización GPS, geocercas, alertas de movimiento, historial de rutas y reportes de comportamiento para optimizar logística o gestión de animales.",
      icon: <GpsFixedIcon sx={{ fontSize: 60, color: primaryColor }} />,
      link: "/Docs",
      image: "/img/tv01.png",
      group: "Tracking_Flotas_Animales",
      sector: "Logística / Agricultura",
      searchtext: "tracking GPS vehículos animales flotas ganadería logística",
    },
  ];

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  const handleCardClick = (grupo, link) => {
    sessionStorage.setItem("selectedGroup", grupo);
    navigate(link);
  };

  const ayuda = [
    {
      id: 1,
      title_es: "Personalizar un documento",
      description_es: "\n \
      Seleccionar el documento, desde la imagen o del menu superior.  \n \
      Se carga con valores iniciales por defecto. \n \
      Personalizarlos clicando en el menu inferior Personalizar o sobre el propio documento. \n \
      Se abre un formulario con los parametros separados en hojas, similar a un libro excel. \n \
      Clicar en la celda para modificarla. \n \
      Clicar Recalcular en el menu inferior para obtener el documento personalizado.\
      ",
      video: "/img/1.mp4",
    },
    {
      id: 2,
      title_es: "Exportar e importar a excel",
      description_es: "\n \
      Los parametros del documento se pueden exportar a excel.  \n \
      Se puedn modificar desde excel y volver a  importarlos para obtener el documento cuando lo desee. \n \
      La aplicacion no guarda sus datos. \n \
       ",
      video: "2.webm",
    },
  ];

  const [openVideo, setOpenVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Estado para controlar qué acordeón está expandido
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  const handleOpenVideo = (video) => {
    setCurrentVideo(video);
    setOpenVideo(true);
  };

  const handleCloseVideo = () => {
    setOpenVideo(false);
    setCurrentVideo(null);
  };

  // Función para manejar la expansión de acordeones
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', backgroundColor: 'white' }}>

      {/* Fondo blanco en lugar de video */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          zIndex: -2,
        }}
      />

      {/* Contenido principal */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Container
          disableGutters
          sx={{
            py: { xs: 8, sm: 8 },
            px: { xs: 0, sm: 2, md: 4 },
          }}
        >

          {/* AYUDA */}
          {showAyuda && (

            <Container sx={{ py: 8 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, color: "#000", textAlign: "center" }}>
                Ayuda
              </Typography>

              {ayuda.map((card) => (
                <Accordion
                  key={card.id}
                  expanded={expandedAccordion === card.id} // 🔹 Controla qué acordeón está expandido
                  onChange={handleAccordionChange(card.id)} // 🔹 Maneja el cambio
                  sx={{
                    background: "white",
                    border: "2px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px !important",
                    color: "#000",
                    mb: 2,
                    "&:before": { display: "none" },
                    "&:hover": { border: "2px solid #ed6c02" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                    sx={{ "& .MuiAccordionSummary-content": { alignItems: "center" } }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>{card.title_es}</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{card.description_es}</Typography>

                    {/* Botón para abrir el video */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenVideo(card.video)}
                    >
                      Ver video
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* Dialog con video dinámico */}
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
                    boxShadow: 8,
                  },
                }}
              >
                {/* Video dinámico */}
                {currentVideo && (
                  <video
                    src={currentVideo}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      backgroundColor: "#000",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

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
                    backgroundColor: "rgba(255, 0, 0, 0.9)",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: 10,
                    "&:hover": { backgroundColor: "rgba(200, 0, 0, 1)", transform: "scale(1.05)" },
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
          )}

          {/* LANDING */}
          {showLanding && (<Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
            {/* Encabezado */}
            <Box textAlign="center" mb={6}>
              <Chip
                label="Servicios Profesionales"
                color="primary"
                sx={{
                  mb: 2,
                  px: 2,
                  py: 1,
                  fontSize: '1rem',
                  backgroundColor: 'rgba(25, 118, 210, 0.9)',
                  color: 'white',
                }}
              />

              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  color: 'black',
                  fontWeight: 'bold',
                }}
              >
                Servicios de Ingeniería
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(0,0,0,0.8)',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}
              >
                "De la idea a la realidad: Soluciones de ingeniería integrales, llave en mano."
              </Typography>
            </Box>
            {/* Call to Action */}
            <Box textAlign="center" mt={6}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'rgba(25, 118, 210, 0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: 'rgba(21, 101, 192, 0.9)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => navigate('/contacto')}
              >
                Solicitar Propuesta Personalizada
              </Button>
            </Box>
            <Divider sx={{ my: 4, backgroundColor: 'rgba(0,0,0,0.2)' }} />

            {/* Servicios en Grid */}
            <Grid container spacing={4}>
              {servicios.map((servicio, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'white',
                      border: `2px solid rgba(0, 0, 0, 0.2)`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        border: `2px solid ${servicio.color}`,
                        boxShadow: `0 8px 32px ${servicio.color}60`,
                        '&::before': {
                          opacity: 1
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-3px',
                        left: '-3px',
                        right: '-3px',
                        bottom: '-3px',
                        background: `linear-gradient(45deg, transparent, ${servicio.color}20, transparent)`,
                        borderRadius: '14px',
                        zIndex: -1,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header del servicio */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            color: servicio.color,
                            mr: 2,
                            fontSize: '2.2rem',
                          }}
                        >
                          {servicio.icono}
                        </Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{
                            color: 'black',
                            fontWeight: 'bold',
                          }}
                        >
                          {servicio.titulo}
                        </Typography>
                      </Box>

                      {/* Lista de items */}
                      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                        {servicio.items.map((item, itemIndex) => (
                          <Typography
                            component="li"
                            variant="body1"
                            key={itemIndex}
                            sx={{
                              mb: 1.5,
                              color: 'rgba(0,0,0,0.9)',
                              fontWeight: 500,
                              '&:before': {
                                content: '"▸"',
                                color: servicio.color,
                                fontWeight: 'bold',
                                display: 'inline-block',
                                width: '1em',
                                marginLeft: '-1em',
                              }
                            }}
                          >
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>

                </Grid>
              ))}
            </Grid>

            {/* Acordeón para versión móvil */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 4 }}>
              {servicios.map((servicio, index) => (
                <Accordion
                  key={index}
                  sx={{
                    background: 'white',
                    border: `1px solid rgba(0, 0, 0, 0.2)`,
                    color: 'black',
                    mb: 2,
                    '&:before': {
                      display: 'none'
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: servicio.color }} />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        color: servicio.color,
                        mr: 2,
                        fontSize: '1.8rem'
                      }}>
                        {servicio.icono}
                      </Box>
                      <Typography variant="h6" sx={{ color: 'black' }}>
                        {servicio.titulo}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      {servicio.items.map((item, itemIndex) => (
                        <Typography
                          component="li"
                          variant="body1"
                          key={itemIndex}
                          sx={{
                            mb: 1.5,
                            color: 'rgba(0,0,0,0.9)',
                            '&:before': {
                              content: '"▸"',
                              color: servicio.color,
                              fontWeight: 'bold',
                              display: 'inline-block',
                              width: '1em',
                              marginLeft: '-1em'
                            }
                          }}
                        >
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

          </Container>)}

          {/* CARRUSEL */}
          {showCarrusel && (
            <Container sx={{ py: 8 }}>
              <Slider {...carouselSettings}>
                {cardsData.map((card) => (
                  <Box
                    key={card.id}
                    sx={{
                      position: "relative",
                      borderRadius: 3,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "2px solid rgba(0, 0, 0, 0.2)",
                      background: 'white',
                      transition: "all 0.3s ease",
                      '&:hover': {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
                      }
                    }}
                    onClick={() => handleCardClick(card.group, "/Blog")}
                  >
                    <CardMedia
                      component="img"
                      src={card.image}
                      alt={card.title_es}
                      onError={(e) => { e.target.src = "/img/defecto.png"; }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        p: 3,
                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                        color: "#fff",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                        {card.title_es}
                      </Typography>
                      <Typography variant="body1">
                        {card.description_es}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Slider>
            </Container>
          )}

          {/* INICIO */}
          {showInicio && (
            <Container sx={{ py: 8 }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 400,
                  backgroundImage: "url('/img/banner-fondo.jpeg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  textAlign: "center",
                  border: "2px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "12px",
                  background: 'white',
                  overflow: "hidden"
                }}
              >
                <Box sx={{ position: "relative", zIndex: 2, py: 8, px: 4 }}>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
                    Ingeniería
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Proyectos y estudios independientes de viabilidad de instalaciones . Control y Supervisión de procesos
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontStyle: "italic", color: "#000" }}>
                    Viability studies and projects. Control and Supervision
                  </Typography>
                  <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.3)" }} />
                </Box>
              </Box>
            </Container>
          )}

          {/* DESCRIPCIÓN */}
          {showDescripcion && (
            <Container sx={{ py: 8 }}>
              <Card sx={{
                p: 3,
                borderRadius: "12px",
                background: "white",
                border: "2px solid rgba(0, 0, 0, 0.2)",
                color: "#000",
                transition: "all 0.3s ease",
                '&:hover': {
                  border: "2px solid #1976d2",
                  boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
                }
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Aplicación Web interactiva de uso libre y gratuito.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  Licencia Creative Commons con atribución requerida.{" "}
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
                      style={{ verticalAlign: 'middle', height: 20 }}
                    />
                  </Link>
                </Typography>
              </Card>
            </Container>
          )}

          {/* SERVICIOS */}
          {showServicios && (
            <>
              <Container sx={{ py: 8 }}>
                <Card sx={{
                  p: 3,
                  borderRadius: "12px",
                  background: "white",
                  border: "2px solid rgba(0, 0, 0, 0.2)",
                  color: "#000",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    border: "2px solid #2e7d32",
                    boxShadow: "0 8px 25px rgba(46, 125, 50, 0.3)",
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Soluciones Integrales de Ingeniería y Eficiencia Energética.
                  </Typography>
                  <Typography variant="body1">
                    Servicios de ingeniería para optimizar recursos, control de instalaciones industriales, supervisión de procesos en energía,
                    agua, agricultura, movilidad y medio ambiente. Mantenimiento predictivo, auditorías y proyectos con enfoque en eficiencia, sostenibilidad y reducción de costes.
                  </Typography>
                </Card>
              </Container>

              <Container sx={{ py: 1 }}>
                <Grid container spacing={3}>
                  {cardsData.map((card) => (
                    <Grid item key={card.id} xs={12} sm={6} md={4}>
                      <Card
                        sx={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "white",
                          border: "2px solid rgba(0, 0, 0, 0.2)",
                          transition: "all 0.3s ease",
                          position: "relative",
                          '&:hover': {
                            transform: "translateY(-8px)",
                            border: "2px solid #1976d2",
                            boxShadow: "0 12px 35px rgba(25, 118, 210, 0.4)",
                          }
                        }}
                        onClick={() => handleCardClick(card.group, "/Blog")}
                      >
                        <Box sx={{ position: "relative", height: 300 }}>
                          <CardMedia
                            component="img"
                            src={card.image}
                            alt={card.title_es}
                            onError={(e) => { e.target.src = "/img/defecto.png"; }}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              width: "100%",
                              height: "70%",
                              p: 2,
                              background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(0,0,0,0.9) 100%)",
                              color: "#fff",
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                              {card.title_es}
                            </Typography>
                            <Typography variant="body2">
                              {card.full_description_es}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </>
          )}

          {/* FAQ */}
          {showFaq && (
            <Container sx={{ py: 8 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, color: "#000", textAlign: "center" }}>
                Preguntas frecuentes
              </Typography>
              {cardsData.map((card) => (
                <Accordion
                  key={card.id}
                  sx={{
                    background: "white",
                    border: "2px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px !important",
                    color: "#000",
                    mb: 2,
                    '&:before': { display: 'none' },
                    '&:hover': {
                      border: "2px solid #ed6c02",
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      {card.title_es}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      {card.description_es}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Container>
          )}

          {/* PRIVACY POLICY */}
          {showPrivacyPolicy && (
            <Container sx={{ py: 8 }}>
              <Card sx={{
                p: 4,
                borderRadius: "12px",
                background: "white",
                border: "2px solid rgba(0, 0, 0, 0.2)",
                color: "#000",
                transition: "all 0.3s ease",
                '&:hover': {
                  border: "2px solid #1976d2",
                  boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
                }
              }}>

                <h1>Política de Privacidad</h1>
                <p><strong>Última actualización: {new Date().getFullYear()}</strong></p>

                <h2>1. Información que Recopilamos</h2>
                <p>
                  Recopilamos información que usted nos proporciona directamente, así como información sobre su uso de nuestros servicios:
                </p>
                <ul>
                  <li>
                    <strong>Información Personal</strong>: Al registrarse, es posible que le solicitemos información personal, como su nombre, dirección de correo electrónico y otra información relevante.
                  </li>
                  <li>
                    <strong>Información de Uso</strong>: Recopilamos información sobre cómo interactúa con nuestros servicios, incluyendo la fecha y hora de su visita, la duración de la visita y las páginas que visita.
                  </li>
                </ul>

                <h2>2. Uso de la Información</h2>
                <p>
                  Utilizamos la información que recopilamos para:
                </p>
                <ul>
                  <li>Proporcionar y mantener nuestros servicios.</li>
                  <li>Mejorar y personalizar su experiencia.</li>
                  <li>Comunicarnos con usted, incluyendo el envío de correos electrónicos sobre actualizaciones, ofertas y promociones.</li>
                  <li>Cumplir con nuestras obligaciones legales y resolver disputas.</li>
                </ul>

                <h2>3. Almacenamiento de Datos</h2>
                <p>
                  Almacenamos su información personal durante el tiempo que sea necesario para cumplir con los fines establecidos en esta política, y de acuerdo con nuestras obligaciones legales.
                </p>

                <h2>4. Compartir Información</h2>
                <p>
                  No compartimos su información personal con terceros, excepto en las siguientes circunstancias:
                </p>
                <ul>
                  <li>Con su consentimiento explícito.</li>
                  <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio y proporcionarle nuestros servicios (por ejemplo, servicios de correo electrónico).</li>
                  <li>Para cumplir con la ley, responder a citaciones o solicitudes legales, o proteger nuestros derechos o los de otros.</li>
                </ul>

                <h2>5. Sus Derechos</h2>
                <p>
                  Usted tiene los siguientes derechos respecto a su información personal:
                </p>
                <ul>
                  <li><strong>Acceso</strong>: Puede solicitar una copia de la información que tenemos sobre usted.</li>
                  <li><strong>Rectificación</strong>: Puede solicitar la corrección de información inexacta o incompleta.</li>
                  <li><strong>Eliminación</strong>: Puede solicitar la eliminación de su información personal bajo ciertas condiciones.</li>
                  <li><strong>Oposición</strong>: Puede oponerse al tratamiento de su información personal en determinadas circunstancias.</li>
                </ul>

                <h2>6. Seguridad de la Información</h2>
                <p>
                  Tomamos medidas razonables para proteger su información personal contra pérdida, robo y uso indebido. Sin embargo, ningún método de transmisión a través de Internet o método de almacenamiento electrónico es 100% seguro. Por lo tanto, no podemos garantizar su seguridad absoluta.
                </p>

                <h2>7. Cambios a Esta Política de Privacidad</h2>
                <p>
                  Podemos actualizar esta política de privacidad de vez en cuando. Le notificaremos sobre cambios significativos en la forma en que tratamos la información personal enviándole un aviso a la dirección de correo electrónico que nos proporcionó.
                </p>



              </Card>
            </Container>
          )}

          {/* TERMS OF USE */}
          {showTermsOfUse && (
            <Container sx={{ py: 8 }}>
              <Card sx={{
                p: 4,
                borderRadius: "12px",
                background: "white",
                border: "2px solid rgba(0, 0, 0, 0.2)",
                color: "#000",
                transition: "all 0.3s ease",
                '&:hover': {
                  border: "2px solid #2e7d32",
                  boxShadow: "0 8px 25px rgba(46, 125, 50, 0.3)",
                }
              }}>
                <Typography variant="h4" gutterBottom>Términos de Uso</Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Última actualización: {new Date().getFullYear()}</strong>
                </Typography>

                <Typography variant="h5" gutterBottom>1. Aceptación de los Términos</Typography>
                <Typography variant="body1" paragraph>
                  Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos de Uso y a nuestra Política de Privacidad. Si no está de acuerdo con estos términos, le solicitamos que no utilice el sitio.
                </Typography>

                <Typography variant="h5" gutterBottom>2. Modificaciones a los Términos</Typography>
                <Typography variant="body1" paragraph>
                  IT se reserva el derecho de modificar estos Términos de Uso en cualquier momento. Los cambios entrarán en vigor una vez que se publiquen en este sitio. Es su responsabilidad revisar periódicamente los términos para estar al tanto de cualquier modificación.
                </Typography>

                <Typography variant="h5" gutterBottom>3. Uso Permitido</Typography>
                <Typography variant="body1" paragraph>
                  Usted se compromete a utilizar este sitio solo con fines legales y de manera que no infrinja los derechos de otros. No podrá utilizar este sitio de ninguna manera que pueda dañar, deshabilitar, sobrecargar o perjudicar el mismo, ni utilizarlo para realizar actividades fraudulentas, engañosas o malintencionadas.
                </Typography>

                <Typography variant="h5" gutterBottom>4. Autorización para Ofertar Ahorros Energéticos</Typography>
                <Typography variant="body1" paragraph>
                  Al utilizar esta plataforma, el propietario de los ahorros energéticos autoriza expresamente a IT a ofertar, exhibir y promocionar sus productos a través del sitio. Esta autorización incluye el derecho de IT a utilizar imágenes, descripciones y cualquier otro contenido proporcionado por el propietario para la promoción de los ahorros energéticos. El propietario garantiza que tiene todos los derechos necesarios para otorgar esta autorización.
                </Typography>

                <Typography variant="h5" gutterBottom>5. Veracidad de la Información Proporcionada</Typography>
                <Typography variant="body1" paragraph>
                  Los usuarios del sitio se comprometen a proporcionar información veraz, precisa y completa en cualquier formulario, registro o interacción con el sitio. Cualquier información falsa, incompleta o engañosa proporcionada por el usuario podrá resultar en la suspensión o cancelación de su acceso al sitio sin previo aviso.
                </Typography>

                <Typography variant="h5" gutterBottom>6. Propiedad Intelectual</Typography>
                <Typography variant="body1" paragraph>
                  Todos los contenidos de este sitio, incluidos textos, gráficos, logotipos, imágenes y software, son propiedad de IT o de sus licenciantes y están protegidos por las leyes de derechos de autor y propiedad intelectual. No se permite la reproducción, distribución o modificación de ningún contenido sin el consentimiento previo por escrito de IT.
                </Typography>

                <Typography variant="h5" gutterBottom>7. Limitación de Responsabilidad</Typography>
                <Typography variant="body1" paragraph>
                  En la máxima medida permitida por la ley, IT no será responsable de ningún daño directo, indirecto, incidental, especial, punitivo o consecuente que surja de su acceso o uso del sitio, incluyendo, pero no limitado a, la pérdida de beneficios o ingresos, o la interrupción del negocio.
                </Typography>

                <Typography variant="h5" gutterBottom>8. Enlaces a Sitios de Terceros</Typography>
                <Typography variant="body1" paragraph>
                  Este sitio puede contener enlaces a otros sitios web que no son propiedad ni están controlados por IT. No somos responsables del contenido de dichos sitios y no asumimos ninguna responsabilidad por las prácticas de privacidad de los mismos. Le recomendamos que revise los términos y políticas de privacidad de cualquier sitio web de terceros que visite.
                </Typography>

                <Typography variant="h5" gutterBottom>9. Sanciones por Incumplimiento</Typography>
                <Typography variant="body1" paragraph>
                  En caso de que se descubra que ha proporcionado información falsa, inexacta o engañosa, IT se reserva el derecho de suspender o eliminar su cuenta sin previo aviso. Dependiendo de la gravedad del caso, IT se reserva el derecho de tomar medidas legales adicionales para proteger sus derechos y los de otros usuarios.
                </Typography>

                <Typography variant="h5" gutterBottom>10. Ley Aplicable</Typography>
                <Typography variant="body1" paragraph>
                  Estos Términos de Uso se rigen por las leyes de España. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de Málaga.
                </Typography>


              </Card>
            </Container>
          )}

          {/* ABOUT US */}
          {showAboutUs && (
            <Container sx={{ py: 8 }}>
              <Card sx={{
                p: 4,
                borderRadius: "12px",
                background: "white",
                border: "2px solid rgba(0, 0, 0, 0.2)",
                color: "#000",
                transition: "all 0.3s ease",
                '&:hover': {
                  border: "2px solid #ed6c02",
                  boxShadow: "0 8px 25px rgba(237, 108, 2, 0.3)",
                }
              }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
                  Sobre IT
                </Typography>

                {false && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                        Nuestra Misión
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        Somos una empresa especializada en ingeniería y eficiencia energética,
                        comprometida con el desarrollo de soluciones innovadoras y sostenibles
                        para optimizar recursos y mejorar procesos industriales.
                      </Typography>

                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                        Nuestra Visión
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        Ser referentes en el sector de la ingeniería y eficiencia energética,
                        contribuyendo al desarrollo sostenible mediante tecnologías innovadoras
                        y soluciones personalizadas para nuestros clientes.
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                        Nuestros Valores
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                          Innovación y tecnología
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                          Sostenibilidad ambiental
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                          Calidad y excelencia
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                          Compromiso con el cliente
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                          Transparencia y ética
                        </Typography>
                      </Box>

                      <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: "bold" }}>
                        Experiencia
                      </Typography>
                      <Typography variant="body1">
                        Con años de experiencia en el sector, nuestro equipo de ingenieros
                        y especialistas trabaja para ofrecer soluciones técnicas de alta
                        calidad adaptadas a las necesidades específicas de cada proyecto.
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {false && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: "bold", color: "#ed6c02" }}>
                        Que es ?
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        Un blog, un cuaderno en línea donde comparto documentos transformados en plantillas
                        que  pueden recibir parámetros y adaptarse automáticamente a distintos contextos o usuarios.
                        Con los años he aprendido que el verdadero valor del conocimiento está en compartirlo.

                      </Typography>


                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#ed6c02" }}>
                        Mi Pasión
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                        Después de una vida dedicada a la ingeniería, mantengo viva esta hermosa profesión
                        que me sigue llenando de satisfacción. Cada informe que vaya compartiendo contiene
                        el amor por esta disciplina que ha dado sentido a mi carrera.
                      </Typography>


                    </Grid>

                    <Grid item xs={12} md={6}>

                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#ed6c02" }}>
                        Mi Deseo
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        Mi mayor anhelo es que estos infomres técnicos les sirvan a alguien. Que encuentren aquí no solo herramientas técnicas, sino también
                        la chispa que encienda su propia pasión por crear un mundo más sostenible.
                      </Typography>

                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#ed6c02" }}>
                        Lo que me Guía
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                          💝 Más allá de simplemente "pasar el tiempo". Es una actividad fundamental para mi bienestar integral.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                          🌱 Sembrar y mantener la curiosidad
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                          🔧 Mantener viva la esencia de la ingeniería práctica
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                          🤝 La satisfacción de seguir siendo util
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                          ✨ El placer de seguir aprendiendo
                        </Typography>
                      </Box>



                      {/* Mensaje personal adicional */}
                      <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(237, 108, 2, 0.1)', borderRadius: 2, border: '1px solid rgba(237, 108, 2, 0.3)' }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                          "Los informes técnicos de esta Aplicación Web, incluido su soporte softwate a medida, son el fruto de la experiencia y la curiosidad."
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}


                {true && (


                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, mt: 3, fontWeight: "bold", color: "#007BFF" }}
                      >
                        ¿Qué es?
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        Un espacio en línea donde se comparten informes técnicos 'aplantillados' para recibir parámetros y adaptarse automáticamente
                        a distintos contextos o necesidades.
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: "bold", color: "#007BFF" }}
                      >
                        Pasión
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                      >
                        Este proyecto mantiene viva la pasión por la ingeniería y por el
                        aprendizaje constante. Cada informe técnico refleja el aprecio por una
                        disciplina que continúa inspirando curiosidad.
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: "bold", color: "#007BFF" }}
                      >
                        Propósito
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        El objetivo es que estos materiales resulten útiles y sirvan de
                        inspiración. Que quienes lleguen aquí encuentren no solo
                        herramientas técnicas, sino también la motivación para crear
                        mas informes técnicos.
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2, fontWeight: "bold",
                          color: "#1976d2",

                        }}
                      >
                        Principios que guían este proyecto
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
                          💝 Más que una simple actividad: una forma de bienestar integral.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
                          🌱 Cultivar y mantener la curiosidad.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
                          🔧 Preservar la esencia de la ingeniería práctica.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
                          🤝 Contribuir con soluciones útiles y simples.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
                          ✨ Disfrutar del aprendizaje continuo.
                        </Typography>
                      </Box>

                      {/* Mensaje adicional */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          backgroundColor: "rgba(0, 123, 255, 0.1)",
                          borderRadius: 2,
                          border: "1px solid rgba(0, 123, 255, 0.3)",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontStyle: "italic", textAlign: "center" }}>
                          "Los informes técnicos de esta Aplicación Web, incluido su soporte softwate a medida, son el fruto de la experiencia y la curiosidad."

                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>




                )}
              </Card>
            </Container>
          )}


          {/* CONTACTO */}
          {/* 🤝 Sección de Contacto / Colaboración */}

          {showSEO && (
            <>
              {/* ✅ Bloque SEO mejorado */}
              <Box
                component="section"
                sx={{
                  mt: 6,
                  px: 2,
                  py: 4,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    textAlign: "center",
                    color: "#031dadff",
                    textTransform: "uppercase",
                  }}
                >
                  Informes Técnicos Personalizables en PDF
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    maxWidth: "900px",
                    margin: "0 auto",
                    color: "#333",
                    mb: 3,
                  }}
                >
                  Crea, mejora y distribuye informes técnicos con una herramienta
                  especializada que promueve el acceso abierto al conocimiento.
                </Typography>

                {/* ✅ Palabras clave en formato "tags" SEO */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.2,
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  {[
                    "plantillas técnicas PDF",
                    "documentación técnica automatizada",
                    "energía fotovoltaica",
                    "fichas técnicas profesionales",
                    "documentación editable",
                    "autoconsumo",
                    "ingeniería",
                    "automatización documental",
                    "Certificados de ahorro energético",
                    "creación de PDF",
                    "Estudios Técnicos",
                    "gestión técnica",
                    "modelos de informes",
                    "baterías",
                    "sector industrial",
                    "paneles solares",
                    "Proyectos",
                  ].map((keyword) => (
                    <Box
                      key={keyword}
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.7,
                        backgroundColor: "#031dadff",
                        color: "#fff",
                        fontSize: "0.85rem",
                        borderRadius: "20px",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      }}
                    >
                      {keyword}
                    </Box>
                  ))}
                </Box>
              </Box>


            </>
          )}


          {/* CONTACTO */}
          {/* 🤝 Sección de Contacto / Colaboración */}

          {showContacto && (

            <Box
              component="section"
              id="contacto"
              sx={{
                backgroundColor: "#f9fafc",
                py: 8,
                px: { xs: 2, md: 6 },
                borderTop: "2px solid #031dadff",
                mt: 8,
              }}
            >
              <Container maxWidth="lg">
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 800,
                    mb: 4,
                    color: "#031dadff",
                    textTransform: "uppercase",
                  }}
                >
                  Contacto
                </Typography>

                <Grid container spacing={4} alignItems="flex-start">
                  {/* 📞 Información de Contacto */}
                  <Grid item xs={12} md={5}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {/* <Typography variant="h6" sx={{ fontWeight: 700, color: "#000" }}>
                      Participa en el desarrollo de fichas o pide asistencia técnica
                    </Typography> */}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <PhoneIcon sx={{ color: "#031dadff" }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Teléfono
                          </Typography>
                          <Typography variant="body2">+34 951 73 34 91</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <EmailIcon sx={{ color: "#031dadff" }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Email
                          </Typography>
                          <Typography variant="body2">
                            <Link
                              href="mailto:info@informetecnico.app?subject=Colaboración%20o%20Solicitud%20de%20Metodología"
                              underline="hover"
                              color="primary"
                            >
                              info@informetecnico.app

                            </Link>
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <ScheduleIcon sx={{ color: "#031dadff" }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Horario
                          </Typography>
                          <Typography variant="body2">Lun - Vie: 8:00 - 14:00</Typography>
                        </Box>
                      </Box>

                    </Box>
                  </Grid>

                  {/* 📨 Formulario de Colaboración / Solicitud */}
                  <Grid item xs={12} md={7}>
                    <Box
                      component="form"
                      action="mailto:info@vatiaco.com?subject=Colaboración%20o%20Solicitud%20de%20Metodología"
                      method="POST"
                      encType="text/plain"
                      sx={{
                        backgroundColor: "#fff",
                        p: 4,
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Nombre completo"
                            name="name"
                            required
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            required
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField fullWidth label="Entidad / Empresa" name="organization" />
                        </Grid>

                        {/* Tipo de solicitud */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth required>
                            <InputLabel id="request-type-label">Objeto</InputLabel>
                            <Select
                              labelId="request-type-label"
                              id="request-type"
                              name="request-type"
                              defaultValue=""
                              label="Objeto"
                            >
                              <MenuItem value="">
                                <em>Selecciona una opción</em>
                              </MenuItem>
                              <MenuItem value="contribuir">
                                Contribuir
                              </MenuItem>
                              <MenuItem value="modificar">
                                Modificar
                              </MenuItem>
                              <MenuItem value="asesoria">
                                Asesoría
                              </MenuItem>
                              <MenuItem value="otros">Otros</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Área de interés */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel id="area-label">Área</InputLabel>
                            <Select
                              labelId="area-label"
                              id="area"
                              name="area"
                              defaultValue=""
                              label="Área"
                            >
                              <MenuItem value="">
                                <em>Selecciona un área</em>
                              </MenuItem>
                              <MenuItem value="contratos">Contratos de energía</MenuItem>
                              <MenuItem value="instalaciones">Instalaciones</MenuItem>
                              <MenuItem value="energias-renovables">Energías renovables</MenuItem>
                              <MenuItem value="CAEs">Certificados de ahorro energético</MenuItem>
                              {/* <MenuItem value="software">Automatización documental</MenuItem> */}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Mensaje"
                            name="message"
                            multiline
                            rows={4}
                            placeholder="Describe tu propuesta de colaboración o la metodología que deseas solicitar"
                            required
                          />
                        </Grid>

                        <Grid item xs={12} textAlign="center" mt={2}>
                          <Box
                            component="button"
                            type="submit"
                            sx={{
                              backgroundColor: "#031dadff",
                              color: "#fff",
                              px: 4,
                              py: 1.5,
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: "1rem",
                              cursor: "pointer",
                              transition: "0.3s",
                              "&:hover": {
                                backgroundColor: "#0220a0",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            Enviar
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Container>
            </Box>


          )}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;

