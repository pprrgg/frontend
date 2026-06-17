import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  IconButton, Box, TextField, Stack, Typography, Paper,
  Accordion, AccordionSummary, AccordionDetails, Dialog,
  DialogTitle, Divider, Slider, Tab, Tabs, Tooltip, Badge, Fab, Button, Chip, GlobalStyles
} from "@mui/material";

// O si prefieres un rayo:
// import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';

import {
  Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
  StayCurrentPortrait as PortraitIcon,
  StayCurrentLandscape as LandscapeIcon,
  Contrast as ShadowIcon,
  Close as CloseIcon,
  KeyboardDoubleArrowUp as CollapseIcon,
  UnfoldMore as ExpandAllIcon,
  GridOn as PanelIcon,
  SettingsInputComponent as MountIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  Settings as SettingsIcon,
  Functions as TotalIcon,
  Layers as LayersIcon,
  ContentCopy as CopyIcon // <--- AÑADE ESTA LÍNEA  
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import ShadowProfileChart from "./ShadowProfileChart";
import { SvgIcon } from '@mui/material';

// Definición rápida del icono
const InverterIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    {/* Este path dibuja una caja con un símbolo de onda/alterna (~), típico de inversores */}
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-2h-2v2zm-4 0h2v-4H7v4zm8 0h2v-7h-2v7z" />
  </SvgIcon>
);
// --- RECURSOS VISUALES (SVG y Leaflet Icons) ---
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

const propsIcon = L.divIcon({
  className: 'custom-props-icon',
  html: `<div style="background-color: #1a237e; width: 26px; height: 26px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg></div>`,
  iconSize: [26, 26], iconAnchor: [13, 13]
});

// --- COMPONENTES AUXILIARES ---
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

