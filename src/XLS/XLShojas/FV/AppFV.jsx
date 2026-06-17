// App.js - Versión Unificada con Configuración JSON

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  IconButton, Box, TextField, Stack, Typography, Paper,
  Accordion, AccordionSummary, AccordionDetails, Dialog,
  DialogTitle, Divider, Slider, Tab, Tabs, Tooltip, Badge, 
  Fab, Button, Chip, GlobalStyles, Menu, MenuItem
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import {
  Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
  StayCurrentPortrait as PortraitIcon,
  StayCurrentLandscape as LandscapeIcon,
  Contrast as ShadowIcon,
  Close as CloseIcon,
    GridOn as PanelIcon,
    SettingsInputComponent as MountIcon,

  Settings as SettingsIcon,
  ContentCopy as CopyIcon
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ShadowProfileChart from "./ShadowProfileChart";
import { SvgIcon } from '@mui/material';

// ============================================================
// 1. CONFIGURACIÓN CENTRAL (JSON)
// ============================================================
const CONFIG = {
  // Valores por defecto para NUEVO GRUPO
  defaults: {
    panel: {
      modelo: "JKM540M-72HL4-V",
      potenciaW: 540,
      width: 1.134,
      height: 2.278,
      vOc: 49.8,
      vMp: 41.2,
      iSc: 13.93,
      iMp: 13.11,
      coefVoc: -0.28
    },
    inverter: {
      modelo: "Huawei SUN2000-15KTL-M0",
      potenciaW: 15000,
      FVcost: 450,
      mpptCount: 2,
      vMax: 1100,
      vMinMppt: 200,
      vMaxMppt: 850,
      iMaxInverter: 30,
      iScMaxInverter: 40
    },
    structure: {
      tipoEstructura: "coplanar",
      tilt: 30,
      slope: 0,
      orientation: "vertical",
      rows: 1,
      cols: 1
    },
    grid: {
      rotation: 0,
      px: 1,
      py: 3,
      sombras: Array(16).fill(1)
    }
  },

  // Configuración de pestañas del modal
  tabs: [
    {
      id: 0,
      label: "Info General",
      icon: "Info",
      fields: [
        { key: "nombre", type: "text", label: "Nombre Grupo", maxLength: 3, path: "nombre" },
        { key: "FVcost", type: "number", label: "Coste (EUR)", path: "config.FVcost" },
        { key: "sombras", type: "custom", component: "ShadowButton" }
      ]
    },
    {
      id: 1,
      label: "Panel",
      icon: "Panel",
      fields: [
        { key: "modelo", type: "text", label: "Modelo de Panel", path: "config.modelo" },
        { key: "potenciaW", type: "number", label: "Potencia (Wp)", path: "config.potenciaW" },
        { key: "width", type: "number", label: "Ancho (m)", path: "config.width" },
        { key: "height", type: "number", label: "Alto (m)", path: "config.height" },
        {
          key: "electric",
          type: "group",
          label: "Ficha Técnica Panel (STC)",
          fields: [
            { key: "vOc", label: "Voc (V)" },
            { key: "vMp", label: "Vmp (V)" },
            { key: "iSc", label: "Isc (A)" },
            { key: "iMp", label: "Imp (A)" },
            { key: "coefVoc", label: "Coef. Temp Voc" }
          ]
        },
      ]
    },
    {
      id: 2,
      label: "Estructura",
      icon: "Mount",
      fields: [
        {
          key: "matrix",
          type: "group",
          label: "Estructura Matriz",
          fields: [
            { key: "rows", label: "Filas", min: 1 },
            { key: "cols", label: "Columnas", min: 1 }
          ]
        },
        { key: "orientation", type: "toggle", label: "Orientación" },
        { key: "rotation", type: "slider", label: "Azimut", min: -180, max: 180 },
        {
          key: "tipoEstructura",
          type: "buttons",
          label: "Tipo de Estructura",
          options: ["coplanar", "libre", "doble"]
        },
        { key: "tilt", type: "slider", label: "Inclinación", min: 0, max: 90 },
        { key: "slope", type: "slider", label: "Pendiente suelo", min: 0, max: 90 }
      ]
    },
    {
      id: 3,
      label: "Inversor",
      icon: "Inverter",
      fields: [
        { key: "inverterModel", type: "text", label: "Modelo Inversor", path: "config.inverterModel" },
        { key: "inverterPower", type: "number", label: "Potencia Nominal (W)", path: "config.inverterPower" },
        { key: "mpptCount", type: "number", label: "Cantidad de MPPT", min: 1, path: "config.mpptCount" },
        {
          key: "limits",
          type: "group",
          label: "Límites Eléctricos MPPT",
          fields: [
            { key: "vMax", label: "Vmax (V)" },
            { key: "vMinMppt", label: "Vmin MPPT (V)" },
            { key: "vMaxMppt", label: "Vmax MPPT (V)" },
            { key: "iMaxInverter", label: "Imax Entrada (A)" },
            { key: "iScMaxInverter", label: "Isc Máx (A)" }
          ]
        }
      ]
    }
  ]
};

// ============================================================
// 2. ICONOS Y RECURSOS VISUALES
// ============================================================
const InverterIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-2h-2v2zm-4 0h2v-4H7v4zm8 0h2v-7h-2v7z" />
  </SvgIcon>
);

const arrowWhiteSvg = `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>`;

const moveIcon = L.divIcon({
  className: 'custom-drag-icon',
  html: `<div style="background-color: #ff9800; width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11]
});

const rotateHandleIcon = L.divIcon({
  className: 'custom-rotate-icon',
  html: `<div style="background-color: #2196f3; width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11]
});

// ============================================================
// 3. COMPONENTES AUXILIARES
// ============================================================
const MapAutoCenter = ({ activeGrid }) => {
  const map = useMap();
  useEffect(() => {
    if (activeGrid?.baseLatLng) {
      map.flyTo(activeGrid.baseLatLng, 20, { animate: true, duration: 1.2 });
    }
  }, [activeGrid?.id, map]);
  return null;
};

