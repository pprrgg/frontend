#!/bin/bash


cd /home/pk/Desktop/frontend/src/excelUploaderStorage/TableControls/CellStrategies
# Crear estructura de directorios para MapEditor modularizado
mkdir -p "./MapEditor/components/controls"
mkdir -p "./MapEditor/hooks"
mkdir -p "./MapEditor/utils"

# Crear archivos de utilidades
cat > "./MapEditor/utils/geometryUtils.js" << 'EOF'
// Utilidades geométricas
export const isPointInPolygon = (point, polygonPoints) => {
  let inside = false;
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i][0], yi = polygonPoints[i][1];
    const xj = polygonPoints[j][0], yj = polygonPoints[j][1];
    const intersect = ((yi > point[1]) !== (yj > point[1])) && 
      (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const calculateCentroid = (points) => {
  let sumLat = 0, sumLng = 0;
  points.forEach(point => {
    sumLat += point.lat;
    sumLng += point.lng;
  });
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length
  };
};

export const parseJSONSafe = (v) => {
  try { 
    return JSON.parse(typeof v === "string" ? v.replace(/'/g, '"').replace(/(\w+):/g, '"$1":') : v); 
  } catch { 
    return null; 
  }
};
EOF

cat > "./MapEditor/utils/leafletUtils.js" << 'EOF'
import L from "leaflet";

// Fix de iconos de Leaflet
export const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

export const createCircleWithHandler = (latlng, onCircleClick, radius = 0.5) => {
  const circle = L.circle(latlng, {
    radius: radius,
    color: "black",
    fillColor: "black",
    fillOpacity: 0.95
  });
  circle.on("click", () => onCircleClick(circle));
  return circle;
};
EOF

# Crear componentes
cat > "./MapEditor/components/MiniPolygonPreview.js" << 'EOF'
import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";

const MiniPolygonPreview = ({ coordinates }) => {
  const canvasRef = useRef(null);
  const width = 80;
  const height = 60;
  const padding = 10;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(0, 0, width, height);

    if (!coordinates || coordinates.length < 2) {
      ctx.fillStyle = '#999';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sin polígono', width / 2, height / 2);
      return;
    }

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    coordinates.forEach(coord => {
      const [lat, lng] = coord;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    const avgLat = (minLat + maxLat) / 2;
    const cosLat = Math.cos((avgLat * Math.PI) / 180);
    const geoWidth = (maxLng - minLng) * cosLat;
    const geoHeight = maxLat - minLat;
    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;
    const scale = Math.min(availableWidth / (geoWidth || 0.00001), availableHeight / (geoHeight || 0.00001));
    const lngCenter = (minLng + maxLng) / 2;
    const latCenter = (minLat + maxLat) / 2;

    const getX = (lng) => width / 2 + (lng - lngCenter) * cosLat * scale;
    const getY = (lat) => height / 2 - (lat - latCenter) * scale;

    ctx.beginPath();
    coordinates.forEach((coord, index) => {
      const x = getX(coord[1]);
      const y = getY(coord[0]);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.fillStyle = 'rgba(139, 69, 19, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (coordinates.length >= 2) {
      const p1 = { x: getX(coordinates[0][1]), y: getY(coordinates[0][0]) };
      const p2 = { x: getX(coordinates[1][1]), y: getY(coordinates[1][0]) };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#FF6600';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      let perpX = -dy / length;
      let perpY = dx / length;

      const centerX = (p1.x + p2.x) / 2;
      const centerY = (p1.y + p2.y) / 2;

      let centroidX = 0, centroidY = 0;
      coordinates.forEach(c => {
        centroidX += getX(c[1]);
        centroidY += getY(c[0]);
      });
      centroidX /= coordinates.length;
      centroidY /= coordinates.length;

      const dotProduct = perpX * (centroidX - centerX) + perpY * (centroidY - centerY);
      if (dotProduct < 0) {
        perpX = -perpX;
        perpY = -perpY;
      }

      const arrowLength = 12;
      const arrowStartX = centerX + perpX * 3;
      const arrowStartY = centerY + perpY * 3;
      const arrowEndX = centerX + perpX * (arrowLength + 3);
      const arrowEndY = centerY + perpY * (arrowLength + 3);

      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.strokeStyle = '#0000ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const angle = Math.atan2(perpY, perpX) + Math.PI;
      const headSize = 5;
      
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowStartX - headSize * Math.cos(angle - Math.PI / 6), arrowStartY - headSize * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowStartX - headSize * Math.cos(angle + Math.PI / 6), arrowStartY - headSize * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = '#0000ff';
      ctx.fill();
    }

    coordinates.forEach((coord, index) => {
      ctx.beginPath();
      ctx.arc(getX(coord[1]), getY(coord[0]), 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#FF6600' : '#ff4444';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  }, [coordinates]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: width,
          borderRadius: '4px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #eee'
        }}
      />
    </Box>
  );
};

export default MiniPolygonPreview;
EOF

cat > "./MapEditor/components/InstructionsPopup.js" << 'EOF'
import React from "react";

const InstructionsPopup = ({ instructions, visible, onClose }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      zIndex: 1000,
      textAlign: 'center',
      maxWidth: '90%',
      pointerEvents: 'none',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
        {instructions}
      </div>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          pointerEvents: 'auto',
          opacity: 0.7
        }}
      >
        ×
      </button>
    </div>
  );
};

export default InstructionsPopup;
EOF

# Crear archivos de control (clases de manipulación)
cat > "./MapEditor/components/controls/PolygonRotator.js << 'EOF'
import L from "leaflet";
import { calculateCentroid } from "../../utils/geometryUtils";

class PolygonRotator {
  constructor(map, onRotate, onInstructionsChange) {
    this.map = map;
    this.onRotate = onRotate;
    this.onInstructionsChange = onInstructionsChange;
    this.isRotating = false;
    this.polygon = null;
    this.startAngle = 0;
    this.currentAngle = 0;
    this.center = null;
    this.originalPoints = [];
    this.rotationHandle = null;
    this.rotationLine = null;
    this.angleLabel = null;
    this.centerMarker = null;
    this.keydownHandler = null;
    this.startHandlePos = null;
  }

  startRotation(polygon) {
    if (!polygon) {
      this.onInstructionsChange("❌ No hay polígono para rotar");
      setTimeout(() => this.onInstructionsChange(""), 2000);
      return;
    }

    this.isRotating = true;
    this.polygon = polygon;

    const latlngs = polygon.getLatLngs();
    const coords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
    this.originalPoints = coords.map(p => ({ lat: p.lat, lng: p.lng }));

    this.center = calculateCentroid(this.originalPoints);
    this.createCenterMarker();
    this.createRotationHandle();
    this.setupRotationEvents();

    this.onInstructionsChange("🔄 Modo rotación: Arrastra el círculo naranja para rotar el polígono. Presiona ESC para cancelar");
  }

  createCenterMarker() {
    if (this.centerMarker) this.centerMarker.remove();
    this.centerMarker = L.marker([this.center.lat, this.center.lng], {
      icon: L.divIcon({
        className: "rotation-center",
        html: `<div style="background: #ff4444; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14]
      })
    }).addTo(this.map);
  }

  createRotationHandle() {
    const centerPoint = this.map.latLngToLayerPoint(this.center);
    const handlePoint = { x: centerPoint.x + 50, y: centerPoint.y };
    const handleLatLng = this.map.layerPointToLatLng(handlePoint);

    this.rotationHandle = L.marker(handleLatLng, {
      icon: L.divIcon({
        className: "rotation-handle",
        html: `<div style="background: #ff9933; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; cursor: move; box-shadow: 0 0 0 2px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20]
      }),
      draggable: true
    }).addTo(this.map);
    this.updateRotationLine();
  }

  updateRotationLine() {
    if (this.rotationLine) this.rotationLine.remove();
    if (this.rotationHandle) {
      const handlePos = this.rotationHandle.getLatLng();
      this.rotationLine = L.polyline([this.center, handlePos], {
        color: "#ff9933",
        weight: 2,
        dashArray: "5, 5"
      }).addTo(this.map);
    }
  }

  setupRotationEvents() {
    this.rotationHandle.on("drag", (e) => {
      const handlePos = e.target.getLatLng();
      this.updateRotationLine();
      this.calculateAndApplyRotation(handlePos);
    });

    this.rotationHandle.on("dragend", () => {
      this.onInstructionsChange("✓ Rotación completada");
      setTimeout(() => {
        if (this.isRotating) {
          this.onInstructionsChange("🔄 Modo rotación: Arrastra el círculo naranja para seguir rotando");
        }
      }, 1500);
    });

    this.keydownHandler = (e) => {
      if (e.key === 'Escape') this.cancelRotation();
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  calculateAndApplyRotation(handlePos) {
    const centerPoint = this.map.latLngToLayerPoint(this.center);
    const handlePoint = this.map.latLngToLayerPoint(handlePos);
    const dx = handlePoint.x - centerPoint.x;
    const dy = handlePoint.y - centerPoint.y;
    const currentAngle = Math.atan2(dy, dx);

    if (this.startHandlePos) {
      const startHandlePoint = this.map.latLngToLayerPoint(this.startHandlePos);
      const startDx = startHandlePoint.x - centerPoint.x;
      const startDy = startHandlePoint.y - centerPoint.y;
      const startAngle = Math.atan2(startDy, startDx);
      const rotationAngle = currentAngle - startAngle;
      this.applyRotation(rotationAngle);
    } else {
      this.startHandlePos = handlePos;
    }
  }

  applyRotation(angleRadians) {
    const map = this.map;
    const centerPoint = map.latLngToLayerPoint(this.center);

    const rotatedLatLngs = this.originalPoints.map(point => {
      const p = map.latLngToLayerPoint(point);
      const dx = p.x - centerPoint.x;
      const dy = p.y - centerPoint.y;
      const cos = Math.cos(angleRadians);
      const sin = Math.sin(angleRadians);
      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;
      const finalPoint = { x: centerPoint.x + rotatedX, y: centerPoint.y + rotatedY };
      return map.layerPointToLatLng(finalPoint);
    });

    this.polygon.setLatLngs(rotatedLatLngs);
    this.currentAngle = angleRadians;
    this.showAngle(angleRadians);

    if (this.onRotate) this.onRotate(this.polygon, angleRadians);
  }

  showAngle(angleRadians) {
    if (this.angleLabel) this.angleLabel.remove();
    const angleDegrees = Math.abs(Math.round(angleRadians * 180 / Math.PI));
    const centerPoint = this.map.latLngToLayerPoint(this.center);
    const labelPoint = this.map.layerPointToLatLng({ x: centerPoint.x, y: centerPoint.y - 30 });

    this.angleLabel = L.marker(labelPoint, {
      icon: L.divIcon({
        className: "angle-label",
        html: `<div style="background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${angleDegrees}°</div>`,
        iconSize: [50, 20]
      })
    }).addTo(this.map);

    setTimeout(() => {
      if (this.angleLabel) {
        this.angleLabel.remove();
        this.angleLabel = null;
      }
    }, 1000);
  }

  cancelRotation() {
    if (this.isRotating) {
      const originalPolygon = L.polygon(this.originalPoints, {
        color: this.polygon.options.color,
        weight: this.polygon.options.weight,
        fillColor: this.polygon.options.fillColor
      });
      this.polygon.remove();
      this.polygon = originalPolygon;
      if (this.onRotate) this.onRotate(this.polygon, 0);
      this.stopRotation();
      this.onInstructionsChange("✖ Rotación cancelada");
      setTimeout(() => this.onInstructionsChange(""), 1500);
    }
  }

  stopRotation() {
    this.isRotating = false;
    if (this.centerMarker) this.centerMarker.remove();
    if (this.rotationHandle) this.rotationHandle.remove();
    if (this.rotationLine) this.rotationLine.remove();
    if (this.angleLabel) this.angleLabel.remove();
    if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
    this.polygon = null;
    this.startHandlePos = null;
  }
}

export default PolygonRotator;
EOF

cat > "./MapEditor/components/controls/PolygonTranslator.js" << 'EOF'
import L from "leaflet";
import { calculateCentroid } from "../../utils/geometryUtils";

class PolygonTranslator {
  constructor(map, onTranslate, onInstructionsChange) {
    this.map = map;
    this.onTranslate = onTranslate;
    this.onInstructionsChange = onInstructionsChange;
    this.isTranslating = false;
    this.polygon = null;
    this.dragStartPoint = null;
    this.originalPoints = [];
    this.currentOffset = { x: 0, y: 0 };
    this.translateHandle = null;
    this.isDragging = false;
    this.center = null;
    this.dragStartPixel = null;
    this.keydownHandler = null;
  }

  startTranslation(polygon) {
    if (!polygon) {
      this.onInstructionsChange("❌ No hay polígono para mover");
      setTimeout(() => this.onInstructionsChange(""), 2000);
      return;
    }

    this.isTranslating = true;
    this.polygon = polygon;
    this.currentOffset = { x: 0, y: 0 };

    const latlngs = polygon.getLatLngs();
    const coords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
    this.originalPoints = coords.map(p => ({ lat: p.lat, lng: p.lng }));
    this.center = calculateCentroid(this.originalPoints);
    this.createTranslateHandle();
    this.setupTranslationEvents();

    this.onInstructionsChange("📦 Modo mover: Arrastra el cuadrado azul para mover el polígono. Presiona ESC para cancelar");
  }

  createTranslateHandle() {
    this.translateHandle = L.marker([this.center.lat, this.center.lng], {
      icon: L.divIcon({
        className: "translate-handle",
        html: `<div style="background: #3399ff; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; cursor: move; box-shadow: 0 0 0 2px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M13 6v5h5V7h-3V4h-2zM6 13h5v5H7v-3H4v-2z"/>
                  <path d="M21 11h-2v2h2v-2zM3 11H1v2h2v-2zM11 21h2v-2h-2v2zM11 3h2V1h-2v2z"/>
                </svg>
               </div>`,
        iconSize: [24, 24]
      }),
      draggable: true
    }).addTo(this.map);
  }

  setupTranslationEvents() {
    this.translateHandle.on("dragstart", (e) => {
      this.isDragging = true;
      this.dragStartPixel = this.map.latLngToLayerPoint(e.target.getLatLng());
    });

    this.translateHandle.on("drag", (e) => {
      if (!this.isDragging) return;
      const currentLatLng = e.target.getLatLng();
      const currentPixel = this.map.latLngToLayerPoint(currentLatLng);
      const deltaX = currentPixel.x - this.dragStartPixel.x;
      const deltaY = currentPixel.y - this.dragStartPixel.y;
      this.applyTranslation(deltaX, deltaY);
    });

    this.translateHandle.on("dragend", () => {
      this.isDragging = false;
      const latlngs = this.polygon.getLatLngs();
      const coords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
      this.originalPoints = coords.map(p => ({ lat: p.lat, lng: p.lng }));
      this.currentOffset = { x: 0, y: 0 };
      this.onInstructionsChange("✓ Movimiento completado");
      setTimeout(() => {
        if (this.isTranslating) {
          this.onInstructionsChange("📦 Modo mover: Arrastra el cuadrado azul para seguir moviendo el polígono");
        }
      }, 1500);
    });

    this.keydownHandler = (e) => {
      if (e.key === 'Escape') this.cancelTranslation();
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  applyTranslation(deltaX, deltaY) {
    const translatedLatLngs = this.originalPoints.map(point => {
      const pointPixel = this.map.latLngToLayerPoint(point);
      const newPixel = { x: pointPixel.x + deltaX, y: pointPixel.y + deltaY };
      return this.map.layerPointToLatLng(newPixel);
    });
    this.polygon.setLatLngs(translatedLatLngs);
    const newHandlePos = this.map.layerPointToLatLng({
      x: this.map.latLngToLayerPoint(this.center).x + deltaX,
      y: this.map.latLngToLayerPoint(this.center).y + deltaY
    });
    this.translateHandle.setLatLng(newHandlePos);
    if (this.onTranslate) this.onTranslate(this.polygon);
  }

  cancelTranslation() {
    if (this.isTranslating) {
      const originalPolygon = L.polygon(this.originalPoints, {
        color: this.polygon.options.color,
        weight: this.polygon.options.weight,
        fillColor: this.polygon.options.fillColor
      });
      this.polygon.remove();
      this.polygon = originalPolygon;
      if (this.onTranslate) this.onTranslate(this.polygon);
      this.stopTranslation();
      this.onInstructionsChange("✖ Movimiento cancelado");
      setTimeout(() => this.onInstructionsChange(""), 1500);
    }
  }

  stopTranslation() {
    this.isTranslating = false;
    this.isDragging = false;
    if (this.translateHandle) this.translateHandle.remove();
    if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
    this.polygon = null;
    this.dragStartPixel = null;
    this.currentOffset = { x: 0, y: 0 };
  }
}

export default PolygonTranslator;
EOF

# Crear el nuevo componente MapEditor modularizado
cat > "./MapEditor/index.jsx" << 'EOF'
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Button, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../../../vendor/leaflet-draw-fixed.js";

// Componentes locales
import MiniPolygonPreview from "./components/MiniPolygonPreview";
import InstructionsPopup from "./components/InstructionsPopup";
import PolygonRotator from "./components/controls/PolygonRotator";
import PolygonTranslator from "./components/controls/PolygonTranslator";
import RectangleDrawer from "./components/controls/RectangleDrawer";
import FreePolygonDrawer from "./components/controls/FreePolygonDrawer";

// Utilidades
import { fixLeafletIcons, createCircleWithHandler } from "./utils/leafletUtils";
import { isPointInPolygon, parseJSONSafe } from "./utils/geometryUtils";

// Fix de iconos
fixLeafletIcons();

const MapEditor = ({ value, saveValue }) => {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [polygonPreview, setPolygonPreview] = useState([]);
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const deleteModeRef = useRef(false);
  const addModeRef = useRef(false);
  const polygonModeRef = useRef(false);
  const rotateModeRef = useRef(false);
  const translateModeRef = useRef(false);
  const rectangleDrawerRef = useRef(null);
  const freePolygonDrawerRef = useRef(null);
  const polygonRotatorRef = useRef(null);
  const polygonTranslatorRef = useRef(null);
  const isMapReadyRef = useRef(false);
  const polygonLayerRef = useRef(null);

  const parsed = parseJSONSafe(value) || {};
  const keyName = Object.keys(parsed)[0] || "data";
  const DEFAULT_CENTER = [40.4166, -3.7037];

  // Inicializar polygonPreview con datos existentes
  useEffect(() => {
    const data = parsed[keyName] || [];
    const polygon = data[0] || [];
    if (polygon && polygon.length > 0) {
      setPolygonPreview(polygon);
    }
  }, []);

  const syncToDB = (drawnItems) => {
    if (!drawnItems) return;
    const layers = drawnItems.getLayers();
    let polygonCoords = [];
    let circles = [];

    layers.forEach((layer) => {
      if (layer instanceof L.Polygon && !(layer instanceof L.Circle)) {
        const latlngs = layer.getLatLngs();
        const actualCoords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        polygonCoords = actualCoords.map((p) => [p.lat, p.lng]);
        polygonLayerRef.current = layer;
        setPolygonPreview(polygonCoords);
      }
      if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        circles.push({ lat: center.lat, lng: center.lng, radius: layer.getRadius() });
      }
    });

    saveValue(JSON.stringify({ [keyName]: [polygonCoords, circles] }));
  };

  const removeObstaclesOutsidePolygon = () => {
    if (!drawnItemsRef.current || !polygonLayerRef.current) return;
    const polygonLatLngs = polygonLayerRef.current.getLatLngs();
    const coords = Array.isArray(polygonLatLngs[0]) ? polygonLatLngs[0] : polygonLatLngs;
    const polygonPoints = coords.map(p => [p.lat, p.lng]);
    const layersToRemove = [];

    drawnItemsRef.current.getLayers().forEach(layer => {
      if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        const point = [center.lat, center.lng];
        if (!isPointInPolygon(point, polygonPoints)) {
          layersToRemove.push(layer);
        }
      }
    });

    layersToRemove.forEach(layer => drawnItemsRef.current.removeLayer(layer));
    if (layersToRemove.length > 0) {
      setInstructions(`🗑️ Se eliminaron ${layersToRemove.length} obstáculos fuera del polígono`);
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 3000);
      syncToDB(drawnItemsRef.current);
    }
  };

  const handlePolygonRotate = (rotatedPolygon, angle) => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.getLayers().forEach(layer => {
        if (layer instanceof L.Polygon && !(layer instanceof L.Circle)) {
          drawnItemsRef.current.removeLayer(layer);
        }
      });
      drawnItemsRef.current.addLayer(rotatedPolygon);
      polygonLayerRef.current = rotatedPolygon;
      syncToDB(drawnItemsRef.current);
      removeObstaclesOutsidePolygon();
    }
  };

  const handlePolygonTranslate = (translatedPolygon) => {
    if (drawnItemsRef.current) {
      syncToDB(drawnItemsRef.current);
      removeObstaclesOutsidePolygon();
    }
  };

  const handleCircleClick = (circle) => {
    if (deleteModeRef.current && drawnItemsRef.current) {
      drawnItemsRef.current.removeLayer(circle);
      syncToDB(drawnItemsRef.current);
      setInstructions("✓ Obstáculo eliminado");
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 1500);
    }
  };

  const handleRectangleComplete = (rectangle, height, heightLine) => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.getLayers().forEach(layer => {
        if (layer instanceof L.Polygon && !(layer instanceof L.Circle)) {
          drawnItemsRef.current.removeLayer(layer);
        }
      });
      drawnItemsRef.current.addLayer(rectangle);
      polygonLayerRef.current = rectangle;
      if (heightLine) {
        heightLine.addTo(mapRef.current);
        setTimeout(() => heightLine.remove(), 2000);
      }
      syncToDB(drawnItemsRef.current);
      removeObstaclesOutsidePolygon();
      setInstructions(`✓ Rectángulo creado correctamente - Altura: ${height.toFixed(1)} metros`);
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 3000);
    }
  };

  const handleFreePolygonComplete = (polygon) => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.getLayers().forEach(layer => {
        if (layer instanceof L.Polygon && !(layer instanceof L.Circle)) {
          drawnItemsRef.current.removeLayer(layer);
        }
      });
      drawnItemsRef.current.addLayer(polygon);
      polygonLayerRef.current = polygon;
      syncToDB(drawnItemsRef.current);
      removeObstaclesOutsidePolygon();
      setInstructions("✓ Polígono creado correctamente");
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 2000);
    }
  };

  const handleInstructionsChange = (text) => {
    if (text) {
      setInstructions(text);
      setShowInstructions(true);
    } else {
      setShowInstructions(false);
      setInstructions("");
    }
  };

  const addCustomControls = (map, drawnItems, syncFn) => {
    const rectangleDrawer = new RectangleDrawer(map, handleRectangleComplete, handleInstructionsChange);
    const freePolygonDrawer = new FreePolygonDrawer(map, handleFreePolygonComplete, handleInstructionsChange);
    const polygonRotator = new PolygonRotator(map, handlePolygonRotate, handleInstructionsChange);
    const polygonTranslator = new PolygonTranslator(map, handlePolygonTranslate, handleInstructionsChange);

    rectangleDrawerRef.current = rectangleDrawer;
    freePolygonDrawerRef.current = freePolygonDrawer;
    polygonRotatorRef.current = polygonRotator;
    polygonTranslatorRef.current = polygonTranslator;

    const CustomControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");

        const translateBtn = L.DomUtil.create("a", "", container);
        translateBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M13 6v5h5V7h-3V4h-2zM6 13h5v5H7v-3H4v-2z" fill="black"/><path d="M21 11h-2v2h2v-2zM3 11H1v2h2v-2zM11 21h2v-2h-2v2zM11 3h2V1h-2v2z" fill="black"/></svg>`;
        translateBtn.title = "Mover polígono";
        translateBtn.style.background = "#fff";
        translateBtn.style.cursor = "pointer";

        const rotateBtn = L.DomUtil.create("a", "", container);
        rotateBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="black"/></svg>`;
        rotateBtn.title = "Rotar polígono";
        rotateBtn.style.background = "#fff";
        rotateBtn.style.cursor = "pointer";

        const rectBtn = L.DomUtil.create("a", "", container);
        rectBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="none" stroke="#000" stroke-width="1.5"/><line x1="4" y1="12" x2="20" y2="12" stroke="#ff4444" stroke-width="1" stroke-dasharray="3"/><circle cx="8" cy="8" r="1.5" fill="#ff4444"/><circle cx="16" cy="8" r="1.5" fill="#ff4444"/><circle cx="12" cy="16" r="1.5" fill="#44ff44"/><text x="12" y="20" font-size="8" text-anchor="middle">altura</text></svg>`;
        rectBtn.title = "Dibujar rectángulo (base + altura)";
        rectBtn.style.background = "#fff";
        rectBtn.style.cursor = "pointer";

        const polyBtn = L.DomUtil.create("a", "", container);
        polyBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="4,16 12,4 20,16" fill="none" stroke="#000" stroke-width="1.5"/><circle cx="4" cy="16" r="1.5" fill="#ff4444"/><circle cx="12" cy="4" r="1.5" fill="#ff4444"/><circle cx="20" cy="16" r="1.5" fill="#ff4444"/><circle cx="4" cy="16" r="3" fill="#44ff44" stroke="white" stroke-width="1"/><text x="12" y="22" font-size="8" text-anchor="middle">click cerrar</text></svg>`;
        polyBtn.title = "Dibujar polígono libre (clic en primer vértice para cerrar)";
        polyBtn.style.background = "#fff";
        polyBtn.style.cursor = "pointer";

        const addBtn = L.DomUtil.create("a", "", container);
        addBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="4,16 12,8 20,16" fill="none" stroke="grey" stroke-width="1"/><rect x="16" y="7" width="2" height="5" fill="none" stroke="black" stroke-width="1"/><rect x="6" y="15" width="12" height="8" fill="none" stroke="#000" stroke-width="1"/></svg>`;
        addBtn.title = "Agregar obstáculo";
        addBtn.style.cursor = "pointer";

        const delBtn = L.DomUtil.create("a", "", container);
        delBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="4,16 12,8 20,16" fill="none" stroke="#000" stroke-width="1"/><rect x="16" y="7" width="2" height="5" fill="none" stroke="#000" stroke-width="1"/><line x1="13" y1="5" x2="21" y2="14" stroke="red" stroke-width="2"/><line x1="21" y1="5" x2="13" y2="14" stroke="red" stroke-width="2"/><rect x="6" y="15" width="12" height="8" fill="none" stroke="#000" stroke-width="1"/></svg>`;
        delBtn.title = "Eliminar obstáculo";
        delBtn.style.cursor = "pointer";

        L.DomEvent.on(translateBtn, "click", (e) => {
          L.DomEvent.stop(e);
          if (!polygonLayerRef.current) {
            setInstructions("❌ No hay polígono para mover. Crea un polígono primero.");
            setShowInstructions(true);
            setTimeout(() => setShowInstructions(false), 2000);
            return;
          }
          addModeRef.current = false;
          deleteModeRef.current = false;
          polygonModeRef.current = false;
          rotateModeRef.current = false;
          translateModeRef.current = true;
          if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
          if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
          if (polygonRotatorRef.current) polygonRotatorRef.current.stopRotation();
          polygonTranslator.startTranslation(polygonLayerRef.current);
          translateBtn.style.background = "#ccffcc";
          rotateBtn.style.background = "";
          rectBtn.style.background = "";
          polyBtn.style.background = "";
          addBtn.style.background = "";
          delBtn.style.background = "";
          setInstructions("📦 Modo mover: Arrastra el cuadrado azul para mover el polígono. ESC para cancelar");
          setShowInstructions(true);
        });

        L.DomEvent.on(rotateBtn, "click", (e) => {
          L.DomEvent.stop(e);
          if (!polygonLayerRef.current) {
            setInstructions("❌ No hay polígono para rotar. Crea un polígono primero.");
            setShowInstructions(true);
            setTimeout(() => setShowInstructions(false), 2000);
            return;
          }
          addModeRef.current = false;
          deleteModeRef.current = false;
          polygonModeRef.current = false;
          rotateModeRef.current = true;
          translateModeRef.current = false;
          if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
          if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
          if (polygonTranslatorRef.current) polygonTranslatorRef.current.stopTranslation();
          polygonRotator.startRotation(polygonLayerRef.current);
          rotateBtn.style.background = "#ccffcc";
          translateBtn.style.background = "";
          rectBtn.style.background = "";
          polyBtn.style.background = "";
          addBtn.style.background = "";
          delBtn.style.background = "";
          setInstructions("🔄 Modo rotación: Arrastra el círculo naranja para rotar el polígono. ESC para cancelar");
          setShowInstructions(true);
        });

        L.DomEvent.on(rectBtn, "click", (e) => {
          L.DomEvent.stop(e);
          addModeRef.current = false;
          deleteModeRef.current = false;
          polygonModeRef.current = false;
          rotateModeRef.current = false;
          translateModeRef.current = false;
          if (polygonRotatorRef.current) polygonRotatorRef.current.stopRotation();
          if (polygonTranslatorRef.current) polygonTranslatorRef.current.stopTranslation();
          if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
          if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
          rectangleDrawerRef.current.startDrawing();
          rectBtn.style.background = "#ccffcc";
          rotateBtn.style.background = "";
          translateBtn.style.background = "";
          polyBtn.style.background = "";
          addBtn.style.background = "";
          delBtn.style.background = "";
          setInstructions("📐 Modo rectángulo: Define la base y luego la altura");
          setShowInstructions(true);
          setTimeout(() => {
            if (!rectangleDrawerRef.current?.isDrawing) setShowInstructions(false);
          }, 5000);
        });

        L.DomEvent.on(polyBtn, "click", (e) => {
          L.DomEvent.stop(e);
          addModeRef.current = false;
          deleteModeRef.current = false;
          polygonModeRef.current = true;
          rotateModeRef.current = false;
          translateModeRef.current = false;
          if (polygonRotatorRef.current) polygonRotatorRef.current.stopRotation();
          if (polygonTranslatorRef.current) polygonTranslatorRef.current.stopTranslation();
          if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
          if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
          freePolygonDrawerRef.current.startDrawing();
          polyBtn.style.background = "#ccffcc";
          rotateBtn.style.background = "";
          translateBtn.style.background = "";
          rectBtn.style.background = "";
          addBtn.style.background = "";
          delBtn.style.background = "";
          setInstructions("✏️ Modo polígono libre: Haz clic para agregar vértices. Haz clic en el PRIMER VÉRTICE (verde) para cerrar el polígono. ESC para cancelar");
          setShowInstructions(true);
        });

        L.DomEvent.on(addBtn, "click", (e) => {
          L.DomEvent.stop(e);
          addModeRef.current = !addModeRef.current;
          deleteModeRef.current = false;
          polygonModeRef.current = false;
          rotateModeRef.current = false;
          translateModeRef.current = false;
          if (polygonRotatorRef.current) polygonRotatorRef.current.stopRotation();
          if (polygonTranslatorRef.current) polygonTranslatorRef.current.stopTranslation();
          if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
          if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
          addBtn.style.background = addModeRef.current ? "#ccffcc" : "";
          delBtn.style.background = "";
          rectBtn.style.background = "";
          polyBtn.style.background = "";
          rotateBtn.style.background = "";
          translateBtn.style.background = "";
          if (addModeRef.current) {
            setInstructions("⚫ Modo agregar obstáculo: Haz clic en el mapa para agregar un obstáculo circular");
            setShowInstructions(true);
          } else {
            setShowInstructions(false);
          }
        });

        L.DomEvent.on(delBtn, "click", (e) => {
          L.DomEvent.stop(e);
          deleteModeRef.current = !deleteModeRef.current;
          addModeRef.current = false;
          polygonModeRef.current = false;
          rotateModeRef.current = false;
          translateModeRef.current = false;
          if (polygonRotatorRef.current) polygonRotatorRef.current.stopRotation();
          if (polygonTranslatorRef.current) polygonTranslatorRef.current.stopTranslation();
          if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
          if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
          delBtn.style.background = deleteModeRef.current ? "#ffcccc" : "";
          addBtn.style.background = "";
          rectBtn.style.background = "";
          polyBtn.style.background = "";
          rotateBtn.style.background = "";
          translateBtn.style.background = "";
          if (deleteModeRef.current) {
            setInstructions("🗑️ Modo eliminar obstáculo: Haz clic en un obstáculo para eliminarlo");
            setShowInstructions(true);
          } else {
            setShowInstructions(false);
          }
        });

        return container;
      }
    });

    map.addControl(new CustomControl());

    map.on("click", (e) => {
      if (!addModeRef.current) return;
      if (polygonLayerRef.current) {
        const polygonLatLngs = polygonLayerRef.current.getLatLngs();
        const coords = Array.isArray(polygonLatLngs[0]) ? polygonLatLngs[0] : polygonLatLngs;
        const polygonPoints = coords.map(p => [p.lat, p.lng]);
        const clickPoint = [e.latlng.lat, e.latlng.lng];
        if (!isPointInPolygon(clickPoint, polygonPoints)) {
          setInstructions("❌ Solo se pueden agregar obstáculos dentro del polígono");
          setShowInstructions(true);
          setTimeout(() => setShowInstructions(false), 2000);
          return;
        }
      }
      const circle = createCircleWithHandler(e.latlng, handleCircleClick);
      drawnItems.addLayer(circle);
      syncFn();
      setInstructions("✓ Obstáculo agregado");
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 1500);
    });
  };

  const handleMapReady = (map) => {
    if (isMapReadyRef.current) return;
    isMapReadyRef.current = true;
    mapRef.current = map;

    deleteModeRef.current = false;
    addModeRef.current = false;
    polygonModeRef.current = false;
    rotateModeRef.current = false;
    translateModeRef.current = false;

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems, remove: false },
      draw: false
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.EDITED, () => syncToDB(drawnItems));
    map.on(L.Draw.Event.EDITSTOP, () => syncToDB(drawnItems));

    addCustomControls(map, drawnItems, () => syncToDB(drawnItems));

    const data = parsed[keyName] || [];
    const polygon = data[0] || [];
    const circles = data[1] || [];

    if (polygon.length > 0) {
      const polygonLayer = L.polygon(polygon, {
        color: "brown",
        fillColor: "rgba(139, 69, 19, 0.3)"
      });
      drawnItems.addLayer(polygonLayer);
      polygonLayerRef.current = polygonLayer;
      setPolygonPreview(polygon);
      map.fitBounds(polygonLayer.getBounds(), { padding: [50, 50] });
    }

    circles.forEach(c => {
      const circle = createCircleWithHandler([c.lat, c.lng], handleCircleClick, c.radius);
      drawnItems.addLayer(circle);
    });
  };

  useEffect(() => {
    if (!open) {
      mapRef.current = null;
      drawnItemsRef.current = null;
      isMapReadyRef.current = false;
      deleteModeRef.current = false;
      addModeRef.current = false;
      polygonModeRef.current = false;
      rotateModeRef.current = false;
      translateModeRef.current = false;
      polygonLayerRef.current = null;
      if (rectangleDrawerRef.current) rectangleDrawerRef.current.stopDrawing();
      if (freePolygonDrawerRef.current) freePolygonDrawerRef.current.stopDrawing();
      if (polygonRotatorRef.current) polygonRotatorRef.current.stopRotation();
      if (polygonTranslatorRef.current) polygonTranslatorRef.current.stopTranslation();
      setShowInstructions(false);
      setInstructions("");
    }
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        size="small"
        sx={{
          minWidth: 32,
          width: "100%",
          py: 0.5,
          px: 0,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <MiniPolygonPreview coordinates={polygonPreview} />
      </Button>
      <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogTitle sx={{ m: 0, p: 2 }}>Editar {keyName}</DialogTitle>
        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8, zIndex: 1000, color: 'success.main' }}>
          <CheckIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, height: "100vh", position: "relative" }}>
          {open && (
            <>
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={22}
                maxZoom={22}
                style={{ width: "100%", height: "100%" }}
                whenReady={(e) => handleMapReady(e.target)}
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="🌍 Híbrido (Satélite + Calles)">
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      attribution="Google"
                      maxZoom={22}
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="🛰️ Satélite">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="Esri"
                      maxZoom={22}
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="🗺️ Callejero">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
              </MapContainer>
              <InstructionsPopup
                instructions={instructions}
                visible={showInstructions}
                onClose={() => setShowInstructions(false)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MapEditor;
EOF

# Crear archivos faltantes (RectangleDrawer y FreePolygonDrawer)
cat > "./MapEditor/components/controls/RectangleDrawer.js" << 'EOF'
import L from "leaflet";

class RectangleDrawer {
  constructor(map, onComplete, onInstructionsChange) {
    this.map = map;
    this.onComplete = onComplete;
    this.onInstructionsChange = onInstructionsChange;
    this.points = [];
    this.markers = [];
    this.tempLine = null;
    this.isDrawing = false;
    this.baseLine = null;
    this.heightLabel = null;
    this.clickHandler = null;
    this.mousemoveHandler = null;
  }

  startDrawing() {
    this.isDrawing = true;
    this.points = [];
    this.clearMarkers();
    this.clearTempLine();
    this.map.getContainer().style.cursor = "crosshair";

    this.clickHandler = (e) => { if (this.isDrawing) this.addPoint(e.latlng); };
    this.mousemoveHandler = (e) => { if (this.isDrawing && this.points.length === 2) this.updateTempLine(e.latlng); };

    this.map.on("click", this.clickHandler);
    this.map.on("mousemove", this.mousemoveHandler);
    this.showInstructions();
  }

  addPoint(latlng) {
    if (this.points.length >= 3) return;
    const marker = L.marker(latlng, {
      icon: L.divIcon({
        className: "temp-marker",
        html: `<div style="background: ${this.points.length === 2 ? '#44ff44' : '#ff4444'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12]
      })
    }).addTo(this.map);
    this.markers.push(marker);
    this.points.push(latlng);
    this.showInstructions();
    if (this.points.length === 2) this.drawBaseLine();
    if (this.points.length === 3) this.calculateAndDrawRectangle();
  }

  drawBaseLine() {
    if (this.baseLine) this.baseLine.remove();
    this.baseLine = L.polyline([this.points[0], this.points[1]], { color: "#ff4444", weight: 3, dashArray: "5, 10" }).addTo(this.map);
  }

  updateTempLine(mouseLatLng) {
    if (!this.points[0] || !this.points[1]) return;
    this.clearTempLine();
    const map = this.map;
    const p0 = map.latLngToLayerPoint(this.points[0]);
    const p1 = map.latLngToLayerPoint(this.points[1]);
    const pm = map.latLngToLayerPoint(mouseLatLng);
    const baseVector = { x: p1.x - p0.x, y: p1.y - p0.y };
    const baseLength = Math.sqrt(baseVector.x ** 2 + baseVector.y ** 2);
    const mouseVector = { x: pm.x - p0.x, y: pm.y - p0.y };
    const dot = (mouseVector.x * baseVector.x + mouseVector.y * baseVector.y) / baseLength;
    const proj = { x: p0.x + (baseVector.x / baseLength) * dot, y: p0.y + (baseVector.y / baseLength) * dot };
    this.tempLine = L.polyline([map.layerPointToLatLng(proj), mouseLatLng], { color: "#44ff44", weight: 2, dashArray: "5,5", opacity: 0.8 }).addTo(this.map);
  }

  clearTempLine() {
    if (this.tempLine) this.tempLine.remove();
    if (this.heightLabel) this.heightLabel.remove();
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    if (this.baseLine) this.baseLine.remove();
  }

  showInstructions() {
    const instructions = [
      "📍 PASO 1: Haz clic en el punto de INICIO de la base",
      "📍 PASO 2: Haz clic en el punto FINAL de la base",
      "📏 PASO 3: Mueve el mouse para ajustar la altura, haz clic para confirmar"
    ];
    if (this.points.length === 0) this.onInstructionsChange(instructions[0]);
    else if (this.points.length === 1) this.onInstructionsChange(instructions[1]);
    else if (this.points.length === 2) this.onInstructionsChange(instructions[2]);
  }

  calculateAndDrawRectangle() {
    const map = this.map;
    const start = this.points[0];
    const end = this.points[1];
    const heightPoint = this.points[2];
    const p0 = map.latLngToLayerPoint(start);
    const p1 = map.latLngToLayerPoint(end);
    const p2 = map.latLngToLayerPoint(heightPoint);
    const baseVector = { x: p1.x - p0.x, y: p1.y - p0.y };
    const baseLength = Math.sqrt(baseVector.x ** 2 + baseVector.y ** 2);
    const toHeightVector = { x: p2.x - p0.x, y: p2.y - p0.y };
    const dot = (toHeightVector.x * baseVector.x + toHeightVector.y * baseVector.y) / baseLength;
    const closestPointOnBase = { x: p0.x + (baseVector.x / baseLength) * dot, y: p0.y + (baseVector.y / baseLength) * dot };
    const perpVector = { x: p2.x - closestPointOnBase.x, y: p2.y - closestPointOnBase.y };
    const height = Math.sqrt(perpVector.x ** 2 + perpVector.y ** 2);
    const perpNormalized = { x: perpVector.x / height, y: perpVector.y / height };
    const rectPointsPx = [p0, p1, { x: p1.x + perpNormalized.x * height, y: p1.y + perpNormalized.y * height }, { x: p0.x + perpNormalized.x * height, y: p0.y + perpNormalized.y * height }];
    const rectPointsLatLng = rectPointsPx.map(p => map.layerPointToLatLng(p));
    const rectangle = L.polygon(rectPointsLatLng, { color: "brown", weight: 3, fillColor: "rgba(139, 69, 19, 0.3)" });
    const heightLine = L.polyline([map.layerPointToLatLng(closestPointOnBase), heightPoint], { color: "#44ff44", weight: 2, dashArray: "5, 5", opacity: 0.6 });
    this.onComplete(rectangle, height, heightLine);
    this.clearAll();
  }

  clearAll() {
    this.clearMarkers();
    this.clearTempLine();
    this.stopDrawing();
  }

  stopDrawing() {
    this.isDrawing = false;
    this.map.getContainer().style.cursor = "";
    if (this.clickHandler) this.map.off("click", this.clickHandler);
    if (this.mousemoveHandler) this.map.off("mousemove", this.mousemoveHandler);
    this.onInstructionsChange("");
  }
}

