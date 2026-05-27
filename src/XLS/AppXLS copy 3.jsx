import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Box, Tabs, Tab, Fab, Tooltip, Badge, Typography, TextField, IconButton, 
  MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Divider 
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import TableViewIcon from "@mui/icons-material/TableView";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import AppFV from "./XLShojas/FV/AppFV";
import { PdfViewerContent } from "./XLShojas/PDF/AppPDF";

// ===============================
// ⚙️ CONFIGURACIÓN CENTRALIZADA
// ===============================
const CONFIG = {
  // Hojas que NO deben mostrar indicador de cambios sucios
  IGNORE_DIRTY_SHEETS: ["PDF"],
  
  // Hojas que NO deben mostrar el botón flotante de guardado
  HIDE_SAVE_BUTTON_SHEETS: ["PDF"],
  
  // Hojas que usan componentes especiales
  sheetComponentMap: {
    Diseño_FV: AppFV,
    PDF: PdfViewerContent,
  },
};

// ===============================
// 📊 COMPONENTE: DistributionBarChart
// ===============================
const DistributionBarChart = ({ value, onChange, width }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);
  const startYRef = useRef(null);
  const startValRef = useRef(null);
  const startMaxValRef = useRef(null);

  const formatDist = (arr) => `[${arr.map(v => Math.max(0, v).toFixed(3)).join(",")}]`;

  const data = useMemo(() => {
    try { return JSON.parse(value); } catch (e) { return []; }
  }, [value]);

  const maxValue = useMemo(() => Math.max(...data, 0.01), [data]);

  const handleMove = (clientY) => {
    if (isDragging === null || !containerRef.current || startMaxValRef.current === null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const chartHeight = rect.height - 20;
    const deltaY = startYRef.current - clientY;
    const deltaValue = (deltaY / chartHeight) * startMaxValRef.current;

    let newValue = Math.max(0, Math.min(1, startValRef.current + deltaValue));
    const newData = [...data];
    const remainingTarget = 1 - newValue;
    const currentSumOthers = data.reduce((acc, val, i) => i !== isDragging ? acc + val : acc, 0);

    const updatedData = newData.map((val, i) => {
      if (i === isDragging) return newValue;
      if (currentSumOthers <= 1e-6) return remainingTarget / (data.length - 1);
      return (val / currentSumOthers) * remainingTarget;
    });

    onChange(formatDist(updatedData));
  };

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e.clientY);
    const onTouchMove = (e) => {
      if (isDragging !== null && e.cancelable) e.preventDefault();
      handleMove(e.touches[0].clientY);
    };
    const handleUp = () => { 
      setIsDragging(null); 
      startMaxValRef.current = null; 
    };

    if (isDragging !== null) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, data]);

  if (!Array.isArray(data) || data.length === 0) return <Box sx={{ width, p: 1 }}>Error</Box>;

  return (
    <Box
      ref={containerRef}
      sx={{
        width, height: 140, display: "flex", flexDirection: "column",
        bgcolor: "#ffffff", borderRight: "1px solid #eee", boxSizing: "border-box",
        userSelect: "none", position: "relative", cursor: isDragging !== null ? "ns-resize" : "default",
        p: "4px", touchAction: "none"
      }}
    >
      <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "2px", position: "relative" }}>
        {data.map((val, i) => (
          <Tooltip key={i} title={`${(val * 100).toFixed(2)}%`} arrow disableInteractive>
            <Box
              onMouseDown={(e) => {
                setIsDragging(i); startYRef.current = e.clientY;
                startValRef.current = data[i]; startMaxValRef.current = maxValue;
              }}
              onTouchStart={(e) => {
                setIsDragging(i); startYRef.current = e.touches[0].clientY;
                startValRef.current = data[i]; startMaxValRef.current = maxValue;
              }}
              sx={{
                flex: 1, height: `${(val / maxValue) * 100}%`,
                bgcolor: i === isDragging ? "#ff9800" : (i === 0 ? "#1976d2" : "#42a5f5"),
                borderRadius: "1px 1px 0 0", border: "1px solid rgba(0,0,0,0.1)",
                transition: isDragging !== null ? "none" : "height 0.2s ease",
                zIndex: i === isDragging ? 2 : 1
              }}
            />
          </Tooltip>
        ))}
        <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px dashed #ddd", pointerEvents: "none", zIndex: 0 }} />
      </Box>
      <Box sx={{ display: "flex", gap: "2px", mt: "4px" }}>
        {data.map((_, i) => (
          <Box key={i} sx={{ flex: 1, textAlign: "center", fontSize: "0.65rem", color: "#888", fontWeight: "bold", fontFamily: "monospace" }}>{i + 1}</Box>
        ))}
      </Box>
    </Box>
  );
};