class FreeGridManager {
  constructor(map, onUpdate, onSelect) {
    this.map = map;
    this.onUpdate = onUpdate;
    this.onSelect = onSelect;
    this.gridLayer = L.layerGroup().addTo(this.map);

    this.isDragging = false;
    this.paintMode = true;
    this.lastTouchedId = null;

    // Detener pintado
    const stopDrawing = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.lastTouchedId = null;
        this.map.dragging.enable();
      }
    };

    // Listeners globales en window
    window.addEventListener('pointerup', stopDrawing);
    window.addEventListener('pointercancel', stopDrawing);

    // EL MOTOR DE PINTADO: Detecta movimiento global mientras está pulsado
    const handlePointerMove = (e) => {
      if (!this.isDragging) return;

      // Localizamos qué hay bajo el puntero usando coordenadas globales
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

    // Dimensiones de la matriz
    const rows = grid.config.rows || 1;
    const cols = grid.config.cols || 1;
    const baseH = isV ? grid.config.height : grid.config.width;
    const baseW = isV ? grid.config.width : grid.config.height;

    // Tamaño total de la celda (bloque de matriz)
    const panelH = baseH * rows;
    const panelW = baseW * cols;

    const pW_px = this.metersToPx(panelW);
    const pH_px = this.metersToPx(panelH) * Math.cos(tiltRad);

    const panels = new Set(grid.paneles || []);
    const tipo = grid.config.tipoEstructura || 'coplanar';

    // --- LÓGICA DE CRECIMIENTO ORGÁNICO (image_a03fda.png) ---
    const cellsToRender = new Set();
    if (panels.size === 0) {
      cellsToRender.add("0,0");
    } else {
      panels.forEach(id => {
        cellsToRender.add(id);
        const [r, c] = id.split(',').map(Number);
        // Vecindad de 8 celdas
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

      // Cálculo de desplazamientos según estructura
      if (tipo === 'doble') {
        // Para estructura doble (Este-Oeste), una fila mira al Azimut y la otra al opuesto.
        // Ajustamos para que la dirección coincida visualmente con el selector de la imagen image_94ed40.jpg
        if (Math.abs(r) % 2 === 0) {
          arrowRad = rad + Math.PI; // Invertimos las pares
        } else {
          arrowRad = rad; // Las impares mantienen el azimut original
        }

        // Mantenemos el pequeño gap de separación para el vértice de la estructura
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

      // Dibujar el bloque principal
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
        // 1. Icono de orientación
        L.marker(cellLatLng, {
          icon: L.divIcon({
            className: 'arrow',
            html: `<div style="transform: rotate(${arrowRad}rad); display: flex; justify-content: center; align-items: center; opacity: 0.8;">${arrowWhiteSvg}</div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          }),
          interactive: false
        }).addTo(this.gridLayer);

        // 2. SUBDIVISIÓN POR LÍNEAS FINAS (image_a0abc0.png)
        if (rows > 1 || cols > 1) {
          const p1 = corners[0], p2 = corners[1], p3 = corners[2], p4 = corners[3];

          // Líneas horizontales
          for (let i = 1; i < rows; i++) {
            const ratio = i / rows;
            const start = [p1.lat + (p4.lat - p1.lat) * ratio, p1.lng + (p4.lng - p1.lng) * ratio];
            const end = [p2.lat + (p3.lat - p2.lat) * ratio, p2.lng + (p3.lng - p2.lng) * ratio];
            L.polyline([start, end], { color: 'rgba(255,255,255,0.3)', weight: 0.8, interactive: false }).addTo(this.gridLayer);
          }
          // Líneas verticales
          for (let j = 1; j < cols; j++) {
            const ratio = j / cols;
            const start = [p1.lat + (p2.lat - p1.lat) * ratio, p1.lng + (p2.lng - p1.lng) * ratio];
            const end = [p4.lat + (p3.lat - p4.lat) * ratio, p4.lng + (p3.lng - p4.lng) * ratio];
            L.polyline([start, end], { color: 'rgba(255,255,255,0.3)', weight: 0.8, interactive: false }).addTo(this.gridLayer);
          }
        }
      } else if (isActive) {
        // Marcador "+" solo en vecinas
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

      // Eventos de interacción
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


const App = () => {
  const [grids, setGrids] = useState([]);
  const [activeGridId, setActiveGridId] = useState(null);
  const [shadowModalOpen, setShadowModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [innerTab, setInnerTab] = useState(0);

  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const needsAutoCenter = useRef(false);
  const isSavingInternal = useRef(false);
  const mapRef = useRef(null);
  const gridManagerRef = useRef(null);

  const activeGrid = useMemo(() => grids.find(g => g.id === activeGridId), [grids, activeGridId]);

  const stats = useMemo(() => {
    const total = grids.reduce((acc, g) => {
      // 1. Obtenemos cuántos bloques (celdas azules) hay pintados
      const bloquesPintados = (g.paneles?.length || 0);

      // 2. Calculamos cuántos paneles hay por cada bloque (por defecto 1x1 = 1)
      const panelesPorBloque = (g.config.rows || 1) * (g.config.cols || 1);

      // 3. Calculamos el total de paneles de este grupo
      const totalPanelesGrupo = bloquesPintados * panelesPorBloque;

      // 4. Sumamos al acumulador global
      acc.panels += totalPanelesGrupo;
      acc.power += totalPanelesGrupo * (g.config.potenciaW || 0);

      return acc;
    }, { panels: 0, power: 0 });

    return total;
  }, [grids]);


  const loadDataFromSession = useCallback((forceCenter = false) => {

    const raw = sessionStorage.getItem("excelData");

    if (!raw) return;

    try {

      const parsed = JSON.parse(raw);

      if (parsed["Diseño_FV"]?.length > 1) {

        const headers = parsed["Diseño_FV"][0];

        const data = parsed["Diseño_FV"]
          .slice(1)
          .map((r) => {

            const row = {};

            headers.forEach((h, i) => {

              let v = r[i];

              // Parsear arrays/objetos serializados
              if (
                typeof v === "string" &&
                (v.startsWith("{") || v.startsWith("["))
              ) {
                try {
                  v = JSON.parse(
                    v.replace(/'/g, '"')
                  );
                } catch (e) {
                  console.warn("Error parseando:", h, v);
                }
              }

              row[h] = v;

            });

            // =====================================================
            // VALIDACIÓN SEGURA COORDENADAS
            // =====================================================

            const lat = parseFloat(row.lat);
            const lng = parseFloat(row.lng);

            const validLat =
              Number.isFinite(lat)
                ? lat
                : 40.4167;

            const validLng =
              Number.isFinite(lng)
                ? lng
                : -3.70325;

            // =====================================================
            // OBJETO GRID NORMALIZADO
            // =====================================================

            // ... dentro de loadDataFromSession en la sección: OBJETO GRID NORMALIZADO ...
            return {
              id: row.id || Date.now(),
              nombre: row.nombre || "G1",
              rotation: Number.isFinite(parseFloat(row.rotation)) ? parseFloat(row.rotation) : 0,
              baseLatLng: {
                lat: validLat,
                lng: validLng
              },
              // ... dentro de loadDataFromSession en el retorno del objeto GRID NORMALIZADO ...
              config: {
                tipoEstructura: row.tipoEstructura || "coplanar",
                width: Number.isFinite(parseFloat(row.width)) ? parseFloat(row.width) : 1.1,
                height: Number.isFinite(parseFloat(row.height)) ? parseFloat(row.height) : 1.9,
                tilt: Number.isFinite(parseFloat(row.tilt)) ? parseFloat(row.tilt) : 30,
                slope: Number.isFinite(parseFloat(row.slope)) ? parseFloat(row.slope) : 0,
                orientation: row.orientation || "vertical",
                potenciaW: Number.isFinite(parseFloat(row.potenciaW)) ? parseFloat(row.potenciaW) : 450,
                rows: Number.isFinite(parseInt(row.rows)) ? parseInt(row.rows) : 1,
                cols: Number.isFinite(parseInt(row.cols)) ? parseInt(row.cols) : 1,
                modelo: row.modelo || "",
                inverterModel: row.inverterModel || "",
                inverterPower: Number.isFinite(parseFloat(row.inverterPower)) ? parseFloat(row.inverterPower) : 0,
                FVcost: Number.isFinite(parseFloat(row.FVcost)) ? parseFloat(row.FVcost) : 0,
                mpptCount: Number.isFinite(parseInt(row.mpptCount)) ? parseInt(row.mpptCount) : 1,

                // --- PARSEO SEGURO DE VARIABLES DEL PANEL ---
                vOc: Number.isFinite(parseFloat(row.vOc)) ? parseFloat(row.vOc) : 0,
                vMp: Number.isFinite(parseFloat(row.vMp)) ? parseFloat(row.vMp) : 0,
                iSc: Number.isFinite(parseFloat(row.iSc)) ? parseFloat(row.iSc) : 0,
                iMp: Number.isFinite(parseFloat(row.iMp)) ? parseFloat(row.iMp) : 0,
                coefVoc: Number.isFinite(parseFloat(row.coefVoc)) ? parseFloat(row.coefVoc) : 0,

                // --- PARSEO SEGURO DE VARIABLES DEL INVERSOR ---
                vMax: Number.isFinite(parseFloat(row.vMax)) ? parseFloat(row.vMax) : 0,
                vMinMppt: Number.isFinite(parseFloat(row.vMinMppt)) ? parseFloat(row.vMinMppt) : 0,
                vMaxMppt: Number.isFinite(parseFloat(row.vMaxMppt)) ? parseFloat(row.vMaxMppt) : 0,
                iMaxInverter: Number.isFinite(parseFloat(row.iMaxInverter)) ? parseFloat(row.iMaxInverter) : 0,
                iScMaxInverter: Number.isFinite(parseFloat(row.iScMaxInverter)) ? parseFloat(row.iScMaxInverter) : 0
              },
              // ... resto del mapeo igual
              paneles: Array.isArray(row.paneles) ? row.paneles : [],
              sombras: Array.isArray(row.sombras) ? row.sombras : Array(16).fill(1)
            };
            // ... resto de la función igual

          })

          // =====================================================
          // FILTRO SEGURIDAD LEAFLET
          // =====================================================

          .filter(g =>

            g.baseLatLng &&

            Number.isFinite(g.baseLatLng.lat) &&

            Number.isFinite(g.baseLatLng.lng)

          );

        const dataStr = JSON.stringify(data);

        // =====================================================
        // ACTUALIZAR SOLO SI CAMBIÓ
        // =====================================================

        if (dataStr !== lastSavedSnapshot) {

          setGrids(data);

          setLastSavedSnapshot(dataStr);

          // ===================================================
          // AUTOCENTER
          // ===================================================

          if (
            forceCenter &&
            !isSavingInternal.current &&
            data.length > 0
          ) {

            needsAutoCenter.current = true;

          }

        }

      }

    } catch (e) {

      console.error(
        "Error sincronizando sesión:",
        e
      );

    }

  }, [lastSavedSnapshot]);
  useEffect(() => {
    // 1. Ejecución inmediata al cargar la web
    loadDataFromSession(true);

    const handleSync = () => {
      // 2. Ejecución cuando detectamos cambios en la base de datos (Importar o Guardar)
      loadDataFromSession(true);
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("sessionStorageUpdate", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("sessionStorageUpdate", handleSync);
    };
  }, [loadDataFromSession]);

  useEffect(() => {
    // Solo entramos si needsAutoCenter es true Y hay un mapa listo
    if (mapRef.current && grids.length > 0 && needsAutoCenter.current) {
      const firstGrid = grids[0];
      if (firstGrid.baseLatLng) {
        mapRef.current.setView(firstGrid.baseLatLng, 18); // Ajusta el zoom a uno razonable
        setActiveGridId(firstGrid.id);
        // IMPORTANTÍSIMO: Resetear el ref inmediatamente para evitar rebotes
        needsAutoCenter.current = false;
      }
    }
  }, [grids]); // Se ejecuta cuando grids cambia, pero solo actúa si el REF es true

  const hasPendingChanges = useMemo(() => lastSavedSnapshot !== JSON.stringify(grids), [grids, lastSavedSnapshot]);


  const handleSave = useCallback(() => {

    if (grids.length === 0) return;

    isSavingInternal.current = true;

    try {

      // =========================================================
      // GEOJSON CORRECTO EN EPSG:4326
      // =========================================================
      const features = grids.flatMap((grid) => {

        const rad = (grid.rotation * Math.PI) / 180;

        const tiltRad = (grid.config.tilt * Math.PI) / 180;

        const isV = grid.config.orientation === 'vertical';

        const rows = grid.config.rows || 1;
        const cols = grid.config.cols || 1;

        const bH = isV
          ? grid.config.height
          : grid.config.width;

        const bW = isV
          ? grid.config.width
          : grid.config.height;

        const panelH = bH * rows;
        const panelW = bW * cols;

        const latRef = grid.baseLatLng.lat;
        const lngRef = grid.baseLatLng.lng;

        const latRad = latRef * (Math.PI / 180);

        // Radio tierra WGS84
        const R = 6378137.0;

        // Altura proyectada por inclinación
        const pH_projected =
          panelH * Math.cos(tiltRad);

        const tipo =
          grid.config.tipoEstructura || 'coplanar';

        // =========================================================
        // GENERAR PANELES
        // =========================================================
        return grid.paneles.map((panelId) => {

          const [r, c] = panelId
            .split(',')
            .map(Number);

          let vStep = 0;

          // =====================================================
          // DISTANCIA ENTRE FILAS
          // =====================================================
          if (tipo === 'libre') {

            const k =
              1 /
              Math.tan(
                Math.max(
                  5,
                  90 - Math.abs(latRef) - 23.44
                ) *
                Math.PI /
                180
              );

            const hV =
              panelH *
              Math.sin(
                Math.max(
                  0,
                  grid.config.tilt -
                  grid.config.slope
                ) *
                Math.PI /
                180
              );

            vStep =
              r *
              (
                pH_projected +
                (hV * k)
              );

          } else if (tipo === 'doble') {

            vStep =
              r * pH_projected +
              (
                Math.floor(r / 2) *
                (pH_projected * 0.15)
              );

          } else {

            vStep =
              r * pH_projected;
          }

          // =====================================================
          // RECTÁNGULO PANEL
          // =====================================================
          const corners = [

            {
              dx: -panelW / 2,
              dy: pH_projected / 2
            },

            {
              dx: panelW / 2,
              dy: pH_projected / 2
            },

            {
              dx: panelW / 2,
              dy: -pH_projected / 2
            },

            {
              dx: -panelW / 2,
              dy: -pH_projected / 2
            },

            {
              dx: -panelW / 2,
              dy: pH_projected / 2
            }

          ].map((off) => {

            // ===================================================
            // ROTACIÓN LOCAL EN METROS
            // ===================================================
            const xR =
              (
                (c * panelW) + off.dx
              ) * Math.cos(rad)
              -
              (
                vStep + off.dy
              ) * Math.sin(rad);

            const yR =
              (
                (c * panelW) + off.dx
              ) * Math.sin(rad)
              +
              (
                vStep + off.dy
              ) * Math.cos(rad);

            // ===================================================
            // CONVERSIÓN CORRECTA A WGS84
            // ===================================================
            const lng =
              lngRef +
              (
                xR /
                (
                  R *
                  Math.cos(latRad)
                )
              ) *
              (
                180 / Math.PI
              );

            const lat =
              latRef -
              (
                yR / R
              ) *
              (
                180 / Math.PI
              );

            return [lng, lat];

          });

          // =====================================================
          // FEATURE
          // =====================================================
          return {

            type: "Feature",

            properties: {
              area: grid.nombre,
              block: panelId
            },

            geometry: {
              type: "Polygon",
              coordinates: [corners]
            }
          };

        });

      });

      // =========================================================
      // FEATURE COLLECTION
      // =========================================================
      const fullGeoJSON = {
        type: "FeatureCollection",
        features
      };

      // =========================================================
      // SERIALIZAR
      // =========================================================
      const geoJsonString = JSON.stringify(
        fullGeoJSON
      ).replace(/"/g, "'");

      // =========================================================
      // SESSION STORAGE
      // =========================================================
      const currentData = JSON.parse(
        sessionStorage.getItem("excelData") || "{}"
      );

      // ... dentro de handleSave en la sección de mapeo de excelData ...
      // ... dentro de handleSave ...
      // ... dentro de handleSave ...
      const headers = [
        "Capítulo", "Categoría", "nombre", "tipoEstructura", "id", "lat", "lng", "rotation",
        "width", "height", "tilt", "slope",
        "orientation",  // Vía 12
        "modelo",       // Vía 13 <--- NUEVO
        "potenciaW",    // Vía 14
        "rows", "cols",
        "inverterModel", "inverterPower","FVcost", "mpptCount",
        "vOc", "vMp", "iSc", "iMp", "coefVoc",
        "vMax", "vMinMppt", "vMaxMppt", "iMaxInverter", "iScMaxInverter",
        "paneles", "sombras", "geojson"
      ];

      const rowsData = grids.map((g) => [
        "FV", "Paneles", g.nombre, g.config?.tipoEstructura || "coplanar", g.id,
        g.baseLatLng?.lat || 0, g.baseLatLng?.lng || 0, g.rotation || 0,
        g.config?.width || 0, g.config?.height || 0, g.config?.tilt || 0, g.config?.slope || 0,
        g.config?.orientation || "vertical", // Mismo orden que el header
        g.config?.modelo || "",              // <--- Aquí guardamos el modelo
        g.config?.potenciaW || 0,            // Mismo orden que el header
        g.config?.rows || 1, g.config?.cols || 1,
        g.config?.inverterModel || "", g.config?.inverterPower || 0, g.config?.FVcost || 0, g.config?.mpptCount || 1,

        // Valores eléctricos de paneles
        g.config?.vOc || 0, g.config?.vMp || 0, g.config?.iSc || 0, g.config?.iMp || 0, g.config?.coefVoc || 0,
        // Valores eléctricos de inversor
        g.config?.vMax || 0, g.config?.vMinMppt || 0, g.config?.vMaxMppt || 0, g.config?.iMaxInverter || 0, g.config?.iScMaxInverter || 0,

        JSON.stringify(g.paneles || []).replace(/"/g, "'"),
        JSON.stringify(g.sombras || []).replace(/"/g, "'"),
        geoJsonString
      ]);
      // ... resto del guardado en sessionStorage igual
      // ... resto del guardado en sessionStorage igual

      currentData["Diseño_FV"] = [
        headers,
        ...rowsData
      ];

      // =========================================================
      // GUARDAR
      // =========================================================
      sessionStorage.setItem(
        "excelData",
        JSON.stringify(currentData)
      );

      // --- CAMBIO AQUÍ PARA ACTUALIZAR ESTADO SIN ERROR ---
      // Si usas una función para el estado global de los datos, 
      // asegúrate de que el nombre coincida (ej: setRows, setData, etc)
      // Si no sabes el nombre, el dispatch de abajo notificará a otros componentes.

      setLastSavedSnapshot(
        JSON.stringify(grids)
      );

      window.dispatchEvent(
        new Event("sessionStorageUpdate")
      );

    } catch (error) {

      console.error(
        "Error al guardar en sesión:",
        error
      );

    } finally {

      setTimeout(() => {

        isSavingInternal.current = false;

      }, 50);

    }

  }, [grids]);


  const handleAddNew = useCallback(() => {
    if (!mapRef.current) return;
    const px = 1;
    const py = 3;
    const id = Date.now();
    const n = {
      id,
      nombre: `G${grids.length + 1}`,
      baseLatLng: mapRef.current.getCenter(),
      rotation: 0,
      config: {
        width: 1.1,
        height: 1.9,
        tilt: 30,
        slope: 0,
        orientation: "vertical",
        potenciaW: 450,
        tipoEstructura: "coplanar",
        rows: 1,
        cols: 1,

        // Configuración Inversor base
        inverterModel: "",
        inverterPower: 0,
        FVcost: 0,
        mpptCount: 1,

        // --- NUEVAS VARIABLES ELÉCTRICAS DEL PANEL (STC) ---
        vOc: 0,
        vMp: 0,
        iSc: 0,
        iMp: 0,
        coefVoc: 0, // Coeficiente de temperatura de Voc

        // --- NUEVAS VARIABLES ELÉCTRICAS DEL INVERSOR (POR MPPT) ---
        vMax: 0,      // Tensión máxima admisible
        vMinMppt: 0,  // Rango MPPT Mínimo
        vMaxMppt: 0,  // Rango MPPT Máximo
        iMaxInverter: 0,    // Corriente máxima de entrada
        iScMaxInverter: 0   // Corriente máxima de cortocircuito
      },

      // Genera: ["-2,-5", "-2,-4" ... "0,0" ... "2,5"]
      paneles: Array.from({ length: px * 2 }, (_, i) => i - px)
        .flatMap(r =>
          Array.from({ length: py * 2 }, (_, j) => j - py)
            .map(c => `${r},${c}`)
        ),

      sombras: Array(16).fill(1)
    };

    // Insertar al principio para que sea el primero en la lista
    setGrids(prev => [n, ...prev]);
    setActiveGridId(id);

    // Desactivamos el autocentrado para que no haya saltos de cámara bruscos
    needsAutoCenter.current = false;
  }, [grids]);

  const handleCopy = useCallback((gridToCopy) => {
    if (!gridToCopy) return;

    const id = Date.now();
    // Creamos un pequeño desplazamiento en metros para la copia (aprox 2 metros)
    const offset = 0.00002;

    const clonedGrid = {
      ...gridToCopy,
      id,
      nombre: `${gridToCopy.nombre}c`, // Añadimos una 'c' de copia al nombre
      baseLatLng: {
        lat: gridToCopy.baseLatLng.lat - offset,
        lng: gridToCopy.baseLatLng.lng + offset
      },
      // Mantenemos el resto igual (config, paneles, sombras, rotation)
      paneles: [...gridToCopy.paneles],
      sombras: [...gridToCopy.sombras]
    };

    setGrids(prev => [clonedGrid, ...prev]);
    setActiveGridId(id);
    // No autocentramos para que el usuario vea dónde aparece la copia respecto al original
    needsAutoCenter.current = false;
  }, []);

  useEffect(() => {
    if (gridManagerRef.current) gridManagerRef.current.render(grids, activeGridId);
  }, [grids, activeGridId]);

  const updateGrid = useCallback((id, fields) => setGrids(prev => prev.map(g => g.id === id ? { ...g, ...fields, config: { ...g.config, ...(fields.config || {}) } } : g)), []);

  const rotateHandlePos = useMemo(() => {
    if (!activeGrid || !mapRef.current) return null;
    const center = mapRef.current.latLngToLayerPoint(activeGrid.baseLatLng);
    const rad = (activeGrid.rotation * Math.PI) / 180;
    const p = L.point(center.x + 85 * Math.sin(-rad), center.y + 85 * Math.cos(-rad));
    return mapRef.current.layerPointToLatLng(p);
  }, [activeGrid]);



  const generateGeoJSONData = useCallback(() => {
    if (!grids.length) return null;

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

    return { type: "FeatureCollection", features };
  }, [grids]);

  const exportToGeoJSON = () => {
    const geojson = generateGeoJSONData();
    if (!geojson) return;

    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FV_Export_${new Date().getTime()}.geojson`;
    a.click();
  };

  // Estados para el Menú Hamburguesa
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [selectedGridForMenu, setSelectedGridForMenu] = React.useState(null);

  const handleOpenMenu = (event, grid) => {
    event.stopPropagation(); // Vital para que Leaflet no detecte click en el mapa
    setMenuAnchor(event.currentTarget);
    setSelectedGridForMenu(grid);
  };

  const handleCloseMenu = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setMenuAnchor(null);
    setSelectedGridForMenu(null);
  };
  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative", overflow: 'hidden' }}>
      <GlobalStyles styles={{
        '.leaflet-container': {
          touchAction: 'none !important', // Bloquea el scroll del navegador
          userSelect: 'none',
          WebkitUserSelect: 'none',
        },
        '.leaflet-pane': {
          touchAction: 'none !important',
        },
        'path.leaflet-interactive': {
          touchAction: 'none !important', // Bloquea gestos sobre los polígonos
          cursor: 'crosshair',
        }
      }} />

      {/* --- PANEL DE CONTROL COMPACTO (TOTAL + LISTA PARCIALES) --- */}
      <Box sx={{
        position: 'fixed', top: 150, left: 20, zIndex: 1200,
        display: 'flex', flexDirection: 'column', gap: 0.5, width: 'auto'
      }}>
        {/* LÍNEA PRINCIPAL: TOTAL Y AGREGAR */}
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


        {/* --- LISTA DE PARCIALES (MINI & GLASSMORPHISM) --- */}
        <Stack spacing={0.5} sx={{ pl: 1, mt: 0.5 }}>
          {grids.map((g) => {
            const isSelected = g.id === activeGridId;

            // Lógica de cálculo de paneles
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
                  height: 24, // Altura optimizada para el icono
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(255, 165, 0, 1)' : 'rgba(255, 255, 255, 0.4)',
                  }
                }}
              >
                {/* INFO GRUPO */}
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexGrow: 1 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {g.nombre}:
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', whiteSpace: 'nowrap', opacity: 0.9 }}>
                    {totalPanelesReal}p | {pwr}kW
                  </Typography>
                </Stack>

                {/* BOTÓN HAMBURGUESA */}
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

        {/* --- MENÚ DESPLEGABLE (FUERA DEL MAP) --- */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
          disablePortal={false} // Asegura que se renderice sobre el mapa
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
      {/* BOTÓN GUARDAR (FLOTANTE ) */}
      <Box
        sx={{
          position: "fixed",
          bottom: "10%",
          right: '10%',
          zIndex: 9999,
          transition: 'all 0.3s ease-in-out',
          // Control de visibilidad con transiciones en lugar de renderizado condicional simple
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
        {/* <Tooltip title="Guardar cambios" arrow placement="top">
          <Fab
            size="small"
            onClick={handleSave}
            sx={{
              bgcolor: "#ed6c02",
              color: "#ffffff",
              width: 50,
              height: 50,
              "&:hover": { bgcolor: "#e65100" },
              animation: hasPendingChanges ? 'pulse-small 1.5s infinite' : 'none',
              boxShadow: 4
            }}
          >
            <SaveIcon sx={{ fontSize: 20 }} />
          </Fab>
        </Tooltip> */}
      </Box>

      <MapContainer center={[40.41, -3.7]} zoom={18} zoomControl={false} style={{ height: "100%" }}
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
        }}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={22} />
        <MapAutoCenter activeGrid={activeGrid} />
        {activeGrid && (
          <>
            <Marker position={activeGrid.baseLatLng} draggable icon={moveIcon} eventHandlers={{ drag: (e) => updateGrid(activeGridId, { baseLatLng: e.target.getLatLng() }) }} />
            {rotateHandlePos && (
              <Marker position={rotateHandlePos} draggable icon={rotateHandleIcon} eventHandlers={{
                drag: (e) => {
                  const center = mapRef.current.latLngToLayerPoint(activeGrid.baseLatLng);
                  const mouse = mapRef.current.latLngToLayerPoint(e.target.getLatLng());
                  const dx = mouse.x - center.x; const dy = mouse.y - center.y;
                  updateGrid(activeGridId, { rotation: -Math.atan2(dx, dy) * (180 / Math.PI) });
                }
              }} />
            )}
            {/* {propsHandlePos && (
              <Marker position={propsHandlePos} icon={propsIcon} eventHandlers={{ click: () => setConfigModalOpen(true) }} />
            )} */}
          </>
        )}
      </MapContainer>


      {/* 2. EL BOTÓN (Debe ir después del mapa para que flote por encima) */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24, // Margen desde abajo
          right: 24,  // Margen desde la derecha
          zIndex: 99999, // Valor extremadamente alto para superar a Leaflet
          pointerEvents: "none", // El contenedor no bloquea el mapa, solo el Fab
          display: "flex",
          gap: 2,
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >

        {/* BOTÓN GUARDAR */}
        <Tooltip title="Guardar cambios" arrow placement="left">
          <Box sx={{ pointerEvents: "auto", transition: 'all 0.3s', opacity: hasPendingChanges ? 1 : 0, transform: hasPendingChanges ? 'scale(1)' : 'scale(0)' }}>
            <Fab
              onClick={handleSave}
              sx={{
                bgcolor: "#ed6c02",
                color: "#ffffff",
                width: 56,
                height: 56,
                "&:hover": { bgcolor: "#e65100" },
                animation: hasPendingChanges ? 'pulse-small 1.5s infinite' : 'none',
                boxShadow: 6
              }}
            >
              <SaveIcon sx={{ fontSize: 28 }} />
            </Fab>
          </Box>
        </Tooltip>
      </Box>

      {/* MODAL CONFIGURACIÓN (LATERAL IZQUIERDO) */}
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
      {/* BARRA LATERAL DE PESTAÑAS CON TOOLTIPS */}
      <Box sx={{ borderRight: 1, borderColor: 'divider', bgcolor: '#f9f9f9', width: 45 }}>
        <Tabs
          orientation="vertical"
          value={innerTab}
          onChange={(_, v) => setInnerTab(v)}
          sx={{ minWidth: 45, '& .MuiTab-root': { minWidth: 45, py: 2 } }}
        >
          {/* NUEVA PESTAÑA GENÉRICA */}
          <Tooltip title="Información General" placement="right" arrow>
            <Tab icon={<InfoIcon fontSize="small" />} />
          </Tooltip>

          <Tooltip title="Configuración de Paneles" placement="right" arrow>
            <Tab icon={<PanelIcon fontSize="small" />} />
          </Tooltip>

          <Tooltip title="Estructura y Montaje" placement="right" arrow>
            <Tab icon={<MountIcon fontSize="small" />} />
          </Tooltip>

          <Tooltip title="Configuración de Inversor" placement="right" arrow>
            <Tab icon={<InverterIcon fontSize="small" />} />
          </Tooltip>
        </Tabs>
      </Box>

      <Box sx={{ flexGrow: 1, p: 1.5, overflow: 'hidden' }}>
        {innerTab === 0 ? (
          /* NUEVA PESTAÑA 0: INFORMACIÓN GENERAL */
          <Stack spacing={2}>
            <Box sx={{
              width: '100%',
              bgcolor: '#f8f9fa',
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #eef0f2'
            }}>
              <TextField
                label="Nombre Grupo"
                size="small"
                variant="standard"
                fullWidth
                value={activeGrid.nombre}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 3) {
                    updateGrid(activeGridId, { nombre: newValue });
                  }
                }}
                sx={{ mb: 1.5 }}
              />
              
              <TextField
                label="Coste (EUR)"
                size="small"
                variant="standard"
                fullWidth
                type="number"
                value={activeGrid.config.FVcost || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { FVcost: parseFloat(e.target.value) || 0 } })}
                sx={{ mb: 1.5 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
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
            </Box>
          </Stack>
        ) : innerTab === 1 ? (
          /* PESTAÑA 1: PANEL Y MATRIZ (antes era 0) */
          <Stack spacing={2} alignItems="center">
            <Box sx={{
              width: '100%',
              bgcolor: '#f8f9fa',
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #eef0f2'
            }}>
              <TextField
                label="Modelo de Panel"
                size="small"
                variant="standard"
                fullWidth
                value={activeGrid.config.modelo || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { modelo: e.target.value } })}
                sx={{ mb: 1.5 }}
              />
              <TextField
                label="Potencia (Wp)"
                size="small"
                variant="standard"
                fullWidth
                type="number"
                value={activeGrid.config.potenciaW || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { potenciaW: parseFloat(e.target.value) || 0 } })}
              />
            </Box>

            {/* VARIABLES ELÉCTRICAS PANEL (STC) */}
            <Box sx={{ width: '100%', p: 0.5 }}>
              <Divider sx={{ mb: 1.5, fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>FICHA TÉCNICA PANEL (STC)</Divider>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="Voc (V)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.vOc || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { vOc: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
                <TextField
                  label="Vmp (V)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.vMp || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { vMp: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="Isc (A)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.iSc || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { iSc: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
                <TextField
                  label="Imp (A)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.iMp || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { iMp: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
              </Stack>
              <TextField
                label="Coef. Temp Voc (%/°C ó mV/°C)" size="small" variant="outlined" type="number" fullWidth
                value={activeGrid.config.coefVoc || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { coefVoc: parseFloat(e.target.value) || 0 } })}
                inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
              />
            </Box>

            {/* ORIENTACIÓN Y GEOMETRÍA */}
            <Box sx={{ width: '100%', p: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => updateGrid(activeGridId, {
                  config: { orientation: activeGrid.config.orientation === 'vertical' ? 'horizontal' : 'vertical' }
                })}
                sx={{ border: '1px solid #ddd', bgcolor: '#fff', width: 36, height: 36 }}
              >
                {activeGrid.config.orientation === 'vertical' ? <PortraitIcon fontSize="small" /> : <LandscapeIcon fontSize="small" />}
              </IconButton>

              <Stack direction="row" spacing={1} width="100%">
                <TextField
                  label="H (m)"
                  size="small"
                  variant="standard"
                  fullWidth
                  type="number"
                  value={activeGrid.config.height}
                  onChange={(e) => updateGrid(activeGridId, { config: { height: parseFloat(e.target.value) || 0 } })}
                />
                <TextField
                  label="W (m)"
                  size="small"
                  variant="standard"
                  fullWidth
                  type="number"
                  value={activeGrid.config.width}
                  onChange={(e) => updateGrid(activeGridId, { config: { width: parseFloat(e.target.value) || 0 } })}
                />
              </Stack>

              <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 700, color: '#1a237e' }}>
                Total bloque: {(activeGrid.config.rows || 1) * (activeGrid.config.cols || 1)} paneles
              </Typography>
            </Box>
          </Stack>
        ) : innerTab === 2 ? (
          /* PESTAÑA 2: MONTAJE (antes era 1) */
          <Stack spacing={2} alignItems="center">
            {/* --- SECCIÓN DE MATRIZ (FILAS x COLUMNAS) --- */}
            <Divider sx={{ width: '100%', my: 1, fontSize: '0.6rem', color: '#999' }}>ESTRUCTURA MATRIZ</Divider>

            <Stack direction="row" spacing={1} width="100%">
              <TextField
                label="Filas"
                size="small"
                variant="outlined"
                type="number"
                fullWidth
                value={activeGrid.config.rows || 1}
                onChange={(e) => updateGrid(activeGridId, {
                  config: { rows: Math.max(1, parseInt(e.target.value) || 1) }
                })}
                inputProps={{ style: { fontSize: '0.8rem', padding: '8px' } }}
              />
              <TextField
                label="Cols"
                size="small"
                variant="outlined"
                type="number"
                fullWidth
                value={activeGrid.config.cols || 1}
                onChange={(e) => updateGrid(activeGridId, {
                  config: { cols: Math.max(1, parseInt(e.target.value) || 1) }
                })}
                inputProps={{ style: { fontSize: '0.8rem', padding: '8px' } }}
              />
            </Stack>

            <Box sx={{ width: '100%', bgcolor: '#fcfcfc', p: 1, borderRadius: 2, border: '1px solid #f0f0f0', textAlign: 'center' }}>
              <AzimutPreview rotation={activeGrid.rotation} />
              <Typography variant="caption" display="block" fontWeight={700} sx={{ mt: 0.5 }}>
                Azim: {Math.round(activeGrid.rotation)}°
              </Typography>
              <Slider
                size="small"
                value={activeGrid.rotation}
                min={-180} max={180}
                onChange={(_, v) => updateGrid(activeGridId, { rotation: v })}
                sx={{ width: '90%' }}
              />
            </Box>

            <Stack spacing={0.5} width="100%">
              {['coplanar', 'libre', 'doble'].map((tipo) => (
                <Button
                  key={tipo}
                  size="small"
                  variant={activeGrid.config.tipoEstructura === tipo ? "contained" : "outlined"}
                  sx={{ fontSize: '0.7rem', py: 0.4, width: '100%', textTransform: 'capitalize' }}
                  onClick={() => {
                    let updates = { tipoEstructura: tipo };
                    if (tipo === 'coplanar') updates.tilt = activeGrid.config.slope;
                    if (tipo === 'doble') updates.slope = 0;
                    updateGrid(activeGridId, { config: updates });
                  }}
                >
                  {tipo}
                </Button>
              ))}
            </Stack>

            <Box sx={{ width: '100%', bgcolor: '#fffdf9', p: 1, borderRadius: 2, border: '1px solid #fff5e6', textAlign: 'center' }}>
              <Box sx={{ transform: 'scale(0.85)', height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AnglePreview tilt={activeGrid.config.tilt} slope={activeGrid.config.slope} isDouble={activeGrid.config.tipoEstructura === 'doble'} />
              </Box>
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" display="block" fontWeight={700} sx={{ color: '#555', fontSize: '0.65rem' }}>
                  Inc: {activeGrid.config.tilt}°
                </Typography>
                <Slider
                  size="small"
                  value={activeGrid.config.tilt}
                  min={0} max={90}
                  disabled={activeGrid.config.tipoEstructura === 'coplanar'}
                  onChange={(_, v) => {
                    const val = activeGrid.config.tipoEstructura === 'libre' ? Math.max(v, activeGrid.config.slope) : v;
                    updateGrid(activeGridId, { config: { tilt: val } });
                  }}
                />
              </Box>
              <Box sx={{ mt: -0.5 }}>
                <Typography variant="caption" display="block" fontWeight={700} color="orange" sx={{ fontSize: '0.65rem' }}>
                  Suelo: {activeGrid.config.slope}°
                </Typography>
                <Slider
                  size="small"
                  value={activeGrid.config.slope}
                  min={0} max={90}
                  sx={{ color: 'orange' }}
                  disabled={activeGrid.config.tipoEstructura === 'doble'}
                  onChange={(_, v) => {
                    let updates = { slope: v };
                    if (activeGrid.config.tipoEstructura === 'coplanar') { updates.tilt = v; }
                    else if (activeGrid.config.tipoEstructura === 'libre') { if (v > activeGrid.config.tilt) updates.tilt = v; }
                    updateGrid(activeGridId, { config: updates });
                  }}
                />
              </Box>
            </Box>

            {/* EL ShadowIcon ya no está aquí, se movió a la pestaña 0 */}
          </Stack>
        ) : (
          /* PESTAÑA 3: CONFIGURACIÓN DE INVERSOR (antes era 2) */
          <Stack spacing={2}>
            <Box sx={{
              width: '100%',
              bgcolor: '#f1f3f9',
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #d0d7de'
            }}>
              <TextField
                label="Modelo Inversor"
                size="small"
                variant="standard"
                fullWidth
                value={activeGrid.config.inverterModel || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { inverterModel: e.target.value } })}
                sx={{ mb: 1.5 }}
              />
              <TextField
                label="Potencia Nominal (W)"
                size="small"
                variant="standard"
                fullWidth
                type="number"
                value={activeGrid.config.inverterPower || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { inverterPower: parseFloat(e.target.value) || 0 } })}
              />
            </Box>

            <Box sx={{ width: '100%', p: 0.5 }}>
              <TextField
                label="Cantidad de MPPT"
                size="small"
                variant="outlined"
                type="number"
                fullWidth
                value={activeGrid.config.mpptCount || 1}
                onChange={(e) => updateGrid(activeGridId, {
                  config: { mpptCount: Math.max(1, parseInt(e.target.value) || 1) }
                })}
                inputProps={{ style: { fontSize: '0.8rem', padding: '8px' } }}
                sx={{ mb: 1.5 }}
              />

              <Divider sx={{ width: '100%', my: 1, fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>LÍMITES ELÉCTRICOS MPPT</Divider>

              <TextField
                label="Tensión Máx Admisible Vmax (V)"
                size="small" variant="outlined" type="number" fullWidth
                value={activeGrid.config.vMax || ''}
                onChange={(e) => updateGrid(activeGridId, { config: { vMax: parseFloat(e.target.value) || 0 } })}
                inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                sx={{ mb: 1 }}
              />

              <Stack direction="row" spacing={1} width="100%" sx={{ mb: 1.5 }}>
                <TextField
                  label="Vmin MPPT (V)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.vMinMppt || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { vMinMppt: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
                <TextField
                  label="Vmax MPPT (V)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.vMaxMppt || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { vMaxMppt: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
              </Stack>

              <Stack direction="row" spacing={1} width="100%">
                <TextField
                  label="Imax Entrada (A)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.iMaxInverter || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { iMaxInverter: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
                <TextField
                  label="Isc Máx Invs (A)" size="small" variant="outlined" type="number" fullWidth
                  value={activeGrid.config.iScMaxInverter || ''}
                  onChange={(e) => updateGrid(activeGridId, { config: { iScMaxInverter: parseFloat(e.target.value) || 0 } })}
                  inputProps={{ style: { fontSize: '0.75rem', padding: '6px' } }}
                />
              </Stack>
            </Box>
          </Stack>
        )}
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
          {activeGrid && <ShadowProfileChart nivelSombra16={activeGrid.sombras} setNivelSombra16={(n) => updateGrid(activeGridId, { sombras: n })} />}
        </Box>
      </Dialog>
    </Box>
  );
};

export default App;

