import React from "react";
import { Button, Box } from "@mui/material";

const JSONButtonRenderer = ({ cellValue, rowIndex, cellIndex, handleOpenJsonPopup }) => {
  try {
    const jsonData = JSON.parse(cellValue);
    if (!jsonData || typeof jsonData !== "object") return null;

    // Asumiendo estructura de 3 niveles: abuelo -> padre -> hijo
    const abueloKey = Object.keys(jsonData)[0];
    if (!abueloKey) return null;

    const abueloValue = jsonData[abueloKey];
    const padreKeys = abueloValue && typeof abueloValue === "object" ? Object.keys(abueloValue) : [];
    
    // Tomar solo el primer padre
    const primerPadreKey = padreKeys[0];
    if (!primerPadreKey) return null;

    const primerPadreValue = abueloValue[primerPadreKey];
    const hijoKeys = primerPadreValue && typeof primerPadreValue === "object" ? Object.keys(primerPadreValue) : [];

    return (
      <Button
        variant="text"
        onClick={() => handleOpenJsonPopup(jsonData, rowIndex, cellIndex)}
        sx={{
          all: "unset",
          display: "block",
          width: "100%",
          cursor: "pointer",
          padding: "8px",
          margin: 0,
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          backgroundColor: "#fafafa",
          "&:hover": {
            backgroundColor: "#f0f0f0",
            borderColor: "#bdbdbd",
          },
        }}
        key={`${rowIndex}-${cellIndex}`}
      >
        <Box
          sx={{
            fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
            fontSize: "0.7rem",
            lineHeight: "1.3",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            overflow: "visible",
            textAlign: "left",
            width: "100%",
            maxHeight: "none",
          }}
        >
          {/* Cajetín del ABUELO */}
          <Box
            sx={{
              backgroundColor: "#e0e0e0",
              padding: "4px 8px",
              borderRadius: "4px",
              marginBottom: "4px",
              border: "1px solid #bdbdbd",
            }}
          >
            <span style={{ fontWeight: "bold", color: "#000" }}>
              {abueloKey}
            </span>
          </Box>

          {/* Solo el PRIMER PADRE con sus hijos */}
          <Box sx={{ paddingLeft: "16px" }}>
            {/* Cajetín del PRIMER PADRE */}
            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                padding: "3px 6px",
                borderRadius: "3px",
                marginBottom: "2px",
                border: "1px solid #ddd",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#000" }}>
                {primerPadreKey}
              </span>
            </Box>

            {/* HIJOS del primer padre */}
            <Box sx={{ paddingLeft: "12px" }}>
              {hijoKeys.map((hijoKey) => {
                const hijoValue = primerPadreValue[hijoKey];
                return (
                  <Box key={hijoKey} sx={{ display: "flex", marginBottom: "1px" }}>
                    <span style={{ fontWeight: "bold", color: "#000", marginRight: "4px" }}>
                      {hijoKey}:
                    </span>
                    <span style={{ color: "#d32f2f" }}>
                      {typeof hijoValue === "string" || typeof hijoValue === "number" 
                        ? hijoValue 
                        : JSON.stringify(hijoValue)
                      }
                    </span>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Indicador de que hay más padres */}

        </Box>
      </Button>
    );
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return (
      <Box
        sx={{
          padding: "8px",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: "#d32f2f",
          backgroundColor: "#ffebee",
          border: "1px solid #ffcdd2",
          borderRadius: "4px",
          width: "100%",
        }}
      >
        JSON inválido: {e.message}
      </Box>
    );
  }
};

export default JSONButtonRenderer;