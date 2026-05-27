import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box, Tabs, Tab, Fab, Tooltip, Badge, Typography, TextField, IconButton,
  MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider, CircularProgress, Menu, InputAdornment, List, ListItemButton, ListItemText, Collapse, Accordion, AccordionSummary, AccordionDetails

} from "@mui/material";






import { useTheme, useMediaQuery } from "@mui/material";

import {
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  FileDownload as FileDownloadIcon,
  RestartAlt as RestartAltIcon, // Icono de reset
  AddCircleOutline as AddIcon, // Icono para "Nuevo"
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
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Home from '@mui/icons-material/HomeOutlined';
import PictureAsPdfIon from '@mui/icons-material/Dashboard';
import PictureAsPdfIcn from '@mui/icons-material/Home';
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
import MenuIcon from "@mui/icons-material/Menu";

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
  isNumeric: (val) => /^-?\d*\.?\d*$/.test(String(val)),
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

  // Estilos de contenedor para mantener la cuadrícula alineada
  const cellStyle = {
    width: columnWidth || 120,
    minWidth: columnWidth || 120,
    maxWidth: columnWidth || 120,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  // 1. LÓGICA DE DISTRIBUCIÓN (Gráficos de barras)
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

  // 2. LÓGICA DE SELECTOR (Dropdowns con punto y coma)
  if (Utils.isSelector(value)) {
    const options = value.split(";");
    return (
      <div style={cellStyle}>
        <select
          value={options[0]}
          onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
          style={{
            ...condensedStyle,
            backgroundColor: "#e3f2fd",
            appearance: "none",
            cursor: "pointer"
          }}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
    );
  }

  // 3. LÓGICA DE CELDAS EDITABLES (Numéricas y Texto con @)
  const isNumericValue = Utils.isNumeric(value);
  const isExplicitEditable = Utils.isEditable(value);

  // Determinamos si el campo debe ser tratado como editable
  // Incluimos el string vacío para que no se bloquee durante el borrado
  const editable = isNumericValue || isExplicitEditable || value === "";

  // Formateamos el valor para mostrarlo (quitando el @ si existe)
  const displayValue = isExplicitEditable
    ? value.slice(1).replace(/_/g, " ")
    : (value ?? "").toString().replace(/_/g, " ");

  return (
    <div style={cellStyle}>
      <input
        // TRUCO VISUAL: Si el valor interno es "0" y es un campo numérico, 
        // lo mostramos vacío para facilitar la escritura de un nuevo número.
        value={displayValue}
        placeholder={isNumericValue ? "0" : ""}
        onChange={(e) => {
          const newVal = e.target.value;

          // Si es un campo numérico (no tiene @) y el usuario borra todo:
          if (!isExplicitEditable && newVal.trim() === "") {
            // Mandamos "0" al estado para que Utils.isNumeric siga siendo true
            onUpdate(sheetName, rowIndex, colIndex, "0");
          } else {
            // Si no, mandamos el valor tal cual
            onUpdate(sheetName, rowIndex, colIndex, newVal);
          }
        }}
        // Mantenemos la celda habilitada si cumple las condiciones de edición
        disabled={!editable}
        style={{
          ...condensedStyle,
          textAlign: (isNumericValue || value === "") ? "right" : "left",
          backgroundColor: isExplicitEditable
            ? "#fff3cd"
            : (isNumericValue || value === "") ? "#fff" : "#f9f9f9",
          cursor: editable ? "text" : "default"
        }}
      />
    </div>
  );
};


const ProjectFormDialog = ({ open, onClose, pdfData, onSaveAll }) => {
  const [localFormData, setLocalFormData] = useState([]);

  useEffect(() => {
    if (open && pdfData) {
      const dataWithoutHeader = pdfData.filter(
        row => row && row[0] !== "Capítulo" && row[2] !== "variable"
      );
      setLocalFormData(JSON.parse(JSON.stringify(dataWithoutHeader)));
    }
  }, [open, pdfData]);

  const groupedData = useMemo(() => {
    if (!localFormData || localFormData.length === 0) return {};

    return localFormData.reduce((acc, row) => {
      const capitulo = row[0] ? String(row[0]).trim() : "";
      const categoria = row[1] ? String(row[1]).trim() : "";
      const variable = row[2] ? String(row[2]).trim() : "";
      const valor = row[3] !== undefined && row[3] !== null ? String(row[3]) : "";

      if (!variable) return acc;

      if (!acc[capitulo]) acc[capitulo] = {};
      if (!acc[capitulo][categoria]) acc[capitulo][categoria] = [];

      acc[capitulo][categoria].push({ id: variable, value: valor });
      return acc;
    }, {});
  }, [localFormData]);

  const handleChange = (capituloKey, categoriaKey, variableId, newValue) => {
    setLocalFormData(prev =>
      prev.map(row => {
        const rowCap = row[0] ? String(row[0]).trim() : "";
        const rowCat = row[1] ? String(row[1]).trim() : "";
        const rowVar = row[2] ? String(row[2]).trim() : "";

        if (rowCap === capituloKey && rowCat === categoriaKey && rowVar === variableId) {
          return [row[0], row[1], row[2], newValue];
        }
        return row;
      })
    );
  };

  const handleConfirm = () => {
    const originalHeader = pdfData[0] || ["Capítulo", "Categoría", "variable", "valor"];
    onSaveAll([originalHeader, ...localFormData]);
    onClose();
  };

  const countItems = (obj) => {
    if (Array.isArray(obj)) return obj.length;
    return Object.values(obj).reduce((sum, cat) => sum + cat.length, 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 90000 }}>
      <DialogTitle sx={{ fontWeight: 800, bgcolor: "#f5f5f5" }}>
        Configuración del Proyecto
      </DialogTitle>

      <DialogContent dividers sx={{ p: 1, bgcolor: "#fafafa" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Object.entries(groupedData).map(([capitulo, categorias], capituloIndex) => {
            const hasChapterName = capitulo.length > 0;
            const displayChapterName = hasChapterName ? capitulo : "PROYECTO";
            const totalChapterItems = countItems(categorias);

            return (
              <Accordion
                key={capitulo || "empty-cap"}
                disableGutters
                elevation={0}
                // Si es el primer capítulo (índice 0), se expande por defecto
                defaultExpanded={capituloIndex === 0}
                sx={{
                  border: '1px solid #e0e0e0',
                  '&:not(:last-child)': { borderBottom: 0 },
                  '&::before': { display: 'none' }
                }}
              >
                {/* 1. NIVEL: ACORDEÓN CAPÍTULO */}
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon color="primary" />}
                  sx={{
                    bgcolor: '#ffffff',
                    borderLeft: hasChapterName ? '4px solid #1976d2' : '4px solid #9e9e9e',
                    '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 }
                  }}
                >
                  <FolderIcon color={hasChapterName ? "primary" : "action"} size="small" />
                  <Typography sx={{ fontWeight: 800, color: hasChapterName ? '#1976d2' : '#616161', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    {displayChapterName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({totalChapterItems} items)
                  </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 1, bgcolor: '#fffdfa', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(categorias).map(([categoria, fields], categoriaIndex) => {
                    const hasCategoryName = categoria.length > 0;
                    const displayCategoryName = hasCategoryName ? categoria : "Campos generales";
                    const totalCategoryItems = fields.length;

                    return (
                      <Accordion
                        key={categoria || "empty-cat"}
                        disableGutters
                        elevation={0}
                        // Si es la primera categoría de este capítulo (índice 0), se expande por defecto
                        defaultExpanded={categoriaIndex === 0}
                        sx={{
                          border: '1px solid #f0e6d2',
                          '&::before': { display: 'none' }
                        }}
                      >
                        {/* 2. NIVEL: ACORDEÓN CATEGORÍA */}
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.2rem' }} />}
                          sx={{
                            bgcolor: '#fffbf4',
                            minHeight: '40px',
                            height: '40px',
                            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 }
                          }}
                        >
                          <FolderOpenIcon sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
                          <Typography sx={{ fontWeight: 700, color: '#9c27b0', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            {displayCategoryName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({totalCategoryItems})
                          </Typography>
                        </AccordionSummary>

                        {/* 3. NIVEL: CAMPOS */}
                        <AccordionDetails sx={{ p: 2, bgcolor: '#ffffff' }}>
                          {fields.map((field) => (
                            <TextField
                              key={field.id}
                              label={field.id}
                              fullWidth
                              size="small"
                              value={field.value}
                              onChange={(e) => handleChange(capitulo, categoria, field.id, e.target.value)}
                              sx={{ mb: 2, '&:last-child': { mb: 0 } }}
                              InputLabelProps={{ shrink: true }}
                            />
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Guardar
        </Button>
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

  // --- ESTADOS ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isActionsMenuOpen = Boolean(menuAnchorEl);

  // --- LÓGICA PARA "NUEVO" (Auto-abrir formulario al recargar) ---
  useEffect(() => {
    const shouldOpenForm = sessionStorage.getItem("autoOpenProjectForm");
    if (shouldOpenForm === "true") {
      sessionStorage.removeItem("autoOpenProjectForm");
      // Damos un pequeño respiro al renderizado inicial
      setTimeout(() => {
        onOpenForm();
      }, 500);
    }
  }, [onOpenForm]);

  const handleNewProject = () => {
    handleCloseActionsMenu();
    // Guardamos la intención en el storage antes de recargar
    sessionStorage.setItem("autoOpenProjectForm", "true");
    // Recargamos la página para resetear todo el estado
    window.location.reload();
  };

  // --- LÓGICA DE DATOS ---
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
    // Nota: Catalogo debe estar importado o disponible globalmente
    let filtered = (typeof Catalogo !== 'undefined' ? Catalogo : []).filter((i) =>
      !search ||
      normalize(i.cod).includes(search) ||
      normalize(i.sector).includes(search) ||
      normalize(i.grupo).includes(search)
    );

    const grouped = filtered.reduce((acc, item) => {
      acc[item.grupo] ??= {};
      acc[item.grupo][item.sector] ??= [];
      acc[item.grupo][item.sector].push(item);
      return acc;
    }, {});

    const sortedGrouped = {};
    Object.keys(grouped).sort().forEach((grupo) => {
      sortedGrouped[grupo] = {};
      Object.keys(grouped[grupo]).sort().forEach((sector) => {
        sortedGrouped[grupo][sector] = grouped[grupo][sector].sort((a, b) =>
          a.cod.localeCompare(b.cod, undefined, { numeric: true, sensitivity: "base" })
        );
      });
    });
    return sortedGrouped;
  }, [searchText]);

  // --- MANEJADORES ---
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenActionsMenu = (event) => setMenuAnchorEl(event.currentTarget);
  const handleCloseActionsMenu = () => setMenuAnchorEl(null);

  const handleOpenProject = () => {
    handleCloseActionsMenu();
    onOpenFile();
  };

  const handleExportProject = () => {
    handleCloseActionsMenu();

    // Tregua de 50ms al hilo de la UI para que el menú se cierre limpiamente
    setTimeout(() => {
      try {
        // 1. Recuperar la data exacta de la sesión
        const sessionExcelData = sessionStorage.getItem("excelData");

        if (!sessionExcelData) {
          toast.error("No hay datos en la sesión para exportar");
          return;
        }

        // 2. Parsear el JSON de la sesión
        const sheetsData = JSON.parse(sessionExcelData);

        // 3. Crear el nuevo libro de trabajo (Workbook)
        const wb = XLSX.utils.book_new();

        // 4. Volcar los datos manteniendo la estructura de Array de Arrays
        Object.entries(sheetsData).forEach(([sheetName, rows]) => {
          const ws = XLSX.utils.aoa_to_sheet(rows);
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        // 5. EXTRAER LOS PREFIJOS POR POSICIÓN (Basado en las variables calculadas de la URL/Sesión)
        // Decodificamos primero por seguridad ante caracteres de URL (%20, etc.)
        const grupoDecoded = finalGrupo && finalGrupo !== "---" ? decodeURIComponent(finalGrupo) : "";
        const sectorDecoded = finalSector && finalSector !== "---" ? decodeURIComponent(finalSector) : "";
        const codDecoded = finalCod && finalCod !== "---" ? decodeURIComponent(finalCod) : "";

        // Extraemos solo lo que está antes del primer "_" de cada segmento
        const p1 = grupoDecoded.split("_")[0] || "A0";
        const p2 = sectorDecoded.split("_")[0] || "A61";
        const p3 = codDecoded.split("_")[0] || "FV01";

        // Limpiamos el nombre del proyecto reemplazando cualquier espacio por guion bajo
        const proyectoClean = projectName ? projectName.trim().replace(/[\s.-]+/g, "_") : "norte";

        // 6. CONSTRUIR EL NOMBRE FINAL EXACTO
        // Formato resultante: ITE_A0_A61_FV01_norte.xlsx
        const fileName = `ITE_${p1}_${p2}_${p3}_${proyectoClean}.xlsx`;

        // 7. Escribir y descargar el archivo de forma nativa en el navegador
        XLSX.writeFile(wb, fileName);

        toast.success("Proyecto exportado correctamente");
      } catch (error) {
        console.error("Error al exportar:", error);
        toast.error("Error crítico al generar el Excel");
      }
    }, 50);
  };

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
    const parts = decodedStr.split("_");
    return (parts.length > 1 ? parts.slice(1) : parts).join(" ").toUpperCase();
  };

  const isDirty = (name) => {
    const ignoreList = (window.CONFIG && window.CONFIG.IGNORE_DIRTY_SHEETS) || [];
    return !ignoreList.includes(name) && dirtySheets[name];
  };

  const baseTextStyle = {
    display: "block",
    transform: "scaleX(0.82)",
    transformOrigin: "center",
    textTransform: "uppercase",
    fontStyle: "normal",
    cursor: "pointer",
    "&:hover": { color: theme.palette.primary.main }
  };

  return (
    <Box
      sx={{
        position: "fixed", top: 32, left: 0, right: 0, bgcolor: "white", zIndex: 1100,
        borderBottom: 1, borderColor: "divider", display: "flex", flexDirection: "column",
        alignItems: "center", minHeight: 65, pt: 0.5, pb: 0, width: "100%", boxSizing: "border-box"
      }}
    >
      {/* HEADER INFO (Fichas) */}
      <Box
        onClick={handleOpenMenu}
        sx={{
          width: "100%", textAlign: "center", display: "flex", flexDirection: "column",
          mb: 0.2, px: { xs: 0.5, sm: 2 }, cursor: "pointer", overflow: "hidden"
        }}
      >
        <Tooltip title={`${formatHeader(finalGrupo)} | ${formatHeader(finalSector)}`} arrow>
          <Typography noWrap sx={{ ...baseTextStyle, width: "100%", lineHeight: 1.05, display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 0.4, sm: 0.65 }, mb: 0.1 }}>
            <Box component="span" sx={{ color: "#00897b", fontWeight: 400, fontSize: "0.67rem" }}>{formatHeader(finalGrupo)}</Box>
            <Box component="span" sx={{ color: "#ccc", fontWeight: 200, fontSize: "0.55rem" }}>|</Box>
            <Box component="span" sx={{ color: "#7b1fa2", fontWeight: 400, fontSize: "0.67rem" }}>{formatHeader(finalSector)}</Box>
          </Typography>
        </Tooltip>

        <Tooltip title={finalCod !== "---" ? decodeURIComponent(finalCod).replace(/_/g, " ").toUpperCase() : "---"} arrow>
          <Typography noWrap sx={{ ...baseTextStyle, width: "100%", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 0.4, sm: 0.7 }, mt: 0 }}>
            {finalCod !== "---" ? (
              <>
                <Box component="span" sx={{ color: "#1565c0", fontWeight: 500, fontSize: "0.68rem" }}>{decodeURIComponent(finalCod).split("_")[0].toUpperCase()}</Box>
                <Box component="span" sx={{ color: "#555", fontWeight: 300, fontSize: "0.68rem" }}>{decodeURIComponent(finalCod).split("_").slice(1).join(" ").toUpperCase()}</Box>
              </>
            ) : "---"}
          </Typography>
        </Tooltip>
      </Box>

      {/* CONTROLES PRINCIPALES */}
      <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", px: 1, height: 38, gap: isMobile ? 0.5 : 1 }}>
        <Box sx={{ flexShrink: 0 }}>
          <Tooltip title="Opciones" arrow>
            <IconButton onClick={handleOpenActionsMenu} size="small" color="primary" sx={{ p: 0.5 }}>
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* MENÚ DE ACCIONES */}
        <Menu
          anchorEl={menuAnchorEl}
          open={isActionsMenuOpen}
          onClose={handleCloseActionsMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          {/* OPCIÓN NUEVO */}
          <MenuItem onClick={handleNewProject} sx={{ py: 1.2 }}>
            <AddIcon sx={{ mr: 1, fontSize: 20, color: 'info.main' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Nuevo</Typography>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleOpenProject}>
            <FolderOpenIcon sx={{ mr: 1, fontSize: 18 }} color="primary" />
            <Typography sx={{ fontSize: '0.85rem' }}>Abrir proyecto</Typography>
          </MenuItem>

          <MenuItem onClick={handleExportProject}>
            <FileDownloadIcon sx={{ mr: 1, fontSize: 18 }} color="success" />
            <Typography sx={{ fontSize: '0.85rem' }}>Exportar proyecto</Typography>
          </MenuItem>
        </Menu>

        {/* NOMBRE DEL PROYECTO (Acceso rápido al Form) */}
        <Tooltip title="Configuración del Proyecto" arrow>
          <Box sx={{ position: "relative", flex: isMobile ? "0 1 40%" : "0 1 150px", minWidth: 0 }}>
            <Typography sx={{ position: "absolute", top: "-3px", left: "6px", bgcolor: "white", px: 0.4, fontSize: "0.35rem", color: "text.secondary", zIndex: 1, fontWeight: 800 }}>
              PROYECTO
            </Typography>
            <Box onClick={onOpenForm} sx={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: "3px", display: "flex", alignItems: "center", px: 0.5, py: 0.2, cursor: "pointer", minHeight: 24 }}>
              <Typography noWrap sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#333", width: "100%" }}>
                {projectName || "---"}
              </Typography>
            </Box>
          </Box>
        </Tooltip>

        {/* TABS DE HOJAS */}
        <Box sx={{ flex: isMobile ? "0 1 40%" : "0 1 auto", display: "flex", alignItems: "center", minWidth: 0 }}>
          {isMobile ? (
            <FormControl size="small" fullWidth>
              <Select
                value={activeTab}
                onChange={(e) => onTabChangeAttempt(e.target.value)}
                sx={{ height: 24, fontSize: "0.6rem", fontWeight: 900 }}
              >
                {sheetNames.map((name, i) => (
                  <MenuItem key={i} value={i} sx={{ fontSize: "0.62rem", fontWeight: 900, color: isDirty(name.toString()) ? "#d32f2f" : "inherit" }}>
                    {name}
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
              sx={{ minHeight: 32, "& .MuiTab-root": { fontWeight: 900, fontSize: "0.62rem", minWidth: "auto", px: 1.5, py: 0 } }}
            >
              {sheetNames.map((name, i) => (
                <Tab key={i} label={name} sx={{ color: isDirty(name.toString()) ? "#d32f2f" : "inherit" }} />
              ))}
            </Tabs>
          )}
        </Box>
      </Box>

      {/* MENÚ DE INFORMES (BUSCADOR) */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        disableScrollLock
        PaperProps={{ sx: { width: 320, maxHeight: "70vh", mt: 1 } }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Buscar informe..." value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><FilterAltIcon sx={{ fontSize: 16 }} /></InputAdornment>),
              sx: { fontSize: "0.75rem", height: 32 }
            }}
          />
        </Box>
        <Divider />
        <List dense sx={{ py: 0 }}>
          {Object.entries(groupedData).map(([grupo, sectores]) => (
            <React.Fragment key={grupo}>
              <ListItemButton onClick={() => setOpenGroup(openGroup === grupo ? null : grupo)}>
                {openGroup === grupo ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                <ListItemText primary={grupo.replace(/^[0-9A-Z]{1,3}[._-\s]+/, "").replace(/_/g, " ")} primaryTypographyProps={{ fontWeight: 700, fontSize: "0.8rem" }} />
              </ListItemButton>
              <Collapse in={openGroup === grupo}>
                {Object.entries(sectores).map(([sector, fichas]) => (
                  <React.Fragment key={sector}>
                    <ListItemButton sx={{ pl: 3 }} onClick={() => setOpenSector(p => ({ ...p, [grupo]: p[grupo] === sector ? null : sector }))}>
                      {openSector[grupo] === sector ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                      <ListItemText primary={sector.replace(/^[0-9A-Z]{1,3}[._-\s]+/, "").replace(/_/g, " ")} primaryTypographyProps={{ fontSize: "0.75rem" }} />
                    </ListItemButton>
                    <Collapse in={openSector[grupo] === sector}>
                      {fichas.map((f) => (
                        <ListItemButton key={f.cod} sx={{ pl: 6 }} onClick={() => handleFichaClick(f)}>
                          <DescriptionIcon sx={{ mr: 1, fontSize: 16, color: "#0066FF" }} />
                          <ListItemText primary={f.cod.replaceAll("_", " ")} primaryTypographyProps={{ fontSize: "0.75rem", fontWeight: 500 }} />
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
    return excelData["PDF"]?.find(r => r?.[1] === "Proyecto" && r?.[2] === "nombre")?.[3]
      || sessionStorage.getItem("projectName")
      || "sin nombre";

  }, [excelData]);

  const broadcastAndSave = (newData) => {
    const val = JSON.stringify(newData);
    sessionStorage.setItem("excelData", val);
    window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: val }));
    Object.keys(newData).forEach(k => {
      lastSavedDataRef.current[k] = JSON.stringify(newData[k]); // <--- ESTO ES VITAL
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
    // 1. Evitamos que se ejecute si no hay parámetros en la URL (evita bucles en rutas raíz)
    if (!sector || !grupo || !cod) return;

    const init = async () => {
      console.log("Iniciando carga de valores por defecto...");

      try {
        // 2. Limpieza de rastro anterior antes de la petición
        sessionStorage.removeItem("excelData");

        const filePath = `/routers/${sector}/${grupo}/${cod}.xlsx`;
        const res = await fetch(filePath);

        if (!res.ok) {
          throw new Error(`No se encontró el archivo en: ${filePath}`);
        }

        const buffer = await res.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const originalData = {};

        wb.SheetNames.forEach((n) => {
          const sheetJson = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "" });
          originalData[n] = sheetJson;
          // Sincronizamos baseline para detectar cambios futuros
          lastSavedDataRef.current[n] = JSON.stringify(sheetJson);
        });

        // 3. Actualizamos el estado y la sesión de una sola vez
        const stringifiedData = JSON.stringify(originalData);
        sessionStorage.setItem("excelData", stringifiedData);
        sessionStorage.setItem("excelKey", `${sector}-${grupo}-${cod}`);

        // Reiniciamos flags de edición
        setDirtySheets({});
        isInitializedRef.current = false;

        // IMPORTANTE: Actualizar el estado al final para disparar el renderizado
        setExcelData(originalData);

      } catch (e) {
        console.error("Error cargando Excel:", e.message);
        toast.error("Error: El archivo no existe en el servidor.");
        // Opcional: setExcelData({}) para romper el estado de "Cargando" si falla
        setExcelData({ ERROR: [] });
      }
    };

    init();

    // Dependencias estrictas para evitar re-ejecuciones innecesarias
  }, [sector, grupo, cod]);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!currentSheet) return;

    // 🔴 Evita el primer cálculo (problema clásico de "primer cambio no detectado")
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      // sincronizamos baseline aquí para asegurar consistencia
      lastSavedDataRef.current[currentSheet] = JSON.stringify(excelData[currentSheet]);
      return;
    }

    const currentData = excelData[currentSheet];
    const savedData = lastSavedDataRef.current[currentSheet];

    // 🔐 seguridad extra por si aún no existe baseline
    if (!currentData || !savedData) return;

    const isDirty =
      JSON.stringify(currentData) !== savedData;

    setDirtySheets(prev => ({
      ...prev,
      [currentSheet]: isDirty
    }));

    // 🚀 AQUÍ puedes disparar tu API si quieres auto-save
    if (isDirty) {
      // debounce básico opcional
      clearTimeout(window.__autosaveTimer);

      window.__autosaveTimer = setTimeout(() => {
        // 🔥 TU API AQUÍ
        console.log("AUTO-SAVE API:", currentSheet, currentData);

        // ejemplo:
        // autoSaveToAPI(currentSheet, currentData);

      }, 800);
    }


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
      if (!currentSheetData || currentSheetData.length <= 2) return prev;
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

    // 1. LEER LA URL DIRECTAMENTE (Sin depender de los nombres de useParams)
    // Esto extrae exactamente ["A0_Sistema_FV", "A61_Conectado_a_red", "FV01_Autoconsumo_sin_excedentes"]
    const hashSegments = window.location.hash.replace('#', '').split('/').filter(Boolean);

    // 2. EXTRAER LOS PREFIJOS POR POSICIÓN
    const p1 = hashSegments[0]?.split("_")[0] || ""; // Debería ser A0
    const p2 = hashSegments[1]?.split("_")[0] || ""; // Debería ser A61
    const p3 = hashSegments[2]?.split("_")[0] || ""; // Debería ser FV01

    // 3. CONSTRUIR EL PREFIJO ESPERADO
    // Esto genera exactamente: ITE_A0_A61_FV01
    const expectedPrefix = `ITE_${p1}_${p2}_${p3}`;

    // 4. VALIDACIÓN DEL NOMBRE DEL ARCHIVO
    if (!file.name.startsWith(expectedPrefix)) {
      toast.error(
        `Archivo no válido para esta ruta.\n` +
        `Se esperaba que empezara por: ${expectedPrefix}\n` +
        `Nombre del archivo: ${file.name}`,
        { autoClose: 7000 }
      );
      e.target.value = "";
      return;
    }

    // 5. PROCESAMIENTO DEL EXCEL
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const importedData = {};

        wb.SheetNames.forEach((n) => {
          importedData[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "" });
        });

        // SINCRONIZACIÓN DE BASELINE
        // Actualizamos lastSavedDataRef para que el sistema reconozca que 
        // los datos actuales son los "guardados" y desaparezca el botón naranja.
        Object.keys(importedData).forEach(n => {
          lastSavedDataRef.current[n] = JSON.stringify(importedData[n]);
        });

        setExcelData(importedData);
        broadcastAndSave(importedData);

        toast.success("Importación exitosa: Estructura de proyecto validada.");

      } catch (err) {
        console.error("Error al procesar el Excel:", err);
        toast.error("Error técnico al leer el contenido del archivo.");
      }
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
      label: "",
      icon: <Home sx={{ fontSize: 20, color: 'error.main' }} />
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
          const item = SHEET_CUSTOMIZATION[name];
          if (item) {
            const StyledTab = (
              <Box key={name} component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
                {item.icon}
                <span>{item.label}</span>
              </Box>
            );
            return new Proxy(StyledTab, {
              get: (target, prop) => {
                if (prop === 'replace') return () => target;
                if (prop === 'toString') return () => item.label;
                return target[prop];
              }
            });
          }
          return name.replace(/_/g, " ");
        })}
        // ... resto de props
        activeTab={activeTab}
        onTabChangeAttempt={(index) => {
          const currentSheetName = sheetNames[activeTab];

          // 1. COMPROBAR SI HAY CAMBIOS Y DESHACER
          if (dirtySheets[currentSheetName]) {
            // Recuperamos la versión "limpia" del ref
            const originalSheetData = JSON.parse(lastSavedDataRef.current[currentSheetName]);

            // Actualizamos el estado de excelData devolviendo esa hoja a su estado original
            setExcelData(prev => ({
              ...prev,
              [currentSheetName]: originalSheetData
            }));

            // Limpiamos el indicador de cambios para esa hoja
            setDirtySheets(prev => ({
              ...prev,
              [currentSheetName]: false
            }));

            toast.info(`Cambios descartados en ${currentSheetName.replace(/_/g, ' ')}`);
          }

          // 2. CAMBIAR DE PESTAÑA
          setActiveTab(index);
          sessionStorage.setItem("activeTabIdx", index);
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