// ===============================
// 🧩 COMPONENTE: CellRenderer
// ===============================
const CellRenderer = ({ value, columnWidth, sheetName, rowIndex, colIndex, onUpdate }) => {
  const isNumeric = (val) => val !== "" && !isNaN(val) && isFinite(val);
  const isExclamation = (val) => typeof val === "string" && val.startsWith("!");
  const isSelector = (val) => typeof val === "string" && val.includes(";") && !val.startsWith("!");
  const isDistribution = (val) => {
    if (typeof val !== "string") return false;
    const trimmed = val.trim();
    return trimmed.startsWith("[") && trimmed.endsWith("]");
  };

  if (isDistribution(value)) {
    return (
      <DistributionBarChart
        value={value}
        width={columnWidth || 120}
        onChange={(val) => onUpdate(sheetName, rowIndex, colIndex, val)}
      />
    );
  }

  if (isSelector(value)) {
    const options = value.split(";");
    return (
      <Box sx={{ width: columnWidth || 120, borderRight: "1px solid #eee", px: 0, display: "flex", alignItems: "center" }}>
        <select
          value={options[0]}
          onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
          style={{
            width: "100%", border: "none", padding: "10px", fontSize: "0.85rem",
            backgroundColor: "#e3f2fd", color: "#000", outline: "none",
            cursor: "pointer", appearance: "none", textAlign: "center"
          }}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      </Box>
    );
  }

  const editable = isNumeric(value) || isExclamation(value);
  return (
    <input
      value={isExclamation(value) ? value.slice(1) : (value ?? "")}
      onChange={(e) => onUpdate(sheetName, rowIndex, colIndex, e.target.value)}
      disabled={!editable}
      style={{
        width: columnWidth || 120, border: "none", borderRight: "1px solid #eee", padding: "10px",
        textAlign: isNumeric(value) || isExclamation(value) ? "right" : "left",
        backgroundColor: isExclamation(value) ? "#fff3cd" : editable ? "#fff" : "#f9f9f9",
        color: editable ? "#000" : "#888", fontSize: "0.85rem", outline: "none"
      }}
    />
  );
};