const AzimutPreview = React.memo(({ rotation }) => {
  const size = 110; const cx = size / 2; const cy = size / 2 - 5; const r = 32;
  return (
    <Box sx={{ width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eee" strokeWidth="1" strokeDasharray="2,2" />
        <text x={cx} y={cy - r - 8} fontSize="11" textAnchor="middle" fill="#999" fontWeight="900">N</text>
        <text x={cx} y={cy + r + 16} fontSize="11" textAnchor="middle" fill="#999" fontWeight="900">S (0°)</text>
        <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cx + r} stroke="#2196f3" strokeWidth="5" strokeLinecap="round" />
          <path d={`M ${cx - 6} ${cy + r - 10} L ${cx} ${cy + r} L ${cx + 6} ${cy + r - 10} Z`} fill="#2196f3" />
          <circle cx={cx} cy={cy} r="4" fill="#333" />
        </g>
      </svg>
    </Box>
  );
});

const AnglePreview = React.memo(({ tilt, slope, isDouble }) => {
  const sizeW = 110; const sizeH = 150; const cx = 55; const baseY = 90; const panelLen = 45;
  const tRad = (tilt * Math.PI) / 180;
  const sRad = (slope * Math.PI) / 180;
  const peakY = baseY - (panelLen * Math.sin(tRad));
  const dx = panelLen * Math.cos(tRad);
  const footLX = cx - dx; const footRX = cx + dx;
  const tx = cx + panelLen * Math.cos(-tRad);
  const ty = baseY + panelLen * Math.sin(-tRad);
  const sx1 = cx + 55 * Math.cos(-sRad); const sy1 = baseY + 55 * Math.sin(-sRad);
  const sx2 = cx - 55 * Math.cos(-sRad); const sy2 = baseY - 55 * Math.sin(-sRad);

  return (
    <Box sx={{ width: sizeW, height: sizeH, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={sizeW} height={sizeH} viewBox={`0 0 ${sizeW} ${sizeH}`}>
        <path d={`M ${cx + panelLen} ${baseY} A ${panelLen} ${panelLen} 0 0 0 ${cx - panelLen} ${baseY}`} fill="none" stroke="#f0f0f0" strokeDasharray="3,3" />
        <line x1="5" y1={baseY} x2={sizeW - 5} y2={baseY} stroke="#eee" strokeWidth="1" />
        {isDouble ? (
          <>
            <line x1={footLX} y1={baseY} x2={cx} y2={peakY} stroke="#1a237e" strokeWidth="7" strokeLinecap="round" opacity="0.6" />
            <line x1={footRX} y1={baseY} x2={cx} y2={peakY} stroke="#1a237e" strokeWidth="7" strokeLinecap="round" />
            <circle cx={cx} cy={peakY} r="4" fill="#1a237e" />
          </>
        ) : (
          <>
            <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#f57c00" strokeWidth="5" strokeLinecap="round" />
            <line x1={cx} y1={baseY} x2={tx} y2={ty} stroke="#1a237e" strokeWidth="8" strokeLinecap="round" />
            <circle cx={cx} cy={baseY} r="4" fill="#333" />
          </>
        )}
      </svg>
    </Box>
  );
});

// ============================================================
// 4. CLASE FreeGridManager (sin cambios)
// ============================================================
class FreeGridManager {
  constructor(map, onUpdate, onSelect) {
    this.map = map;
    this.onUpdate = onUpdate;
    this.onSelect = onSelect;
    this.gridLayer = L.layerGroup().addTo(this.map);
    this.isDragging = false;
    this.paintMode = true;
    this.lastTouchedId = null;

    const stopDrawing = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.lastTouchedId = null;
        this.map.dragging.enable();
      }
    };

    window.addEventListener('pointerup', stopDrawing);
    window.addEventListener('pointercancel', stopDrawing);

    const handlePointerMove = (e) => {
      if (!this.isDragging) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el._leaflet_id) {
        this.gridLayer.eachLayer((layer) => {
          if (layer._path === el && layer.options.customCellId) {
            const cellId = layer.options.customCellId;
            const gridId = layer.options.customGridId;
            if (this.lastTouchedId !== cellId) {
              this.lastTouchedId = cellId;
              this.onUpdate(gridId, cellId, this.paintMode);
            }
          }
        });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
  }

  metersToPx(m) {
    if (!this.map || !this.map._loaded) return 10;
    const c = this.map.getCenter();
    const p1 = this.map.latLngToLayerPoint(c);
    const p2 = this.map.layerPointToLatLng(L.point(p1.x + 10, p1.y));
    return (m / c.distanceTo(p2)) * 10;
  }

  render(grids, activeId) {
    this.gridLayer.clearLayers();
    grids.forEach(g => this.drawGrid(g, g.id === activeId));
  }

  drawGrid(grid, isActive) {
    const center = this.map.latLngToLayerPoint(grid.baseLatLng);
    const rad = (grid.rotation * Math.PI) / 180;
    const tiltRad = (grid.config.tilt * Math.PI) / 180;
    const isV = grid.config.orientation === 'vertical';
    const rows = grid.config.rows || 1;
    const cols = grid.config.cols || 1;
    const baseH = isV ? grid.config.height : grid.config.width;
    const baseW = isV ? grid.config.width : grid.config.height;
    const panelH = baseH * rows;
    const panelW = baseW * cols;
    const pW_px = this.metersToPx(panelW);
    const pH_px = this.metersToPx(panelH) * Math.cos(tiltRad);
    const panels = new Set(grid.paneles || []);
    const tipo = grid.config.tipoEstructura || 'coplanar';

    const cellsToRender = new Set();
    if (panels.size === 0) {
      cellsToRender.add("0,0");
    } else {
      panels.forEach(id => {
        cellsToRender.add(id);
        const [r, c] = id.split(',').map(Number);
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            cellsToRender.add(`${r + dr},${c + dc}`);
          }
        }
      });
    }

    cellsToRender.forEach(id => {
      const [r, c] = id.split(',').map(Number);
      const active = panels.has(id);
      let arrowRad = rad;
      let verticalOffset = 0;

      if (tipo === 'doble') {
        if (Math.abs(r) % 2 === 0) {
          arrowRad = rad + Math.PI;
        } else {
          arrowRad = rad;
        }
        verticalOffset = r * pH_px + (Math.floor(r / 2) * (pH_px * 0.15));
      } else if (tipo === 'libre') {
        const lat = Math.abs(this.map.getCenter().lat);
        const kFactor = 1 / Math.tan(Math.max(5, 90 - lat - 23.44) * Math.PI / 180);
        const hProjected = panelH * Math.sin(Math.max(0, grid.config.tilt - grid.config.slope) * Math.PI / 180);
        const gapMeters = hProjected * kFactor;
        verticalOffset = r * (pH_px + this.metersToPx(gapMeters));
      } else {
        verticalOffset = r * pH_px;
      }

      const cp = L.point(
        center.x + (c * pW_px * Math.cos(rad) - verticalOffset * Math.sin(rad)),
        center.y + (c * pW_px * Math.sin(rad) + verticalOffset * Math.cos(rad))
      );

      const corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].map(([dx, dy]) =>
        this.map.layerPointToLatLng(L.point(
          cp.x + (dx * pW_px * Math.cos(rad) - dy * pH_px * Math.sin(rad)),
          cp.y + (dx * pW_px * Math.sin(rad) + dy * pH_px * Math.cos(rad))
        ))
      );

      const cell = L.polygon(corners, {
        color: active ? "#fff" : (isActive ? "rgba(255,255,255,0.4)" : "transparent"),
        weight: active ? 1 : 0.5,
        fillColor: active ? "#1a237e" : (isActive ? "rgba(255,255,255,0.1)" : "transparent"),
        fillOpacity: active ? 0.6 : 0.2,
        interactive: isActive,
        className: isActive ? 'editable-cell' : 'non-interactive-cell',
        customCellId: id,
        customGridId: grid.id
      }).addTo(this.gridLayer);

      const cellLatLng = this.map.layerPointToLatLng(cp);

      if (active) {
        L.marker(cellLatLng, {
          icon: L.divIcon({
            className: 'arrow',
            html: `<div style="transform: rotate(${arrowRad}rad); display: flex; justify-content: center; align-items: center; opacity: 0.8;">${arrowWhiteSvg}</div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          }),
          interactive: false
        }).addTo(this.gridLayer);

        if (rows > 1 || cols > 1) {
          const p1 = corners[0], p2 = corners[1], p3 = corners[2], p4 = corners[3];
          for (let i = 1; i < rows; i++) {
            const ratio = i / rows;
            const start = [p1.lat + (p4.lat - p1.lat) * ratio, p1.lng + (p4.lng - p1.lng) * ratio];
            const end = [p2.lat + (p3.lat - p2.lat) * ratio, p2.lng + (p3.lng - p2.lng) * ratio];
            L.polyline([start, end], { color: 'rgba(255,255,255,0.3)', weight: 0.8, interactive: false }).addTo(this.gridLayer);
          }
          for (let j = 1; j < cols; j++) {
            const ratio = j / cols;
            const start = [p1.lat + (p2.lat - p1.lat) * ratio, p1.lng + (p2.lng - p1.lng) * ratio];
            const end = [p4.lat + (p3.lat - p4.lat) * ratio, p4.lng + (p3.lng - p4.lng) * ratio];
            L.polyline([start, end], { color: 'rgba(255,255,255,0.3)', weight: 0.8, interactive: false }).addTo(this.gridLayer);
          }
        }
      } else if (isActive) {
        L.marker(cellLatLng, {
          icon: L.divIcon({
            className: 'grid-plus',
            html: `<div style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 300;">+</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          }),
          interactive: false
        }).addTo(this.gridLayer);
      }

      if (isActive) {
        L.DomEvent.on(cell._path, 'pointerdown', (e) => {
          L.DomEvent.stop(e);
          e.target.setPointerCapture(e.pointerId);
          this.isDragging = true;
          this.paintMode = !active;
          this.lastTouchedId = id;
          this.map.dragging.disable();
          this.onUpdate(grid.id, id, this.paintMode);
        });
        cell.on('mouseover', () => {
          if (this.isDragging) this.onUpdate(grid.id, id, this.paintMode);
        });
      }
    });
  }
}

// ============================================================
// 5. COMPONENTE PRINCIPAL APP
// ============================================================
const App = () => {
  // ===== ESTADOS =====
  const [grids, setGrids] = useState([]);
  const [activeGridId, setActiveGridId] = useState(null);
  const [shadowModalOpen, setShadowModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [innerTab, setInnerTab] = useState(0);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedGridForMenu, setSelectedGridForMenu] = useState(null);

  const needsAutoCenter = useRef(false);
  const isSavingInternal = useRef(false);
  const mapRef = useRef(null);
  const gridManagerRef = useRef(null);

  const activeGrid = useMemo(() => grids.find(g => g.id === activeGridId), [grids, activeGridId]);

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = grids.reduce((acc, g) => {
      const bloquesPintados = (g.paneles?.length || 0);
      const panelesPorBloque = (g.config.rows || 1) * (g.config.cols || 1);
      const totalPanelesGrupo = bloquesPintados * panelesPorBloque;
      acc.panels += totalPanelesGrupo;
      acc.power += totalPanelesGrupo * (g.config.potenciaW || 0);
      return acc;
    }, { panels: 0, power: 0 });
    return total;
  }, [grids]);

  // ===== FUNCIÓN PARA CREAR NUEVO GRID DESDE CONFIGURACIÓN =====
  const createGridFromConfig = useCallback((mapCenter, gridCount) => {
    const { panel, inverter, structure, grid } = CONFIG.defaults;
    const id = Date.now();
    const px = grid.px;
    const py = grid.py;

    return {
      id,
      nombre: `G${gridCount + 1}`,
      baseLatLng: mapCenter,
      rotation: grid.rotation,
      config: {
        // Panel
        modelo: panel.modelo,
        potenciaW: panel.potenciaW,
        width: panel.width,
        height: panel.height,
        vOc: panel.vOc,
        vMp: panel.vMp,
        iSc: panel.iSc,
        iMp: panel.iMp,
        coefVoc: panel.coefVoc,
        // Inversor
        inverterModel: inverter.modelo,
        inverterPower: inverter.potenciaW,
        FVcost: inverter.FVcost,
        mpptCount: inverter.mpptCount,
        vMax: inverter.vMax,
        vMinMppt: inverter.vMinMppt,
        vMaxMppt: inverter.vMaxMppt,
        iMaxInverter: inverter.iMaxInverter,
        iScMaxInverter: inverter.iScMaxInverter,
        // Estructura
        tipoEstructura: structure.tipoEstructura,
        tilt: structure.tilt,
        slope: structure.slope,
        orientation: structure.orientation,
        rows: structure.rows,
        cols: structure.cols
      },
      paneles: Array.from({ length: px * 2 }, (_, i) => i - px)
        .flatMap(r => Array.from({ length: py * 2 }, (_, j) => j - py)
          .map(c => `${r},${c}`)
        ),
      sombras: [...grid.sombras]
    };
  }, []);

  // ===== HANDLERS =====
  const handleAddNew = useCallback(() => {
    if (!mapRef.current) return;
    const newGrid = createGridFromConfig(mapRef.current.getCenter(), grids.length);
    setGrids(prev => [newGrid, ...prev]);
    setActiveGridId(newGrid.id);
    needsAutoCenter.current = false;
  }, [grids, createGridFromConfig]);

  const handleCopy = useCallback((gridToCopy) => {
    if (!gridToCopy) return;
    const id = Date.now();
    const offset = 0.00002;
    const clonedGrid = {
      ...gridToCopy,
      id,
      nombre: `${gridToCopy.nombre}c`,
      baseLatLng: {
        lat: gridToCopy.baseLatLng.lat - offset,
        lng: gridToCopy.baseLatLng.lng + offset
      },
      paneles: [...gridToCopy.paneles],
      sombras: [...gridToCopy.sombras]
    };
    setGrids(prev => [clonedGrid, ...prev]);
    setActiveGridId(id);
    needsAutoCenter.current = false;
  }, []);

  const updateGrid = useCallback((id, fields) => {
    setGrids(prev => prev.map(g => {
      if (g.id !== id) return g;
      // Si el update es sobre config, lo fusionamos correctamente
      if (fields.config) {
        return { ...g, ...fields, config: { ...g.config, ...fields.config } };
      }
      return { ...g, ...fields };
    }));
  }, []);

  // ===== RENDERIZADOR DINÁMICO DE CAMPOS =====
  const renderField = useCallback((field, grid, gridId) => {
    // Helper para obtener valor anidado
    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Helper para actualizar campo
    const updateField = (path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const updateObj = {};
      let current = updateObj;
      keys.forEach(key => {
        current[key] = {};
        current = current[key];
      });
      current[lastKey] = value;
      updateGrid(gridId, updateObj);
    };

    const fieldPath = field.path || `config.${field.key}`;
    const value = getValue(grid, fieldPath);

    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.key}
            label={field.label}
            size="small"
            variant="standard"
            fullWidth
            value={value || ''}
            onChange={(e) => updateField(fieldPath, e.target.value)}
            inputProps={{ maxLength: field.maxLength }}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.key}
            label={field.label}
            size="small"
            variant="standard"
            fullWidth
            type="number"
            value={value || ''}
            onChange={(e) => updateField(fieldPath, parseFloat(e.target.value) || 0)}
            inputProps={{ min: field.min }}
          />
        );

      case 'slider':
        return (
          <Box key={field.key} sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="caption" display="block" fontWeight={700}>
              {field.label}: {Math.round(value || 0)}°
            </Typography>
            <Slider
              size="small"
              value={value || 0}
              min={field.min}
              max={field.max}
              onChange={(_, v) => updateField(fieldPath, v)}
              sx={{ width: '90%' }}
            />
          </Box>
        );

      case 'toggle':
        return (
          <Box key={field.key} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={() => updateField(fieldPath, grid.config.orientation === 'vertical' ? 'horizontal' : 'vertical')}
              sx={{ border: '1px solid #ddd', bgcolor: '#fff', width: 36, height: 36 }}
            >
              {grid.config.orientation === 'vertical' ? 
                <PortraitIcon fontSize="small" /> : 
                <LandscapeIcon fontSize="small" />
              }
            </IconButton>
          </Box>
        );

      case 'buttons':
        return (
          <Stack key={field.key} spacing={0.5} width="100%">
            {field.options.map((option) => (
              <Button
                key={option}
                size="small"
                variant={grid.config[field.key] === option ? "contained" : "outlined"}
                sx={{ fontSize: '0.7rem', py: 0.4, width: '100%', textTransform: 'capitalize' }}
                onClick={() => {
                  const updates = { [field.key]: option };
                  if (option === 'coplanar') updates.tilt = grid.config.slope;
                  if (option === 'doble') updates.slope = 0;
                  updateGrid(gridId, { config: updates });
                }}
              >
                {option}
              </Button>
            ))}
          </Stack>
        );

      case 'group':
        return (
          <Box key={field.key} sx={{ width: '100%', p: 0.5 }}>
            {field.label && (
              <Divider sx={{ mb: 1.5, fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>
                {field.label}
              </Divider>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {field.fields.map((subField) => {
                const subPath = `config.${subField.key}`;
                const subValue = getValue(grid, subPath);
                return (
                  <TextField
                    key={subField.key}
                    label={subField.label}
                    size="small"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={subValue || ''}
                    onChange={(e) => updateField(subPath, parseFloat(e.target.value) || 0)}
                    inputProps={{ 
                      style: { fontSize: '0.75rem', padding: '6px' },
                      min: subField.min
                    }}
                    sx={{ width: field.fields.length > 2 ? 'calc(50% - 4px)' : '100%' }}
                  />
                );
              })}
            </Stack>
          </Box>
        );

      case 'custom':
        if (field.component === 'ShadowButton') {
          return (
            <Box key={field.key} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => setShadowModalOpen(true)} 
                sx={{ border: "1px solid #ddd", bgcolor: '#fff' }}
              >
                <ShadowIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" sx={{ ml: 1, alignSelf: 'center', color: '#666' }}>
                Configurar sombras
              </Typography>
            </Box>
          );
        }
        return null;

      default:
        return null;
    }
  }, [updateGrid]);

  // ===== EFECTOS Y OTRAS FUNCIONES =====
  const loadDataFromSession = useCallback((forceCenter = false) => {
    const raw = sessionStorage.getItem("excelData");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed["Diseño_FV"]?.length > 1) {
        const headers = parsed["Diseño_FV"][0];
        const data = parsed["Diseño_FV"].slice(1).map((r) => {
          const row = {};
          headers.forEach((h, i) => {
            let v = r[i];
            if (typeof v === "string" && (v.startsWith("{") || v.startsWith("["))) {
              try { v = JSON.parse(v.replace(/'/g, '"')); } catch (e) {}
            }
            row[h] = v;
          });
          const lat = parseFloat(row.lat) || 40.4167;
          const lng = parseFloat(row.lng) || -3.70325;
          return {
            id: row.id || Date.now(),
            nombre: row.nombre || "G1",
            rotation: parseFloat(row.rotation) || 0,
            baseLatLng: { lat, lng },
            config: {
              tipoEstructura: row.tipoEstructura || "coplanar",
              width: parseFloat(row.width) || 1.1,
              height: parseFloat(row.height) || 1.9,
              tilt: parseFloat(row.tilt) || 30,
              slope: parseFloat(row.slope) || 0,
              orientation: row.orientation || "vertical",
              potenciaW: parseFloat(row.potenciaW) || 450,
              rows: parseInt(row.rows) || 1,
              cols: parseInt(row.cols) || 1,
              modelo: row.modelo || "",
              inverterModel: row.inverterModel || "",
              inverterPower: parseFloat(row.inverterPower) || 0,
              FVcost: parseFloat(row.FVcost) || 0,
              mpptCount: parseInt(row.mpptCount) || 1,
              vOc: parseFloat(row.vOc) || 0,
              vMp: parseFloat(row.vMp) || 0,
              iSc: parseFloat(row.iSc) || 0,
              iMp: parseFloat(row.iMp) || 0,
              coefVoc: parseFloat(row.coefVoc) || 0,
              vMax: parseFloat(row.vMax) || 0,
              vMinMppt: parseFloat(row.vMinMppt) || 0,
              vMaxMppt: parseFloat(row.vMaxMppt) || 0,
              iMaxInverter: parseFloat(row.iMaxInverter) || 0,
              iScMaxInverter: parseFloat(row.iScMaxInverter) || 0
            },
            paneles: Array.isArray(row.paneles) ? row.paneles : [],
            sombras: Array.isArray(row.sombras) ? row.sombras : Array(16).fill(1)
          };
        }).filter(g => g.baseLatLng && Number.isFinite(g.baseLatLng.lat) && Number.isFinite(g.baseLatLng.lng));

        const dataStr = JSON.stringify(data);
        if (dataStr !== lastSavedSnapshot) {
          setGrids(data);
          setLastSavedSnapshot(dataStr);
          if (forceCenter && !isSavingInternal.current && data.length > 0) {
            needsAutoCenter.current = true;
          }
        }
      }
    } catch (e) {
      console.error("Error sincronizando sesión:", e);
    }
  }, [lastSavedSnapshot]);

  const handleSave = useCallback(() => {
    if (grids.length === 0) return;
    isSavingInternal.current = true;
    try {
      const features = grids.flatMap((grid) => {
        const rad = (grid.rotation * Math.PI) / 180;
        const tiltRad = (grid.config.tilt * Math.PI) / 180;
        const isV = grid.config.orientation === 'vertical';
        const rows = grid.config.rows || 1;
        const cols = grid.config.cols || 1;
        const bH = isV ? grid.config.height : grid.config.width;
        const bW = isV ? grid.config.width : grid.config.height;
        const panelH = bH * rows;
        const panelW = bW * cols;
        const latRad = grid.baseLatLng.lat * (Math.PI / 180);
        const R = 6378137.0;
        const pH_projected = panelH * Math.cos(tiltRad);
        const tipo = grid.config.tipoEstructura || 'coplanar';

        return grid.paneles.map((panelId) => {
          const [r, c] = panelId.split(',').map(Number);
          let vStep = 0;
          if (tipo === 'libre') {
            const k = 1 / Math.tan(Math.max(5, 90 - Math.abs(grid.baseLatLng.lat) - 23.44) * Math.PI / 180);
            const hV = panelH * Math.sin(Math.max(0, grid.config.tilt - grid.config.slope) * Math.PI / 180);
            vStep = r * (pH_projected + (hV * k));
          } else if (tipo === 'doble') {
            vStep = r * pH_projected + (Math.floor(r / 2) * (pH_projected * 0.15));
          } else {
            vStep = r * pH_projected;
          }

          const corners = [
            { dx: -panelW / 2, dy: pH_projected / 2 },
            { dx: panelW / 2, dy: pH_projected / 2 },
            { dx: panelW / 2, dy: -pH_projected / 2 },
            { dx: -panelW / 2, dy: -pH_projected / 2 },
            { dx: -panelW / 2, dy: pH_projected / 2 }
          ].map((off) => {
            const xR = ((c * panelW) + off.dx) * Math.cos(rad) - (vStep + off.dy) * Math.sin(rad);
            const yR = ((c * panelW) + off.dx) * Math.sin(rad) + (vStep + off.dy) * Math.cos(rad);
            const lng = grid.baseLatLng.lng + (xR / (R * Math.cos(latRad))) * (180 / Math.PI);
            const lat = grid.baseLatLng.lat - (yR / R) * (180 / Math.PI);
            return [lng, lat];
          });

          return {
            type: "Feature",
            properties: { area: grid.nombre, block: panelId },
            geometry: { type: "Polygon", coordinates: [corners] }
          };
        });
      });

      const fullGeoJSON = { type: "FeatureCollection", features };
      const geoJsonString = JSON.stringify(fullGeoJSON).replace(/"/g, "'");
      const currentData = JSON.parse(sessionStorage.getItem("excelData") || "{}");

      const headers = [
        "Capítulo", "Categoría", "nombre", "tipoEstructura", "id", "lat", "lng", "rotation",
        "width", "height", "tilt", "slope", "orientation", "modelo", "potenciaW",
        "rows", "cols", "inverterModel", "inverterPower", "FVcost", "mpptCount",
        "vOc", "vMp", "iSc", "iMp", "coefVoc",
        "vMax", "vMinMppt", "vMaxMppt", "iMaxInverter", "iScMaxInverter",
        "paneles", "sombras", "geojson"
      ];

      const rowsData = grids.map((g) => [
        "FV", "Paneles", g.nombre, g.config?.tipoEstructura || "coplanar", g.id,
        g.baseLatLng?.lat || 0, g.baseLatLng?.lng || 0, g.rotation || 0,
        g.config?.width || 0, g.config?.height || 0, g.config?.tilt || 0, g.config?.slope || 0,
        g.config?.orientation || "vertical",
        g.config?.modelo || "",
        g.config?.potenciaW || 0,
        g.config?.rows || 1, g.config?.cols || 1,
        g.config?.inverterModel || "", g.config?.inverterPower || 0, g.config?.FVcost || 0, g.config?.mpptCount || 1,
        g.config?.vOc || 0, g.config?.vMp || 0, g.config?.iSc || 0, g.config?.iMp || 0, g.config?.coefVoc || 0,
        g.config?.vMax || 0, g.config?.vMinMppt || 0, g.config?.vMaxMppt || 0, g.config?.iMaxInverter || 0, g.config?.iScMaxInverter || 0,
        JSON.stringify(g.paneles || []).replace(/"/g, "'"),
        JSON.stringify(g.sombras || []).replace(/"/g, "'"),
        geoJsonString
      ]);

      currentData["Diseño_FV"] = [headers, ...rowsData];
      sessionStorage.setItem("excelData", JSON.stringify(currentData));
      setLastSavedSnapshot(JSON.stringify(grids));
      window.dispatchEvent(new Event("sessionStorageUpdate"));
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setTimeout(() => { isSavingInternal.current = false; }, 50);
    }
  }, [grids]);

  const exportToGeoJSON = useCallback(() => {
    // Función simplificada para exportar
    const features = grids.flatMap((grid) => {
      const rad = (grid.rotation * Math.PI) / 180;
      const tiltRad = (grid.config.tilt * Math.PI) / 180;
      const isV = grid.config.orientation === 'vertical';
      const rows = grid.config.rows || 1;
      const cols = grid.config.cols || 1;
      const baseH = isV ? grid.config.height : grid.config.width;
      const baseW = isV ? grid.config.width : grid.config.height;
      const panelH = baseH * rows;
      const panelW = baseW * cols;
      const latRad = grid.baseLatLng.lat * (Math.PI / 180);
      const m_per_deg_lat = 111320;
      const m_per_deg_lng = 111320 * Math.cos(latRad);
      const tipo = grid.config.tipoEstructura || 'coplanar';
      const pH_projected = panelH * Math.cos(tiltRad);

      return grid.paneles.map((panelId) => {
        const [r, c] = panelId.split(',').map(Number);
        let verticalOffsetMeters = 0;
        if (tipo === 'doble') {
          verticalOffsetMeters = r * pH_projected + (Math.floor(r / 2) * (pH_projected * 0.15));
        } else if (tipo === 'libre') {
          const lat = Math.abs(grid.baseLatLng.lat);
          const kFactor = 1 / Math.tan(Math.max(5, 90 - lat - 23.44) * Math.PI / 180);
          const hProjectedReal = panelH * Math.sin(Math.max(0, grid.config.tilt - grid.config.slope) * Math.PI / 180);
          const gapMeters = hProjectedReal * kFactor;
          verticalOffsetMeters = r * (pH_projected + gapMeters);
        } else {
          verticalOffsetMeters = r * pH_projected;
        }

        const cornersOffsets = [
          { dx: -panelW / 2, dy: pH_projected / 2 },
          { dx: panelW / 2, dy: pH_projected / 2 },
          { dx: panelW / 2, dy: -pH_projected / 2 },
          { dx: -panelW / 2, dy: -pH_projected / 2 },
          { dx: -panelW / 2, dy: pH_projected / 2 }
        ];

        const coordinates = cornersOffsets.map(offset => {
          const x = (c * panelW) + offset.dx;
          const y = verticalOffsetMeters + offset.dy;
          const xRot = x * Math.cos(rad) - y * Math.sin(rad);
          const yRot = x * Math.sin(rad) + y * Math.cos(rad);
          return [
            grid.baseLatLng.lng + (xRot / m_per_deg_lng),
            grid.baseLatLng.lat - (yRot / m_per_deg_lat)
          ];
        });

        return {
          type: "Feature",
          properties: { area: grid.nombre, row: r, col: c, structure: tipo },
          geometry: { type: "Polygon", coordinates: [coordinates] }
        };
      });
    });

    const geojson = { type: "FeatureCollection", features };
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FV_Export_${new Date().getTime()}.geojson`;
    a.click();
  }, [grids]);

  const handleOpenMenu = (event, grid) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedGridForMenu(grid);
  };

  const handleCloseMenu = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setMenuAnchor(null);
    setSelectedGridForMenu(null);
  };

  const rotateHandlePos = useMemo(() => {
    if (!activeGrid || !mapRef.current) return null;
    const center = mapRef.current.latLngToLayerPoint(activeGrid.baseLatLng);
    const rad = (activeGrid.rotation * Math.PI) / 180;
    const p = L.point(center.x + 85 * Math.sin(-rad), center.y + 85 * Math.cos(-rad));
    return mapRef.current.layerPointToLatLng(p);
  }, [activeGrid]);

  const hasPendingChanges = useMemo(() => lastSavedSnapshot !== JSON.stringify(grids), [grids, lastSavedSnapshot]);

  // ===== EFECTOS =====
  useEffect(() => {
    loadDataFromSession(true);
    const handleSync = () => loadDataFromSession(true);
    window.addEventListener("storage", handleSync);
    window.addEventListener("sessionStorageUpdate", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("sessionStorageUpdate", handleSync);
    };
  }, [loadDataFromSession]);

  useEffect(() => {
    if (mapRef.current && grids.length > 0 && needsAutoCenter.current) {
      const firstGrid = grids[0];
      if (firstGrid.baseLatLng) {
        mapRef.current.setView(firstGrid.baseLatLng, 18);
        setActiveGridId(firstGrid.id);
        needsAutoCenter.current = false;
      }
    }
  }, [grids]);

  useEffect(() => {
    if (gridManagerRef.current) gridManagerRef.current.render(grids, activeGridId);
  }, [grids, activeGridId]);

  // ===== RENDER PRINCIPAL =====
  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative", overflow: 'hidden' }}>
      <GlobalStyles styles={{
        '.leaflet-container': {
          touchAction: 'none !important',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        },
        '.leaflet-pane': { touchAction: 'none !important' },
        'path.leaflet-interactive': {
          touchAction: 'none !important',
          cursor: 'crosshair',
        }
      }} />

      {/* PANEL DE CONTROL */}
      <Box sx={{
        position: 'fixed', top: 150, left: 20, zIndex: 1200,
        display: 'flex', flexDirection: 'column', gap: 0.5, width: 'auto'
      }}>
        <Paper elevation={4} sx={{
          bgcolor: '#1a237e', color: 'white', p: '4px 12px',
          borderRadius: 50, display: 'flex', alignItems: 'center', gap: 1.5,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
              <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: '6px' }}>{stats.panels}p | </span>
              {(stats.power / 1000).toFixed(2)} kWp
            </Typography>
          </Stack>
          <Tooltip title="Nuevo Grupo de Paneles FV">
            <IconButton
              onClick={handleAddNew}
              size="small"
              sx={{
                bgcolor: 'orange', color: 'white', width: 22, height: 22,
                '&:hover': { bgcolor: '#ff9800' }
              }}
            >
              <AddIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* LISTA DE GRUPOS */}
        <Stack spacing={0.5} sx={{ pl: 1, mt: 0.5 }}>
          {grids.map((g) => {
            const isSelected = g.id === activeGridId;
            const bloquesPintados = g.paneles?.length || 0;
            const panelesPorBloque = (g.config.rows || 1) * (g.config.cols || 1);
            const totalPanelesReal = bloquesPintados * panelesPorBloque;
            const pwr = ((totalPanelesReal * (g.config.potenciaW || 0)) / 1000).toFixed(2);

            return (
              <Paper
                key={g.id}
                onClick={() => setActiveGridId(g.id)}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '0 4px 0 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'rgba(255, 165, 0, 0.85)' : 'rgba(255, 255, 255, 0.25)',
                  color: isSelected ? 'white' : '#1a237e',
                  backdropFilter: 'blur(6px)',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  width: 'fit-content',
                  minWidth: 140,
                  height: 24,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(255, 165, 0, 1)' : 'rgba(255, 255, 255, 0.4)',
                  }
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexGrow: 1 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {g.nombre}:
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', whiteSpace: 'nowrap', opacity: 0.9 }}>
                    {totalPanelesReal}p | {pwr}kW
                  </Typography>
                </Stack>
                {isSelected && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, g)}
                    sx={{ color: 'white', p: 0.2, ml: 0.5 }}
                  >
                    <MenuIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Paper>
            );
          })}
        </Stack>

        {/* MENÚ DESPLEGABLE */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
          disablePortal={false}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'rgba(26, 35, 126, 0.98)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                minWidth: 170,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  fontSize: '0.75rem',
                  py: 1,
                  gap: 1.5,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }
              }
            }
          }}
        >
          <MenuItem onClick={() => { handleCopy(selectedGridForMenu); handleCloseMenu(); }}>
            <CopyIcon sx={{ fontSize: 16 }} /> Copiar Grupo
          </MenuItem>
          <MenuItem onClick={() => { setConfigModalOpen(true); handleCloseMenu(); }}>
            <SettingsIcon sx={{ fontSize: 16, color: '#ffa726' }} /> Configuración
          </MenuItem>
          <MenuItem onClick={() => { exportToGeoJSON(); handleCloseMenu(); }}>
            <PanelIcon sx={{ fontSize: 16, color: '#4fc3f7' }} /> Exportar GeoJSON
          </MenuItem>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setGrids(prev => prev.filter(x => x.id !== selectedGridForMenu?.id));
              setActiveGridId(null);
              handleCloseMenu();
            }}
            sx={{ color: '#ff7043' }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} /> Eliminar Grupo
          </MenuItem>
        </Menu>
      </Box>

      {/* BOTÓN GUARDAR */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 99999,
          pointerEvents: "none",
          display: "flex",
          gap: 2,
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >
        <Tooltip title="Guardar cambios" arrow placement="left">
          <Box sx={{ 
            pointerEvents: "auto", 
            transition: 'all 0.3s', 
            opacity: hasPendingChanges ? 1 : 0, 
            transform: hasPendingChanges ? 'scale(1)' : 'scale(0)' 
          }}>
            <Fab
              onClick={handleSave}
              sx={{
                bgcolor: "#ed6c02",
                color: "#ffffff",
                width: 56,
                height: 56,
                "&:hover": { bgcolor: "#e65100" },
                animation: hasPendingChanges ? 'pulse-small 1.5s infinite' : 'none',
                boxShadow: 6,
                '@keyframes pulse-small': {
                  '0%': { boxShadow: '0 0 0 0px rgba(237, 108, 2, 0.8)' },
                  '70%': { boxShadow: '0 0 0 8px rgba(237, 108, 2, 0)' },
                  '100%': { boxShadow: '0 0 0 0px rgba(237, 108, 2, 0)' },
                }
              }}
            >
              <SaveIcon sx={{ fontSize: 28 }} />
            </Fab>
          </Box>
        </Tooltip>
      </Box>

      {/* MAPA */}
      <MapContainer 
        center={[40.41, -3.7]} 
        zoom={18} 
        zoomControl={false} 
        style={{ height: "100%" }}
        whenReady={(e) => {
          mapRef.current = e.target;
          gridManagerRef.current = new FreeGridManager(e.target, (gid, cid, add) => {
            setGrids(prev => prev.map(g => {
              if (g.id !== gid) return g;
              const s = new Set(g.paneles);
              add ? s.add(cid) : s.delete(cid);
              return { ...g, paneles: Array.from(s) };
            }));
          }, (id) => setActiveGridId(id));
        }}
      >
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={22} />
        <MapAutoCenter activeGrid={activeGrid} />
        {activeGrid && (
          <>
            <Marker 
              position={activeGrid.baseLatLng} 
              draggable 
              icon={moveIcon} 
              eventHandlers={{ 
                drag: (e) => updateGrid(activeGridId, { baseLatLng: e.target.getLatLng() }) 
              }} 
            />
            {rotateHandlePos && (
              <Marker 
                position={rotateHandlePos} 
                draggable 
                icon={rotateHandleIcon} 
                eventHandlers={{
                  drag: (e) => {
                    const center = mapRef.current.latLngToLayerPoint(activeGrid.baseLatLng);
                    const mouse = mapRef.current.latLngToLayerPoint(e.target.getLatLng());
                    const dx = mouse.x - center.x; 
                    const dy = mouse.y - center.y;
                    updateGrid(activeGridId, { rotation: -Math.atan2(dx, dy) * (180 / Math.PI) });
                  }
                }} 
              />
            )}
          </>
        )}
      </MapContainer>

      {/* MODAL CONFIGURACIÓN */}
      <Dialog
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        hideBackdrop={true}
        disableEnforceFocus={true}
        PaperProps={{
          sx: {
            position: 'fixed',
            left: 20,
            top: 150,
            m: 0,
            width: 245,
            maxHeight: '80vh',
            borderRadius: 2,
            border: '1px solid #1a237e',
            boxShadow: 6,
            transform: 'scale(0.75)',
            transformOrigin: '0 0',
            margin: 0,
          }
        }}
      >
        <Box sx={{ bgcolor: '#1a237e', color: 'white', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={900}>Configuración</Typography>
          </Box>
          <IconButton size="small" onClick={() => setConfigModalOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {activeGrid && (
          <Box sx={{ display: 'flex', flexDirection: 'row', bgcolor: 'white' }}>
            {/* Barra lateral de pestañas */}
            <Box sx={{ borderRight: 1, borderColor: 'divider', bgcolor: '#f9f9f9', width: 45 }}>
              <Tabs
                orientation="vertical"
                value={innerTab}
                onChange={(_, v) => setInnerTab(v)}
                sx={{ minWidth: 45, '& .MuiTab-root': { minWidth: 45, py: 2 } }}
              >
                {CONFIG.tabs.map((tab) => {
                  const iconMap = {
                    'Info': <InfoIcon fontSize="small" />,
                    'Panel': <PanelIcon fontSize="small" />,
                    'Mount': <MountIcon fontSize="small" />,
                    'Inverter': <InverterIcon fontSize="small" />
                  };
                  return (
                    <Tooltip key={tab.id} title={tab.label} placement="right" arrow>
                      <Tab icon={iconMap[tab.icon]} />
                    </Tooltip>
                  );
                })}
              </Tabs>
            </Box>

            {/* Contenido dinámico */}
            <Box sx={{ flexGrow: 1, p: 1.5, overflow: 'hidden', maxHeight: '70vh', overflowY: 'auto' }}>
              <Stack spacing={2}>
                {CONFIG.tabs[innerTab]?.fields.map((field) => (
                  <React.Fragment key={field.key}>
                    {renderField(field, activeGrid, activeGridId)}
                  </React.Fragment>
                ))}
              </Stack>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* DIALOGO SOMBRAS */}
      <Dialog open={shadowModalOpen} onClose={() => setShadowModalOpen(false)} fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Sombras: {activeGrid?.nombre}
          <IconButton onClick={() => setShadowModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Box sx={{ p: 3 }}>
          {activeGrid && (
            <ShadowProfileChart 
              nivelSombra16={activeGrid.sombras} 
              setNivelSombra16={(n) => updateGrid(activeGridId, { sombras: n })} 
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default App;