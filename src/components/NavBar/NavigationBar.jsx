import React, { useState, useMemo } from "react";
import {
  AppBar,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  TextField,
  InputAdornment,
  Box,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Iconos
import EmailIcon from '@mui/icons-material/Email';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import InfoIcon from "@mui/icons-material/Info";
import GavelIcon from "@mui/icons-material/Gavel";
import PolicyIcon from "@mui/icons-material/Policy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import Catalogo from "../Catalogo.json";

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ---------------- CONFIG ----------------
  const NAV_HEIGHT = "32px";

  // ---------------- STATE ----------------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState(() => sessionStorage.getItem("searchText") || "");
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});
  const [language, setLanguage] = useState("es");
  const [langAnchorEl, setLangAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);

  const pages = [
    { label: "Inicio", icon: <HomeIcon sx={{ fontSize: 14 }} />, path: "/" },
    { label: "Informes", icon: <NoteAltOutlinedIcon sx={{ fontSize: 14 }} />, isMenu: true },
    { label: "Contacto", icon: <EmailIcon sx={{ fontSize: 14 }} />, path: "/contacto" },
  ];

  const sideMenu = [
    { label: "Términos", path: "/terminos", icon: <GavelIcon sx={{ fontSize: 16 }} /> },
    { label: "Privacidad", path: "/privacidad", icon: <PolicyIcon sx={{ fontSize: 16 }} /> },
    { label: "Sobre ITE", path: "/sobre", icon: <InfoIcon sx={{ fontSize: 16 }} /> },
  ];

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
      setDrawerOpen(false);
      navigate(`/${ficha.grupo}/${ficha.sector}/${ficha.cod}`, { replace: true });
    } catch (err) {
      toast.error("Error al cargar la ficha");
    }
  };

  const formatLabel = (str) => {
    if (!str) return "";
    return str
      .replace(/^[0-9A-Z]{1,3}[._-\s]+/, "") // Quita "01. ", "A-", "01_" al inicio
      .replaceAll("_", " ")                  // Cambia guiones bajos por espacios
      .trim();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ bgcolor: "white", boxShadow: "none", borderBottom: "none", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar
          variant="dense"
          sx={{
            minHeight: `${NAV_HEIGHT} !important`,
            height: NAV_HEIGHT,
            px: { xs: 0.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* IZQUIERDA: Menu + Logo (Desplazados a la derecha con ml: 1) */}
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', zIndex: 2, ml: { xs: 1, sm: 2 } }}>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ color: "black", mr: 0.5, p: 0.2 }}
            >
              {drawerOpen ? <CloseIcon sx={{ fontSize: 16 }} /> : <MenuIcon sx={{ fontSize: 16 }} />}
            </IconButton>

            <Box
              sx={{
                width: 62, height: '100%', bgcolor: "#0066FF",
                display: "flex", flexDirection: "column", justifyContent: "center", px: 0.5, cursor: 'pointer'
              }}
              onClick={() => { navigate("/"); setDrawerOpen(false); }}
            >
              <Typography sx={{ color: "white", fontSize: "9px", fontWeight: 700, lineHeight: 1, textTransform: "uppercase", display: 'flex', justifyContent: 'space-between' }}>
                {"INFORME".split("").map((char, i) => <span key={i}>{char}</span>)}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "11px", fontWeight: 900, lineHeight: 0.9, textTransform: "uppercase", display: 'flex', justifyContent: 'space-between' }}>
                {"TÉCNICO".split("").map((char, i) => <span key={i}>{char}</span>)}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "7px", fontWeight: 500, lineHeight: 1, textTransform: "uppercase", display: 'flex', justifyContent: 'space-between' }}>
                {"ECONÓMICO".split("").map((char, i) => <span key={i}>{char}</span>)}
              </Typography>
            </Box>
          </Box>

          {/* CENTRO: Botón Informes (Móvil) o Menú (Desktop) */}
          {isMobile ? (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}
            >
              <Button
                size="small"
                startIcon={<NoteAltOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={handleOpenMenu}
                sx={{
                  color: "black",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  whiteSpace: 'nowrap',
                  minWidth: 'auto'
                }}
              >
                Informes
              </Button>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", gap: 2, height: '100%' }}>
              {pages.map((item) => (
                <Button
                  key={item.label}
                  startIcon={item.icon}
                  onClick={(e) => (item.isMenu ? handleOpenMenu(e) : navigate(item.path))}
                  sx={{
                    color: "black", fontWeight: 800, fontSize: "0.7rem", textTransform: "none",
                    height: '100%', borderRadius: 0, px: 1,
                    borderBottom: location.pathname === item.path ? "2px solid black" : "2px solid transparent",
                    "&:hover": { bgcolor: "transparent", color: "#0066FF" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* DERECHA: Idioma */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', zIndex: 2, mr: { xs: 0.5, sm: 1 } }}>
            <Button
              size="small"
              onClick={(e) => setLangAnchorEl(e.currentTarget)}
              sx={{ color: "#666", fontWeight: 700, fontSize: "0.65rem", minWidth: 'auto', p: 0.5 }}
            >
              {language.toUpperCase()}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar variant="dense" sx={{ minHeight: NAV_HEIGHT, height: NAV_HEIGHT }} />

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, p: 2, pt: 4 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "#999", ml: 1, fontSize: '0.6rem' }}>Navegación</Typography>
          <List dense>
            {pages.filter(p => !p.isMenu).map((item) => (
              <ListItemButton key={item.label} onClick={() => { navigate(item.path); setDrawerOpen(false); }}>
                <Box sx={{ mr: 1.5, display: 'flex' }}>{item.icon}</Box>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.75rem' }} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography variant="overline" sx={{ fontWeight: 800, color: "#999", ml: 1, fontSize: '0.6rem' }}>Información</Typography>
          <List dense>
            {sideMenu.map((item) => (
              <ListItemButton key={item.label} onClick={() => { navigate(item.path); setDrawerOpen(false); }}>
                <Box sx={{ mr: 1.5, display: 'flex', color: '#555' }}>{item.icon}</Box>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.75rem' }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: { width: isMobile ? '95vw' : 320, maxHeight: "70vh", mt: 0.5, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Buscar..."
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
                {/* Visualización limpia del Grupo */}
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
                      {/* Visualización limpia del Sector */}
                      <ListItemText
                        primary={formatLabel(sector)}
                        primaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItemButton>

                    <Collapse in={openSector[grupo] === sector}>
                      {fichas.map(f => (
                        <ListItemButton key={f.cod} sx={{ pl: 6 }} onClick={() => handleFichaClick(f)}>
                          <DescriptionIcon sx={{ mr: 1, fontSize: 16, color: '#0066FF' }} />
                          {/* El COD se mantiene intacto ya que es el identificador técnico */}
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

      <Menu anchorEl={langAnchorEl} open={Boolean(langAnchorEl)} onClose={() => setLangAnchorEl(null)}>
        <MenuItem sx={{ fontSize: '0.75rem' }} onClick={() => { setLanguage("en"); setLangAnchorEl(null); }}>🇬🇧 English</MenuItem>
        <MenuItem sx={{ fontSize: '0.75rem' }} onClick={() => { setLanguage("es"); setLangAnchorEl(null); }}>🇪🇸 Español</MenuItem>
      </Menu>
    </>
  );
}