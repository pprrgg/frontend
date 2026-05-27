import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, Typography, Box, Radio, RadioGroup, FormControlLabel, FormControl } from "@mui/material";

// --- PERFILES PREDEFINIDOS ---
const PRESETS = {
  plano: Array(24).fill(1 / 24),
  residencial: [
    0.03, 0.02, 0.02, 0.02, 0.02, 0.03, // Madrugada
    0.04, 0.06, 0.05, 0.04, 0.03, 0.03, // Mañana
    0.04, 0.05, 0.04, 0.03, 0.04, 0.06, // Tarde
    0.08, 0.10, 0.12, 0.09, 0.06, 0.04  // Noche (Pico)
  ].map(v => v / 1.15), // Normalizado a suma ~1
  comercial: [
    0.01, 0.01, 0.01, 0.01, 0.01, 0.02, // Madrugada
    0.05, 0.08, 0.10, 0.12, 0.12, 0.12, // Apertura/Mañana
    0.10, 0.08, 0.10, 0.06, 0.04, 0.02, // Tarde
    0.01, 0.01, 0.01, 0.01, 0.01, 0.01  // Cierre
  ].map(v => v / 1.03)
};

// Función auxiliar para normalizar cualquier array a suma 1
const normalize = (arr) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  return arr.map(v => v / sum);
};

export default function ConsumoProfileChart({ valoresConsumo = [], setValoresConsumo }) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [mode, setMode] = useState('custom'); // 'plano', 'residencial', 'comercial', 'custom'
  const svgRef = useRef(null);

  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 50, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const safeData = useMemo(() => {
    if (!Array.isArray(valoresConsumo) || valoresConsumo.length !== 24) return PRESETS.plano;
    return valoresConsumo;
  }, [valoresConsumo]);

  const currentMax = useMemo(() => {
    const peak = Math.max(...safeData);
    return peak > 0 ? peak * 1.2 : 0.1;
  }, [safeData]);

  const barWidth = chartWidth / 24;

  const getYPosition = (v) => padding.top + chartHeight - (v / currentMax) * chartHeight;
  const getValueFromY = (y) => Math.max(0, Math.min(1, currentMax - ((y - padding.top) / chartHeight) * currentMax));

  // --- CAMBIO DE MODO ---
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode !== 'custom') {
      setValoresConsumo(normalize(PRESETS[newMode]));
    }
  };

  const updateValue = (index, newValue) => {
    if (mode !== 'custom') setMode('custom'); // Si mueve una barra, se vuelve custom
    
    let newData = [...safeData];
    const targetValue = Math.max(0.0001, Math.min(0.999, newValue));
    newData[index] = targetValue;

    const otherSum = safeData.reduce((acc, val, i) => (i !== index ? acc + val : acc), 0);
    if (otherSum > 0) {
      const factor = (1 - targetValue) / otherSum;
      newData = newData.map((v, i) => i === index ? v : v * factor);
    } else {
      const rem = (1 - targetValue) / 23;
      newData = newData.map((v, i) => i === index ? v : rem);
    }

    // Ajuste final de precisión
    const diff = 1 - newData.reduce((a, b) => a + b, 0);
    const adjustIdx = newData.findIndex((v, i) => i !== index && v > 0);
    if (adjustIdx !== -1) newData[adjustIdx] += diff;

    setValoresConsumo(newData);
  };

  const handleInteraction = (e) => {
    if (draggingIndex === null) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.touches ? e.touches[0].clientX : e.clientX;
    pt.y = e.touches ? e.touches[0].clientY : e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    updateValue(draggingIndex, getValueFromY(svgP.y));
  };

  useEffect(() => {
    const stop = () => setDraggingIndex(null);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  return (
    <Card elevation={0} sx={{ width: '100%', bgcolor: 'transparent' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">Seleccionar Perfil Típico:</Typography>
        <FormControl>
          <RadioGroup 
            row 
            value={mode} 
            onChange={(e) => handleModeChange(e.target.value)}
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
          >
            <FormControlLabel value="plano" control={<Radio size="small" />} label="Plano" />
            <FormControlLabel value="residencial" control={<Radio size="small" />} label="Residencial" />
            <FormControlLabel value="comercial" control={<Radio size="small" />} label="Comercial" />
            <FormControlLabel value="custom" control={<Radio size="small" />} label="Personalizado" />
          </RadioGroup>
        </FormControl>
      </Box>

      <CardContent sx={{ p: 0 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", touchAction: "none", userSelect: "none", overflow: 'visible' }}
          onMouseMove={handleInteraction}
          onTouchMove={handleInteraction}
        >
          {/* Guías Y */}
          {[0, 0.5, 1].map((p) => {
            const val = p * currentMax;
            const y = getYPosition(val);
            return (
              <g key={p}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eee" />
                <text x={padding.left - 10} y={y + 5} textAnchor="end" fontSize="11" fill="#999">
                  {(val * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Barras */}
          {safeData.map((value, i) => {
            const x = padding.left + i * barWidth;
            const y = getYPosition(value);
            const bH = chartHeight - (y - padding.top);
            return (
              <g key={i}>
                <rect
                  x={x} y={padding.top} width={barWidth} height={chartHeight}
                  fill="transparent" style={{ cursor: 'ns-resize' }}
                  onMouseDown={() => setDraggingIndex(i)}
                  onTouchStart={() => setDraggingIndex(i)}
                />
                <rect
                  x={x + 3} y={y} width={barWidth - 6} height={Math.max(1, bH)}
                  fill={draggingIndex === i ? "#4caf50" : "#2196f3"}
                  rx="1" pointerEvents="none"
                />
                {i % 4 === 0 && (
                  <text x={x + barWidth/2} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill="#666">
                    {i}h
                  </text>
                )}
              </g>
            );
          })}
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#ccc" />
        </svg>
      </CardContent>
    </Card>
  );
}