// ===============================
// 🧩 COMPONENTE: ProjectFormDialog
// ===============================
const ProjectFormDialog = ({ open, onClose, pdfData, onUpdateField }) => {
  const dynamicSections = Array.from(
    new Set(
      (pdfData || [])
        .slice(1)
        .filter(row => row && row[0] && row[0].includes("_"))
        .map(row => row[0].split("_")[0])
    )
  );

  const handleSave = () => {
    const fullData = JSON.parse(sessionStorage.getItem("excelData") || "{}");
    fullData["PDF"] = pdfData;
    sessionStorage.setItem("excelData", JSON.stringify(fullData));
    window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: JSON.stringify(fullData) }));
    onClose();
    toast.success("Cambios sincronizados");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 3000 }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", bgcolor: "#f5f5f5" }}>
        Configuración del Proyecto
      </DialogTitle>
      <DialogContent dividers sx={{ mt: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
          {pdfData && pdfData.length > 0 ? (
            dynamicSections.map((sectionName) => {
              const fields = pdfData.slice(1).filter(row => row && row[0] && row[0].startsWith(`${sectionName}_`));
              return (
                <Box key={sectionName}>
                  <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 1.2 }}>
                    {sectionName}
                  </Typography>
                  <Divider sx={{ mb: 2, mt: 0.5, borderBottomWidth: 2, borderColor: "primary.light" }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {fields.map((row) => {
                      const rawKey = row[0];
                      const cleanLabel = rawKey.split("_").slice(1).join(" ");
                      return (
                        <TextField 
                          key={rawKey} 
                          label={cleanLabel} 
                          fullWidth 
                          size="small" 
                          value={row[1] || ""} 
                          onChange={(e) => onUpdateField(rawKey, e.target.value)} 
                          variant="outlined" 
                          InputLabelProps={{ shrink: true }} 
                          sx={{ "& .MuiInputLabel-root": { fontWeight: 700 } }} 
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography variant="body2" sx={{ p: 3, textAlign: "center", color: "gray" }}>
              Cargando campos...
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" sx={{ fontWeight: 700 }}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ===============================
// 🧩 COMPONENTE: Toolbar
// ===============================
const Toolbar = ({ projectName, onOpenFile, onOpenForm, onExport, sheetNames, activeTab, onTabChange, dirtySheets }) => {
  
  // Función para determinar si una hoja debe mostrar indicador sucio
  const shouldShowDirty = (sheetName) => {
    return !CONFIG.IGNORE_DIRTY_SHEETS.includes(sheetName) && dirtySheets[sheetName];
  };

  // Función para determinar el color del tab
  const getTabColor = (sheetName, isSelected) => {
    const hasDirty = shouldShowDirty(sheetName);
    if (isSelected) {
      return hasDirty ? "#d32f2f" : "#1976d2";
    }
    return hasDirty ? "#d32f2f" : "#555";
  };

  return (
    <Box sx={{
      position: "fixed",
      top: 35,
      left: 0,
      right: 0,
      bgcolor: "white",
      zIndex: 1100,
      borderBottom: 1,
      borderColor: "rgba(0, 0, 0, 0.1)",
      display: "flex",
      justifyContent: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      px: { xs: 1, sm: 2 }
    }}>
      <Box sx={{
        width: "100%",
        maxWidth: "1400px",
        display: "flex",
        alignItems: "center",
        height: 40 
      }}>
        {/* Botón abrir proyecto */}
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Abrir proyecto">
            <IconButton onClick={onOpenFile} size="small" sx={{ mr: 1, color: "#1976d2" }}>
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Nombre del proyecto */}
          <Tooltip title={`Proyecto: ${projectName} (Clic para configurar)`} arrow >
            <Typography
              onClick={onOpenForm}
              sx={{
                fontWeight: 800,
                fontSize: "0.75rem",
                cursor: "pointer",
                color: "#333",
                maxWidth: { xs: "100px", sm: "150px", md: "250px" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                borderBottom: "1px dashed #1976d2",
                "&:hover": { color: "#1976d2" },
                transition: "all 0.2s"
              }}
            >
              {projectName}
            </Typography>
          </Tooltip>
        </Box>

        {/* Tabs */}
        <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", justifyContent: "center", px: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => onTabChange(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              display: { xs: "none", sm: "flex" },
              minHeight: '40px',
              height: '40px',
              '& .MuiTabs-indicator': { backgroundColor: '#fbc02d', height: 3 }
            }}
          >
            {sheetNames.map((name, i) => (
              <Tab
                key={i}
                label={name.replace(/_/g, ' ')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  minHeight: '40px',
                  px: 2,
                  textTransform: 'uppercase',
                  color: getTabColor(name, false),
                  '&.Mui-selected': { color: getTabColor(name, true) }
                }}
              />
            ))}
          </Tabs>

          {/* Select móvil */}
          <FormControl size="small" sx={{ display: { xs: "flex", sm: "none" }, width: "100%", maxWidth: 180 }}>
            <Select
              value={activeTab}
              onChange={(e) => onTabChange(e.target.value)}
              sx={{ height: 30, fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}
            >
              {sheetNames.map((name, i) => (
                <MenuItem key={i} value={i} sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {shouldShowDirty(name) && <Box sx={{ width: 6, height: 6, bgcolor: "#d32f2f", borderRadius: "50%", mr: 1 }} />}
                    {name.replace(/_/g, ' ')}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Botón exportar */}
        <Box sx={{ flexShrink: 0 }}>
          <Tooltip title="Guardar proyecto">
            <IconButton onClick={onExport} size="small" sx={{ color: "#2e7d32" }}>
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

// ===============================
// 🧩 COMPONENTE: SheetRenderer
// ===============================
const SheetRenderer = ({ sheetName, data, columnWidths, onUpdateCell, onDuplicateRow, onDeleteRow, isUpperSheet }) => {
  const isHeaderRow = (r) => r === 0;
  
  return (
    <Box sx={{ display: "inline-block", maxWidth: "100%", border: "1px solid #ddd", bgcolor: "#fff", boxShadow: 1, borderRadius: "4px" }}>
      {data.length > 0 ? (
        data.map((row, r) => (
          <Box key={r} sx={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee" }}>
            {(row || []).map((cell, c) => (
              <CellRenderer
                key={c}
                value={cell}
                columnWidth={columnWidths[c]}
                sheetName={sheetName}
                rowIndex={r}
                colIndex={c}
                onUpdate={onUpdateCell}
              />
            ))}
            {isUpperSheet(sheetName) && !isHeaderRow(r) && (
              <Box sx={{ display: "flex", px: 1, gap: 1 }}>
                <ContentCopyIcon 
                  sx={{ fontSize: 18, cursor: "pointer", color: "action.active", "&:hover": { color: "primary.main" } }} 
                  onClick={() => onDuplicateRow(sheetName, r)} 
                />
                <DeleteIcon 
                  sx={{ fontSize: 18, cursor: "pointer", color: "error.light", "&:hover": { color: "error.main" } }} 
                  onClick={() => onDeleteRow(sheetName, r)} 
                />
              </Box>
            )}
          </Box>
        ))
      ) : (
        <Box sx={{ p: 10, textAlign: "center", color: "gray" }}>Cargando datos...</Box>
      )}
    </Box>
  );
};

// ===============================
// 🧠 COMPONENTE PRINCIPAL: ExcelUploaderStorage
// ===============================
const getColumnWidths = (data) => {
  if (!data || !data.length) return [];
  const cols = Math.max(...data.map((r) => (r ? r.length : 0)));
  const widths = Array(cols).fill(80);
  for (let c = 0; c < cols; c++) {
    let max = 4;
    data.forEach((row) => {
      const val = row?.[c];
      const text = val === null || val === undefined ? "" : String(val);
      if (text.length > max) max = text.length;
    });
    widths[c] = Math.min(Math.max(max * 8, 80), 300);
  }
  return widths;
};

const ExcelUploaderStorage = () => {
  const { sector, grupo, cod } = useParams();

  const activeSector = sector || "A0_Sistema_FV";
  const activeGrupo = grupo || "A61_Conectado_a_red";
  const activeCod = cod || "FV01_Autoconsumo_sin_excedentes";

  const [excelData, setExcelData] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("activeTabIdx");
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  const [dirtySheets, setDirtySheets] = useState({});
  const lastSavedDataRef = useRef({});
  const fileInputRef = useRef(null);

  const sheetNames = useMemo(() => Object.keys(excelData || {}), [excelData]);
  const currentSheetName = sheetNames[activeTab];

  const projectName = useMemo(() => {
    if (excelData["PDF"]) {
      const row = excelData["PDF"].find(r => r && r[0] === "Documento_nombre");
      return row ? row[1] : (sessionStorage.getItem("projectName") || "sin nombre");
    }
    return sessionStorage.getItem("projectName") || "sin nombre";
  }, [excelData]);

  // Helpers
  const isUpperSheet = (name) => name && name === name.toUpperCase();
  
  // Función para verificar si una hoja debe ignorar el estado "dirty"
  const shouldIgnoreDirty = (sheetName) => CONFIG.IGNORE_DIRTY_SHEETS.includes(sheetName);
  
  // Función para verificar si debe mostrar el botón de guardado
  const shouldShowSaveButton = (sheetName) => {
    return !CONFIG.HIDE_SAVE_BUTTON_SHEETS.includes(sheetName);
  };

  // Sincronización
  useEffect(() => {
    sessionStorage.setItem("activeTabIdx", activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem("projectName", projectName);
  }, [projectName]);

  // Carga dinámica
  useEffect(() => {
    const loadFromUrl = async () => {
      try {
        const currentKey = `${activeSector}-${activeGrupo}-${activeCod}`;
        const savedKey = sessionStorage.getItem("excelKey");
        const savedData = sessionStorage.getItem("excelData");

        if (savedKey === currentKey && savedData) {
          const parsed = JSON.parse(savedData);
          setExcelData(parsed);
          setDirtySheets({});
          Object.keys(parsed).forEach(name => {
            lastSavedDataRef.current[name] = JSON.stringify(parsed[name]);
          });
          return;
        }

        const path = `/routers/${activeSector}/${activeGrupo}/${activeCod}.xlsx`;
        const res = await fetch(path);
        if (!res.ok) throw new Error(`No se encuentra el archivo: ${activeCod}.xlsx`);

        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

        const parsed = {};
        workbook.SheetNames.forEach((name) => {
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "" });
          parsed[name] = data;
          lastSavedDataRef.current[name] = JSON.stringify(data);
        });

        setExcelData(parsed);
        setDirtySheets({});
        setActiveTab(0);
        sessionStorage.setItem("excelData", JSON.stringify(parsed));
        sessionStorage.setItem("excelKey", currentKey);
        toast.info(`Cargado desde archivo: ${activeCod}`);
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
    };

    loadFromUrl();
  }, [activeSector, activeGrupo, activeCod]);

  // Detectar cambios (IGNORANDO hojas configuradas)
  useEffect(() => {
    if (!currentSheetName || !excelData[currentSheetName]) return;
    
    // Si la hoja debe ignorar dirty, siempre la marcamos como limpia
    if (shouldIgnoreDirty(currentSheetName)) {
      setDirtySheets(prev => ({ ...prev, [currentSheetName]: false }));
      return;
    }
    
    const currentContent = JSON.stringify(excelData[currentSheetName]);
    const isDifferent = currentContent !== lastSavedDataRef.current[currentSheetName];
    setDirtySheets(prev => ({ ...prev, [currentSheetName]: isDifferent }));
  }, [excelData, currentSheetName]);

  // Acciones
  const saveCurrentSheetToSession = () => {
    if (!currentSheetName) return;
    const sessionRaw = sessionStorage.getItem("excelData");
    let fullData = sessionRaw ? JSON.parse(sessionRaw) : {};
    fullData[currentSheetName] = excelData[currentSheetName];
    const finalValue = JSON.stringify(fullData);
    sessionStorage.setItem("excelData", finalValue);
    window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: finalValue }));
    lastSavedDataRef.current[currentSheetName] = JSON.stringify(excelData[currentSheetName]);
    setDirtySheets(prev => ({ ...prev, [currentSheetName]: false }));
    toast.success(`Hoja "${currentSheetName}" guardada en sesión`);
  };

  const updatePDFField = (variableName, newValue) => {
    setExcelData(prev => {
      if (!prev || !prev["PDF"]) return prev;
      const newData = { ...prev };
      const pdfSheet = [...newData["PDF"]];
      const idx = pdfSheet.findIndex(row => row && row[0] === variableName);
      if (idx !== -1) {
        pdfSheet[idx] = [variableName, newValue];
      }
      newData["PDF"] = pdfSheet;
      return newData;
    });
  };

  const importFromDisk = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const currentPrefix = activeCod.split("_")[0].toUpperCase();
    const fileNameUpper = file.name.toUpperCase();

    if (!fileNameUpper.startsWith("ITE_")) {
      toast.error("ERROR: Solo archivos que comiencen por 'ITE_'");
      e.target.value = "";
      return;
    }

    if (!fileNameUpper.includes(`_${currentPrefix}_`)) {
      toast.error(`ERROR: No corresponde al tipo ${currentPrefix}`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const parsed = {};
        workbook.SheetNames.forEach(name => {
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "" });
          parsed[name] = data;
          lastSavedDataRef.current[name] = JSON.stringify(data);
        });

        setExcelData(parsed);
        setDirtySheets({});
        const finalValue = JSON.stringify(parsed);
        sessionStorage.setItem("excelData", finalValue);
        window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: finalValue, storageArea: sessionStorage }));
        toast.success("Proyecto ITE cargado correctamente");
      } catch (err) { toast.error("Error al procesar el archivo"); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const exportToExcelFromSession = () => {
    const sessionRaw = sessionStorage.getItem("excelData");
    const dataToExport = sessionRaw ? JSON.parse(sessionRaw) : excelData;
    const workbook = XLSX.utils.book_new();
    Object.entries(dataToExport).forEach(([name, data]) => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, ws, name);
    });

    const prefix = activeCod.split("_")[0];
    const fileName = `ITE_${prefix}_${projectName.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success(`Exportado como: ${fileName}`);
  };

  const updateCell = (sheet, r, c, value) => {
    const prev = excelData?.[sheet]?.[r]?.[c];
    const isDistribution = (val) => {
      if (typeof val !== "string") return false;
      const trimmed = val.trim();
      return trimmed.startsWith("[") && trimmed.endsWith("]");
    };
    const isSelector = (val) => typeof val === "string" && val.includes(";") && !val.startsWith("!");
    const isExclamation = (val) => typeof val === "string" && val.startsWith("!");

    if (isDistribution(prev)) {
      setExcelData(prevData => ({
        ...prevData,
        [sheet]: prevData[sheet].map((row, ri) =>
          ri === r ? row.map((cell, ci) => ci === c ? value : cell) : row
        )
      }));
      return;
    }

    if (isSelector(prev)) {
      const options = prev.split(";");
      const rest = options.filter(opt => opt !== value);
      const finalValue = [value, ...rest].join(";");

      setExcelData(prevData => ({
        ...prevData,
        [sheet]: prevData[sheet].map((row, ri) =>
          ri === r ? row.map((cell, ci) => ci === c ? finalValue : cell) : row
        )
      }));
      return;
    }

    const hadExcl = isExclamation(prev);
    if (value !== "" && !/^-?\d*\.?\d*$/.test(value) && !hadExcl) return;
    setExcelData(prevData => ({
      ...prevData,
      [sheet]: prevData[sheet].map((row, ri) =>
        ri === r ? row.map((cell, ci) => ci === c ? (hadExcl ? `!${value}` : value) : cell) : row
      )
    }));
  };

  const duplicateRow = (sheet, index) => {
    if (index === 0) return;
    setExcelData((prev) => {
      const sheetData = prev[sheet];
      const clonedRow = [...sheetData[index]];
      return { ...prev, [sheet]: [...sheetData.slice(0, index + 1), clonedRow, ...sheetData.slice(index + 1)] };
    });
  };

  const deleteRow = (sheet, index) => {
    if (index === 0) return;
    setExcelData((prev) => {
      const rows = prev[sheet] || [];
      if (rows.length <= 2) return prev;
      return { ...prev, [sheet]: rows.filter((_, i) => i !== index) };
    });
  };

  const columnWidths = useMemo(() => getColumnWidths(excelData[currentSheetName] || []), [excelData, currentSheetName]);
  const ActiveComponent = CONFIG.sheetComponentMap[currentSheetName] || null;
  const activeSheetData = excelData[currentSheetName] || [];

  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "1400px", margin: "0 auto", p: 2, display: "flex", flexDirection: "column" }}>
        
        {/* Input oculto para carga de archivos */}
        <input type="file" ref={fileInputRef} onChange={importFromDisk} accept=".xlsx, .xls" style={{ display: "none" }} />

        {/* Toolbar */}
        <Toolbar
          projectName={projectName}
          onOpenFile={() => fileInputRef.current.click()}
          onOpenForm={() => setIsFormOpen(true)}
          onExport={exportToExcelFromSession}
          sheetNames={sheetNames}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dirtySheets={dirtySheets}
        />

        {/* Espaciador para el toolbar fijo */}
        <Box sx={{ height: "60px", width: "100%" }} />

        {/* Diálogo de configuración */}
        <ProjectFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          pdfData={excelData["PDF"]}
          onUpdateField={updatePDFField}
        />

        {/* Contenido principal */}
        <Box sx={{ mt: 2, flexGrow: 1, overflow: "auto", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {ActiveComponent ? (
            <Box sx={{ width: "100%" }}>
              <ActiveComponent
                sheetName={currentSheetName}
                data={activeSheetData}
                setExcelData={setExcelData}
                sector={activeSector}
                grupo={activeGrupo}
                cod={activeCod}
              />
            </Box>
          ) : (
            <SheetRenderer
              sheetName={currentSheetName}
              data={activeSheetData}
              columnWidths={columnWidths}
              onUpdateCell={updateCell}
              onDuplicateRow={duplicateRow}
              onDeleteRow={deleteRow}
              isUpperSheet={isUpperSheet}
            />
          )}
        </Box>
      </Box>

      {/* Botón flotante de guardado (solo para hojas que no están en HIDE_SAVE_BUTTON_SHEETS) */}
      {!ActiveComponent && currentSheetName && shouldShowSaveButton(currentSheetName) && (
        <Badge
          color="error"
          variant="dot"
          invisible={!dirtySheets[currentSheetName]}
          sx={{
            position: "fixed",
            top: 100,
            right: 20,
            zIndex: 2000,
            "& .MuiBadge-badge": { top: 4, right: 4 }
          }}
        >
          <Fab
            onClick={saveCurrentSheetToSession}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 32,
              height: 32,
              minHeight: 32,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <SaveIcon sx={{ fontSize: 18 }} />
          </Fab>
        </Badge>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar />
    </Box>
  );
};

export default ExcelUploaderStorage;