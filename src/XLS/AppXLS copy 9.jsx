import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box, Tabs, Tab, Fab, Tooltip, Badge, Typography, TextField, IconButton,
  MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider, CircularProgress, Menu, InputAdornment, List, ListItemButton, ListItemText, Collapse
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import {
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  FileDownload as FileDownloadIcon
} from "@mui/icons-material";


// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EngineeringIcon from '@mui/icons-material/Engineering'; // Para Instalación
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Para Operación
import SavingsIcon from '@mui/icons-material/Savings'; // Para Ingresos


import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

// Componentes Externos (Asumidos en tu estructura)
import AppFV from "./XLShojas/FV/AppFV";
import { PdfViewerContent } from "./XLShojas/PDF/AppPDF";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import SolarPowerIcon from '@mui/icons-material/SolarPower'; // Opción principal
import DesignServicesIcon from '@mui/icons-material/DesignServices'; // Opción alternativa (regla y lápiz)

import BoltIcon from '@mui/icons-material/Bolt'; // El rayo representa energía/consumo
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter'; // Muy específico para medición de consumo
import InsightsIcon from '@mui/icons-material/Insights'; // Para análisis de consumo
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
// 1. IMPORTACIONES (Asegúrate de tener solo una de cada)
import ReceiptIcon from '@mui/icons-material/Receipt'; // Para Operación
import TuneIcon from '@mui/icons-material/Tune';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import FolderIcon from '@mui/icons-material/Folder';
import EuroIcon from '@mui/icons-material/Euro';

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LabelIcon from "@mui/icons-material/Label"; // Icono para categorías

// import FolderOpenIcon from "@mui/icons-material/FolderOpen";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DescriptionIcon from "@mui/icons-material/Description";

// import {
//   Box,
//   Typography,
//   IconButton,
//   Tooltip,
//   Tabs,
//   Tab,
//   FormControl,
//   Select,
//   MenuItem,
//   useTheme,
//   useMediaQuery,
//   Menu,
//   TextField,
//   InputAdornment,
//   Divider,
//   List,
//   ListItemButton,
//   ListItemText,
//   Collapse
// } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";
// import FolderOpenIcon from "@mui/icons-material/FolderOpen";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import FilterAltIcon from "@mui/icons-material/FilterAlt";
// import ArrowRightIcon from "@mui/icons-material/ArrowRight";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import DescriptionIcon from "@mui/icons-material/Description";
// import * as XLSX from "xlsx";
// import { toast } from "react-toastify";

// Importar el catálogo
import Catalogo from "../components/Catalogo.json";


// ==========================================
// 1. CONFIGURACIÓN Y UTILIDADES
// ==========================================
const CONFIG = {
  IGNORE_DIRTY_SHEETS: ["PDF"],
  HIDE_SAVE_BUTTON_SHEETS: ["PDF"],
  SHEET_COMPONENTS: {
    Diseño_FV: AppFV,
    PDF: PdfViewerContent,
  },
};

const Utils = {
  isNumeric: (val) => val !== "" && !isNaN(val) && isFinite(val),
  // Cambio de ! por @ para identificar strings editables
  isEditable: (val) => typeof val === "string" && val.startsWith("@"),
  // Ajustamos el selector para que ignore los que empiezan con @
  isSelector: (val) => typeof val === "string" && val.includes(";") && !val.startsWith("@"),
  isDistribution: (val) => typeof val === "string" && val.trim().startsWith("[") && val.trim().endsWith("]"),
  isUpperSheet: (name) => name && name === name.toUpperCase(),

  getColumnWidths: (data) => {
    if (!data?.length) return [];
    const cols = Math.max(...data.map((r) => r?.length || 0));
    const widths = Array(cols).fill(80);
    for (let c = 0; c < cols; c++) {
      let max = 4;
      data.forEach((row) => {
        const text = String(row?.[c] ?? "");
        if (text.length > max) max = text.length;
      });
      widths[c] = Math.min(Math.max(max * 7, 60), 110);
    }
    return widths;
  }
};

// ==========================================
// 2. COMPONENTES DE APOYO (UI)
// ==========================================