export default RectangleDrawer;
EOF

cat > "./MapEditor/components/controls/FreePolygonDrawer.js" << 'EOF'
import L from "leaflet";

class FreePolygonDrawer {
  constructor(map, onComplete, onInstructionsChange) {
    this.map = map;
    this.onComplete = onComplete;
    this.onInstructionsChange = onInstructionsChange;
    this.points = [];
    this.markers = [];
    this.polyline = null;
    this.tempPolyline = null;
    this.isDrawing = false;
    this.firstMarker = null;
    this.isCompleting = false;
    this.clickHandler = null;
    this.mousemoveHandler = null;
    this.keydownHandler = null;
  }

  startDrawing() {
    this.isDrawing = true;
    this.isCompleting = false;
    this.points = [];
    this.markers = [];
    this.clearPolyline();
    this.map.getContainer().style.cursor = "crosshair";

    this.clickHandler = (e) => {
      if (!this.isDrawing || this.isCompleting) return;
      if (this.points.length >= 3 && this.firstMarker) {
        const clickLatLng = e.latlng;
        const firstPoint = this.points[0];
        const distance = this.calculateDistance(clickLatLng, firstPoint);
        if (distance < 10) {
          this.completePolygon();
          return;
        }
      }
      this.addPoint(e.latlng);
    };

    this.mousemoveHandler = (e) => {
      if (!this.isDrawing || this.isCompleting || this.points.length === 0) return;
      this.updateTempPolyline(e.latlng);
    };

    this.map.on("click", this.clickHandler);
    this.map.on("mousemove", this.mousemoveHandler);

    this.keydownHandler = (e) => { if (e.key === 'Escape') this.cancelDrawing(); };
    document.addEventListener('keydown', this.keydownHandler);
    this.showInstructions();
  }

