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
    // Ajuste del cálculo considerando el espacio de los números (aprox 20px)
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
      height: 160, // Aumentado para dar espacio a los números
      display: "flex", 
      flexDirection: "column", 
      bgcolor: "#fff", 
      borderRight: "1px solid #eee", 
      p: "4px", 
      touchAction: "none" 
    }}>
      {/* Área de Gráfico */}
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

      {/* EJE X: Numeración */}
      <Box sx={{ display: "flex", gap: "2px", borderTop: "1px solid #ccc", pt: "2px" }}>
        {data.map((_, i) => (
          <Typography 
            key={i} 
            sx={{ 
              flex: 1, 
              fontSize: "0.6rem", 
              textAlign: "center", 
              color: "#757575",
              fontWeight: 700
            }}
          >
            {i + 1}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const CellRenderer = ({ value, columnWidth, sheetName, rowIndex, colIndex, onUpdate }) => {
  if (Utils.isDistribution(value)) return <DistributionBarChart value={value} width={columnWidth || 120} onChange={(val) => onUpdate(sheetName, rowIndex, colIndex, val)} />;
  if (Utils.isSelector(value)) {
    const options = value.split(";");
    return (
      <Box sx={{ width: columnWidth || 120, borderRight: "1px solid #eee" }}>
        <select value={options[0]} onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)} style={{ width: "100%", border: "none", padding: "10px", fontSize: "0.85rem", backgroundColor: "#e3f2fd", cursor: "pointer" }}>
          {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>
      </Box>
    );
  }
  const editable = Utils.isNumeric(value) || Utils.isExclamation(value);
  return (
    <input
      value={Utils.isExclamation(value) ? value.slice(1) : (value ?? "")}
      onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
      disabled={!editable}
      style={{ width: columnWidth || 120, border: "none", borderRight: "1px solid #eee", padding: "10px", textAlign: editable ? "right" : "left", backgroundColor: Utils.isExclamation(value) ? "#fff3cd" : editable ? "#fff" : "#f9f9f9", outline: "none" }}
    />
  );
};

// ==========================================
// 3. DIÁLOGO DE PROYECTO (CON BORRADOR)
// ==========================================

const ProjectFormDialog = ({ open, onClose, pdfData, onSaveAll }) => {
  // Estado local para edición fluida sin afectar la sesión hasta confirmar
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
    onSaveAll(localFormData); // Guarda masivamente en el padre
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





const Toolbar = ({ projectName, onOpenFile, onOpenForm, onExport, sheetNames, activeTab, onTabChange, dirtySheets }) => {
  const theme = useTheme();
  // Detecta si la pantalla es de tamaño móvil (600px o menos)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isDirty = (name) => !CONFIG.IGNORE_DIRTY_SHEETS.includes(name) && dirtySheets[name];

  return (
    <Box sx={{
      position: "fixed", top: 35, left: 0, right: 0,
      bgcolor: "white", zIndex: 1100, borderBottom: 1, borderColor: "divider",
      display: "flex", justifyContent: "center", height: 52
    }}>
      <Box sx={{ width: "100%", maxWidth: "1400px", display: "flex", alignItems: "center", px: 1 }}>

        {/* Tooltip y botón de Carpeta */}
        <Tooltip title="Abrir Proyecto" arrow>
          <IconButton onClick={onOpenFile} size="small" color="primary" sx={{ mr: 1 }}>
            <FolderOpenIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* CAMPO NOMBRE DEL PROYECTO (Mantenido con ancho fijo y etiqueta) */}
        <Tooltip title="Configuración del Proyecto" arrow>
          <Box sx={{
            position: "relative",
            width: isMobile ? "100px" : "200px", // Más corto en móvil para dar espacio
            // minWidth: isMobile ? "140px" : "280px", 
            height: "30px",
            display: "flex",
            alignItems: "center",
            mt: 0.8
          }}>
            <Typography sx={{
              position: "absolute", top: "-9px", left: "10px", bgcolor: "white", px: 0.5,
              fontSize: "0.62rem", color: "text.secondary", zIndex: 1, fontWeight: 700,
              // textTransform: "lowercase"
            }}>
              Proyecto
            </Typography>
            <Box onClick={onOpenForm} sx={{
              width: "100%", height: "100%", border: "1px solid #ccc", borderRadius: "4px",
              display: "flex", alignItems: "center", px: 1.2, cursor: "pointer",
              "&:hover": { borderColor: theme.palette.primary.main }
            }}>
              <Typography sx={{
                fontSize: "0.78rem", fontWeight: 800, color: "#333",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%"
              }}>
                {projectName}
              </Typography>
            </Box>
          </Box>
        </Tooltip>

        {/* SECCIÓN CENTRAL: Tabs en Desktop / Selector en Móvil */}
        <Box sx={{ flexGrow: 1, display: "flex", minWidth: 0, ml: 2, justifyContent: "center" }}>
          {isMobile ? (
            <FormControl size="small" fullWidth sx={{ maxWidth: 200 }}>
              <Select
                value={activeTab}
                onChange={(e) => onTabChange(e.target.value)}
                sx={{
                  height: 32, fontSize: "0.7rem", fontWeight: 900,
                  "& .MuiSelect-select": { textTransform: "uppercase" }
                }}
              >
                {sheetNames.map((name, i) => (
                  <MenuItem key={i} value={i} sx={{ textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700 }}>
                    {isDirty(name) ? `● ${name.replace(/_/g, ' ')}` : name.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Tabs
              value={activeTab}
              onChange={(e, v) => onTabChange(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase', // Forzar Mayúsculas
                  minWidth: 'auto',
                  px: 2
                }
              }}
            >
              {sheetNames.map((name, i) => (
                <Tab
                  key={i}
                  label={name.replace(/_/g, ' ')}
                  sx={{ color: isDirty(name) ? "#d32f2f" : "inherit" }}
                />
              ))}
            </Tabs>
          )}
        </Box>

        {/* Tooltip y botón de Exportar */}
        <Tooltip title="Guardar Proyecto" arrow>
          <IconButton onClick={onExport} size="small" color="success" sx={{ ml: 1 }}>
            <FileDownloadIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
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
  };

  useEffect(() => {
    const init = async () => {
      const key = `${sector}-${grupo}-${cod}`;
      const saved = sessionStorage.getItem("excelData");
      const savedKey = sessionStorage.getItem("excelKey");

      // 1. PRIORIDAD: Si ya tenemos datos en el estado de React que coinciden con la URL, 
      // NO hacemos nada. Esto evita que al cerrar el modal (que provoca un re-render)
      // el useEffect sobreescriba el estado local con datos viejos.
      if (Object.keys(excelData).length > 0 && savedKey === key) {
        return;
      }

      // 2. RECUPERACIÓN: Si no hay datos en React pero sí en SessionStorage (y es el mismo proyecto)
      if (savedKey === key && saved) {
        try {
          const parsed = JSON.parse(saved);
          setExcelData(parsed);
          // Sincronizamos la referencia de "último guardado" para evitar que marque "dirty" erróneamente
          Object.keys(parsed).forEach(k => {
            lastSavedDataRef.current[k] = JSON.stringify(parsed[k]);
          });
          return; // Salimos, no necesitamos fetch
        } catch (e) {
          console.error("Error parsing session data", e);
        }
      }

      // 3. CARGA INICIAL: Si es un proyecto nuevo o no hay nada guardado
      try {
        const res = await fetch(
          `/routers/${sector || "A0_Sistema_FV"}/${grupo || "A61_Conectado_a_red"}/${cod || "FV01_Autoconsumo_sin_excedentes"}.xlsx`
        );

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
      } catch (e) {
        toast.error("Error al cargar el archivo Excel");
        console.error(e);
      }
    };

    init();
    // Agregamos excelData a las dependencias con cuidado, 
    // pero la guarda del punto 1 evitará el bucle infinito.
  }, [sector, grupo, cod]);
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
          if (val !== "" && !/^-?\d*\.?\d*$/.test(val) && !isExcl && !Utils.isDistribution(newRow[c])) return row;
          newRow[c] = isExcl ? `!${val}` : val;
        }
        return newRow;
      });
      const newData = { ...prev, [sheet]: newSheetData };
      if (sheet === "PDF") broadcastAndSave(newData);
      return newData;
    });
  };

  // Función para actualizar una hoja completa y sincronizar sesión (Usada por el Formulario)
  const updateFullSheet = (sheetName, newSheetData) => {
    setExcelData(prev => {
      // 1. Intentamos recuperar lo último que haya en sesión por si AppFV escribió ahí
      const sessionRaw = sessionStorage.getItem("excelData");
      const baseData = sessionRaw ? JSON.parse(sessionRaw) : prev;

      // 2. Mezclamos los datos base con la nueva hoja PDF
      const newData = { ...baseData, [sheetName]: newSheetData };

      // 3. Sincronizamos sesión inmediatamente
      broadcastAndSave(newData);
      return newData;
    });
    toast.success("Proyecto actualizado");
  };

  const saveCurrentSheet = () => {
    broadcastAndSave(excelData);
    lastSavedDataRef.current[currentSheet] = JSON.stringify(excelData[currentSheet]);
    setDirtySheets(prev => ({ ...prev, [currentSheet]: false }));
    toast.success("Cambios guardados");
  };

  // ... dentro del componente ExcelUploaderStorage

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Extraer el prefijo del sistema (ej. de "FV01_Autoconsumo" extrae "FV01")
    const currentPrefix = cod ? cod.split("_")[0].toUpperCase() : "";

    // 2. Extraer el prefijo del archivo seleccionado
    // Si el archivo se llama "ITE_FV01_Proyecto.xlsx", extraemos "FV01"
    const fileName = file.name.toUpperCase();

    // Buscamos si el prefijo actual está contenido al inicio del nombre del archivo
    // Esto soluciona el problema si el archivo tiene el prefijo "ITE_" delante
    const isValid = fileName.includes(currentPrefix) && currentPrefix !== "";

    if (!isValid) {
      toast.error(
        `Tipo de archivo incorrecto. El sistema espera un proyecto de tipo [${currentPrefix}], pero el archivo seleccionado no parece coincidir.`
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });

        if (!wb.SheetNames.includes("PDF")) {
          toast.error("El Excel no tiene el formato correcto (Falta hoja PDF)");
          return;
        }

        const p = {};
        wb.SheetNames.forEach(n => {
          p[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "" });
          lastSavedDataRef.current[n] = JSON.stringify(p[n]);
        });

        setExcelData(p);
        broadcastAndSave(p);
        setDirtySheets({});
        toast.success("Proyecto importado con éxito");
      } catch (err) {
        toast.error("Error crítico al leer el archivo");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // ... resto del componente

  const handleExport = () => {
    const data = JSON.parse(sessionStorage.getItem("excelData") || JSON.stringify(excelData));
    const wb = XLSX.utils.book_new();
    Object.entries(data).forEach(([n, d]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(d), n));
    XLSX.writeFile(wb, `ITE_${cod?.split("_")[0] || "PROY"}_${projectName}.xlsx`);
  };

  useEffect(() => {
    if (!currentSheet || CONFIG.IGNORE_DIRTY_SHEETS.includes(currentSheet)) return;
    setDirtySheets(prev => ({ ...prev, [currentSheet]: JSON.stringify(excelData[currentSheet]) !== lastSavedDataRef.current[currentSheet] }));
  }, [excelData, currentSheet]);

  useEffect(() => { sessionStorage.setItem("activeTabIdx", activeTab); }, [activeTab]);

  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} />
      <Toolbar projectName={projectName} onOpenFile={() => fileInputRef.current.click()} onOpenForm={() => setIsFormOpen(true)} onExport={handleExport} sheetNames={sheetNames} activeTab={activeTab} onTabChange={setActiveTab} dirtySheets={dirtySheets} />

      <Box sx={{ height: 60 }} />

      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
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
          <Box sx={{ display: "inline-block", border: "1px solid #ddd", bgcolor: "#fff", borderRadius: 1 }}>
            {(excelData[currentSheet] || []).map((row, r) => (
              <Box key={r} sx={{ display: "flex", borderBottom: "1px solid #eee" }}>
                {row.map((cell, c) => (
                  <CellRenderer key={c} value={cell} columnWidth={Utils.getColumnWidths(excelData[currentSheet])[c]} onUpdate={updateCell} sheetName={currentSheet} rowIndex={r} colIndex={c} />
                ))}
                {Utils.isUpperSheet(currentSheet) && r > 0 && (
                  <Box sx={{ display: "flex", px: 1, alignItems: "center", gap: 1 }}>
                    <ContentCopyIcon sx={{ fontSize: 16, cursor: "pointer" }} onClick={() => setExcelData(p => ({ ...p, [currentSheet]: [...p[currentSheet].slice(0, r + 1), [...p[currentSheet][r]], ...p[currentSheet].slice(r + 1)] }))} />
                    <DeleteIcon sx={{ fontSize: 16, cursor: "pointer", color: "error.light" }} onClick={() => setExcelData(p => ({ ...p, [currentSheet]: p[currentSheet].filter((_, i) => i !== r) }))} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {!CONFIG.SHEET_COMPONENTS[currentSheet] && currentSheet && !CONFIG.HIDE_SAVE_BUTTON_SHEETS.includes(currentSheet) && (
        <Badge color="error" variant="dot" invisible={!dirtySheets[currentSheet]} sx={{ position: "fixed", top: 100, right: 20 }}>
          <Fab onClick={saveCurrentSheet} size="small" color="primary"><SaveIcon fontSize="small" /></Fab>
        </Badge>
      )}

      {/* FORMULARIO DE PROYECTO CORREGIDO */}
      <ProjectFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        pdfData={excelData["PDF"] || []}
        onSaveAll={(newData) => updateFullSheet("PDF", newData)}
      />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </Box>
  );
};

export default ExcelUploaderStorage;