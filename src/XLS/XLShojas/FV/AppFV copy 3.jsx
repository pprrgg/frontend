import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  IconButton, Box, TextField, Stack, Typography, Paper,
  Accordion, AccordionSummary, AccordionDetails, Dialog,
  DialogTitle, Divider, Slider, Tab, Tabs, Tooltip, Badge, Fab, Button, Chip
} from "@mui/material";
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
  KeyboardArrowDown as DownIcon
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import ShadowProfileChart from "./ShadowProfileChart";

// --- RECURSOS VISUALES (SVG y Leaflet Icons) ---
const arrowWhiteSvg = `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>`;
const moveIcon = L.divIcon({ className: 'custom-drag-icon', html: `<div style="background-color: #ff9800; width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg></div>`, iconSize: [22, 22], iconAnchor: [11, 11] });
const rotateHandleIcon = L.divIcon({ className: 'custom-rotate-icon', html: `<div style="background-color: #2196f3; width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg></div>`, iconSize: [22, 22], iconAnchor: [11, 11] });

// --- COMPONENTES AUXILIARES ---
const MapAutoCenter = ({ activeGrid }) => {
  const map = useMap();
  useEffect(() => {
    if (activeGrid?.baseLatLng) {
      map.flyTo(activeGrid.baseLatLng, 22, { animate: true, duration: 1.2 });
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
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      if (this.map.dragging) this.map.dragging.enable();
    });
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
    const panelH = isV ? grid.config.height : grid.config.width;
    const panelW = isV ? grid.config.width : grid.config.height;
    const pW_px = this.metersToPx(panelW);
    const pH_px = this.metersToPx(panelH) * Math.cos(tiltRad);
    const panels = new Set(grid.paneles || []);
    const tipo = grid.config.tipoEstructura || 'coplanar';

    let minR = 0, maxR = 0, minC = 0, maxC = 0;
    if (panels.size > 0) {
      const coords = Array.from(panels).map(p => p.split(',').map(Number));
      minR = Math.min(...coords.map(c => c[0])) - 1;
      maxR = Math.max(...coords.map(c => c[0])) + 1;
      minC = Math.min(...coords.map(c => c[1])) - 1;
      maxC = Math.max(...coords.map(c => c[1])) + 1;
    } else {
      minR = -1; maxR = 1; minC = -1; maxC = 1;
    }

    for (let r = minR; r <= maxR; r++) {
      let arrowRad = rad;
      let verticalOffset = 0;
      if (tipo === 'doble') {
        if (Math.abs(r) % 2 !== 0) arrowRad = rad + Math.PI;
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

      for (let c = minC; c <= maxC; c++) {
        const id = `${r},${c}`;
        const active = panels.has(id);
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
          fillOpacity: active ? 0.8 : 0.2,
          interactive: true
        }).addTo(this.gridLayer);

        if (active) {
          L.marker(this.map.layerPointToLatLng(cp), {
            icon: L.divIcon({
              className: 'arrow',
              html: `<div style="transform: rotate(${arrowRad}rad)">${arrowWhiteSvg}</div>`,
              iconSize: [14, 14], iconAnchor: [7, 7]
            }),
            interactive: false
          }).addTo(this.gridLayer);
        }

        if (isActive) {
          cell.on('mousedown', (e) => {
            L.DomEvent.stopPropagation(e);
            this.map.dragging.disable();
            this.isDragging = true;
            this.paintMode = !active;
            this.onUpdate(grid.id, id, this.paintMode);
          });
          cell.on('mouseover', () => {
            if (this.isDragging) this.onUpdate(grid.id, id, this.paintMode);
          });
        } else {
          cell.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            this.onSelect(grid.id);
          });
        }
      }
    }
  }
}

