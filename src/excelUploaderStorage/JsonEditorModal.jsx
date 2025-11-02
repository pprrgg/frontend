import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Collapse,
  FormControl,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const JsonEditorModal = ({
  jsonPopup,
  setJsonPopup,
  localJsonData = {}, // 🔧 siempre inicializamos como {}
  setLocalJsonData,
  handleSaveJson,
  refreshParentData,
}) => {
  const [selectedGrandParent, setSelectedGrandParent] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [localSelectedData, setLocalSelectedData] = useState({});
  const [expandedFields, setExpandedFields] = useState({});

  // Inicializa selección cuando se abre el modal
  useEffect(() => {
    if (jsonPopup.open && localJsonData && Object.keys(localJsonData).length > 0) {
      try {
        const firstGrandParent = Object.keys(localJsonData)[0];
        const firstParent =
          Object.keys(localJsonData[firstGrandParent] || {})[0] || null;

        setSelectedGrandParent(firstGrandParent || null);
        setSelectedParent(firstParent || null);

        setLocalSelectedData(
          firstGrandParent && firstParent
            ? { ...localJsonData[firstGrandParent][firstParent] }
            : {}
        );
        setExpandedFields({});
      } catch (err) {
        console.error("Error al inicializar:", err);
        setSelectedGrandParent(null);
        setSelectedParent(null);
        setLocalSelectedData({});
        setExpandedFields({});
      }
    }
  }, [jsonPopup.open, localJsonData]);

  // Actualiza datos seleccionados cuando cambian los índices
  useEffect(() => {
    if (
      selectedGrandParent &&
      selectedParent &&
      localJsonData?.[selectedGrandParent]?.[selectedParent]
    ) {
      setLocalSelectedData({
        ...localJsonData[selectedGrandParent][selectedParent],
      });
      setExpandedFields({});
    }
  }, [selectedGrandParent, selectedParent, localJsonData]);

  const isJsonString = (str) => {
    try {
      JSON.parse(str);
    } catch {
      return false;
    }
    return true;
  };

  const parseIfJson = (value) => {
    if (typeof value === "string" && isJsonString(value)) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  };

  const handleDeepValueChange = (path, value) => {
    setLocalSelectedData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (typeof current[key] === "string" && isJsonString(current[key])) {
          current[key] = JSON.parse(current[key]);
        }
        current[key] = { ...current[key] };
        current = current[key];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const toggleExpand = (path) => {
    const pathKey = path.join(".");
    setExpandedFields((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));
  };

  const isExpanded = (path) => {
    const pathKey = path.join(".");
    return expandedFields[pathKey] || false;
  };

  const reorderParents = (grandParentKey, parentKey) => {
    const grandParentData = { ...localJsonData[grandParentKey] };
    const parentData = grandParentData[parentKey];

    const reordered = {
      [parentKey]: parentData,
      ...Object.fromEntries(
        Object.entries(grandParentData).filter(([key]) => key !== parentKey)
      ),
    };

    return {
      ...localJsonData,
      [grandParentKey]: reordered,
    };
  };

  const reorderGrandParents = (grandParentKey) => {
    return {
      [grandParentKey]: localJsonData[grandParentKey],
      ...Object.fromEntries(
        Object.entries(localJsonData).filter(([key]) => key !== grandParentKey)
      ),
    };
  };

  const handleGrandParentChange = (e) => {
    const newGrandParent = e.target.value;
    setSelectedGrandParent(newGrandParent);

    if (newGrandParent && localJsonData[newGrandParent]) {
      const firstParent = Object.keys(localJsonData[newGrandParent])[0] || null;
      setSelectedParent(firstParent);
      setLocalJsonData(reorderGrandParents(newGrandParent));
    } else {
      setSelectedParent(null);
    }
  };

  const handleParentChange = (e) => {
    const newParent = e.target.value;
    setSelectedParent(newParent);
    setLocalJsonData(reorderParents(selectedGrandParent, newParent));
  };

  const renderInputRecursive = (field, value, path = [field]) => {
    const parsedValue = parseIfJson(value);

    if (typeof parsedValue === "object" && parsedValue !== null && !Array.isArray(parsedValue)) {
      const expanded = isExpanded(path);

      return (
        <Box
          key={path.join(".")}
          sx={{ border: "1px solid #ddd", borderRadius: 1, p: 1, mt: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              backgroundColor: "#f5f5f5",
              p: 1,
              borderRadius: 1,
            }}
            onClick={() => toggleExpand(path)}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {field}
            </Typography>
            <IconButton size="small" sx={{ ml: "auto" }}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1, pl: 2 }}>
              {Object.entries(parsedValue).map(([nestedField, nestedValue]) =>
                renderInputRecursive(nestedField, nestedValue, [...path, nestedField])
              )}
            </Box>
          </Collapse>
        </Box>
      );
    }

    return (
      <Box
        key={path.join(".")}
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 2,
          width: "100%",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: "medium", color: "text.secondary", mb: 0.5 }}
        >
          {field}
        </Typography>

        {(() => {
          if (typeof parsedValue === "string") {
            const options = parsedValue.split(";").map((opt) => opt.trim());
            const isBoolean =
              options.includes("True") &&
              options.includes("False") &&
              options.length === 2;

            if (isBoolean) {
              const checked = options[0] === "True";
              return (
                <Checkbox
                  checked={checked}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? "True;False"
                      : "False;True";
                    handleDeepValueChange(path, newValue);
                  }}
                />
              );
            }

            if (options.length > 1) {
              return (
                <Select
                  size="small"
                  value={options[0]}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const reordered = [selected, ...options.filter((o) => o !== selected)].join(";");
                    handleDeepValueChange(path, reordered);
                  }}
                  fullWidth
                >
                  {options.map((opt, i) => (
                    <MenuItem key={i} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              );
            }

            return (
              <TextField
                size="small"
                value={parsedValue}
                onChange={(e) => handleDeepValueChange(path, e.target.value)}
                fullWidth
              />
            );
          }

          if (typeof parsedValue === "number") {
            return (
              <TextField
                size="small"
                type="number"
                value={parsedValue}
                onChange={(e) => handleDeepValueChange(path, Number(e.target.value))}
                fullWidth
              />
            );
          }

          return (
            <TextField
              size="small"
              value={parsedValue}
              onChange={(e) => handleDeepValueChange(path, e.target.value)}
              fullWidth
            />
          );
        })()}
      </Box>
    );
  };

  const handleSave = () => {
    if (!jsonPopup.sheetName || jsonPopup.rowIndex === null || jsonPopup.cellIndex === null) {
      console.error("Faltan datos para guardar en sessionStorage");
      return;
    }

    const updatedGrandParent = {
      ...localJsonData[selectedGrandParent],
      [selectedParent]: localSelectedData,
    };

    const updatedJson = {
      ...localJsonData,
      [selectedGrandParent]: updatedGrandParent,
    };

    const sessionData = JSON.parse(sessionStorage.getItem("excelData")) || {};
    const sheetData = [...(sessionData[jsonPopup.sheetName] || [])];

    if (!sheetData[jsonPopup.rowIndex + 1]) {
      sheetData[jsonPopup.rowIndex + 1] = [];
    }

    sheetData[jsonPopup.rowIndex + 1][jsonPopup.cellIndex] = JSON.stringify(updatedJson);

    sessionStorage.setItem(
      "excelData",
      JSON.stringify({
        ...sessionData,
        [jsonPopup.sheetName]: sheetData,
      })
    );

    setLocalJsonData(updatedJson);
    if (refreshParentData) refreshParentData();
    setJsonPopup((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    setJsonPopup((prev) => ({ ...prev, open: false }));
  };

  if (!jsonPopup.open || !selectedGrandParent || !selectedParent) return null;

  return (
    <Modal
      open={jsonPopup.open}
      onClose={handleCancel}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <Box
        sx={{
          backgroundColor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          width: "80%",
          maxWidth: 800,
          p: 4,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" gutterBottom>
          Editor JSON
        </Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedGrandParent || ""}
              onChange={handleGrandParentChange}
            >
              {localJsonData &&
                Object.keys(localJsonData).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <Select
              value={selectedParent || ""}
              onChange={handleParentChange}
              disabled={!selectedGrandParent}
            >
              {selectedGrandParent &&
                localJsonData?.[selectedGrandParent] &&
                Object.keys(localJsonData[selectedGrandParent]).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", mb: 2, width: "100%" }}>
          <Table size="small" sx={{ width: "100%" }}>
            <TableBody>
              {Object.entries(localSelectedData || {})
                .filter(([field]) => field !== "subject")
                .map(([field, value]) => (
                  <TableRow key={field}>
                    <TableCell colSpan={2} sx={{ padding: "4px 8px", border: "none" }}>
                      {renderInputRecursive(field, value)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={handleCancel} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default JsonEditorModal;
