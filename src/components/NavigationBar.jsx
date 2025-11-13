import React, { useState, useMemo, useEffect } from "react";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  TextField,
  InputAdornment,
  Typography,
  Box,
  Divider,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PolicyIcon from "@mui/icons-material/Policy";
import InfoIcon from "@mui/icons-material/Info";
import GavelIcon from "@mui/icons-material/Gavel";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { auth } from "./firebase/firebaseConfig.jsx";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Catalogo from "./Catalogo.json";

export default function TopNavBar() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  // --- Estados ---
  const [value, setValue] = useState(0);
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const [searchText, setSearchText] = useState(() => sessionStorage.getItem("searchText") || "");
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});
  const [selectedFicha, setSelectedFicha] = useState(() => {
    const stored = sessionStorage.getItem("selectedFicha");
    return stored ? JSON.parse(stored) : null;
  });
  const [tempSheets, setTempSheets] = useState(() => {
    const storedSheets = sessionStorage.getItem("excelData");
    return storedSheets ? JSON.parse(storedSheets) : {};
  });
  const [fichaVersion, setFichaVersion] = useState(0);

  const menuItems = [
    { label: "Contacto", path: "/Contacto", icon: <ContactMailIcon fontSize="small" /> },
    { label: "Términos de Uso", path: "/Terminos", icon: <GavelIcon fontSize="small" /> },
    { label: "Privacidad", path: "/Privacidad", icon: <PolicyIcon fontSize="small" /> },
    { label: "Sobre IT", path: "/Sobre", icon: <InfoIcon fontSize="small" /> },
  ];

  const pages = [
    { label: "", icon: <HomeIcon />, path: "/Blog" },
    { label: "Docs", icon: <DescriptionIcon />, isMenu: true },
    { label: "", icon: <HelpOutlineIcon />, path: "/ayuda" },
    { label: "Login", icon: <PersonOutlineIcon />, path: "/login" },
  ];

  // --- Normalizar texto ---
  const normalize = (str = "") =>
    str
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // --- Guardar búsqueda ---
  useEffect(() => {
    sessionStorage.setItem("searchText", searchText);
  }, [searchText]);

  // --- Filtrado y agrupamiento ---
  const filteredData = useMemo(() => {
    const normalizedSearch = normalize(searchText);
    return Catalogo.filter((item) => {
      const cod = normalize(item.cod);
      const sector = normalize(item.sector);
      const grupo = normalize(item.grupo);
      return !searchText || cod.includes(normalizedSearch) || sector.includes(normalizedSearch) || grupo.includes(normalizedSearch);
    });
  }, [searchText]);

  const groupedData = useMemo(() => {
    const grouped = {};
    filteredData.forEach((item) => {
      if (!grouped[item.grupo]) grouped[item.grupo] = {};
      if (!grouped[item.grupo][item.sector]) grouped[item.grupo][item.sector] = [];
      grouped[item.grupo][item.sector].push(item);
    });

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
      .reduce((acc, grupo) => {
        const sectores = grouped[grupo];
        const sortedSectores = Object.keys(sectores)
          .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
          .reduce((accSec, sector) => {
            accSec[sector] = [...sectores[sector]].sort((a, b) => a.cod.localeCompare(b.cod, "es", { sensitivity: "base" }));
            return accSec;
          }, {});
        acc[grupo] = sortedSectores;
        return acc;
      }, {});
  }, [filteredData]);

  // --- Toggle grupos y sectores ---
  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group);
    setOpenSector({});
  };
  const toggleSector = (group, sector) => {
    setOpenSector((prev) => ({ ...prev, [group]: prev[group] === sector ? null : sector }));
  };

  // --- Manejar ficha ---
  // --- Manejar ficha ---
  const handleFichaClick = async (ficha) => {
    try {
      setSelectedFicha(ficha);
      sessionStorage.setItem("selectedFicha", JSON.stringify(ficha));

      const filePath = `routers/${ficha.grupo}/${ficha.sector}/${ficha.cod}.xlsx`;
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`No se pudo cargar el archivo: ${filePath}`);
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = workbook.SheetNames.reduce((acc, sheetName) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        acc[sheetName] = sheet.filter((row) => row.some((cell) => cell != null && cell !== ""));
        return acc;
      }, {});
      setTempSheets(sheetsData);
      sessionStorage.setItem("excelData", JSON.stringify(sheetsData));

      setFichaVersion((v) => v + 1);
      setAnchorEl(null);
      setOpenGroup(null);
      setOpenSector({});

      // 👇 Ir primero a /Blog, luego a /doc
      navigate("/Blog");
      setTimeout(() => navigate("/doc"), 200);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar la ficha seleccionada.");
    }
  };


  return (
    <>
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          bgcolor: "white",
          borderBottom: "1px solid #ddd",
          boxShadow: "none",
          zIndex: 1300,
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(e, newValue) => {
            const item = pages[newValue];

            if (item.isMenu) {
              setAnchorEl(e.currentTarget);
            } else {
              setValue(newValue);
              setAnchorEl(null);

              if (item.icon.type === HomeIcon) {
                // Ir al inicio del componente (scroll al top)
                window.scrollTo({ top: 0, behavior: "smooth" });

                // También puedes navegar si quieres resetear ruta
                navigate("/Blog");

                // Cerrar menús abiertos
                setOpenGroup(null);
                setOpenSector({});
              } else if (item.path) {
                navigate(item.path);
              }
            }
          }}
          sx={{ bgcolor: "white" }}
        >

          {pages.map((item, idx) => (
            <BottomNavigationAction key={idx} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </AppBar>

      {/* Menú tipo submenu (reemplazo del Drawer) */}
      {/* Menú tipo submenu (reemplazo del Drawer) */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: "70vh",
            borderRadius: 2,
            bgcolor: "white",
            color: "black",
            border: "1px solid #ddd",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            p: 1,
          },
        }}
      >
        {/* Campo de búsqueda */}
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar documento..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value.toLowerCase())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterAltIcon sx={{ color: "#555" }} />
                </InputAdornment>
              ),
              sx: {
                color: "black",
                backgroundColor: "#fafafa",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#999" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
              },
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        <List dense>
          {Object.entries(groupedData).map(([grupo, sectores]) => (
            <React.Fragment key={grupo}>
              <ListItemButton
                onClick={() => toggleGroup(grupo)}
                sx={{
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                {openGroup === grupo ? (
                  <ArrowDropDownIcon sx={{ color: "#1976d2", mr: 1 }} />
                ) : (
                  <ArrowRightIcon sx={{ color: "#555", mr: 1 }} />
                )}
                <ListItemText
                  primary={grupo.includes("_") ? grupo.split("_").slice(1).join("_").replaceAll("_", " ") : grupo}
                  primaryTypographyProps={{ style: { color: "#222", fontWeight: 500 } }}
                />
              </ListItemButton>

              <Collapse in={openGroup === grupo}>
                {Object.entries(sectores).map(([sector, fichas]) => (
                  <React.Fragment key={sector}>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                      onClick={() => toggleSector(grupo, sector)}
                    >
                      {openSector[grupo] === sector ? (
                        <ArrowDropDownIcon sx={{ color: "#2e7d32", mr: 1 }} />
                      ) : (
                        <ArrowRightIcon sx={{ color: "#555", mr: 1 }} />
                      )}
                      <ListItemText
                        primary={sector.includes("_") ? sector.split("_").slice(1).join("_").replaceAll("_", " ") : sector}


                        primaryTypographyProps={{ style: { color: "#333" } }}
                      />
                    </ListItemButton>

                    <Collapse in={openSector[grupo] === sector}>
                      {fichas.map((ficha) => (
                        <ListItemButton
                          key={ficha.cod}
                          sx={{
                            pl: 8,
                            "&:hover": { backgroundColor: "#f5f5f5" },
                          }}
                          onClick={() => {
                            setAnchorEl(null);
                            handleFichaClick(ficha);
                          }}
                        >
                          <DescriptionIcon sx={{ color: "#ed6c02", mr: 1 }} />
                          <ListItemText
                            primary={ficha.cod.includes("_") ? ficha.cod.split("_").slice(1).join("_").replaceAll("_", " ") : ficha.cod}

                            primaryTypographyProps={{ style: { color: "#333" } }}
                          />
                        </ListItemButton>
                      ))}
                    </Collapse>
                  </React.Fragment>
                ))}
              </Collapse>

              <Divider sx={{ borderColor: "#eee" }} />
            </React.Fragment>
          ))}
        </List>
      </Menu>

      {/* Navbar inferior para menú secundario */}
      <Box sx={{ position: "fixed", bottom: 0, width: "100%", zIndex: 100 }}>
        <BottomNavigation value={activeMenuItem} sx={{ bgcolor: "white", borderTop: "1px solid #ddd" }}>
          {menuItems.map((item, idx) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              onClick={() => {
                if (activeMenuItem === idx) {
                  setActiveMenuItem(null);
                } else {
                  setActiveMenuItem(idx);
                  navigate(item.path);
                }
              }}
            />
          ))}
        </BottomNavigation>
      </Box>
    </>
  );
}