const App = () => {
  const [grids, setGrids] = useState([]);
  const [activeGridId, setActiveGridId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(null);
  const [shadowModalOpen, setShadowModalOpen] = useState(false);
  const [innerTab, setInnerTab] = useState(0);
  const [menuVisible, setMenuVisible] = useState(true);

  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const needsAutoCenter = useRef(false);

  const mapRef = useRef(null);
  const gridManagerRef = useRef(null);

  const totals = useMemo(() => grids.reduce((acc, g) => {
    acc.panels += (g.paneles?.length || 0);
    acc.power += (g.paneles?.length || 0) * (g.config.potenciaW || 0);
    return acc;
  }, { panels: 0, power: 0 }), [grids]);

  const loadDataFromSession = useCallback((forceCenter = false) => {
    const raw = sessionStorage.getItem("excelData");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed["Diseño_FV"]?.length > 1) {
        const headers = parsed["Diseño_FV"][0];
        const data = parsed["Diseño_FV"].slice(1).map(r => {
          const obj = {};
          headers.forEach((h, i) => {
            let v = r[i];
            if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
              v = JSON.parse(v.replace(/'/g, '"'));
            }
            obj[h] = v;
          });
          return obj;
        });

        const dataStr = JSON.stringify(data);
        if (dataStr !== lastSavedSnapshot) {
          setGrids(data);
          setLastSavedSnapshot(dataStr);
          if (forceCenter) needsAutoCenter.current = true;
        }
      }
    } catch (e) { console.error("Error sincronizando sesión:", e); }
  }, [lastSavedSnapshot]);

  useEffect(() => {
    loadDataFromSession(true);
    const handleStorageChange = (e) => { if (e.key === "excelData") loadDataFromSession(true); };
    const handleLocalChange = () => loadDataFromSession(true);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("sessionStorageUpdate", handleLocalChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sessionStorageUpdate", handleLocalChange);
    };
  }, [loadDataFromSession]);

  useEffect(() => {
    if (mapRef.current && grids.length > 0 && needsAutoCenter.current) {
      const firstGrid = grids[0];
      if (firstGrid.baseLatLng) {
        mapRef.current.setView(firstGrid.baseLatLng, 22);
        setActiveGridId(firstGrid.id);
        setExpandedId(firstGrid.id);
        needsAutoCenter.current = false;
      }
    }
  }, [grids]);

  const hasPendingChanges = useMemo(() => {
    return lastSavedSnapshot !== JSON.stringify(grids);
  }, [grids, lastSavedSnapshot]);

  const handleSave = useCallback(() => {
    if (grids.length === 0) return;
    const current = JSON.parse(sessionStorage.getItem("excelData") || "{}");
    const headers = ["id", "name", "baseLatLng", "rotation", "config", "paneles", "sombras"];
    current["Diseño_FV"] = [headers, ...grids.map(g => [
      g.id, g.name, JSON.stringify(g.baseLatLng).replace(/"/g, "'"),
      g.rotation, JSON.stringify(g.config).replace(/"/g, "'"),
      JSON.stringify(g.paneles).replace(/"/g, "'"),
      JSON.stringify(g.sombras).replace(/"/g, "'")
    ])];
    sessionStorage.setItem("excelData", JSON.stringify(current));
    setLastSavedSnapshot(JSON.stringify(grids));
    window.dispatchEvent(new Event("sessionStorageUpdate"));
  }, [grids]);

  const handleAddNew = useCallback(() => {
    if (!mapRef.current) return;
    const id = Date.now();
    const n = {
      id, name: `Área ${grids.length + 1}`, baseLatLng: mapRef.current.getCenter(), rotation: 0,
      config: { width: 1.1, height: 1.9, tilt: 30, slope: 0, orientation: "vertical", potenciaW: 450, tipoEstructura: "coplanar" },
      paneles: ["0,0"], sombras: Array(16).fill(1)
    };
    setGrids(prev => [...prev, n]);
    setActiveGridId(id);
    setExpandedId(id);
    setMenuVisible(true);
  }, [grids]);

  useEffect(() => {
    if (gridManagerRef.current) gridManagerRef.current.render(grids, activeGridId);
  }, [grids, activeGridId]);

  const updateGrid = useCallback((id, fields) => setGrids(prev => prev.map(g => g.id === id ? { ...g, ...fields, config: { ...g.config, ...(fields.config || {}) } } : g)), []);

  const moveGrid = useCallback((index, direction) => {
    const newGrids = [...grids];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newGrids.length) return;
    [newGrids[index], newGrids[targetIndex]] = [newGrids[targetIndex], newGrids[index]];
    setGrids(newGrids);
  }, [grids]);

  const activeGrid = useMemo(() => grids.find(g => g.id === activeGridId), [grids, activeGridId]);

  const rotateHandlePos = useMemo(() => {
    if (!activeGrid || !mapRef.current) return null;
    const center = mapRef.current.latLngToLayerPoint(activeGrid.baseLatLng);
    const rad = (activeGrid.rotation * Math.PI) / 180;
    const p = L.point(center.x + 85 * Math.sin(-rad), center.y + 85 * Math.cos(-rad));
    return mapRef.current.layerPointToLatLng(p);
  }, [activeGrid]);

  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative", overflow: 'hidden' }}>

      {/* CABECERO FLOTANTE SUPERIOR */}



      {activeGrid && (
        <Chip
          label={`${activeGrid.name}: ${((activeGrid.paneles?.length || 0) * (activeGrid.config.potenciaW || 0) / 1000).toFixed(2)} kWp (${activeGrid.paneles?.length || 0}u)`}
          onDelete={() => {
            setGrids(prev => prev.filter(x => x.id !== activeGridId));
            setActiveGridId(null);
          }}
          deleteIcon={<DeleteIcon style={{ color: '#ff5252', fontSize: 18 }} />}
          sx={{
            position: 'fixed',
            top: 120,
            left: 130,
            transform: 'translateX(-50%)',
            zIndex: 1100,
            bgcolor: '#1a237e', // Azul oscuro sólido para máxima legibilidad
            color: 'white',
            fontWeight: 600,
            boxShadow: 3,
            '& .MuiChip-deleteIcon': {
              marginLeft: '8px',
              '&:hover': { color: '#ff1744' }
            }
          }}
        />
      )}


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
          </>
        )}
      </MapContainer>

      {/* MENU LATERAL (DESPLAZADO HACIA ABAJO SI HAY CABECERO) */}
      <Box sx={{
        position: "fixed", top: activeGrid ? 155 : 155, left: 30, width: 220, zIndex: 1000,
        transition: 'all 0.3s ease',
        transform: menuVisible ? 'translateX(0)' : 'translateX(-240px)'
      }}>
        <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #1a237e' }}>
          <Box
            sx={{
              p: 1.5,
              display: 'flex',
              flexDirection: 'row', // Cambiado de 'column' a 'row'
              alignItems: 'center',
              justifyContent: 'center', // Centra el conjunto en el Box
              bgcolor: '#1a237e',
              color: 'white',
              gap: 1.5 // Un poco más de espacio entre botón y texto
            }}
          >
            {/* El botón ahora está primero, por lo que aparece a la izquierda */}
            <IconButton
              size="small"
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => setMenuVisible(false)}
            >
              <CollapseIcon fontSize="small" />
            </IconButton>

            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="subtitle2" fontWeight={900}>
                {(totals.power / 1000).toFixed(2)} kWp
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                ({totals.panels} mod)
              </Typography>
            </Stack>
          </Box>

          {grids.length > 0 && (
            <Box sx={{ maxHeight: '70vh', overflowY: 'auto', bgcolor: 'white' }}>
              {grids.map((g, index) => {
                const isExpanded = expandedId === g.id;
                const isActive = activeGridId === g.id;
                const areaPwp = ((g.paneles?.length || 0) * (g.config.potenciaW || 0) / 1000).toFixed(2);
                return (
                  <Accordion key={g.id} expanded={isExpanded} sx={{ '&:before': { display: 'none' }, m: '0 !important', borderBottom: '1px solid #eee' }}>
                    <AccordionSummary
                      sx={{ px: 1, borderLeft: isActive ? '4px solid #1a237e' : '4px solid transparent', '& .MuiAccordionSummary-content': { alignItems: 'center', my: 1, overflow: 'hidden' } }}
                      onClick={() => { setActiveGridId(g.id); setExpandedId(isExpanded ? null : g.id); }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0.5 }}>
                        <Stack>
                          <IconButton size="small" disabled={index === 0} onClick={(e) => { e.stopPropagation(); moveGrid(index, -1); }} sx={{ p: 0, height: 14 }}><UpIcon sx={{ fontSize: 16 }} /></IconButton>
                          <IconButton size="small" disabled={index === grids.length - 1} onClick={(e) => { e.stopPropagation(); moveGrid(index, 1); }} sx={{ p: 0, height: 14 }}><DownIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Stack>

                        {isEditingName === g.id ? (
                          <TextField autoFocus size="small" variant="standard" value={g.name} onClick={(e) => e.stopPropagation()} onBlur={() => setIsEditingName(null)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(null)} onChange={(e) => updateGrid(g.id, { name: e.target.value })} sx={{ width: '50%' }} />
                        ) : (
                          <Box onDoubleClick={(e) => { e.stopPropagation(); setIsEditingName(g.id); }} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                            <Typography variant="caption" fontWeight={900} sx={{ display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', lineHeight: 1.1 }}>{g.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{areaPwp}kWp · {g.paneles?.length || 0}u.</Typography>
                          </Box>
                        )}

                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setGrids(prev => prev.filter(x => x.id !== g.id)); if (isActive) setActiveGridId(null); }}>
                          <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0, borderTop: '1px solid #eee' }}>
                      <Stack direction="row">
                        {/* Sidebar de pestañas */}
                        <Box sx={{ borderRight: 1, borderColor: 'divider', bgcolor: '#f9f9f9', width: 45 }}>
                          <Tabs
                            orientation="vertical"
                            value={innerTab}
                            onChange={(_, v) => setInnerTab(v)}
                            sx={{ minWidth: 45, '& .MuiTab-root': { minWidth: 45, py: 2 } }}
                          >
                            <Tab icon={<PanelIcon fontSize="small" />} />
                            <Tab icon={<MountIcon fontSize="small" />} />
                          </Tabs>
                        </Box>

                        {/* Contenedor de contenido */}
                        <Box sx={{ flexGrow: 1, p: 1.5, overflow: 'hidden' }}>
                          {innerTab === 0 ? (
                            /* PESTAÑA 1: PANEL */
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
                                  value={g.config.modelo || ''}
                                  onChange={(e) => updateGrid(g.id, { config: { modelo: e.target.value } })}
                                  sx={{ mb: 1.5 }}
                                />
                                <TextField
                                  label="Potencia (Wp)"
                                  size="small"
                                  variant="standard"
                                  fullWidth
                                  type="number"
                                  value={g.config.potenciaW}
                                  onChange={(e) => updateGrid(g.id, { config: { potenciaW: parseFloat(e.target.value) || 0 } })}
                                />
                              </Box>

                              <Box sx={{ width: '100%', p: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <IconButton
                                  onClick={() => updateGrid(g.id, {
                                    config: { orientation: g.config.orientation === 'vertical' ? 'horizontal' : 'vertical' }
                                  })}
                                  sx={{ border: '1px solid #ddd', bgcolor: '#fff', width: 40, height: 40 }}
                                >
                                  {g.config.orientation === 'vertical' ? <PortraitIcon fontSize="small" /> : <LandscapeIcon fontSize="small" />}
                                </IconButton>

                                <Stack direction="row" spacing={1.5} width="100%">
                                  <TextField
                                    label="H (m)"
                                    size="small"
                                    variant="standard"
                                    fullWidth
                                    type="number"
                                    value={g.config.height}
                                    onChange={(e) => updateGrid(g.id, { config: { height: parseFloat(e.target.value) || 0 } })}
                                  />
                                  <TextField
                                    label="W (m)"
                                    size="small"
                                    variant="standard"
                                    fullWidth
                                    type="number"
                                    value={g.config.width}
                                    onChange={(e) => updateGrid(g.id, { config: { width: parseFloat(e.target.value) || 0 } })}
                                  />
                                </Stack>
                              </Box>
                            </Stack>
                          ) : (
                            /* PESTAÑA 2: MONTAJE */
                            <Stack spacing={2} alignItems="center">

                              {/* GRUPO AZIMUT */}
                              <Box sx={{ width: '100%', bgcolor: '#fcfcfc', p: 1, borderRadius: 2, border: '1px solid #f0f0f0', textAlign: 'center' }}>
                                <AzimutPreview rotation={g.rotation} />
                                <Typography variant="caption" display="block" fontWeight={700} sx={{ mt: 0.5 }}>
                                  Azim: {Math.round(g.rotation)}°
                                </Typography>
                                <Slider
                                  size="small"
                                  value={g.rotation}
                                  min={-180} max={180}
                                  onChange={(_, v) => updateGrid(g.id, { rotation: v })}
                                  sx={{ width: '90%' }}
                                />
                              </Box>

                              {/* SELECTOR DE TIPO ESTRUCTURA (Vertical) */}
                              <Stack spacing={0.5} width="100%">
                                {['coplanar', 'libre', 'doble'].map((tipo) => (
                                  <Button
                                    key={tipo}
                                    size="small"
                                    variant={g.config.tipoEstructura === tipo ? "contained" : "outlined"}
                                    sx={{
                                      fontSize: '0.7rem',
                                      py: 0.4,
                                      width: '100%',
                                      textTransform: 'capitalize'
                                    }}
                                    onClick={() => {
                                      let updates = { tipoEstructura: tipo };
                                      if (tipo === 'coplanar') updates.tilt = g.config.slope;
                                      if (tipo === 'doble') updates.slope = 0;
                                      updateGrid(g.id, { config: updates });
                                    }}
                                  >
                                    {tipo}
                                  </Button>
                                ))}
                              </Stack>

                              {/* GRUPO INCLINACIÓN Y SUELO (Reducido de tamaño) */}
                              <Box sx={{ width: '100%', bgcolor: '#fffdf9', p: 1, borderRadius: 2, border: '1px solid #fff5e6', textAlign: 'center' }}>
                                {/* Contenedor pequeño para el AnglePreview */}
                                <Box sx={{ transform: 'scale(0.85)', height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                  <AnglePreview tilt={g.config.tilt} slope={g.config.slope} isDouble={g.config.tipoEstructura === 'doble'} />
                                </Box>

                                <Box sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" display="block" fontWeight={700} sx={{ color: '#555', fontSize: '0.65rem' }}>
                                    Inc: {g.config.tilt}°
                                  </Typography>
                                  <Slider
                                    size="small"
                                    value={g.config.tilt}
                                    min={0} max={90}
                                    disabled={g.config.tipoEstructura === 'coplanar'}
                                    onChange={(_, v) => {
                                      const val = g.config.tipoEstructura === 'libre' ? Math.max(v, g.config.slope) : v;
                                      updateGrid(g.id, { config: { tilt: val } });
                                    }}
                                  />
                                </Box>

                                <Box sx={{ mt: -0.5 }}>
                                  <Typography variant="caption" display="block" fontWeight={700} color="orange" sx={{ fontSize: '0.65rem' }}>
                                    Suelo: {g.config.slope}°
                                  </Typography>
                                  <Slider
                                    size="small"
                                    value={g.config.slope}
                                    min={0} max={90}
                                    sx={{ color: 'orange' }}
                                    disabled={g.config.tipoEstructura === 'doble'}
                                    onChange={(_, v) => {
                                      let updates = { slope: v };
                                      if (g.config.tipoEstructura === 'coplanar') { updates.tilt = v; }
                                      else if (g.config.tipoEstructura === 'libre') { if (v > g.config.tilt) updates.tilt = v; }
                                      updateGrid(g.id, { config: updates });
                                    }}
                                  />
                                </Box>
                              </Box>

                              <IconButton
                                size="small"
                                onClick={() => setShadowModalOpen(true)}
                                sx={{ border: "1px solid #ddd", bgcolor: '#fff', mt: -1 }}
                              >
                                <ShadowIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    </AccordionDetails>


                  </Accordion>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>

      {/* BOTON EXPANDIR (BAJADO PARA NO TAPAR LA BARRA SI EXISTE) */}
      {!menuVisible && (
        <Fab size="small" onClick={() => setMenuVisible(true)} sx={{ position: 'fixed', top: activeGrid ? 155 : 15, left: 35, zIndex: 1000, bgcolor: '#1a237e', color: 'white' }}>
          <ExpandAllIcon />
        </Fab>
      )}

      {/* BOTÓN FLOTANTE AGREGAR */}
      <Box sx={{ position: "fixed", top: 120, left: "60%", zIndex: 9999 }}>
        <Tooltip title="Añadir paneles" >
          <Fab
            onClick={handleAddNew}
            sx={{
              bgcolor: "orange",
              color: "#ffffff",
              // Ajuste de tamaño para que coincida con el segundo botón
              width: 32,
              height: 32,
              minHeight: 32
            }}
          >
            {/* Ajustamos también el tamaño del icono para que no se vea desbordado */}
            <AddIcon sx={{ fontSize: 18 }} />
          </Fab>
        </Tooltip>
      </Box>

      {/* BOTÓN FLOTANTE GUARDAR (Solo visible si hay cambios) */}
      <Box
        sx={{
          position: "fixed",
          top: 20,
          left: '70%',
          zIndex: 9999,
          transition: 'all 0.3s ease-in-out',
          opacity: hasPendingChanges ? 1 : 0,
          transform: hasPendingChanges ? 'scale(1)' : 'scale(0)',
          pointerEvents: hasPendingChanges ? 'auto' : 'none',
          // Definición de la animación de pulso pequeña
          '@keyframes pulse-small': {
            '0%': { boxShadow: '0 0 0 0px rgba(237, 108, 2, 0.8)' },
            '70%': { boxShadow: '0 0 0 8px rgba(237, 108, 2, 0)' },
            '100%': { boxShadow: '0 0 0 0px rgba(237, 108, 2, 0)' },
          },
        }}
      >
        <Tooltip title="Cambios pendientes" arrow placement="top">
          <Fab
            size="small" // Tamaño pequeño predefinido de MUI
            onClick={handleSave}
            sx={{
              bgcolor: "#ed6c02",
              color: "#ffffff",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: "#e65100",
              },
              // Efecto de alerta activo
              animation: hasPendingChanges ? 'pulse-small 1.5s infinite' : 'none',
              boxShadow: 4
            }}
          >
            <SaveIcon sx={{ fontSize: 20 }} />
          </Fab>
        </Tooltip>
      </Box>

      {/* DIALOGO SOMBRAS */}
      <Dialog open={shadowModalOpen} onClose={() => setShadowModalOpen(false)} fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Sombras: {activeGrid?.name}
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