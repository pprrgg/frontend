import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Tabs, Tab, Fab, Tooltip, Badge, Typography, TextField, IconButton,
  MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider,CircularProgress
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
import { useParams } from "react-router-dom";

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
  isExclamation: (val) => typeof val === "string" && val.startsWith("!"),
  isSelector: (val) => typeof val === "string" && val.includes(";") && !val.startsWith("!"),
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

  // AJUSTES PARA MINIMAPA ULTRA ESTRECHO
  const barWidth = 1.5; // Muy finas para un look elegante
  const gap = 0.5;      // Espacio mínimo entre barras

  return (
    <div
      onClick={onClick}
      style={{
        width: "fit-content",
        height: "18px", // Un poco más bajo para que sea discreto
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: `${gap}px`,
        cursor: "pointer",
        padding: "2px 4px",
        backgroundColor: "rgba(0,0,0,0.04)", // Fondo sutil para dar contexto
        borderRadius: "3px",
        border: "1px solid rgba(0,0,0,0.05)"
      }}
    >
      {data.map((val, i) => (
        <div
          key={i}
          style={{
            width: `${barWidth}px`,
            flexShrink: 0,
            height: `${Math.max((val / maxValue) * 100, 15)}%`, // Altura mínima para que no desaparezcan
            backgroundColor: i === 0 ? "#1976d2" : "#90caf9",
            borderRadius: "0.2px" // Bordes casi rectos por lo fino que es
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

  const editable = Utils.isNumeric(value) || Utils.isExclamation(value);
  const displayValue = Utils.isExclamation(value)
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
          backgroundColor: Utils.isExclamation(value) ? "#fff3cd" : editable ? "#fff" : "#f9f9f9",
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

// ==========================================
// 3. TOOLBAR (CON SOPORTE DE NAVEGACIÓN SEGURA)
// ==========================================


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

  const getUrlData = () => {
    // Obtenemos el hash y decodificamos para eliminar caracteres como %C3%AD
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
      console.error("Error decoding URL:", e);
      return { grupo: "", sector: "", cod: "" };
    }
  };

  const urlData = getUrlData();
  const sessionData = sessionStorage.getItem("selectedFicha");
  const sessionFicha = sessionData ? JSON.parse(sessionData) : {};

  // Combinamos datos priorizando URL -> Params -> Session
  const finalGrupo = urlData.grupo || sessionFicha.grupo || "---";
  const finalSector = urlData.sector || sessionFicha.sector || "---";
  const finalCod = urlData.cod || cod || sessionFicha.cod || "---";

  const formatHeader = (str) => {
    if (!str || str === "---") return str;
    // Decodificamos de nuevo por si el string viene de session sin procesar
    const decodedStr = decodeURIComponent(str);
    const parts = decodedStr.split('_');
    return (parts.length > 1 ? parts.slice(1) : parts).join(' ').toUpperCase();
  };

  const groupLabel = formatHeader(finalGrupo);
  const sectorLabel = formatHeader(finalSector);
  const docTypeLabel = (finalCod && finalCod !== "---"
    ? decodeURIComponent(finalCod).replace(/_/g, ' ').toUpperCase()
    : "---");

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Asumiendo que CONFIG está definido globalmente o importado
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
    cursor: "default"
  };

  return (
    <Box sx={{
      position: "fixed", top: 30, left: 0, right: 0,
      bgcolor: "white", zIndex: 1100, borderBottom: 1, borderColor: "divider",
      display: "flex", flexDirection: "column", alignItems: "center",
      minHeight: 65, pt: 0.5, pb: 0,
      width: "100%",
      boxSizing: "border-box"
    }}>
      {/* Header Info */}
      <Box sx={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", mb: 0.2, px: 2 }}>
        <Typography sx={{ ...baseTextStyle, fontSize: "0.6rem", color: "text.secondary", fontWeight: 900, opacity: 0.96, lineHeight: 1.7 }}>
          <span>{groupLabel}</span>
          <Box component="span" sx={{ color: "#eee", mx: 0.3, fontWeight: 200 }}>|</Box>
          <span>{sectorLabel}</span>
        </Typography>
        <Typography sx={{ ...baseTextStyle, fontSize: "0.6rem", color: "text.secondary", fontWeight: 900, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 0.98 }}>
          {docTypeLabel}
        </Typography>
      </Box>

      {/* Controles: Grupo Centrado */}
      <Box sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1,
        height: 38,
        boxSizing: "border-box",
        gap: isMobile ? 0.5 : 1 // Espacio mínimo físico entre elementos
      }}>

        {/* 1. Icono Abrir */}
        <Box sx={{ flexShrink: 0 }}>
          <Tooltip title="Abrir proyecto" arrow>
            <IconButton onClick={onOpenFile} size="small" color="primary" sx={{ p: 0.5 }}>
              <FolderOpenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 2. Proyecto (Limitado en móvil para no solapar) */}
        <Tooltip title="Configuración del Proyecto" arrow>
          <Box sx={{
            position: "relative",
            // En móvil: permite encogerse hasta el 40% del ancho para dejar sitio al select
            flex: isMobile ? "0 1 40%" : "0 1 150px",
            minWidth: 0 // Crucial para que el texto noWrap funcione
          }}>
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

        {/* 3. Tabs o Select (Limitado en móvil) */}
        <Box sx={{
          // En móvil: permite encogerse hasta el 40%
          flex: isMobile ? "0 1 40%" : "0 1 auto",
          display: "flex",
          alignItems: "center",
          minWidth: 0
        }}>
          {isMobile ? (
            <FormControl size="small" fullWidth>
              <Select
                value={activeTab}
                onChange={(e) => onTabChangeAttempt(e.target.value)}
                sx={{
                  height: 24, fontSize: "0.6rem", fontWeight: 900,
                  '& .MuiSelect-select': { py: 0, px: 1 } // Menos padding para ganar espacio
                }}
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
              sx={{
                minHeight: 32,
                '& .MuiTab-root': { fontWeight: 900, fontSize: '0.62rem', textTransform: 'uppercase', minWidth: 'auto', px: 1.5, py: 0 },
              }}
            >
              {sheetNames.map((name, i) => (
                <Tab key={i} label={name.replace(/_/g, ' ')} sx={{ color: isDirty(name) ? "#d32f2f" : "inherit" }} />
              ))}
            </Tabs>
          )}
        </Box>

        {/* 4. Icono Exportar */}
        <Box sx={{ flexShrink: 0 }}>
          <Tooltip title="Exportar proyecto" arrow>
            <IconButton onClick={onExport} size="small" color="success" sx={{ p: 0.5 }}>
              <FileDownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};



const ExcelUploaderStorage = () => {
  const { sector, grupo, cod } = useParams();
  const [excelData, setExcelData] = useState({});
  const [activeTab, setActiveTab] = useState(() => Number(sessionStorage.getItem("activeTabIdx") || 0));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- Lógica de Capítulos y Categorías Colapsables ---
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  // --- Lógica de Cambios Pendientes ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [dirtySheets, setDirtySheets] = useState({});
  const lastSavedDataRef = useRef({});
  const fileInputRef = useRef(null);

  const sheetNames = useMemo(() => Object.keys(excelData), [excelData]);
  const currentSheet = sheetNames[activeTab];

  // Alternar visibilidad de capítulos y categorías
  const toggleChapter = (chapterName) => {
    setExpandedChapters(prev => ({ ...prev, [chapterName]: !prev[chapterName] }));
  };

  const toggleCategory = (chapterName, categoryName) => {
    const key = `${chapterName}-${categoryName}`;
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Resetear colapsables al cambiar de hoja
  useEffect(() => {
    setExpandedChapters({});
    setExpandedCategories({});
  }, [currentSheet]);

  const groupedInfo = useMemo(() => {
    const rows = excelData[currentSheet] || [];
    if (rows.length === 0) return { hasChapters: false, hasCategories: false, header: null, groups: {} };

    const header = rows[0];
    const normalizeStr = (str) => String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const chapterIdx = header.findIndex(cell => normalizeStr(cell) === "capitulo");
    const categoryIdx = header.findIndex(cell => normalizeStr(cell) === "categoria");

    if (chapterIdx === -1) return { hasChapters: false, hasCategories: false, header, groups: {} };

    // Estructura: groups = { "Nombre Capítulo": { "Nombre Categoría": [ { originalIdx, row } ] } }
    const groups = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const chapterName = row[chapterIdx] || "GENERAL";
      const categoryName = (categoryIdx !== -1 && row[categoryIdx]) ? row[categoryIdx] : "SIN CATEGORÍA";

      if (!groups[chapterName]) groups[chapterName] = {};
      if (!groups[chapterName][categoryName]) groups[chapterName][categoryName] = [];

      groups[chapterName][categoryName].push({ originalIdx: i, row });
    }

    return { 
      hasChapters: true, 
      hasCategories: categoryIdx !== -1, 
      header, 
      groups 
    };
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
          const isExcl = Utils.isExclamation(newRow[c]);
          if (!isExcl && !Utils.isDistribution(newRow[c])) {
            const numRegex = /^-?\d*\.?\d*$/;
            if (!numRegex.test(val)) return row;
          }
          newRow[c] = isExcl ? `!${val}` : val;
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
          {row.map((cell, c) => (
            <CellRenderer
              key={`${r}-${c}`}
              value={cell}
              columnWidth={Utils.getColumnWidths(excelData[currentSheet] || [])[c]}
              onUpdate={updateCell}
              sheetName={currentSheet}
              rowIndex={r}
              colIndex={c}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const hasPendingChanges = !!dirtySheets[currentSheet];

  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} />

      <Toolbar
        projectName={projectName}
        onOpenFile={() => fileInputRef.current.click()}
        onOpenForm={() => setIsFormOpen(true)}
        onExport={handleExport}
        sheetNames={sheetNames.map(name => name.replace(/_/g, " "))}
        activeTab={activeTab}
        onTabChangeAttempt={(idx) => {
          if (hasPendingChanges) confirmSave();
          setActiveTab(idx);
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
                Object.entries(groupedInfo.groups).map(([chapterName, categories], gIdx) => {
                  const isChapterExpanded = !!expandedChapters[chapterName]; 
                  
                  // Calcular el total de filas sumando todas las categorías dentro de este capítulo
                  const totalChapterItems = Object.values(categories).reduce((acc, rows) => acc + rows.length, 0);

                  return (
                    <Box key={`chapter-${chapterName}`} sx={{ borderBottom: "1px solid #ddd" }}>
                      
                      {/* Cabecera del Capítulo */}
                      <Box 
                        onClick={() => toggleChapter(chapterName)}
                        sx={{ 
                          bgcolor: isChapterExpanded ? "#fef8f5" : "#f5f5f5", 
                          p: 1, pl: 2, 
                          fontWeight: "bold", 
                          borderLeft: "5px solid #ed6c02", 
                          color: "#e65100", 
                          fontSize: "0.75rem",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          cursor: "pointer",
                          userSelect: "none",
                          "&:hover": { bgcolor: "#f0f0f0" }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {isChapterExpanded ? <FolderOpenIcon sx={{ fontSize: 16 }} /> : <FolderIcon sx={{ fontSize: 16 }} />}
                          {chapterName.toUpperCase()}
                          <Typography variant="caption" sx={{ ml: 1, color: "text.secondary", fontWeight: "normal" }}>
                            ({totalChapterItems} ítems)
                          </Typography>
                        </Box>
                        {isChapterExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </Box>
                      
                      {/* Contenido del Capítulo (Subcategorías) */}
                      {isChapterExpanded && (
                        <Box>
                          {Object.entries(categories).map(([categoryName, rows]) => {
                            const catKey = `${chapterName}-${categoryName}`;
                            const isCategoryExpanded = !!expandedCategories[catKey];

                            return (
                              <Box key={`category-${catKey}`}>
                                
                                {/* Cabecera de la Categoría (Solo se muestra si existe la columna Categoría) */}
                                {groupedInfo.hasCategories && (
                                  <Box 
                                    onClick={() => toggleCategory(chapterName, categoryName)}
                                    sx={{ 
                                      bgcolor: isCategoryExpanded ? "#fffdf5" : "#ffffff", 
                                      p: 0.8, pl: 4, 
                                      fontWeight: "bold",
                                      borderLeft: "5px solid #ffb74d", 
                                      borderBottom: "1px solid #eee",
                                      color: "#f57c00", 
                                      fontSize: "0.7rem",
                                      display: "flex", 
                                      alignItems: "center", 
                                      justifyContent: "space-between",
                                      cursor: "pointer",
                                      userSelect: "none",
                                      "&:hover": { bgcolor: "#fdf8f0" }
                                    }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      {isCategoryExpanded ? <FolderOpenIcon sx={{ fontSize: 14 }} /> : <FolderIcon sx={{ fontSize: 14 }} />}
                                      {categoryName.toUpperCase()}
                                      <Typography variant="caption" sx={{ ml: 1, color: "text.secondary", fontWeight: "normal" }}>
                                        ({rows.length} ítems)
                                      </Typography>
                                    </Box>
                                    {isCategoryExpanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                                  </Box>
                                )}

                                {/* Filas de la Categoría */}
                                {(!groupedInfo.hasCategories || isCategoryExpanded) && (
                                  <Box>
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
// export default ExcelUploaderStorage;
export default ExcelUploaderStorage;