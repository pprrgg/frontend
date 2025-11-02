import React, { useEffect, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Usamos un divIcon con HTML que contiene el icono de MUI convertido en SVG
const createMuiIcon = (color = "red", size = 36) => {
  return L.divIcon({
    className: "", // sin clases de Leaflet por defecto
    html: `<svg xmlns="http://www.w3.org/2000/svg" height="${size}" viewBox="0 -960 960 960" width="${size}" fill="${color}">
             <path d="M480-80q-140-121-210-230.5T200-480q0-115 82.5-197.5T480-760q115 0 197.5 82.5T760-480q0 87-70 196.5T480-80Zm0-420Zm0 116q48 0 82-34t34-82q0-48-34-82t-82-34q-48 0-82 34t-34 82q0 48 34 82t82 34Z"/>
           </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // la punta abajo
    popupAnchor: [0, -size],
  });
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  zIndex: 1300,
};

function MapaModal({ open, cerrarModal }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        const mapContainer = document.getElementById('map');

        if (!mapContainer) {
          console.error("¡El contenedor del mapa no se encontró!");
          return;
        }

        if (map) {
          map.remove();
          setMap(null);
        }

        const newMap = L.map(mapContainer).setView([33, -3], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(newMap);

        let marker = null;
        const excelData = JSON.parse(sessionStorage.getItem('excelData'));

        if (excelData && excelData.Coordenadas) {
          const lat = excelData.Coordenadas[1][1];
          const lng = excelData.Coordenadas[2][1];
          marker = L.marker([lat, lng], { icon: createMuiIcon("red", 36) })
            .addTo(newMap)
            .bindPopup(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();
        }

        newMap.on('click', (e) => {
          const { lat, lng } = e.latlng;

          const newExcelData =
            JSON.parse(sessionStorage.getItem('excelData')) || {};
          newExcelData.Coordenadas = [
            ["Parámetro", "Valor"],
            ["lat", lat],
            ["lng", lng],
          ];
          sessionStorage.setItem('excelData', JSON.stringify(newExcelData));

          if (marker) {
            newMap.removeLayer(marker);
          }

          marker = L.marker([lat, lng], { icon: createMuiIcon("red", 36) })
            .addTo(newMap)
            .bindPopup(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();
        });

        setMap(newMap);
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      if (map) {
        map.remove();
        setMap(null);
      }
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={cerrarModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ zIndex: 1300 }}
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={cerrarModal}
          sx={{
            position: 'absolute',
            right: 3,
            top: 3,
            color: 'text.primary',
          }}
        >
          <CloseIcon />
        </IconButton>
        <div id="map" style={{ height: '100%', width: '100%' }}></div>
      </Box>
    </Modal>
  );
}

export default MapaModal;
