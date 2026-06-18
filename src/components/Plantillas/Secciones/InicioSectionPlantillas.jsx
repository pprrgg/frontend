import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  Container,
  Typography,
  Stack,
  Chip,
  Menu,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
} from "@mui/material";

// Iconos
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import CloseIcon from "@mui/icons-material/Close";
import SensorsIcon from "@mui/icons-material/Sensors";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from '@mui/icons-material/EditNote';

import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

// Importación del catálogo (ajusta la ruta según tu estructura)
import Catalogo from "../../Catalogo.json";

const InicioSection = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [openVideo, setOpenVideo] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});

  const isMenuOpen = Boolean(anchorEl);

  // ---------------- LÓGICA FILTRADO ----------------
  const normalize = (str = "") =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/_/g, " ").trim();

  const groupedData = useMemo(() => {
    const search = normalize(searchText);
    let filtered = Catalogo.filter((i) =>
      !search || normalize(i.cod).includes(search) || normalize(i.sector).includes(search) || normalize(i.grupo).includes(search)
    );

    const grouped = filtered.reduce((acc, item) => {
      acc[item.grupo] ??= {};
      acc[item.grupo][item.sector] ??= [];
      acc[item.grupo][item.sector].push(item);
      return acc;
    }, {});

    const sortedGrouped = {};
    Object.keys(grouped).sort().forEach(grupo => {
      sortedGrouped[grupo] = {};
      Object.keys(grouped[grupo]).sort().forEach(sector => {
        sortedGrouped[grupo][sector] = grouped[grupo][sector].sort((a, b) =>
          a.cod.localeCompare(b.cod, undefined, { numeric: true, sensitivity: 'base' })
        );
      });
    });
    return sortedGrouped;
  }, [searchText]);

  // ---------------- HANDLERS ----------------
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleFichaClick = async (ficha) => {
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
      handleCloseMenu();
      navigate(`/${ficha.grupo}/${ficha.sector}/${ficha.cod}`, { replace: true });
    } catch (err) {
      toast.error("Error al cargar la ficha");
    }
  };

  const formatLabel = (str) => {
    if (!str) return "";
    return str.replace(/^[0-9A-Z]{1,3}[._-\s]+/, "").replaceAll("_", " ").trim();
  };

  // ESTILO ULTRA COMPACTO
  const chipStyle = {
    fontWeight: 900,
    height: 14,
    fontSize: '0.45rem',
    borderRadius: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    "& .MuiChip-label": { px: 0.5 },
    "& .MuiChip-icon": { fontSize: '0.6rem', color: 'inherit', ml: 0.2, mr: -0.3 },
    "&:hover": { bgcolor: '#283593', transform: 'scale(1.05)' }
  };

  return (
    <>
      <Box
        id="inicio"
        sx={{
          bgcolor: "#ffffff",
          color: "#1a1a1a",
          pb: 0.5,
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          minHeight: "50px"
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            justifyContent="space-between"
            spacing={{ xs: 1, md: 2 }}
          >
            {/* IZQUIERDA: Título y Micro Badges */}


            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{
                py: 2,
                width: '100%',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Typography
                component="h1"
                onClick={handleOpenMenu}
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  fontWeight: 800,
                  color: "#1e293b",
                  cursor: "pointer",
                }}
              >
                Blog técnico{" "}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.2,
                    mx: 0.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "white",
                    fontWeight: 900,
                    boxShadow: "0 4px 12px rgba(37,99,235,.25)",
                  }}
                >
                  interactivo
                </Box>{" "}
                de P.Román
              </Typography>
              {/* <Stack
    direction="row"
    spacing={1}
    sx={{ justifyContent: "center" }}
  >
    {[
      { icon: <PictureAsPdfIcon />, label: "Informes Personalizables en PDF" },
      // { icon: <EditNoteIcon />, label: "Personalizables" },
      // { icon: <SensorsIcon />, label: "en linea" },
    ].map((item, idx) => (
      <Chip
        key={idx}
        size="small"
        icon={React.cloneElement(item.icon, {
          style: { fontSize: '0.8rem', marginRight: '2px' }
        })}
        label={item.label}
        onClick={handleOpenMenu}
        variant="outlined"
        sx={{
          height: 24,
          fontSize: '0.7rem',
          fontWeight: 600,
          borderRadius: '12px',
          borderColor: '#cbd5e1',
          color: '#64748b',
          transition: 'all 0.2s',
          '&:hover': { 
            borderColor: '#3b82f6', 
            color: '#3b82f6',
            bgcolor: '#f1f5f9'
          }
        }}
      />
    ))}
  </Stack> */}
            </Stack>
            {/* DERECHA: Botón Guía */}
            <Button
              variant="text"
              onClick={() => setOpenVideo(true)}
              startIcon={<PlayCircleFilledWhiteIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{
                fontWeight: 800,
                color: "#1a237e",
                fontSize: "0.65rem",
                p: 0,
                minWidth: "auto",
                textDecoration: "underline",
                "&:hover": { bgcolor: "transparent", opacity: 0.8 }
              }}
            >
              Guía
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* --- MENÚ DE INFORMES (El mismo que el del Navbar) --- */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: { width: 320, maxHeight: "70vh", mt: 1, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Buscar informe..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><FilterAltIcon sx={{ fontSize: 16 }} /></InputAdornment>),
              sx: { fontSize: '0.75rem', height: 32 }
            }}
          />
        </Box>
        <Divider />
        <List dense sx={{ py: 0 }}>
          {Object.entries(groupedData).map(([grupo, sectores]) => (
            <React.Fragment key={grupo}>
              <ListItemButton onClick={() => setOpenGroup(openGroup === grupo ? null : grupo)}>
                {openGroup === grupo ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                <ListItemText
                  primary={formatLabel(grupo)}
                  primaryTypographyProps={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize' }}
                />
              </ListItemButton>

              <Collapse in={openGroup === grupo}>
                {Object.entries(sectores).map(([sector, fichas]) => (
                  <React.Fragment key={sector}>
                    <ListItemButton
                      sx={{ pl: 3 }}
                      onClick={() => setOpenSector(p => ({ ...p, [grupo]: p[grupo] === sector ? null : sector }))}
                    >
                      {openSector[grupo] === sector ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                      <ListItemText
                        primary={formatLabel(sector)}
                        primaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItemButton>

                    <Collapse in={openSector[grupo] === sector}>
                      {fichas.map(f => (
                        <ListItemButton key={f.cod} sx={{ pl: 6 }} onClick={() => handleFichaClick(f)}>
                          <DescriptionIcon sx={{ mr: 1, fontSize: 16, color: '#0066FF' }} />
                          <ListItemText
                            primary={f.cod.replaceAll("_", " ")}
                            primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
                          />
                        </ListItemButton>
                      ))}
                    </Collapse>
                  </React.Fragment>
                ))}
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Menu>

      {/* MODAL DEL VIDEO */}
      <Dialog
        fullScreen
        open={openVideo}
        onClose={() => setOpenVideo(false)}
        PaperProps={{ sx: { backgroundColor: "rgba(0,0,0,0.95)" } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setOpenVideo(false)} sx={{ color: "white" }}>
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
          <video
            src="video/1.mp4"
            controls
            autoPlay
            style={{ maxWidth: "95vw", maxHeight: "80vh", borderRadius: "4px" }}
          />
        </Box>
      </Dialog>
    </>
  );
};

export default InicioSection;