import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  IconButton, Box, TextField, Stack, Typography, Paper,
  Dialog, DialogTitle, Divider, Slider, Tooltip, Fab, Button, GlobalStyles,
  Collapse, ListItemButton, ListItemText, FormControl, Select
} from "@mui/material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
  StayCurrentPortrait as PortraitIcon,
  StayCurrentLandscape as LandscapeIcon,
  Contrast as ShadowIcon,
  Close as CloseIcon,
  GridOn as PanelIcon,
  SettingsInputComponent as MountIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import ShadowProfileChart from "./ShadowProfileChart";



// --- RECURSOS VISUALES ---
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

// --- COMPONENTES AUXILIARES ---
const MapAutoCenter = ({ activeGrid, shouldAutoCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (shouldAutoCenter && activeGrid?.baseLatLng) {
      map.flyTo(activeGrid.baseLatLng, Math.max(map.getZoom(), 18), { duration: 0.8 });
    }
  }, [activeGrid?.id, shouldAutoCenter, map]);
  return null;
};

// Preview de Azimut compacto
const AzimutPreviewCompact = React.memo(({ rotation }) => {
  const size = 50; const cx = size / 2; const cy = size / 2; const r = 15;
  return (
    <Box sx={{ width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2" />
        <text x={cx} y={cy - r - 2} fontSize="4" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontWeight="900">N</text>
        <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cx + r} stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${cx - 3} ${cy + r - 4} L ${cx} ${cy + r} L ${cx + 3} ${cy + r - 4} Z`} fill="#4fc3f7" />
          <circle cx={cx} cy={cy} r="2" fill="#333" />
        </g>
      </svg>
    </Box>
  );
});

// Preview de ángulos compacto
const AnglePreviewCompact = React.memo(({ tilt, slope, isDouble }) => {
  const sizeW = 50; const sizeH = 60; const cx = 25; const baseY = 40; const panelLen = 16;
  const tRad = (tilt * Math.PI) / 180;
  const sRad = (slope * Math.PI) / 180;
  const peakY = baseY - (panelLen * Math.sin(tRad));
  const dx = panelLen * Math.cos(tRad);
  const footLX = cx - dx; const footRX = cx + dx;
  const tx = cx + panelLen * Math.cos(-tRad);
  const ty = baseY + panelLen * Math.sin(-tRad);
  const sx1 = cx + 20 * Math.cos(-sRad); const sy1 = baseY + 20 * Math.sin(-sRad);
  const sx2 = cx - 20 * Math.cos(-sRad); const sy2 = baseY - 20 * Math.sin(-sRad);

  return (
    <Box sx={{ width: sizeW, height: sizeH, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
      <svg width={sizeW} height={sizeH} viewBox={`0 0 ${sizeW} ${sizeH}`}>
        <path d={`M ${cx + panelLen} ${baseY} A ${panelLen} ${panelLen} 0 0 0 ${cx - panelLen} ${baseY}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="2,2" />
        <line x1="2" y1={baseY} x2={sizeW - 2} y2={baseY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {isDouble ? (
          <>
            <line x1={footLX} y1={baseY} x2={cx} y2={peakY} stroke="#4fc3f7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <line x1={footRX} y1={baseY} x2={cx} y2={peakY} stroke="#1a677e" strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy={peakY} r="2" fill="#4fc3f7" />
          </>
        ) : (
          <>
            <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
            <line x1={cx} y1={baseY} x2={tx} y2={ty} stroke="#4fc3f7" strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy={baseY} r="2" fill="#333" />
          </>
        )}
      </svg>
    </Box>
  );
});

class FreeGridManager {
  constructor(map, onUpdate, onSelect, onDoubleClick, onGridSelect) {
    this.map = map;
    this.onUpdate = onUpdate;
    this.onSelect = onSelect;
    this.onDoubleClick = onDoubleClick;
    this.onGridSelect = onGridSelect;
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
        fillColor: active ? "#031530" : (isActive ? "rgba(255,255,255,0.1)" : "transparent"),
        fillOpacity: active ? 0.6 : 0.2,
        interactive: true,
        className: isActive ? 'editable-cell' : 'non-interactive-cell',
        customCellId: id,
        customGridId: grid.id
      }).addTo(this.gridLayer);

      const cellLatLng = this.map.layerPointToLatLng(cp);

      cell.on('dblclick', () => {
        this.onSelect(grid.id);
        this.onGridSelect(grid.id);
        this.onDoubleClick();
      });

      cell.on('click', () => {
        this.onSelect(grid.id);
        this.onGridSelect(grid.id);
      });

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

    // --- MARCADOR DE INFORMACIÓN (SOLO CÍRCULO CON NÚMERO, SIN INTERACCIÓN) ---
// --- MARCADOR DE INFORMACIÓN (CÍRCULO CON NÚMERO Y NOMBRE DENTRO) ---
const bloquesPintados = (grid.paneles?.length || 0);
const panelesPorBloque = (grid.config.rows || 1) * (grid.config.cols || 1);
const totalPaneles = bloquesPintados * panelesPorBloque;
const nombreGrupo = grid.nombre || "G";

// Icono del círculo con número y nombre dentro - SIN INTERACCIÓN
const infoIcon = L.divIcon({
  className: 'info-marker-icon',
  html: `
    <div style="
      background-color: #ff9800;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      font-family: 'Roboto', 'Helvetica', sans-serif;
      pointer-events: none;
      user-select: none;
      line-height: 1;
      padding: 2px 0;
    ">
      <!-- NOMBRE DEL GRUPO (arriba dentro del círculo) -->
      <span style="
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        opacity: 0.9;
        margin-bottom: 1px;
        line-height: 1;
      ">${nombreGrupo}</span>
      
      <!-- NÚMERO (abajo dentro del círculo) -->
      <span style="
        font-size: 13px;
        font-weight: 800;
        line-height: 1;
      ">${totalPaneles}</span>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Marcador NO interactivo
L.marker(grid.baseLatLng, {
  icon: infoIcon,
  interactive: false,
  zIndexOffset: 1000,
  keyboard: false
}).addTo(this.gridLayer);

  }


}

const App = () => {
  const [grids, setGrids] = useState([]);
  const [activeGridId, setActiveGridId] = useState(null);
  const [shadowModalOpen, setShadowModalOpen] = useState(false);
  const [shouldAutoCenter, setShouldAutoCenter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isMapInteraction, setIsMapInteraction] = useState(false);

  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const needsAutoCenter = useRef(false);
  const isSavingInternal = useRef(false);
  const mapRef = useRef(null);
  const gridManagerRef = useRef(null);

  const activeGrid = useMemo(() => grids.find(g => g.id === activeGridId), [grids, activeGridId]);

  const openConfigPanel = useCallback(() => { }, []);

  const toggleMenuOpen = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  const toggleGroupExpand = useCallback((groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  const handleGridSelectFromMap = useCallback((gridId) => {
    if (isMapInteraction) return;
    setIsMapInteraction(true);

    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      setIsMapInteraction(false);
      return;
    }

    setActiveGridId(gridId);
    setExpandedGroups(prev => ({ ...prev, [gridId]: true }));

    if (mapRef.current && grid.baseLatLng) {
      mapRef.current.flyTo(grid.baseLatLng, Math.max(mapRef.current.getZoom(), 18), { duration: 0.8 });
    }

    setTimeout(() => setIsMapInteraction(false), 100);
  }, [grids, isMapInteraction]);

  const handleGridSelectFromMenu = useCallback((gridId, event) => {
    if (event) event.stopPropagation();
    if (isMapInteraction) return;

    setIsMapInteraction(true);

    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      setIsMapInteraction(false);
      return;
    }

    setActiveGridId(gridId);
    setExpandedGroups(prev => ({ ...prev, [gridId]: true }));

    if (mapRef.current && grid.baseLatLng) {
      mapRef.current.flyTo(grid.baseLatLng, Math.max(mapRef.current.getZoom(), 18), { duration: 0.8 });
    }

    setTimeout(() => setIsMapInteraction(false), 100);
  }, [grids, isMapInteraction]);

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
              if (typeof v === "string" && (v.startsWith("{") || v.startsWith("["))) {
                try {
                  v = JSON.parse(v.replace(/'/g, '"'));
                } catch (e) {
                  console.warn("Error parseando:", h, v);
                }
              }
              row[h] = v;
            });

            const lat = parseFloat(row.lat);
            const lng = parseFloat(row.lng);
            const validLat = Number.isFinite(lat) ? lat : 40.4167;
            const validLng = Number.isFinite(lng) ? lng : -3.70325;

            return {
              id: row.id || Date.now(),
              nombre: row.nombre || "G1",
              rotation: Number.isFinite(parseFloat(row.rotation)) ? parseFloat(row.rotation) : 0,
              baseLatLng: { lat: validLat, lng: validLng },
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
                FVcost: Number.isFinite(parseFloat(row.FVcost)) ? parseFloat(row.FVcost) : 0
              },
              paneles: Array.isArray(row.paneles) ? row.paneles : [],
              sombras: Array.isArray(row.sombras) ? row.sombras : Array(16).fill(1)
            };
          })
          .filter(g => g.baseLatLng && Number.isFinite(g.baseLatLng.lat) && Number.isFinite(g.baseLatLng.lng));

        const dataStr = JSON.stringify(data);
        if (dataStr !== lastSavedSnapshot) {
          setGrids(data);
          setLastSavedSnapshot(dataStr);
          if (forceCenter && !isSavingInternal.current && data.length > 0) {
            setShouldAutoCenter(true);
            needsAutoCenter.current = true;
            if (data.length > 0) {
              setExpandedGroups(prev => ({ ...prev, [data[0].id]: true }));
            }
          }
        }
      }
    } catch (e) {
      console.error("Error sincronizando sesión:", e);
    }
  }, [lastSavedSnapshot]);

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
        mapRef.current.flyTo(firstGrid.baseLatLng, 18, { duration: 0.8 });
        setActiveGridId(firstGrid.id);
        setExpandedGroups(prev => ({ ...prev, [firstGrid.id]: true }));
        needsAutoCenter.current = false;
        setTimeout(() => setShouldAutoCenter(false), 100);
      }
    }
  }, [grids]);

  const hasPendingChanges = useMemo(() => lastSavedSnapshot !== JSON.stringify(grids), [grids, lastSavedSnapshot]);

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
        const latRef = grid.baseLatLng.lat;
        const lngRef = grid.baseLatLng.lng;
        const latRad = latRef * (Math.PI / 180);
        const R = 6378137.0;
        const pH_projected = panelH * Math.cos(tiltRad);
        const tipo = grid.config.tipoEstructura || 'coplanar';

        return grid.paneles.map((panelId) => {
          const [r, c] = panelId.split(',').map(Number);
          let vStep = 0;

          if (tipo === 'libre') {
            const k = 1 / Math.tan(Math.max(5, 90 - Math.abs(latRef) - 23.44) * Math.PI / 180);
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
            const lng = lngRef + (xR / (R * Math.cos(latRad))) * (180 / Math.PI);
            const lat = latRef - (yR / R) * (180 / Math.PI);
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
        "width", "height", "tilt", "slope",
        "orientation", "modelo", "potenciaW",
        "rows", "cols",
        "FVcost",
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
        g.config?.FVcost || 0,
        JSON.stringify(g.paneles || []).replace(/"/g, "'"),
        JSON.stringify(g.sombras || []).replace(/"/g, "'"),
        geoJsonString
      ]);

      currentData["Diseño_FV"] = [headers, ...rowsData];
      sessionStorage.setItem("excelData", JSON.stringify(currentData));
      setLastSavedSnapshot(JSON.stringify(grids));
      window.dispatchEvent(new Event("sessionStorageUpdate"));
    } catch (error) {
      console.error("Error al guardar en sesión:", error);
    } finally {
      setTimeout(() => { isSavingInternal.current = false; }, 50);
    }
  }, [grids]);

  const handleAddNew = useCallback(() => {
    if (!mapRef.current) return;
    const id = Date.now();
    const n = {
      id,
      nombre: `G${grids.length + 1}`,
      baseLatLng: mapRef.current.getCenter(),
      rotation: 0,
      config: {
        modelo: "JKM540M-72HL4-V",
        potenciaW: 540,
        width: 1.134,
        height: 2.278,
        tipoEstructura: "coplanar",
        tilt: 30,
        slope: 0,
        orientation: "vertical",
        rows: 1,
        cols: 1,
        FVcost: 1000
      },
      paneles: ["0,0"],
      sombras: Array(16).fill(1)
    };
    setGrids(prev => [n, ...prev]);
    setActiveGridId(id);
    setExpandedGroups(prev => ({ ...prev, [id]: true }));
    setShouldAutoCenter(false);
    needsAutoCenter.current = false;
    if (mapRef.current && n.baseLatLng) {
      mapRef.current.flyTo(n.baseLatLng, 22, { duration: 0.8 });
    }
  }, [grids]);

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
    setExpandedGroups(prev => ({ ...prev, [id]: true }));
    setShouldAutoCenter(false);
    needsAutoCenter.current = false;
    if (mapRef.current && clonedGrid.baseLatLng) {
      mapRef.current.flyTo(clonedGrid.baseLatLng, 18, { duration: 0.8 });
    }
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

  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative", overflow: 'hidden' }}>
      <GlobalStyles styles={{
        '.leaflet-container': {
          touchAction: 'none !important',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        },
        '.leaflet-pane': {
          touchAction: 'none !important',
        },
        'path.leaflet-interactive': {
          touchAction: 'none !important',
          cursor: 'pointer',
        }
      }} />

      <Box sx={{
        position: 'fixed',
        top: 100,
        left: 0,
        zIndex: 1200,
        width: menuOpen ? 180 : 40,
        height: 'calc(100vh - 100px)',
        backgroundColor: 'rgba(13, 20, 69, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          minHeight: 40,
          bgcolor: 'rgba(26, 35, 126, 0.5)',
        }}>
          {menuOpen ? (
            <>
              <Typography sx={{ color: '#4fc3f7', fontSize: '0.85rem', fontWeight: 900 }}>
                ☀️ FV Control
              </Typography>
              <IconButton size="small" onClick={toggleMenuOpen} sx={{ color: '#4fc3f7' }}>
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </>
          ) : (
            <IconButton size="small" onClick={toggleMenuOpen} sx={{ color: '#4fc3f7', mx: 'auto' }}>
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>

        {menuOpen && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {/* Estilos comunes para TextFields */}
            {(() => {
              const textFieldStyles = {
                mb: 0.5,
                '& .MuiInput-root': {
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.9)',
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: 'rgba(255,255,255,0.3)',
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.85rem', // <-- Labels más grandes
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#ff9800',
                  },
                  '&.MuiInputLabel-shrink': {
                    fontSize: '0.85rem', // Mantiene el tamaño al flotar
                  }
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'rgba(255,255,255,0.15)'
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#ff9800'
                },
              };
              return null;
            })()}

            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 1,
              p: 1,
              mb: 1,
              textAlign: 'center'
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                {stats.panels}p | {(stats.power / 1000).toFixed(2)} kWp
              </Typography>
            </Box>

            <Button
              size="small"
              fullWidth
              onClick={handleAddNew}
              sx={{
                bgcolor: '#ff9800',
                color: 'white',
                fontSize: '0.75rem',
                py: 0.5,
                mb: 1,
                '&:hover': { bgcolor: '#f57c00' }
              }}
            >
              <AddIcon sx={{ fontSize: 16, mr: 0.5 }} /> Nuevo
            </Button>

            <Box sx={{ mt: 1 }}>
              {grids.map((g) => {
                const isSelected = g.id === activeGridId;
                const isExpanded = expandedGroups[g.id] || false;
                const bloquesPintados = g.paneles?.length || 0;
                const panelesPorBloque = (g.config.rows || 1) * (g.config.cols || 1);
                const totalPanelesReal = bloquesPintados * panelesPorBloque;
                const pwr = ((totalPanelesReal * (g.config.potenciaW || 0)) / 1000).toFixed(1);

                return (
                  <Box key={g.id} sx={{ mb: 0.5 }}>
                    {/* NIVEL 1: ITEM PRINCIPAL DEL GRUPO */}
                    <ListItemButton
                      onClick={(e) => handleGridSelectFromMenu(g.id, e)}
                      sx={{
                        borderRadius: 1,
                        p: '4px 8px',
                        bgcolor: isSelected ? 'rgba(255, 165, 0, 0.25)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1px solid rgba(255, 165, 0, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                        minHeight: 32,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: isSelected ? 900 : 600 }}>
                              {g.nombre}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                              {totalPanelesReal}p
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>
                            {pwr} kWp
                          </Typography>
                        }
                        sx={{ m: 0, '& .MuiListItemText-primary': { m: 0 }, '& .MuiListItemText-secondary': { m: 0 } }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupExpand(g.id);
                        }}
                        sx={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.5)', p: 0.5 }}
                      >
                        {isExpanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </ListItemButton>

                    {/* NIVEL 2: CONFIGURACIÓN EXPANDIDA SIN TABS */}
                    <Collapse in={isExpanded && isSelected} timeout="auto" unmountOnExit>
                      <Box sx={{
                        ml: 1,
                        pl: 1,
                        borderLeft: '2px solid rgba(255, 165, 0, 0.3)',
                        py: 1,
                        borderRadius: '0 4px 4px 0',
                      }}>
                        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
                        <Box sx={{
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: 1,
                          p: 1,
                          mb: 1,
                        }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem', mb: 0.5, letterSpacing: 1 }}>
                            ─ INFORMACIÓN ─
                          </Typography>
                          <TextField
                            label="Nombre"
                            size="small"
                            variant="standard"
                            fullWidth
                            value={activeGrid?.nombre || ''}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (newValue.length <= 3) {
                                updateGrid(activeGridId, { nombre: newValue });
                              }
                            }}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <TextField
                            label="Coste (EUR)"
                            size="small"
                            variant="standard"
                            fullWidth
                            type="number"
                            value={activeGrid?.config.FVcost || ''}
                            onChange={(e) => updateGrid(activeGridId, { config: { FVcost: parseFloat(e.target.value) || 0 } })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <Button
                            size="small"
                            onClick={() => setShadowModalOpen(true)}
                            fullWidth
                            sx={{
                              fontSize: '0.6rem',
                              color: 'rgba(255,255,255,0.7)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              py: 0.3,
                              '&:hover': { borderColor: '#ff9800', color: '#fff' }
                            }}
                          >
                            <ShadowIcon sx={{ fontSize: 14, mr: 0.5 }} /> Configurar Sombras
                          </Button>
                        </Box>

                        {/* SECCIÓN 2: PANEL */}
                        <Box sx={{
                          bgcolor: 'rgba(79, 195, 247, 0.05)',
                          borderRadius: 1,
                          p: 1,
                          mb: 1,
                        }}>
                          <Typography sx={{ color: 'rgba(79, 195, 247, 0.4)', fontSize: '0.55rem', mb: 0.5, letterSpacing: 1 }}>
                            ─ PANEL ─
                          </Typography>
                          <TextField
                            label="Modelo"
                            size="small"
                            variant="standard"
                            fullWidth
                            value={activeGrid?.config.modelo || ''}
                            onChange={(e) => updateGrid(activeGridId, { config: { modelo: e.target.value } })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <TextField
                            label="Potencia (Wp)"
                            size="small"
                            variant="standard"
                            fullWidth
                            type="number"
                            value={activeGrid?.config.potenciaW || ''}
                            onChange={(e) => updateGrid(activeGridId, { config: { potenciaW: parseFloat(e.target.value) || 0 } })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />

                          {/* CONMUTADOR DE ORIENTACIÓN - Un solo botón que alterna */}
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                            <Button
                              size="small"
                              onClick={() => updateGrid(activeGridId, {
                                config: { orientation: activeGrid?.config.orientation === 'vertical' ? 'horizontal' : 'vertical' }
                              })}
                              sx={{
                                fontSize: '0.6rem',
                                py: 0.3,
                                px: 2,
                                color: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                bgcolor: 'rgba(79,195,247,0.1)',
                                borderRadius: 2,
                                minWidth: 120,
                                '&:hover': {
                                  bgcolor: 'rgba(79,195,247,0.2)',
                                  borderColor: '#4fc3f7'
                                }
                              }}
                            >
                              {activeGrid?.config.orientation === 'vertical' ? (
                                <><PortraitIcon sx={{ fontSize: 14, mr: 0.5 }} /> Vertical</>
                              ) : (
                                <><LandscapeIcon sx={{ fontSize: 14, mr: 0.5 }} /> Horizontal</>
                              )}
                            </Button>
                          </Box>

                          <TextField
                            label="Alto (m)"
                            size="small"
                            variant="standard"
                            fullWidth
                            type="number"
                            value={activeGrid?.config.height || 0}
                            onChange={(e) => updateGrid(activeGridId, { config: { height: parseFloat(e.target.value) || 0 } })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <TextField
                            label="Ancho (m)"
                            size="small"
                            variant="standard"
                            fullWidth
                            type="number"
                            value={activeGrid?.config.width || 0}
                            onChange={(e) => updateGrid(activeGridId, { config: { width: parseFloat(e.target.value) || 0 } })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <TextField
                            label="Filas"
                            size="small"
                            variant="standard"
                            fullWidth
                            type="number"
                            value={activeGrid?.config.rows || 1}
                            onChange={(e) => updateGrid(activeGridId, {
                              config: { rows: Math.max(1, parseInt(e.target.value) || 1) }
                            })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <TextField
                            label="Columnas"
                            size="small"
                            variant="standard"
                            fullWidth
                            type="number"
                            value={activeGrid?.config.cols || 1}
                            onChange={(e) => updateGrid(activeGridId, {
                              config: { cols: Math.max(1, parseInt(e.target.value) || 1) }
                            })}
                            sx={{
                              mb: 0.5,
                              '& .MuiInput-root': { fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' },
                              '& .MuiInputLabel-root': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
                              '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.15)' },
                              '& .MuiInput-underline:after': { borderBottomColor: '#ff9800' },
                            }}
                          />
                          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textAlign: 'center' }}>
                            Total: {(activeGrid?.config.rows || 1) * (activeGrid?.config.cols || 1)} paneles/bloque
                          </Typography>
                        </Box>

                        {/* SECCIÓN 3: ESTRUCTURA */}
                        <Box sx={{
                          bgcolor: 'rgba(255, 152, 0, 0.05)',
                          borderRadius: 1,
                          p: 1,
                          mb: 1,
                        }}>
                          <Typography sx={{ color: 'rgba(255, 152, 0, 0.4)', fontSize: '0.55rem', mb: 0.5, letterSpacing: 1 }}>
                            ─ ESTRUCTURA ─
                          </Typography>

                          {/* SELECTOR DE TIPO DE ESTRUCTURA - Menú desplegable */}
                          <Box sx={{ mb: 1 }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.5rem', mb: 0.3 }}>
                              Tipo de estructura
                            </Typography>
                            <FormControl fullWidth size="small" variant="outlined">
                              <Select
                                value={activeGrid?.config.tipoEstructura || 'coplanar'}
                                onChange={(e) => {
                                  const tipo = e.target.value;
                                  let updates = { tipoEstructura: tipo };
                                  if (tipo === 'coplanar') updates.tilt = activeGrid?.config.slope || 0;
                                  if (tipo === 'doble') updates.slope = 0;
                                  updateGrid(activeGridId, { config: updates });
                                }}
                                sx={{
                                  color: 'rgba(255,255,255,0.9)',
                                  fontSize: '0.6rem',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255,255,255,0.15)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff9800',
                                  },
                                  '& .MuiSvgIcon-root': {
                                    color: 'rgba(255,255,255,0.5)',
                                  }
                                }}
                              >
                                <MenuItem value="coplanar" sx={{ fontSize: '0.6rem' }}>Coplanar</MenuItem>
                                <MenuItem value="libre" sx={{ fontSize: '0.6rem' }}>Libre</MenuItem>
                                <MenuItem value="doble" sx={{ fontSize: '0.6rem' }}>Doble eje</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>

                          {/* Azimut - Gráfico centrado y más grande */}
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'rgba(0,0,0,0.2)',
                              borderRadius: 1,
                              p: 1,
                            }}>
                              <Box sx={{
                                transform: 'scale(2)',
                                transformOrigin: 'center center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                              }}>
                                <AzimutPreviewCompact rotation={activeGrid?.rotation || 0} />
                              </Box>
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 600 }}>
                                Azimut: {Math.round(activeGrid?.rotation || 0)}°
                              </Typography>
                            </Box>
                            <Slider
                              size="small"
                              value={activeGrid?.rotation || 0}
                              min={-180} max={180}
                              onChange={(_, v) => updateGrid(activeGridId, { rotation: v })}
                              sx={{
                                color: '#4fc3f7',
                                height: 4,
                                mt: 0.5,
                                '& .MuiSlider-thumb': { width: 14, height: 14 }
                              }}
                            />
                          </Box>

                          {/* Ángulos - Gráfico centrado y más grande */}
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: 1,
                            p: 1,
                            mb: 1,
                          }}>
                            <Box sx={{
                              transform: 'scale(2.0)',
                              transformOrigin: 'center center',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                            }}>
                              <AnglePreviewCompact
                                tilt={activeGrid?.config.tilt || 0}
                                slope={activeGrid?.config.slope || 0}
                                isDouble={activeGrid?.config.tipoEstructura === 'doble'}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%' }}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>
                                Inc: {activeGrid?.config.tilt || 0}°
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>
                                Suelo: {activeGrid?.config.slope || 0}°
                              </Typography>
                            </Box>
                          </Box>

                          {/* Inclinación */}
                          <Box sx={{ mb: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem' }}>
                                Inclinación
                              </Typography>
                              <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 600 }}>
                                {activeGrid?.config.tilt || 0}°
                              </Typography>
                            </Box>
                            <Slider
                              size="small"
                              value={activeGrid?.config.tilt || 0}
                              min={0} max={90}
                              disabled={activeGrid?.config.tipoEstructura === 'coplanar'}
                              onChange={(_, v) => {
                                const val = activeGrid?.config.tipoEstructura === 'libre' ? Math.max(v, activeGrid?.config.slope || 0) : v;
                                updateGrid(activeGridId, { config: { tilt: val } });
                              }}
                              sx={{
                                color: '#4fc3f7',
                                height: 4,
                                '& .MuiSlider-thumb': { width: 14, height: 14 }
                              }}
                            />
                          </Box>

                          {/* Suelo */}
                          <Box sx={{ mb: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem' }}>
                                Pendiente suelo
                              </Typography>
                              <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 600 }}>
                                {activeGrid?.config.slope || 0}°
                              </Typography>
                            </Box>
                            <Slider
                              size="small"
                              value={activeGrid?.config.slope || 0}
                              min={0} max={90}
                              disabled={activeGrid?.config.tipoEstructura === 'doble'}
                              onChange={(_, v) => {
                                let updates = { slope: v };
                                if (activeGrid?.config.tipoEstructura === 'coplanar') { updates.tilt = v; }
                                else if (activeGrid?.config.tipoEstructura === 'libre') { if (v > activeGrid?.config.tilt) updates.tilt = v; }
                                updateGrid(activeGridId, { config: updates });
                              }}
                              sx={{
                                color: '#ff9800',
                                height: 4,
                                '& .MuiSlider-thumb': { width: 14, height: 14 }
                              }}
                            />
                          </Box>
                        </Box>

                        {/* ACCIONES */}
                        <Box sx={{
                          display: 'flex',
                          gap: 0.5,
                          mt: 0.5,
                          flexWrap: 'wrap',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          pt: 0.5,
                          justifyContent: 'center'
                        }}>
                          <Button
                            size="small"
                            onClick={() => handleCopy(activeGrid)}
                            sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', p: '2px 6px', minHeight: 20 }}
                          >
                            <CopyIcon sx={{ fontSize: 12, mr: 0.5 }} /> Copiar
                          </Button>
                          <Button
                            size="small"
                            onClick={exportToGeoJSON}
                            sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', p: '2px 6px', minHeight: 20 }}
                          >
                            <PanelIcon sx={{ fontSize: 12, mr: 0.5 }} /> GeoJSON
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setGrids(prev => prev.filter(x => x.id !== activeGrid?.id));
                              setActiveGridId(null);
                            }}
                            sx={{ fontSize: '0.55rem', color: '#ef5350', p: '2px 6px', minHeight: 20 }}
                          >
                            <DeleteIcon sx={{ fontSize: 12, mr: 0.5 }} /> Eliminar
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* BOTÓN GUARDAR */}
      <Box sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 99999,
        pointerEvents: "none",
        display: "flex",
        gap: 2,
        flexDirection: "column",
        alignItems: "flex-end"
      }}>
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
                width: 48,
                height: 48,
                "&:hover": { bgcolor: "#e65100" },
                animation: hasPendingChanges ? 'pulse-small 1.5s infinite' : 'none',
                boxShadow: 6
              }}
            >
              <SaveIcon sx={{ fontSize: 22 }} />
            </Fab>
          </Box>
        </Tooltip>
      </Box>

      {/* MAPA */}
      <MapContainer center={[40.41, -3.7]} zoom={18} zoomControl={false} style={{ height: "100%" }}
        whenReady={(e) => {
          mapRef.current = e.target;
          gridManagerRef.current = new FreeGridManager(
            e.target,
            (gid, cid, add) => {
              setGrids(prev => prev.map(g => {
                if (g.id !== gid) return g;
                const s = new Set(g.paneles);
                add ? s.add(cid) : s.delete(cid);
                return { ...g, paneles: Array.from(s) };
              }));
            },
            (id) => {
              setActiveGridId(id);
              setExpandedGroups(prev => ({ ...prev, [id]: true }));
            },
            openConfigPanel,
            handleGridSelectFromMap
          );
        }}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={22} />
        <MapAutoCenter activeGrid={activeGrid} shouldAutoCenter={shouldAutoCenter} />
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
          </>
        )}
      </MapContainer>

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