const DistributionBarChart = ({ value, onChange, width }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);
  const stateRef = useRef({ y: null, val: null, max: null });

  const data = useMemo(() => {
    try { return JSON.parse(value); } catch (e) { return []; }
  }, [value]);

  const maxValue = useMemo(() => Math.max(...data, 0.01), [data]);

  const handleMove = (clientY) => {
    if (isDragging === null || !stateRef.current.max) return;
    const rect = containerRef.current.getBoundingClientRect();
    const chartHeight = rect.height - 40;
    const deltaValue = ((stateRef.current.y - clientY) / chartHeight) * stateRef.current.max;
    let newValue = Math.max(0, Math.min(1, stateRef.current.val + deltaValue));
    const remaining = 1 - newValue;
    const othersSum = data.reduce((acc, v, i) => i !== isDragging ? acc + v : acc, 0);
    const updated = data.map((v, i) => {
      if (i === isDragging) return newValue;
      return othersSum <= 1e-6 ? remaining / (data.length - 1) : (v / othersSum) * remaining;
    });
    onChange(`[${updated.map(v => Math.max(0, v).toFixed(3)).join(",")}]`);
  };

  useEffect(() => {
    const move = (e) => handleMove(e.clientY || e.touches?.[0].clientY);
    const stop = () => { setIsDragging(null); stateRef.current.max = null; };
    if (isDragging !== null) {
      window.addEventListener("mousemove", move); window.addEventListener("mouseup", stop);
      window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", stop);
    }
    return () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", stop);
    };
  }, [isDragging, data]);

  // CONFIGURACIÓN DE ESTILO ESTRECHO
  const BAR_MAX_WIDTH = "10px"; // Límite de ancho para que sigan siendo estrechas
  const GAP = "2px";

  return (
    <Box ref={containerRef} sx={{
      width: "100%", // Ocupa todo el ancho disponible del Modal
      height: 180,
      display: "flex",
      flexDirection: "column",
      bgcolor: "#fff",
      p: "12px",
      touchAction: "none"
    }}>
      {/* Contenedor de Barras */}
      <Box sx={{
        flex: 1,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between", // Distribuye las barras a lo ancho
        gap: GAP,
        mb: "6px"
      }}>
        {data.map((val, i) => (
          <Tooltip key={i} title={`${(val * 100).toFixed(2)}%`} arrow>
            <Box
              onMouseDown={(e) => { setIsDragging(i); stateRef.current = { y: e.clientY, val: data[i], max: maxValue }; }}
              onTouchStart={(e) => { setIsDragging(i); stateRef.current = { y: e.touches[0].clientY, val: data[i], max: maxValue }; }}
              sx={{
                flex: 1, // Hace que crezcan equitativamente
                maxWidth: BAR_MAX_WIDTH, // Pero les pone un techo para que sean estrechas
                height: `${(val / maxValue) * 100}%`,
                bgcolor: i === isDragging ? "#ff9800" : (i === 0 ? "#1976d2" : "#42a5f5"),
                borderRadius: "1px 1px 0 0",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "height 0.1s ease",
                cursor: "ns-resize",
                "&:hover": { opacity: 0.8 }
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Etiquetas Inferiores */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: GAP,
        borderTop: "1px solid #eee",
        pt: "4px"
      }}>
        {data.map((_, i) => (
          <Typography key={i} sx={{
            flex: 1,
            maxWidth: BAR_MAX_WIDTH,
            fontSize: "0.6rem",
            textAlign: "center",
            color: "#999",
            fontWeight: 600
          }}>
            {i + 1}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};


const DistributionPreview = ({ value, onClick }) => {
  const data = useMemo(() => {
    try { return JSON.parse(value); } catch (e) { return []; }
  }, [value]);

  const maxValue = useMemo(() => Math.max(...data, 0.01), [data]);

  // AJUSTES PARA MINIGRAFICO MÁS ANCHO Y VISIBLE
  const barWidth = 3.5; // Aumentado de 1.5 a 4px para que cada barra sea legible
  const gap = 0.15;    // Aumentado de 0.5 a 1.5px para separar las barras
  const totalWidth = data.length * (barWidth + gap) + 8; // Cálculo dinámico del contenedor

  return (
    <div
      onClick={onClick}
      style={{
        width: `${totalWidth}px`, // Ahora tiene un cuerpo más definido
        height: "22px",           // Ligeramente más alto para mejor visualización
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: `${gap}px`,
        cursor: "pointer",
        padding: "3px 6px",
        backgroundColor: "rgba(0,0,0,0.06)", // Un poco más oscuro para que resalten los azules
        borderRadius: "4px",
        border: "1px solid rgba(0,0,0,0.1)",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.1)"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)"}
    >
      {data.map((val, i) => (
        <div
          key={i}
          style={{
            width: `${barWidth}px`,
            flexShrink: 0,
            // Ajuste de altura mínima al 20% para que las barras de valor 0 sean visibles
            height: `${Math.max((val / maxValue) * 100, 20)}%`,
            backgroundColor: i === 0 ? "#1976d2" : "#64b5f6", // Azul un poco más intenso
            borderRadius: "1px" // Bordes suavizados
          }}
        />
      ))}
    </div>
  );
};
const CellRenderer = ({ value, columnWidth, sheetName, rowIndex, colIndex, onUpdate }) => {
  const [open, setOpen] = useState(false);

  // Usamos el ancho que nos pasa la tabla para no desalinear los bordes
  const cellStyle = {
    width: columnWidth || 120,
    minWidth: columnWidth || 120,
    maxWidth: columnWidth || 120,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // Mantiene el minigráfico en el centro de la columna
    borderRight: "1px solid #eee",
    boxSizing: "border-box",
    margin: 0,
    padding: 0
  };

  const condensedStyle = {
    fontSize: "0.7rem",
    padding: "4px 8px",
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center"
  };

  if (Utils.isDistribution(value)) {
    return (
      <div style={cellStyle}>
        <DistributionPreview value={value} onClick={() => setOpen(true)} />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <div style={{ padding: "20px" }}>
            <h4 style={{ fontSize: "0.9rem", margin: "0 0 15px 0" }}>Editar Distribución</h4>
            <DistributionBarChart
              value={value}
              width="100%"
              onChange={(val) => onUpdate(sheetName, rowIndex, colIndex, val)}
            />
          </div>
        </Dialog>
      </div>
    );
  }

  // Los selectores e inputs también usan cellStyle para mantener la cuadrícula
  if (Utils.isSelector(value)) {
    const options = value.split(";");
    return (
      <div style={cellStyle}>
        <select
          value={options[0]}
          onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
          style={{ ...condensedStyle, backgroundColor: "#e3f2fd", appearance: "none" }}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
    );
  }

  const editable = Utils.isNumeric(value) || Utils.isEditable(value);
  const displayValue = Utils.isEditable(value)
    ? value.slice(1).replace(/_/g, " ")
    : (value ?? "").toString().replace(/_/g, " ");

  return (
    <div style={cellStyle}>
      <input
        value={displayValue}
        onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
        disabled={!editable}
        style={{
          ...condensedStyle,
          textAlign: editable ? "right" : "left",
          backgroundColor: Utils.isEditable(value) ? "#fff3cd" : editable ? "#fff" : "#f9f9f9",
        }}
      />
    </div>
  );
};

const ProjectFormDialog = ({ open, onClose, pdfData, onSaveAll }) => {
  const [localFormData, setLocalFormData] = useState([]);
  useEffect(() => {
    if (open && pdfData) {
      setLocalFormData(JSON.parse(JSON.stringify(pdfData)));
    }
  }, [open, pdfData]);

  const sections = useMemo(() => {
    if (!localFormData || localFormData.length === 0) return [];
    return Array.from(new Set(
      localFormData.slice(1)
        .filter(r => r && r[0] && String(r[0]).includes("_"))
        .map(r => String(r[0]).split("_")[0])
    ));
  }, [localFormData]);

  const handleChange = (key, value) => {
    setLocalFormData(prev => prev.map(row => (row[0] === key ? [key, value] : row)));
  };

  const handleConfirm = () => {
    onSaveAll(localFormData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 90000 }}>
      <DialogTitle sx={{ fontWeight: 800, bgcolor: "#f5f5f5" }}>Configuración del Proyecto</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
          {sections.map(sec => (
            <Box key={sec}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 900 }}>{sec.replace(/_/g, ' ')}</Typography>
              <Divider sx={{ mb: 2 }} />
              {localFormData.filter(r => r?.[0]?.startsWith(`${sec}_`)).map(row => (
                <TextField
                  key={row[0]}
                  label={row[0].split("_").slice(1).join(" ")}
                  fullWidth size="small"
                  value={row[1] || ""}
                  onChange={(e) => handleChange(row[0], e.target.value)}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
              ))}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};


const Toolbar = ({
  projectName,
  onOpenFile,
  onOpenForm,
  onExport,
  sheetNames,
  activeTab,
  onTabChangeAttempt,
  dirtySheets
}) => {
  const theme = useTheme();
  const { cod } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // --- ESTADOS PARA EL MENÚ DE INFORMES ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});

  const isMenuOpen = Boolean(anchorEl);

  // --- LÓGICA DE FILTRADO Y DATOS ---
  const getUrlData = () => {
    const hash = window.location.hash.replace('#', '');
    try {
      const decodedHash = decodeURIComponent(hash);
      const segments = decodedHash.split('/').filter(Boolean);
      return {
        grupo: segments[0] || "",
        sector: segments[1] || "",
        cod: segments[2] || ""
      };
    } catch (e) {
      return { grupo: "", sector: "", cod: "" };
    }
  };

  const urlData = getUrlData();
  const sessionData = sessionStorage.getItem("selectedFicha");
  const sessionFicha = sessionData ? JSON.parse(sessionData) : {};

  const finalGrupo = urlData.grupo || sessionFicha.grupo || "---";
  const finalSector = urlData.sector || sessionFicha.sector || "---";
  const finalCod = urlData.cod || cod || sessionFicha.cod || "---";

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

  // --- MANEJADORES ---
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
      navigate(`/${ficha.grupo}/${ficha.sector}/${ficha.cod}`);
    } catch (err) {
      toast.error("Error al cargar la ficha");
    }
  };

  const formatHeader = (str) => {
    if (!str || str === "---") return str;
    const decodedStr = decodeURIComponent(str);
    const parts = decodedStr.split('_');
    return (parts.length > 1 ? parts.slice(1) : parts).join(' ').toUpperCase();
  };

  const isDirty = (name) => {
    const ignoreList = (window.CONFIG && window.CONFIG.IGNORE_DIRTY_SHEETS) || [];
    return !ignoreList.includes(name) && dirtySheets[name];
  };

  // --- ESTILOS ---
  const baseTextStyle = {
    display: "block",
    transform: "scaleX(0.82)",
    transformOrigin: "center",
    textTransform: "uppercase",
    fontStyle: "normal",
    cursor: "pointer", // Cambiado a pointer para indicar que es clicable
    "&:hover": { color: theme.palette.primary.main }
  };

  return (
    <Box sx={{
      position: "fixed", top: 32, left: 0, right: 0, // Ajustado a 32 por el NavHeight previo
      bgcolor: "white", zIndex: 1100, borderBottom: 1, borderColor: "divider",
      display: "flex", flexDirection: "column", alignItems: "center",
      minHeight: 65, pt: 0.5, pb: 0, width: "100%", boxSizing: "border-box"
    }}>

      {/* 1. Header Info (ZONA CLICABLE) */}
      <Box
        onClick={handleOpenMenu}
        sx={{
          width: "100%", textAlign: "center", display: "flex",
          flexDirection: "column", mb: 0.2, px: 2, cursor: 'pointer'
        }}
      >
        <Typography sx={{ ...baseTextStyle, fontSize: "0.76rem", color: "text.secondary", fontWeight: 900, opacity: 0.96, lineHeight: 1.7 }}>
          <span>{formatHeader(finalGrupo)}</span>
          <Box component="span" sx={{ color: "#eee", mx: 0.3, fontWeight: 200 }}>|</Box>
          <span>{formatHeader(finalSector)}</span>
        </Typography>
        <Typography sx={{ ...baseTextStyle, fontSize: "0.76rem", color: "text.secondary", fontWeight: 900, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 0.98 }}>
          {finalCod !== "---" ? decodeURIComponent(finalCod).replace(/_/g, ' ').toUpperCase() : "---"}
        </Typography>
      </Box>

      {/* 2. Controles */}
      <Box sx={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        px: 1, height: 38, boxSizing: "border-box", gap: isMobile ? 0.5 : 1
      }}>
        <Box sx={{ flexShrink: 0 }}>
          <Tooltip title="Abrir proyecto" arrow>
            <IconButton onClick={onOpenFile} size="small" color="primary" sx={{ p: 0.5 }}>
              <FolderOpenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Tooltip title="Configuración del Proyecto" arrow>
          <Box sx={{ position: "relative", flex: isMobile ? "0 1 40%" : "0 1 150px", minWidth: 0 }}>
            <Typography sx={{ position: "absolute", top: "-3px", left: "6px", bgcolor: "white", px: 0.4, fontSize: "0.35rem", color: "text.secondary", zIndex: 1, fontWeight: 800 }}>
              PROYECTO
            </Typography>
            <Box onClick={onOpenForm} sx={{
              width: "100%", border: "1px solid #e0e0e0", borderRadius: "3px",
              display: "flex", alignItems: "center", px: 0.5, py: 0.2, cursor: "pointer",
              minHeight: 24, boxSizing: "border-box"
            }}>
              <Typography noWrap sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#333", width: "100%" }}>
                {projectName || "---"}
              </Typography>
            </Box>
          </Box>
        </Tooltip>

        <Box sx={{ flex: isMobile ? "0 1 40%" : "0 1 auto", display: "flex", alignItems: "center", minWidth: 0 }}>
          {isMobile ? (
            <FormControl size="small" fullWidth>
              <Select
                value={activeTab}
                onChange={(e) => onTabChangeAttempt(e.target.value)}
                sx={{ height: 24, fontSize: "0.6rem", fontWeight: 900, '& .MuiSelect-select': { py: 0, px: 1 } }}
              >
                {sheetNames.map((name, i) => (
                  <MenuItem key={i} value={i} sx={{ fontSize: "0.65rem", textTransform: "uppercase" }}>
                    {isDirty(name) ? `● ${name.replace(/_/g, ' ')}` : name.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Tabs
              value={activeTab}
              onChange={(e, v) => onTabChangeAttempt(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 32, '& .MuiTab-root': { fontWeight: 900, fontSize: '0.62rem', textTransform: 'uppercase', minWidth: 'auto', px: 1.5, py: 0 } }}
            >
              {sheetNames.map((name, i) => (
                <Tab key={i} label={name.replace(/_/g, ' ')} sx={{ color: isDirty(name) ? "#d32f2f" : "inherit" }} />
              ))}
            </Tabs>
          )}
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Tooltip title="Exportar proyecto" arrow>
            <IconButton onClick={onExport} size="small" color="success" sx={{ p: 0.5 }}>
              <FileDownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* --- EL MENÚ DESPLEGABLE --- */}
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
                  primary={grupo.replace(/^[0-9A-Z]{1,3}[._-\s]+/, "").replace(/_/g, " ")}
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
                        primary={sector.replace(/^[0-9A-Z]{1,3}[._-\s]+/, "").replace(/_/g, " ")}
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
    </Box>
  );
};

const ExcelUploaderStorage = () => {
  const { sector, grupo, cod } = useParams();
  const [excelData, setExcelData] = useState({});
  const [activeTab, setActiveTab] = useState(() => Number(sessionStorage.getItem("activeTabIdx") || 0));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- Lógica de Expansión Única ---
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // --- Lógica de Cambios Pendientes ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [dirtySheets, setDirtySheets] = useState({});
  const lastSavedDataRef = useRef({});
  const fileInputRef = useRef(null);

  const sheetNames = useMemo(() => Object.keys(excelData), [excelData]);
  const currentSheet = sheetNames[activeTab];

  const toggleChapter = (chapterName) => {
    setExpandedChapter(prev => (prev === chapterName ? null : chapterName));
    setExpandedCategory(null);
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategory(prev => (prev === categoryName ? null : categoryName));
  };

  useEffect(() => {
    setExpandedChapter(null);
    setExpandedCategory(null);
  }, [currentSheet]);

  const groupedInfo = useMemo(() => {
    const rows = excelData[currentSheet] || [];
    if (rows.length === 0) return { hasChapters: false, header: null, groups: {}, hiddenIndices: [] };

    const header = rows[0];
    const normalize = (val) => String(val || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const chapterIdx = header.findIndex(cell => normalize(cell) === "capitulo");
    const categoryIdx = header.findIndex(cell => normalize(cell) === "categoria");

    // Guardamos los índices que queremos ocultar de la vista de tabla
    const hiddenIndices = [chapterIdx, categoryIdx].filter(i => i !== -1);

    if (chapterIdx === -1) return { hasChapters: false, header, groups: {}, hiddenIndices };

    const groups = {};

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const chapterName = row[chapterIdx] || "GENERAL";
      const categoryName = categoryIdx !== -1 ? (row[categoryIdx] || "SIN CATEGORÍA") : "GENERAL";

      if (!groups[chapterName]) groups[chapterName] = {};
      if (!groups[chapterName][categoryName]) groups[chapterName][categoryName] = [];

      groups[chapterName][categoryName].push({ originalIdx: i, row });
    }

    return { hasChapters: true, header, groups, hiddenIndices };
  }, [excelData, currentSheet]);

  const projectName = useMemo(() => {
    return excelData["PDF"]?.find(r => r?.[0] === "Documento_nombre")?.[1] || sessionStorage.getItem("projectName") || "sin nombre";
  }, [excelData]);

  const broadcastAndSave = (newData) => {
    const val = JSON.stringify(newData);
    sessionStorage.setItem("excelData", val);
    window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: val }));
    Object.keys(newData).forEach(k => {
      lastSavedDataRef.current[k] = JSON.stringify(newData[k]);
    });
    setDirtySheets({});
  };

  useEffect(() => {
    const sync = (e) => {
      if (e.key === 'excelData' && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setExcelData(parsed);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const init = async () => {
      const key = `${sector}-${grupo}-${cod}`;
      const saved = sessionStorage.getItem("excelData");
      const savedKey = sessionStorage.getItem("excelKey");

      if (Object.keys(excelData).length > 0 && savedKey === key) return;

      if (savedKey === key && saved) {
        try {
          const parsed = JSON.parse(saved);
          setExcelData(parsed);
          Object.keys(parsed).forEach(k => { lastSavedDataRef.current[k] = JSON.stringify(parsed[k]); });
          return;
        } catch (e) { console.error(e); }
      }

      try {
        const res = await fetch(`/routers/${sector || "A0_Sistema_FV"}/${grupo || "A61_Conectado_a_red"}/${cod || "FV01_Autoconsumo_sin_excedentes"}.xlsx`);
        if (!res.ok) throw new Error("Archivo no encontrado");
        const buffer = await res.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const p = {};
        wb.SheetNames.forEach((n) => {
          p[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "" });
          lastSavedDataRef.current[n] = JSON.stringify(p[n]);
        });
        setExcelData(p);
        broadcastAndSave(p);
        sessionStorage.setItem("excelKey", key);
      } catch (e) { toast.error("Error al cargar archivo inicial"); }
    };
    init();
  }, [sector, grupo, cod]);

  useEffect(() => {
    if (!currentSheet || CONFIG.IGNORE_DIRTY_SHEETS.includes(currentSheet)) return;
    const isDirty = JSON.stringify(excelData[currentSheet]) !== lastSavedDataRef.current[currentSheet];
    setDirtySheets(prev => ({ ...prev, [currentSheet]: isDirty }));
  }, [excelData, currentSheet]);

  const confirmSave = () => {
    const sessionRaw = sessionStorage.getItem("excelData");
    let dataToSave = excelData;
    if (sessionRaw) {
      try {
        const sessionParsed = JSON.parse(sessionRaw);
        if (sessionParsed && sessionParsed["Diseño_FV"]) {
          dataToSave = { ...excelData, "Diseño_FV": sessionParsed["Diseño_FV"] };
        }
      } catch (e) { console.error("Error al sincronizar antes de guardar", e); }
    }
    broadcastAndSave(dataToSave);
    setExcelData(dataToSave);
    if (pendingTab !== null) setActiveTab(pendingTab);
    setIsConfirmOpen(false);
    setPendingTab(null);
    toast.success("Cambios guardados correctamente");
  };

  const updateCell = (sheet, r, c, val) => {
    setExcelData(prev => {
      const newSheetData = prev[sheet].map((row, idx) => {
        if (idx !== r) return row;
        const newRow = [...row];
        if (Utils.isSelector(newRow[c])) {
          const opts = newRow[c].split(";");
          newRow[c] = [val, ...opts.filter(o => o !== val)].join(";");
        } else {
          const isExcl = Utils.isEditable(newRow[c]);
          if (!isExcl && !Utils.isDistribution(newRow[c])) {
            const numRegex = /^-?\d*\.?\d*$/;
            if (!numRegex.test(val)) return row;
          }
          newRow[c] = isExcl ? `@${val}` : val;
        }
        return newRow;
      });
      return { ...prev, [sheet]: newSheetData };
    });
  };

  const deleteRow = (sheet, rowIndex) => {
    setExcelData(prev => {
      const currentSheetData = prev[sheet];
      if (!currentSheetData || currentSheetData.length <= 1) return prev;
      const newSheetData = [...currentSheetData];
      newSheetData.splice(rowIndex, 1);
      return { ...prev, [sheet]: newSheetData };
    });
  };

  const duplicateRow = (sheet, rowIndex) => {
    setExcelData(prev => {
      const newData = [...prev[sheet]];
      const rowToCopy = [...newData[rowIndex]];
      newData.splice(rowIndex + 1, 0, rowToCopy);
      return { ...prev, [sheet]: newData };
    });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const p = {};
        wb.SheetNames.forEach(n => {
          p[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "" });
          lastSavedDataRef.current[n] = JSON.stringify(p[n]);
        });
        setExcelData(p); broadcastAndSave(p); toast.success("Importado");
      } catch (e) { toast.error("Error al procesar archivo"); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    const hashSegments = window.location.hash.replace('#', '').split('/').filter(Boolean);
    const gP = hashSegments[0]?.split("_")[0] || "G0";
    const sP = hashSegments[1]?.split("_")[0] || "S0";
    const cP = hashSegments[2]?.split("_")[0] || "PROY";
    const wb = XLSX.utils.book_new();
    Object.entries(excelData).forEach(([n, d]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(d), n));
    XLSX.writeFile(wb, `ITE_${gP}_${sP}_${cP}_${projectName}.xlsx`);
  };

  const dynamicColumnWidths = useMemo(() => {
    const rows = excelData[currentSheet] || [];
    if (rows.length <= 1) return {};

    const widths = {};

    for (let i = 1; i < rows.length; i++) {
      rows[i].forEach((cell, c) => {
        let estimatedWidth;

        if (Utils.isDistribution(cell)) {
          estimatedWidth = 120;
        } else {
          const text = String(cell || "");
          const contentLength = text.length;

          // --- LÓGICA DE LIMITACIÓN ---
          if (contentLength <= 3) {
            estimatedWidth = 45;
          } else if (contentLength <= 10) {
            estimatedWidth = 85;
          } else {
            // Calculamos el ancho pero ponemos un TOPE (ej. 300px)
            // para que los campos editables no crezcan infinitamente
            const calculated = contentLength * 7.5;
            estimatedWidth = Math.min(Math.max(calculated, 100), 300);
          }
        }

        if (!widths[c] || estimatedWidth > widths[c]) {
          widths[c] = estimatedWidth;
        }
      });
    }
    return widths;
  }, [excelData, currentSheet]);




  const renderRow = (row, r, isHeader = false) => {
    if (!row) return null;
    const isUpper = Utils.isUpperSheet(currentSheet);
    const totalRows = (excelData[currentSheet] || []).length;

    return (
      <Box key={`${currentSheet}-${r}`} sx={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee" }}>
        {isUpper && (
          <Box sx={{
            display: "flex", gap: 0.5, px: 1, minWidth: 65,
            borderRight: "1px solid #eee", bgcolor: isHeader ? "#eceff1" : "transparent"
          }}>
            {!isHeader && (
              <>
                <IconButton size="small" onClick={() => duplicateRow(currentSheet, r)}>
                  <ContentCopyIcon sx={{ fontSize: 14, color: "primary.main" }} />
                </IconButton>
                {totalRows > 1 && (
                  <IconButton size="small" onClick={() => deleteRow(currentSheet, r)}>
                    <DeleteIcon sx={{ fontSize: 14, color: "error.main" }} />
                  </IconButton>
                )}
              </>
            )}
          </Box>
        )}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {row.map((cell, c) => {
            // --- FILTRADO DE COLUMNAS OCULTAS ---
            if (groupedInfo.hiddenIndices.includes(c)) return null;

            return (
              <CellRenderer
                key={`${r}-${c}`}
                value={cell}
                // Usamos el ancho dinámico calculado para esa columna específica
                // Si no hay cálculo (ej. tabla vacía), cae a "auto"
                columnWidth={dynamicColumnWidths[c] ? `${dynamicColumnWidths[c]}px` : "auto"}
                onUpdate={updateCell}
                sheetName={currentSheet}
                rowIndex={r}
                colIndex={c}
              />
            );
          })}
        </Box>
      </Box>
    );
  };

  const hasPendingChanges = !!dirtySheets[currentSheet];


  // 2. CONFIGURACIÓN
  const SHEET_CUSTOMIZATION = {
    "PDF": {
      label: "PDF",
      icon: <PictureAsPdfIcon sx={{ fontSize: 20, color: 'error.main' }} />
    },

    "COSTES_DE_INSTALACION": {
      label: "Costes de Instalación",
      icon: <EngineeringIcon sx={{ fontSize: 20, color: 'warning.main' }} />
    },
    "COSTES_DE_OPERACION": {
      label: "Costes de Operación",
      icon: <BuildCircleIcon sx={{ fontSize: 20, color: 'info.main' }} />
    },
    "INGRESOS": {
      label: "Ingresos",
      icon: <SavingsIcon sx={{ fontSize: 20, color: 'success.main' }} />
    },
    "Diseño_FV": {
      label: "Diseño Fotovoltaico",
      icon: <SolarPowerIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
    },
    "CONSUMO": {
      label: "Consumo",
      icon: <ElectricMeterIcon sx={{ fontSize: 20, color: '#fbc02d' }} />
    },
    "financieros": {
      label: "Parámetros Financieros",
      icon: <EuroIcon sx={{ fontSize: 20, color: 'grey.700' }} />
    },
    "SIMBOLO_EURO": {
      label: "Moneda",
      icon: <EuroIcon sx={{ fontSize: 20, color: 'success.dark' }} />
    }
  };


  useEffect(() => {
    // Si no hay datos agrupados, reseteamos a null
    if (!groupedInfo.hasChapters) {
      setExpandedChapter(null);
      setExpandedCategory(null);
      return;
    }

    // Obtenemos el nombre del primer capítulo
    const firstChapter = Object.keys(groupedInfo.groups)[0];
    if (firstChapter) {
      setExpandedChapter(firstChapter);

      // Obtenemos la primera categoría de ese capítulo
      const firstCategory = Object.keys(groupedInfo.groups[firstChapter])[0];
      if (firstCategory) {
        // El key de categoría que usas en el render es `${chapterName}-${catName}`
        setExpandedCategory(`${firstChapter}-${firstCategory}`);
      }
    }
  }, [currentSheet, groupedInfo.hasChapters]); // Añadimos groupedInfo.hasChapters como dependencia


  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} />

      <Toolbar
        projectName={projectName}
        onOpenFile={() => fileInputRef.current.click()}
        onOpenForm={() => setIsFormOpen(true)}
        onExport={handleExport}
        sheetNames={sheetNames.map(name => {
          // 1. Buscamos la configuración en el diccionario
          const item = SHEET_CUSTOMIZATION[name];

          // 2. Si existe, construimos el componente visual (Icono + Texto)
          if (item) {
            const StyledTab = (
              <Box
                key={name}
                component="span"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 0.5
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Box>
            );

            // 3. El Proxy permite que el Tab use el componente pero crea que es un String
            return new Proxy(StyledTab, {
              get: (target, prop) => {
                if (prop === 'replace') return () => target;
                if (prop === 'toString') return () => item.label; // Usamos el texto del diccionario
                return target[prop];
              }
            });
          }

          // 4. Si la hoja no está en el diccionario, aplicamos el formato simple
          return name.replace(/_/g, " ");
        })}
        activeTab={activeTab}
        onTabChangeAttempt={(index) => {
          if (hasPendingChanges) discardChanges();
          setDirtySheets({});
          setActiveTab(index);
        }}
        dirtySheets={dirtySheets}
      />

      <Box sx={{ height: 60 }} />

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {!excelData[currentSheet] ? (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <CircularProgress size={30} sx={{ mb: 2, color: '#ed6c02' }} />
            <Typography variant="body2" color="textSecondary">Cargando datos...</Typography>
          </Box>
        ) : CONFIG.SHEET_COMPONENTS[currentSheet] ? (
          <Box sx={{ width: "100%" }}>
            {React.createElement(CONFIG.SHEET_COMPONENTS[currentSheet], {
              sheetName: currentSheet, data: excelData[currentSheet], setExcelData, sector, grupo, cod
            })}
          </Box>
        ) : (
          <Box sx={{ maxWidth: "100%", overflowX: "auto", border: "1px solid #ddd", bgcolor: "#fff", borderRadius: 1 }}>
            <Box sx={{ display: "table", margin: "0 auto", minWidth: "100%" }}>
              {renderRow(groupedInfo.header, 0, true)}

              {!groupedInfo.hasChapters ? (
                excelData[currentSheet].slice(1).map((row, r) => renderRow(row, r + 1, false))
              ) : (
                Object.entries(groupedInfo.groups).map(([chapterName, categories]) => {
                  const isChExpanded = expandedChapter === chapterName;
                  const totalItems = Object.values(categories).reduce((acc, cat) => acc + cat.length, 0);

                  return (
                    <Box key={`chapter-${chapterName}`} sx={{ borderBottom: "1px solid #ddd" }}>
                      {/* NIVEL 1: CAPÍTULO */}
                      <Box
                        onClick={() => toggleChapter(chapterName)}
                        sx={{
                          bgcolor: isChExpanded ? "#fef8f5" : "#f5f5f5",
                          p: 0.8, pl: 2, fontWeight: "bold",
                          borderLeft: "5px solid",
                          borderColor: isChExpanded ? "primary.main" : "transparent",
                          color: "primary.main", fontSize: "0.65rem",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: "pointer", userSelect: "none",
                          "&:hover": { bgcolor: "#f0f0f0" }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {isChExpanded ? <FolderOpenIcon sx={{ fontSize: 14 }} /> : <FolderIcon sx={{ fontSize: 14 }} />}
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.65rem" }}>
                            {chapterName.startsWith('@') ? chapterName.substring(1).toUpperCase() : chapterName.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 1, color: "text.secondary", fontSize: "0.6rem" }}>
                            ({totalItems} ítems)
                          </Typography>
                        </Box>
                        {isChExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                      </Box>

                      {/* NIVEL 2: CATEGORÍAS */}
                      {isChExpanded && (
                        <Box sx={{ bgcolor: "#fff" }}>
                          {Object.entries(categories).map(([catName, rows]) => {
                            const catKey = `${chapterName}-${catName}`;
                            const isCatExpanded = expandedCategory === catKey;

                            return (
                              <Box key={catKey} sx={{ borderBottom: "1px solid #f9f9f9" }}>
                                <Box
                                  onClick={() => toggleCategory(catKey)}
                                  sx={{
                                    bgcolor: isCatExpanded ? "#fff9f2" : "#fff",
                                    px: 4, py: 0.6,
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "#fffcf9" }
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {/* Icono de carpeta aplicado también a categorías */}
                                    {isCatExpanded ? (
                                      <FolderOpenIcon sx={{ fontSize: 13, color: "secondary.main" }} />
                                    ) : (
                                      <FolderIcon sx={{ fontSize: 13, color: "#999" }} />
                                    )}

                                    <Typography sx={{
                                      fontSize: "0.6rem",
                                      fontWeight: isCatExpanded ? 700 : 500,
                                      color: isCatExpanded ? "secondary.main" : "#666",
                                      textTransform: "uppercase"
                                    }}>
                                      {catName.startsWith('@') ? catName.substring(1) : catName}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.55rem", color: "#aaa" }}>
                                      ({rows.length})
                                    </Typography>
                                  </Box>
                                  {isCatExpanded ? (
                                    <ExpandLessIcon sx={{ fontSize: 14, color: "#ccc" }} />
                                  ) : (
                                    <ExpandMoreIcon sx={{ fontSize: 14, color: "#ccc" }} />
                                  )}
                                </Box>

                                {/* NIVEL 3: FILAS (DATOS) */}
                                {isCatExpanded && (
                                  <Box sx={{ bgcolor: "#fff" }}>
                                    {rows.map(({ originalIdx, row }) => renderRow(row, originalIdx, false))}
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Botón Flotante de Guardar */}
      <Box sx={{
        position: "fixed", bottom: "10%", right: '10%', zIndex: 9999,
        transition: 'all 0.3s', opacity: hasPendingChanges ? 1 : 0,
        transform: hasPendingChanges ? 'scale(1)' : 'scale(0.5)',
        pointerEvents: hasPendingChanges ? 'auto' : 'none'
      }}>
        <Tooltip title={`Guardar cambios en ${currentSheet}`} arrow placement="top">
          <Fab size="small" onClick={confirmSave} sx={{ bgcolor: "#ed6c02", color: "#fff", "&:hover": { bgcolor: "#e65100" } }}>
            <SaveIcon />
          </Fab>
        </Tooltip>
      </Box>

      <ProjectFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        pdfData={excelData["PDF"] || []}
        onSaveAll={(newPdfData) => {
          const sessionRaw = sessionStorage.getItem("excelData");
          let currentData = sessionRaw ? JSON.parse(sessionRaw) : excelData;
          const updated = { ...currentData, PDF: newPdfData };
          setExcelData(updated);
          broadcastAndSave(updated);
          toast.success("Proyecto actualizado");
        }}
      />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </Box>
  );
};

export default ExcelUploaderStorage;

