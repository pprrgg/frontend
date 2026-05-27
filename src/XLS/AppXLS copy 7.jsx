import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Tabs, Tab, Fab, Tooltip, Badge, Typography, TextField, IconButton,
  MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import {
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  FileDownload as FileDownloadIcon
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";

// Componentes Externos (Asumidos en tu estructura)
import AppFV from "./XLShojas/FV/AppFV";
import { PdfViewerContent } from "./XLShojas/PDF/AppPDF";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
      widths[c] = Math.min(Math.max(max * 8, 80), 300);
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

  return (
    <Box ref={containerRef} sx={{
      width,
      height: 160,
      display: "flex",
      flexDirection: "column",
      bgcolor: "#fff",
      borderRight: "1px solid #eee",
      p: "4px",
      touchAction: "none"
    }}>
      <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "2px", mb: "4px" }}>
        {data.map((val, i) => (
          <Tooltip key={i} title={`${(val * 100).toFixed(2)}%`} arrow>
            <Box
              onMouseDown={(e) => { setIsDragging(i); stateRef.current = { y: e.clientY, val: data[i], max: maxValue }; }}
              onTouchStart={(e) => { setIsDragging(i); stateRef.current = { y: e.touches[0].clientY, val: data[i], max: maxValue }; }}
              sx={{
                flex: 1,
                height: `${(val / maxValue) * 100}%`,
                bgcolor: i === isDragging ? "#ff9800" : (i === 0 ? "#1976d2" : "#42a5f5"),
                borderRadius: "1px 1px 0 0",
                border: "1px solid rgba(0,0,0,0.1)",
                transition: "height 0.1s ease"
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: "2px", borderTop: "1px solid #ccc", pt: "2px" }}>
        {data.map((_, i) => (
          <Typography key={i} sx={{ flex: 1, fontSize: "0.6rem", textAlign: "center", color: "#757575", fontWeight: 700 }}>
            {i + 1}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const CellRenderer = ({ value, columnWidth, sheetName, rowIndex, colIndex, onUpdate }) => {
  const condensedStyle = {
    fontSize: "0.7rem",
    padding: "4px 8px",
    letterSpacing: "-0.02em",
    lineHeight: "1",
    fontWeight: "500"
  };

  if (Utils.isDistribution(value)) {
    return <DistributionBarChart value={value} width={columnWidth || 120} onChange={(val) => onUpdate(sheetName, rowIndex, colIndex, val)} />;
  }

  if (Utils.isSelector(value)) {
    const options = value.split(";");
    return (
      <Box sx={{ width: columnWidth || 120, borderRight: "1px solid #eee", display: "flex", alignItems: "center" }}>
        <select
          value={options[0]}
          onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
          style={{ ...condensedStyle, width: "100%", border: "none", backgroundColor: "#e3f2fd", cursor: "pointer", appearance: "none" }}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt.replace(/_/g, " ")}</option>
          ))}
        </select>
      </Box>
    );
  }

  const editable = Utils.isNumeric(value) || Utils.isExclamation(value);
  const displayValue = Utils.isExclamation(value)
    ? value.slice(1).replace(/_/g, " ")
    : (value ?? "").toString().replace(/_/g, " ");

  return (
    <input
      value={displayValue}
      onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
      disabled={!editable}
      style={{
        ...condensedStyle,
        width: columnWidth || 120,
        border: "none",
        borderRight: "1px solid #eee",
        textAlign: editable ? "right" : "left",
        backgroundColor: Utils.isExclamation(value) ? "#fff3cd" : editable ? "#fff" : "#f9f9f9",
        outline: "none"
      }}
    />
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

// ==========================================
// 4. COMPONENTE PRINCIPAL
// ==========================================

const ExcelUploaderStorage = () => {
  const { sector, grupo, cod } = useParams();
  const [excelData, setExcelData] = useState({});
  const [activeTab, setActiveTab] = useState(() => Number(sessionStorage.getItem("activeTabIdx") || 0));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- Lógica de Cambios Pendientes ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [dirtySheets, setDirtySheets] = useState({});
  const lastSavedDataRef = useRef({});
  const fileInputRef = useRef(null);

  const sheetNames = useMemo(() => Object.keys(excelData), [excelData]);
  const currentSheet = sheetNames[activeTab];

  const projectName = useMemo(() => {
    return excelData["PDF"]?.find(r => r?.[0] === "Documento_nombre")?.[1] || sessionStorage.getItem("projectName") || "sin nombre";
  }, [excelData]);

  const broadcastAndSave = (newData) => {
    const val = JSON.stringify(newData);
    sessionStorage.setItem("excelData", val);
    window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: val }));
    // Al guardar, actualizamos la referencia de "seguro"
    Object.keys(newData).forEach(k => {
      lastSavedDataRef.current[k] = JSON.stringify(newData[k]);
    });
    setDirtySheets({});
  };

  // Listener para capturar cambios externos (ej. de AppFV)
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
      } catch (e) { toast.error("Error al cargar"); }
    };
    init();
  }, [sector, grupo, cod]);

  // Dirty Check: Compara estado actual con la referencia guardada
  useEffect(() => {
    if (!currentSheet || CONFIG.IGNORE_DIRTY_SHEETS.includes(currentSheet)) return;
    const isDirty = JSON.stringify(excelData[currentSheet]) !== lastSavedDataRef.current[currentSheet];
    setDirtySheets(prev => ({ ...prev, [currentSheet]: isDirty }));
  }, [excelData, currentSheet]);

  // Intercepción de navegación
  const onTabChangeAttempt = (idx) => {
    if (dirtySheets[currentSheet]) {
      setPendingTab(idx);
      setIsConfirmOpen(true);
    } else {
      setActiveTab(idx);
    }
  };

  // --- MODIFICACIÓN CLAVE: confirmSave ---
  const confirmSave = () => {
    // 1. Antes de guardar, intentamos obtener lo último de la sesión
    const sessionRaw = sessionStorage.getItem("excelData");
    let dataToSave = excelData;

    if (sessionRaw) {
      try {
        const sessionParsed = JSON.parse(sessionRaw);

        // Validamos que exista la propiedad "Diseño_FV" en la sesión antes de mezclar
        if (sessionParsed && sessionParsed["Diseño_FV"]) {
          dataToSave = {
            ...excelData,
            "Diseño_FV": sessionParsed["Diseño_FV"]
          };
        }
      } catch (e) {
        console.error("Error al sincronizar con sesión antes de guardar", e);
      }
    }

    // 2. Guardamos y actualizamos referencias
    broadcastAndSave(dataToSave);
    setExcelData(dataToSave);

    if (pendingTab !== null) setActiveTab(pendingTab);
    setIsConfirmOpen(false);
    setPendingTab(null);
    toast.success("Cambios guardados correctamente");
  };

  const discardChanges = () => {
    const restored = { ...excelData, [currentSheet]: JSON.parse(lastSavedDataRef.current[currentSheet]) };
    setExcelData(restored);
    if (pendingTab !== null) setActiveTab(pendingTab);
    setIsConfirmOpen(false); setPendingTab(null);
    toast.info("Cambios descartados");
  };

  const updateCell = (sheet, r, c, val) => {
    setExcelData(prev => {
      const newSheetData = prev[sheet].map((row, idx) => {
        if (idx !== r) return row;
        const newRow = [...row];

        // Lógica para Selectores (se mantiene igual)
        if (Utils.isSelector(newRow[c])) {
          const opts = newRow[c].split(";");
          newRow[c] = [val, ...opts.filter(o => o !== val)].join(";");
        }
        else {
          const isExcl = Utils.isExclamation(newRow[c]);

          // --- BLOQUEO DE CARACTERES ---
          // Si no es una celda con "!" (exclamación) y no es una distribución [x,y...], 
          // validamos que el contenido sea numérico.
          if (!isExcl && !Utils.isDistribution(newRow[c])) {
            // Permitimos: números, un solo punto decimal, y un signo menos al principio.
            // Si el valor no cumple, devolvemos la fila sin cambios (bloqueo).
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const hashSegments = window.location.hash.replace('#', '').split('/').filter(Boolean);
    const g = hashSegments[0]?.split("_")[0].toUpperCase() || "";
    const s = hashSegments[1]?.split("_")[0].toUpperCase() || "";
    const c = hashSegments[2]?.split("_")[0].toUpperCase() || "";
    const fileName = file.name.toUpperCase();

    if ((!fileName.includes(g) || !fileName.includes(s) || !fileName.includes(c)) && g !== "") {
      toast.error(`Bloqueo de seguridad: No corresponde a ${g}, ${s} y ${c}`);
      return;
    }

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
      } catch (e) { toast.error("Error al procesar"); }
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

const hasPendingChanges = !!dirtySheets[currentSheet];

  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} />

      <Toolbar
        projectName={projectName}
        onOpenFile={() => fileInputRef.current.click()}
        onOpenForm={() => setIsFormOpen(true)}
        onExport={handleExport}
        sheetNames={sheetNames.map(name => {
          if (name === "PDF" || name === "financieros") {
            const isPDF = name === "PDF";
            const IconComponent = (
              <Box key={name} component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 40 }}>
                {isPDF ?
                  <PictureAsPdfIcon sx={{ fontSize: 20, color: 'error.main' }} /> :
                  <TrendingUpIcon sx={{ fontSize: 20, color: currentSheet === "financieros" ? "primary.main" : "inherit" }} />
                }
              </Box>
            );
            return new Proxy(IconComponent, {
              get: (target, prop) => {
                if (prop === 'replace') return () => target;
                if (prop === 'toString') return () => (isPDF ? "PDF" : "financieros");
                return target[prop];
              }
            });
          }
          return name.replace(/_/g, " ");
        })}
        activeTab={activeTab}
        onTabChangeAttempt={(index) => {
          // 1. ELIMINAR CAMBIOS: Llamamos a discardChanges() para restaurar la data original
          // Esta función debe existir en tu componente y recargar los datos desde el Storage
          if (hasPendingChanges) {
            discardChanges(); 
          }

          // 2. RESETEAR INDICADORES: Limpiamos las marcas visuales de "sucio"
          setDirtySheets({});

          // 3. NAVEGAR: Cambiamos de pestaña
          setActiveTab(index);
        }}
        dirtySheets={dirtySheets}
      />

      <Box sx={{ height: 60 }} />

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {CONFIG.SHEET_COMPONENTS[currentSheet] ? (
          <Box sx={{ width: "100%" }}>
            {React.createElement(CONFIG.SHEET_COMPONENTS[currentSheet], {
              sheetName: currentSheet,
              data: excelData[currentSheet],
              setExcelData: setExcelData,
              sector, grupo, cod
            })}
          </Box>
        ) : (
          <Box sx={{
            maxWidth: "100%",
            maxHeight: "80vh",
            overflowX: "auto",
            border: "1px solid #ddd",
            bgcolor: "#fff",
            borderRadius: 1,
            boxShadow: 2,
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#bbb', borderRadius: '10px' }
          }}>
            <Box sx={{ display: "table", margin: "0 auto", minWidth: "100%" }}>
              {(excelData[currentSheet] || []).map((row, r) => {
                const isHeader = r === 0;
                return (
                  <Box
                    key={r}
                    sx={{
                      display: "flex",
                      borderBottom: "1px solid #eee",
                      whiteSpace: "nowrap",
                      bgcolor: isHeader ? "#eceff1" : "transparent",
                      position: isHeader ? "sticky" : "relative",
                      top: 0,
                      zIndex: isHeader ? 2 : 1,
                      "& input, & select": {
                        textTransform: isHeader ? "uppercase" : "none",
                        fontSize: "0.72rem",
                        fontWeight: isHeader ? "800" : "500",
                        color: isHeader ? "#455a64" : "inherit"
                      }
                    }}
                  >
                    {row.map((cell, c) => (
                      <CellRenderer
                        key={c}
                        value={cell}
                        columnWidth={Utils.getColumnWidths(excelData[currentSheet])[c]}
                        onUpdate={updateCell}
                        sheetName={currentSheet}
                        rowIndex={r}
                        colIndex={c}
                      />
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* BOTÓN FLOTANTE: Solo aparece si hay cambios reales en la hoja actual */}
      <Box
        sx={{
          position: "fixed",
          top: 20,
          left: '70%',
          zIndex: 9999,
          transition: 'all 0.3s ease-in-out',
          opacity: hasPendingChanges ? 1 : 0,
          transform: hasPendingChanges ? 'scale(1)' : 'scale(0.5)',
          pointerEvents: hasPendingChanges ? 'auto' : 'none',
          '@keyframes pulse-small': {
            '0%': { boxShadow: '0 0 0 0px rgba(237, 108, 2, 0.8)' },
            '70%': { boxShadow: '0 0 0 8px rgba(237, 108, 2, 0)' },
            '100%': { boxShadow: '0 0 0 0px rgba(237, 108, 2, 0)' },
          },
        }}
      >
        <Tooltip title={`Guardar cambios en ${currentSheet}`} arrow placement="top">
          <Fab
            size="small"
            onClick={confirmSave}
            sx={{
              bgcolor: "#ed6c02",
              color: "#ffffff",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "#e65100" },
              animation: hasPendingChanges ? 'pulse-small 1.5s infinite' : 'none',
              boxShadow: 4
            }}
          >
            <SaveIcon sx={{ fontSize: 20 }} />
          </Fab>
        </Tooltip>
      </Box>

      <ProjectFormDialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        pdfData={excelData["PDF"] || []} 
        onSaveAll={(newData) => broadcastAndSave({ ...excelData, PDF: newData })} 
      />
      
      <ToastContainer position="bottom-right" autoClose={2000} />
    </Box>
  );

};

export default ExcelUploaderStorage;