  calculateDistance(point1, point2) {
    const p1 = this.map.latLngToLayerPoint(point1);
    const p2 = this.map.latLngToLayerPoint(point2);
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  addPoint(latlng) {
    if (!this.isDrawing || this.isCompleting) return;
    const isFirstPoint = this.points.length === 0;
    const markerColor = isFirstPoint ? '#44ff44' : '#ff4444';
    const marker = L.marker(latlng, {
      icon: L.divIcon({
        className: "temp-marker",
        html: `<div style="background: ${markerColor}; width: ${isFirstPoint ? '14px' : '10px'}; height: ${isFirstPoint ? '14px' : '10px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.3);"></div>`,
        iconSize: [isFirstPoint ? 14 : 10, isFirstPoint ? 14 : 10]
      })
    }).addTo(this.map);
    this.markers.push(marker);
    if (isFirstPoint) this.firstMarker = marker;
    this.points.push(latlng);
    this.updatePolyline();
    this.showInstructions();
  }

  updatePolyline() {
    if (this.polyline) this.polyline.remove();
    if (this.points.length > 1) {
      this.polyline = L.polyline(this.points, { color: "#ff4444", weight: 3, opacity: 0.8 }).addTo(this.map);
    }
  }

  updateTempPolyline(mousePoint) {
    if (this.tempPolyline) this.tempPolyline.remove();
    if (this.points.length > 0) {
      const tempPoints = [...this.points, mousePoint];
      this.tempPolyline = L.polyline(tempPoints, { color: "#ff4444", weight: 3, dashArray: "5, 10", opacity: 0.6 }).addTo(this.map);
    }
  }

  completePolygon() {
    if (this.isCompleting) return;
    this.isCompleting = true;
    if (this.points.length >= 3) {
      const closedPoints = [...this.points, this.points[0]];
      const polygon = L.polygon(closedPoints, { color: "brown", weight: 3, fillColor: "rgba(139, 69, 19, 0.3)" });
      this.stopDrawing();
      this.onComplete(polygon);
      this.clearAll();
    } else {
      this.onInstructionsChange("❌ Se necesitan al menos 3 puntos para formar un polígono");
      setTimeout(() => { if (this.isDrawing) this.showInstructions(); this.isCompleting = false; }, 2000);
    }
  }

  cancelDrawing() {
    this.stopDrawing();
    this.clearAll();
  }

  showInstructions() {
    if (!this.isDrawing || this.isCompleting) return;
    const pointsCount = this.points.length;
    let message = "";
    if (pointsCount === 0) message = "📍 Haz clic para comenzar el polígono (primer vértice en verde)";
    else if (pointsCount === 1) message = "📍 Haz clic para agregar más vértices";
    else message = `📍 ${pointsCount} vértices dibujados. Haz clic en el PRIMER VÉRTICE (verde) para cerrar el polígono, o ESC para cancelar`;
    this.onInstructionsChange(message);
  }

  clearPolyline() {
    if (this.polyline) this.polyline.remove();
    if (this.tempPolyline) this.tempPolyline.remove();
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.firstMarker = null;
  }

  clearAll() {
    this.clearMarkers();
    this.clearPolyline();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.map.getContainer().style.cursor = "";
    if (this.clickHandler) this.map.off("click", this.clickHandler);
    if (this.mousemoveHandler) this.map.off("mousemove", this.mousemoveHandler);
    if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
    this.onInstructionsChange("");
  }
}

export default FreePolygonDrawer;
EOF

echo "✅ Estructura de MapEditor creada exitosamente en: ./MapEditor"
echo ""
echo "📁 Estructura creada:"
echo "  src/excelUploaderStorage/TableControls/CellStrategies/"
echo "  └── MapEditor/"
echo "      ├── index.jsx (componente principal modularizado)"
echo "      ├── components/"
echo "      │   ├── MiniPolygonPreview.js"
echo "      │   ├── InstructionsPopup.js"
echo "      │   └── controls/"
echo "      │       ├── PolygonRotator.js"
echo "      │       ├── PolygonTranslator.js"
echo "      │       ├── RectangleDrawer.js"
echo "      │       └── FreePolygonDrawer.js"
echo "      └── utils/"
echo "          ├── geometryUtils.js"
echo "          └── leafletUtils.js"
echo ""
echo "⚠️  Nota: El archivo original MapEditor.jsx debe ser reemplazado por el nuevo modulo"
echo "   o puedes importar desde './MapEditor/index'"