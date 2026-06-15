import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Tabs, Tab, Fab, Tooltip, Badge, Typography, TextField, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderOpenIcon from "@mui/icons-material/FolderOpen"; // Icono para abrir
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";

import TableViewIcon from "@mui/icons-material/TableView"; // Representa la hoja de Excel
import FileUploadIcon from "@mui/icons-material/FileUpload"; // Flecha subir
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Flecha bajar


import AppFV from "./XLShojas/FV/AppFV";
// Importamos el contenido lógico del PDF (el export nombrado)
import { PdfViewerContent } from "./XLShojas/PDF/AppPDF";

// ===============================
// 📊 COMPONENTE DE DISTRIBUCIÓN (PRECISIÓN 1:1)
// ===============================
const isDistribution = (val) => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  return trimmed.startsWith("[") && trimmed.endsWith("]");
};

const formatDist = (arr) => `[${arr.map(v => Math.max(0, v).toFixed(3)).join(",")}]`;

const DistributionBarChart = ({ value, onChange, width }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);
  const startYRef = useRef(null);
  const startValRef = useRef(null);
  const startMaxValRef = useRef(null);

  const data = useMemo(() => {
    try { return JSON.parse(value); } catch (e) { return []; }
  }, [value]);

  const maxValue = useMemo(() => Math.max(...data, 0.01), [data]);

  const handleMouseMove = (e) => {
    if (isDragging === null || !containerRef.current || startMaxValRef.current === null) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Ajustamos el cálculo considerando que el área de barras es un poco menor por los números
    const chartHeight = rect.height - 20;
    const deltaY = startYRef.current - e.clientY;
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
    const handleMouseUp = () => { setIsDragging(null); startMaxValRef.current = null; };
    if (isDragging !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, data]);

  if (!Array.isArray(data) || data.length === 0) return <Box sx={{ width, p: 1 }}>Error</Box>;

  return (
    <Box
      ref={containerRef}
      sx={{
        width,
        height: 140, // Aumentamos un poco la altura para los números
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRight: "1px solid #eee",
        boxSizing: "border-box",
        userSelect: "none",
        position: "relative",
        cursor: isDragging !== null ? "ns-resize" : "default",
        p: "4px"
      }}
    >
      {/* Área de Gráfico */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "2px", position: "relative" }}>
        {data.map((val, i) => (
          <Tooltip key={i} title={`${(val * 100).toFixed(2)}%`} arrow disableInteractive>
            <Box
              onMouseDown={(e) => {
                setIsDragging(i); startYRef.current = e.clientY;
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
        {/* Línea horizontal de referencia */}
        <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px dashed #ddd", pointerEvents: "none", zIndex: 0 }} />
      </Box>

      {/* Eje X: Numeración */}
      <Box sx={{ display: "flex", gap: "2px", mt: "4px" }}>
        {data.map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.65rem",
              color: "#888",
              fontWeight: "bold",
              fontFamily: "monospace"
            }}
          >
            {i + 1}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ===============================
// 🧠 MAPEO DE COMPONENTES
// ===============================
const sheetComponentMap = {
  Diseño_FV: AppFV,
  // Definimos PDF como el componente que recibirá las props de ruta
  PDF: PdfViewerContent,
};

// ===============================
// 📏 HELPERS DE DISEÑO
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

  // Valores activos basados en URL o Fallback
  const activeSector = sector || "A0_Sistema_FV";
  const activeGrupo = grupo || "A61_Conectado_a_red";
  const activeCod = cod || "FV01_Autoconsumo_sin_excedentes";

  const [excelData, setExcelData] = useState({});

  // --- NUEVA FUNCIONALIDAD: GESTIÓN DE PROYECTO ---
  const [projectName, setProjectName] = useState("sin nombre");
  const [isEditingName, setIsEditingName] = useState(false);

  // PERSISTENCIA DEL TAB: Intentamos leer de sessionStorage al cargar
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("activeTabIdx");
    return savedTab ? parseInt(savedTab, 10) : 0;
  });

  const [dirtySheets, setDirtySheets] = useState({});

  const lastSavedDataRef = useRef({});
  const fileInputRef = useRef(null);

  const sheetNames = useMemo(() => Object.keys(excelData || {}), [excelData]);
  const currentSheetName = sheetNames[activeTab];

  // Efecto para guardar el tab actual cada vez que cambie
  useEffect(() => {
    sessionStorage.setItem("activeTabIdx", activeTab);
  }, [activeTab]);

  // Helpers de validación
  const isNumeric = (val) => val !== "" && !isNaN(val) && isFinite(val);
  const isExclamation = (val) => typeof val === "string" && val.startsWith("!");
  const isUpperSheet = (name) => name && name === name.toUpperCase();
  const isHeaderRow = (r) => r === 0;

  // NUEVO HELPER: Detectar si es un string separado por ; (selector)
  const isSelector = (val) => typeof val === "string" && val.includes(";") && !val.startsWith("!");

  // ===============================
  // 📥 CARGA DINÁMICA (Efecto de Ruta)
  // ===============================
  useEffect(() => {
    const loadFromUrl = async () => {
      try {
        const currentKey = `${activeSector}-${activeGrupo}-${activeCod}`;
        const savedKey = sessionStorage.getItem("excelKey");
        const savedData = sessionStorage.getItem("excelData");

        // 🧠 CASO 1: MISMA URL → usar sesión
        if (savedKey === currentKey && savedData) {
          const parsed = JSON.parse(savedData);

          setExcelData(parsed);
          setDirtySheets({});
          // Eliminamos setActiveTab(0) para que respete el estado inicial del useState

          // reconstruir lastSavedDataRef
          Object.keys(parsed).forEach(name => {
            lastSavedDataRef.current[name] = JSON.stringify(parsed[name]);
          });

          toast.info(`Restaurado desde sesión: ${activeCod}`);
          return;
        }

        // 🌐 CASO 2: URL distinta → fetch
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
        // Solo resetear el tab si cambiamos de archivo/ruta totalmente
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

  // 🔴 Detectar cambios manuales para el punto rojo
  useEffect(() => {
    if (!currentSheetName || !excelData[currentSheetName]) return;
    const currentContent = JSON.stringify(excelData[currentSheetName]);
    const isDifferent = currentContent !== lastSavedDataRef.current[currentSheetName];
    setDirtySheets(prev => ({ ...prev, [currentSheetName]: isDifferent }));
  }, [excelData, currentSheetName]);

  // ===============================
  // 💾 ACCIONES DE PERSISTENCIA
  // ===============================
  const saveCurrentSheetToSession = () => {
    if (!currentSheetName) return;
    const sessionRaw = sessionStorage.getItem("excelData");
    let fullData = sessionRaw ? JSON.parse(sessionRaw) : {};
    fullData[currentSheetName] = excelData[currentSheetName];
    const finalValue = JSON.stringify(fullData);
    sessionStorage.setItem("excelData", finalValue);

    // NOTIFICAR AL RESTO DE COMPONENTES
    window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: finalValue }));

    lastSavedDataRef.current[currentSheetName] = JSON.stringify(excelData[currentSheetName]);
    setDirtySheets(prev => ({ ...prev, [currentSheetName]: false }));
    toast.success(`Hoja "${currentSheetName}" guardada en sesión`);
  };

  const importFromDisk = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDACIÓN ESTRICTA: Solo permitir archivos que empiecen por ITE_
    if (!file.name.toUpperCase().startsWith("ITE_")) {
      toast.error("ERROR: Solo se permiten archivos que comiencen por 'ITE_'");
      e.target.value = ""; // Limpiar el input
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

        // Intentar deducir el nombre del proyecto del nombre del archivo ITE_PREFIX_NOMBRE.xlsx
        const parts = file.name.replace(".xlsx", "").split("_");
        if (parts.length >= 3) {
          setProjectName(parts.slice(2).join(" ").replace(/_/g, " "));
        }

        setExcelData(parsed);
        setDirtySheets({});
        const finalValue = JSON.stringify(parsed);
        sessionStorage.setItem("excelData", finalValue);
        window.dispatchEvent(new StorageEvent('storage', { key: 'excelData', newValue: finalValue, storageArea: sessionStorage }));
        toast.success("Proyecto PRoman.blog cargado correctamente");
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

    // Nombre: ITE_<PrefijoCod>_<Proyecto>
    const prefix = activeCod.split("_")[0];
    const safeProjectName = projectName.replace(/\s+/g, "_");
    const fileName = `ITE_${prefix}_${safeProjectName}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success(`Exportado como: ${fileName}`);
  };

  // ===============================
  // ✏️ EDICIÓN DE DATOS
  // ===============================
  const updateCell = (sheet, r, c, value) => {
    const prev = excelData?.[sheet]?.[r]?.[c];

    // LÓGICA DE DISTRIBUCIONES [x,y,z]
    if (isDistribution(prev)) {
      setExcelData(prevData => ({
        ...prevData,
        [sheet]: prevData[sheet].map((row, ri) =>
          ri === r ? row.map((cell, ci) => ci === c ? value : cell) : row
        )
      }));
      return;
    }

    // LÓGICA DE REORDENAMIENTO PARA SELECTORES
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
  const ActiveComponent = sheetComponentMap[currentSheetName] || null;
  const activeSheetData = excelData[currentSheetName] || [];

  return (
    <Box sx={{ width: "100%", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "1400px", margin: "0 auto", p: 2, display: "flex", flexDirection: "column" }}>
        <input type="file" ref={fileInputRef} onChange={importFromDisk} accept=".xlsx, .xls" style={{ display: "none" }} />

        {/* CONTENEDOR FIJO DE TABS / NAVBAR */}
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
          <Box sx={{ width: "100%", maxWidth: "1400px", display: "flex", alignItems: "center" }}>

            {/* SECCIÓN IZQUIERDA: PROYECTO */}
            {/* CONTENEDOR FIJO DE PROYECTO Y TABS CENTRADO */}
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
              justifyContent: "center", // Centra el contenido horizontalmente
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              px: { xs: 1, sm: 2 }
            }}>
              <Box sx={{
                width: "100%",
                maxWidth: "1400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center" // Asegura que los elementos internos se agrupen hacia el centro
              }}>

                {/* SECCIÓN IZQUIERDA: PROYECTO (Ahora con ancho flexible para no empujar los tabs fuera del centro) */}
                <Box sx={{ display: "flex", alignItems: "center", mr: 0 }}>
                  <Tooltip title="Abrir proyecto">
                    <IconButton onClick={() => fileInputRef.current.click()} size="small" sx={{ mr: 1, color: "#1976d2" }}>
                      <FolderOpenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* <Typography sx={{ color: "#888", fontSize: "0.75rem", mr: 0.5, whiteSpace: "nowrap" }}>Proyectos /</Typography> */}
                  <Typography sx={{ color: "#888", fontSize: "0.75rem", mr: 0.0, whiteSpace: "nowrap" }}></Typography>

                  {isEditingName ? (
                    <TextField
                      variant="standard"
                      autoFocus
                      size="small"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      sx={{ "& .MuiInput-input": { fontWeight: 800, fontSize: "0.75rem", p: 0, width: "auto" } }}
                    />
                  ) : (
                    <Typography
                      onDoubleClick={() => setIsEditingName(true)}
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        color: "#333",
                        "&:hover": { color: "#1976d2" },
                        whiteSpace: "nowrap"
                      }}
                    >
                      {projectName}
                    </Typography>
                  )}
                </Box>

                {/* TABS CENTRALES */}
                <Tabs
                  value={activeTab}
                  onChange={(e, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    minHeight: '36px',
                    height: '36px',
                    '& .MuiTabs-scrollButtons': {
                      height: '36px',
                      '&.Mui-disabled': { opacity: 0.3 },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#fbc02d',
                      height: 3
                    }
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
                        minHeight: '36px',
                        px: 2,
                        textTransform: 'none',
                        textTransform: 'uppercase', // <--- Cambia 'none' por 'uppercase'
                        color: dirtySheets[name] ? "#d32f2f" : "#555",
                        '&.Mui-selected': {
                          color: dirtySheets[name] ? "#d32f2f" : "#1976d2",
                        }
                      }}
                    />
                  ))}
                </Tabs>

                {/* BOTÓN EXPORTAR DERECHA */}
                <Tooltip title="Guardar proyecto">
                  <IconButton onClick={exportToExcelFromSession} size="small" sx={{ ml: 1, color: "#2e7d32" }}>
                    <FileDownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                flexGrow: 1,
                minHeight: '36px',
                height: '36px',
                '& .MuiTabs-scrollButtons': {
                  height: '36px',
                  '&.Mui-disabled': { opacity: 0.3 },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#fbc02d',
                  height: 3
                }
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
                    minHeight: '36px',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    lineHeight: 1,
                    textTransform: 'none',
                    color: dirtySheets[name] ? "#d32f2f" : "#555",
                    '&.Mui-selected': {
                      color: dirtySheets[name] ? "#d32f2f" : "#1976d2",
                    }
                  }}
                />
              ))}
            </Tabs>

            {/* BOTÓN EXPORTAR DERECHA */}
            <Tooltip title="Exportar Proyecto como ITE_">
              <IconButton onClick={exportToExcelFromSession} size="small" sx={{ ml: 1, color: "#2e7d32" }}>
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ESPACIADOR */}
        <Box sx={{ height: "60px", width: "100%" }} />

        {/* CONTENIDO PRINCIPAL */}
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
            <Box sx={{ display: "inline-block", maxWidth: "100%", border: "1px solid #ddd", bgcolor: "#fff", boxShadow: 1, borderRadius: "4px" }}>
              {activeSheetData.length > 0 ? (
                activeSheetData.map((row, r) => (
                  <Box key={r} sx={{ display: "flex", alignItems: "center", borderBottom: "1px solid #eee" }}>
                    {(row || []).map((cell, c) => {

                      if (isDistribution(cell)) {
                        return (
                          <DistributionBarChart
                            key={c}
                            value={cell}
                            width={columnWidths[c] || 120}
                            onChange={(val) => updateCell(currentSheetName, r, c, val)}
                          />
                        );
                      }

                      if (isSelector(cell)) {
                        const options = cell.split(";");
                        return (
                          <Box key={c} sx={{ width: columnWidths[c] || 120, borderRight: "1px solid #eee", px: 0, display: "flex", alignItems: "center" }}>
                            <select
                              value={options[0]}
                              onChange={(e) => updateCell(currentSheetName, r, c, e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                padding: "10px",
                                fontSize: "0.85rem",
                                backgroundColor: "#e3f2fd",
                                color: "#000",
                                outline: "none",
                                cursor: "pointer",
                                appearance: "none",
                                textAlign: "center"
                              }}
                            >
                              {options.map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </Box>
                        );
                      }

                      const editable = isNumeric(cell) || isExclamation(cell);
                      return (
                        <input
                          key={c}
                          value={isExclamation(cell) ? cell.slice(1) : (cell ?? "")}
                          onChange={(e) => updateCell(currentSheetName, r, c, e.target.value)}
                          disabled={!editable}
                          style={{
                            width: columnWidths[c] || 120, border: "none", borderRight: "1px solid #eee", padding: "10px",
                            textAlign: isNumeric(cell) || isExclamation(cell) ? "right" : "left",
                            backgroundColor: isExclamation(cell) ? "#fff3cd" : editable ? "#fff" : "#f9f9f9",
                            color: editable ? "#000" : "#888", fontSize: "0.85rem", outline: "none"
                          }}
                        />
                      );
                    })}
                    {isUpperSheet(currentSheetName) && !isHeaderRow(r) && (
                      <Box sx={{ display: "flex", px: 1, gap: 1 }}>
                        <ContentCopyIcon sx={{ fontSize: 18, cursor: "pointer", color: "action.active", "&:hover": { color: "primary.main" } }} onClick={() => duplicateRow(currentSheetName, r)} />
                        <DeleteIcon sx={{ fontSize: 18, cursor: "pointer", color: "error.light", "&:hover": { color: "error.main" } }} onClick={() => deleteRow(currentSheetName, r)} />
                      </Box>
                    )}
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 10, textAlign: "center", color: "gray" }}>Cargando datos...</Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* --- BOTONES FLOTANTES ORIGINALES --- */}
      {!ActiveComponent && currentSheetName && (
        <Tooltip title={`Guardar cambios en ${currentSheetName}`}>
          <Badge
            color="error"
            variant="dot"
            invisible={!dirtySheets[currentSheetName]}
            sx={{
              position: "fixed",
              top: 70,
              left: '70%',
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
        </Tooltip>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar />
    </Box>
  );
};

export default ExcelUploaderStorage;