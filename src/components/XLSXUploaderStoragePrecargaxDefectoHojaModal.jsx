import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import MapaModal from "./MapaModal";
import JsonEditorModal from "../excelUploaderStorage/JsonEditorModal";
import TableControls from "../excelUploaderStorage/TableControls";
import MenuOptions from "../excelUploaderStorage/MenuOptions";
import LargeTableWarning from "../excelUploaderStorage/LargeTableWarning";

const ExcelUploaderStorage = ({ openx, cerrarModalx, handleRecalculate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [openMapaModal, setOpenMapaModal] = useState(false);
  const [excelDataFromSession, setExcelDataFromSession] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [jsonPopup, setJsonPopup] = useState({
    open: false,
    data: null,
    rowIndex: null,
    cellIndex: null,
    sheetName: null,
    storageKey: "excelData"
  });
  const [localJsonData, setLocalJsonData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMobile = useMediaQuery("(max-width: 600px)");

  const loadSessionData = () => {
    const sessionData = sessionStorage.getItem("excelData");
    if (sessionData) setExcelDataFromSession(JSON.parse(sessionData));
  };

  useEffect(() => { loadSessionData(); }, [openx, refreshKey]);

  useEffect(() => {
    if (excelDataFromSession) {
      const sheetNames = Object.keys(excelDataFromSession).filter(s => s !== "Coordenadas");
      if (activeTab >= sheetNames.length) setActiveTab(0);
    }
  }, [excelDataFromSession]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const handleOpenMapaModal = () => setOpenMapaModal(true);
  const handleCloseMapaModal = () => setOpenMapaModal(false);

  const handleFileUpload = (file) => {
    if (!file) return;

    sessionStorage.removeItem("excelData");
    setExcelDataFromSession(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        const filledSheet = sheet.map((row) =>
          row.map((cell) => {
            if (cell === null || cell === undefined) return " ";
            return typeof cell === 'string' && !isNaN(cell) && cell.trim() !== "" ?
              Number(cell) : cell;
          })
        );
        const filteredSheet = filledSheet.filter((row) => row.some((cell) => cell !== ""));
        sheetsData[sheetName] = filteredSheet;
      });

      sessionStorage.setItem("excelData", JSON.stringify(sheetsData));
      setExcelDataFromSession(sheetsData);
      setRefreshKey(prev => prev + 1);
      toast.success("¡Archivo cargado correctamente!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportar = () => {
    const ep = JSON.parse(sessionStorage.getItem('selectedFicha') || 'null');
    if (!ep || !ep.cod) {
      toast.error("No se encontró el código de referencia para validar el archivo.");
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file || !file.name.toLowerCase().includes(ep.cod.toLowerCase())) {
        toast.error(`El archivo debe ser 'WB_${ep.cod}_******** '.`);
        document.body.removeChild(fileInput);
        return;
      }
      handleFileUpload(file);
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleExport = () => {
    const sessionData = JSON.parse(sessionStorage.getItem("excelData"));
    const wb = XLSX.utils.book_new();

    const convertCellValue = (value) => {
      if (!isNaN(value) && value !== null && value !== "") {
        const num = Number(value);
        return isFinite(num) ? num : value;
      }
      return value;
    };

    Object.keys(sessionData).forEach((sheetName) => {
      const sheetData = sessionData[sheetName].map((row) =>
        row.map((cell) => convertCellValue(cell))
      );
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const ep = JSON.parse(sessionStorage.getItem('selectedFicha') || 'null');
    const formattedDate = new Date().toISOString().slice(0, 10);
    const fileName = `IT_${ep?.cod || "Export"}_${formattedDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleSaveJson = () => {
    const sessionData = JSON.parse(sessionStorage.getItem("excelData"));
    const newSessionData = { ...sessionData };
    const sheetData = [...newSessionData[jsonPopup.sheetName]];

    const originalData = sheetData[jsonPopup.rowIndex + 1][jsonPopup.cellIndex];
    let originalJson;
    try {
      originalJson = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
    } catch { originalJson = {}; }

    const updatedJson = {};
    Object.keys(originalJson).forEach(key => {
      updatedJson[key] = localJsonData[key] !== undefined ? localJsonData[key] : originalJson[key];
    });

    sheetData[jsonPopup.rowIndex + 1][jsonPopup.cellIndex] = JSON.stringify(updatedJson);
    newSessionData[jsonPopup.sheetName] = sheetData;

    sessionStorage.setItem("excelData", JSON.stringify(newSessionData));
    setExcelDataFromSession(newSessionData);
    setJsonPopup({ ...jsonPopup, open: false, data: updatedJson });
    setRefreshKey(prev => prev + 1);
  };

  const refreshParentData = () => {
    const updatedData = JSON.parse(sessionStorage.getItem("excelData"));
    setExcelDataFromSession(updatedData);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={openx}
        onClose={cerrarModalx}
        transitionDuration={300}
        PaperProps={{
          sx: {
            width: isMobile ? '99%' : '99%',
            height: isMobile ? 'calc(100% - 110px)' : 'calc(100% - 110px)', // 👈 resta 55px arriba + 55px abajo
            borderRadius: isMobile ? '16px 16px 0 0' : 0,
            top: isMobile ? 'auto' : '55px',
            bottom: isMobile ? 'auto' : '55px', // 👈 igual separación inferior
            margin: isMobile ? 'auto' : 0,
            boxShadow: isMobile ? '0px -5px 20px rgba(0,0,0,0.3)' : 'none',
            p: 1,
            position: 'fixed', // 👈 asegúrate de que se posicione respecto a la ventana
            overflow: 'hidden'
          }
        }}

        ModalProps={{ sx: { zIndex: 1300 } }}
      >
        <IconButton
          onClick={cerrarModalx}
          sx={{
            position: 'absolute',
            top: 8,
            right: 22,
            zIndex: 1500,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)' },
            width: 40,
            height: 40
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>

        <MenuOptions
          isMobile={isMobile}
          handleImportar={handleImportar}
          handleExport={handleExport}
          handleOpenMapaModal={handleOpenMapaModal}
          handleRecalculate={handleRecalculate}
          handleClose={cerrarModalx}
        />

        {excelDataFromSession && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Tabs */}
            <Box sx={{ overflowX: 'auto', borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': { minWidth: 100, fontSize: '0.8rem', px: 1, py: 1.5, maxWidth: '150px' }
                }}
              >
                {Object.keys(excelDataFromSession)
                  .filter(sheet => sheet !== "Coordenadas")
                  .map((sheet, index) => (
                    <Tab key={index} label={sheet.length > 15 ? `${sheet.substring(0, 12)}...` : sheet} />
                  ))}
              </Tabs>
            </Box>

            {/* Contenedor de la tabla con scroll */}
            <Box
              sx={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'auto',
                p: 0.5,
                // maxHeight: '70vh',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#bdbdbd',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#9e9e9e',
                },
              }}
            >

              {(() => {
                const sheetNames = Object.keys(excelDataFromSession).filter(s => s !== "Coordenadas");
                const activeSheet = sheetNames[activeTab];
                const data = excelDataFromSession[activeSheet] || [];
                const columns = data[0]?.map((_, index) => `C${index + 1}`) || [];
                const isTooLargeSheet = data.length > 100;

                return isTooLargeSheet ? (
                  <LargeTableWarning columns={columns} data={data.slice(0, 3)} isMobile={true} />
                ) : (
                  <Box sx={{
                    minWidth: '100%',
                    width: 'max-content',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: 'background.paper',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <TableControls
                      activeSheet={activeSheet}
                      editingCell={editingCell}
                      setEditingCell={setEditingCell}
                      handleOpenJsonPopup={(jsonData, rowIndex, cellIndex) => {
                        setLocalJsonData(jsonData);
                        setJsonPopup({
                          open: true,
                          data: jsonData,
                          rowIndex,
                          cellIndex,
                          sheetName: activeSheet,
                          storageKey: "excelData"
                        });
                      }}
                      jsonPopup={jsonPopup}
                      setJsonPopup={setJsonPopup}
                      refreshData={refreshKey}
                      isMobile={true}
                      containerWidth="100%"
                      forceMobileLayout={true}
                    />

                    {data.length > 6 && (
                      <Box sx={{ textAlign: 'center', py: 0.5, color: 'text.secondary', fontSize: '0.7rem', background: 'linear-gradient(transparent, #f5f5f5)' }}>
                        ⬅️ Desliza para ver más datos ➡️
                      </Box>
                    )}

                    <Box sx={{ flexShrink: 0, px: 1, py: 0.5, backgroundColor: 'primary.light', color: 'white', fontSize: '0.7rem', borderRadius: '0 0 4px 4px', textAlign: 'center' }}>
                      {data.length} filas • {columns.length} columnas
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          </Box>
        )}
      </Drawer>

      <JsonEditorModal
        jsonPopup={jsonPopup}
        setJsonPopup={setJsonPopup}
        localJsonData={localJsonData}
        setLocalJsonData={setLocalJsonData}
        handleSaveJson={handleSaveJson}
        refreshParentData={refreshParentData}
      />

      <MapaModal open={openMapaModal} cerrarModal={handleCloseMapaModal} />
      <ToastContainer />
    </>
  );
};

export default ExcelUploaderStorage;
