import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import {
  Calculate as CalculateIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Map as MapIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";

const fuchsiaColor = "#D100D1";

const BottomMenuResponsive = ({
  handleImportar,
  handleExport,
  handleOpenMapaModal,
  handleRecalculate,
  handleClose,
}) => {
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [hasCoords, setHasCoords] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("excelData"));
      setHasCoords(data?.Coordenadas !== undefined && data?.Coordenadas !== null);
    } catch (e) {
      setHasCoords(false);
    }
  }, []);

  const menuOptions = [
    { label: "Importar", icon: <CloudUploadIcon />, onClick: handleImportar },
    { label: "Exportar", icon: <CloudDownloadIcon />, onClick: handleExport },
    ...(hasCoords ? [{ label: "Ubicación", icon: <MapIcon />, onClick: handleOpenMapaModal }] : []),
    { label: "Recalcular", icon: <CalculateIcon />, onClick: handleRecalculate },
    { label: "Cerrar", icon: <CloseIcon />, onClick: handleClose },
  ];

  return (
<BottomNavigation
  value={value}
  onChange={(event, newValue) => {
    setValue(newValue);
    menuOptions[newValue]?.onClick();
  }}
  showLabels
  sx={{
    width: "100%",
    position: "fixed",
    bottom: 0,
    bgcolor: "#fff",
    borderTop: "1px solid #ddd",
    zIndex: 2000, // 👈 siempre por encima de todo
    boxShadow: "0 -2px 8px rgba(0,0,0,0.1)", // leve sombra superior
  }}
>

      {menuOptions.map(({ label, icon }, index) => (
        <BottomNavigationAction
          key={label}
          label={label}
          icon={icon}
          sx={{
            color: value === index ? fuchsiaColor : "gray",
            "&.Mui-selected": { color: fuchsiaColor },
          }}
        />
      ))}
    </BottomNavigation>
  );
};

export default BottomMenuResponsive;
