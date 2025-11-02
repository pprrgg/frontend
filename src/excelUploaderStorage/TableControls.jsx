import React, { useEffect, useMemo, useState } from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    TableContainer,
    Box,
    IconButton
} from "@mui/material";
import CellRenderer from "./TableControls/CellRenderer";

const TableControls = ({
    activeSheet,
    editingCell,
    setEditingCell,
    handleOpenJsonPopup,
    refreshData
}) => {
    const [dataFromSession, setDataFromSession] = useState({});

    const isSheetFullyUppercase = activeSheet === activeSheet?.toUpperCase();
    const allowRowOperations = isSheetFullyUppercase;

    const loadSessionData = () => {
        const stored = JSON.parse(sessionStorage.getItem("excelData")) || {};
        setDataFromSession(stored);
    };

    useEffect(() => {
        loadSessionData();
        const handleStorageChange = () => loadSessionData();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refreshData]);

    const updateSessionData = (newData) => {
        sessionStorage.setItem("excelData", JSON.stringify(newData));
        setDataFromSession(newData);
        window.dispatchEvent(new Event('storage'));
    };

    const columns = useMemo(() => {
        const sheet = dataFromSession[activeSheet];
        if (sheet && sheet.length > 0) {
            return sheet[0].map((_, index) => ({
                Header: sheet[0][index],
                accessor: index.toString(),
            }));
        }
        return [];
    }, [activeSheet, dataFromSession]);

    const data = useMemo(() => {
        const sheet = dataFromSession[activeSheet];
        return sheet ? sheet.slice(1) : [];
    }, [activeSheet, dataFromSession]);

    const handleDuplicateRow = (rowIndex) => {
        if (!allowRowOperations || rowIndex == null) return;
        const updatedData = { ...dataFromSession };
        const sheetData = [...updatedData[activeSheet]];
        const rowToDuplicate = sheetData[rowIndex + 1];
        sheetData.splice(rowIndex + 1, 0, [...rowToDuplicate]);
        updatedData[activeSheet] = sheetData;
        updateSessionData(updatedData);
    };

    const handleDeleteRow = (rowIndex) => {
        if (!allowRowOperations || rowIndex == null) return;
        const updatedData = { ...dataFromSession };
        const sheetData = [...updatedData[activeSheet]];
        if (sheetData.slice(1).length <= 1) {
            alert("No se puede eliminar la última fila.");
            return;
        }
        sheetData.splice(rowIndex + 1, 1);
        updatedData[activeSheet] = sheetData;
        updateSessionData(updatedData);
    };

    const handleMoveRowUp = (rowIndex) => {
        if (!allowRowOperations || rowIndex <= 0) return;
        const updatedData = { ...dataFromSession };
        const sheetData = [...updatedData[activeSheet]];
        const row = sheetData[rowIndex + 1];
        sheetData.splice(rowIndex + 1, 1);
        sheetData.splice(rowIndex, 0, row);
        updatedData[activeSheet] = sheetData;
        updateSessionData(updatedData);
    };

    const handleMoveRowDown = (rowIndex) => {
        if (!allowRowOperations || rowIndex >= data.length - 1) return;
        const updatedData = { ...dataFromSession };
        const sheetData = [...updatedData[activeSheet]];
        const row = sheetData[rowIndex + 1];
        sheetData.splice(rowIndex + 1, 1);
        sheetData.splice(rowIndex + 2, 0, row);
        updatedData[activeSheet] = sheetData;
        updateSessionData(updatedData);
    };

    return (
        <TableContainer component={Paper}>
            <Box sx={{ overflowX: 'auto' }}>
                <Table stickyHeader size="small" aria-label="controlled table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ padding: 0, width: '4px', backgroundColor: 'transparent', borderLeft: '2px solid black' }} />
                            {columns.map((col, idx) => (
                                <TableCell
                                    key={idx}
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#ddd',
                                        maxWidth: 200,
                                        width: 'auto',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {col.Header}
                                </TableCell>
                            ))}
                            {allowRowOperations && (
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#ddd',
                                        textAlign: 'center',
                                        width: 'auto',
                                        minWidth: 80,
                                        maxWidth: 200,
                                        whiteSpace: 'normal'
                                    }}
                                >
                                    Acciones
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} hover>
                                <TableCell sx={{ padding: 0, width: '4px', backgroundColor: 'transparent', borderLeft: '2px solid black' }} />
                                {row.map((cell, cellIndex) => (
                                    <TableCell
                                        key={cellIndex}
                                        sx={{
                                            maxWidth: 200,
                                            width: 'auto',
                                            wordBreak: 'break-word',
                                            verticalAlign: 'middle',
                                            padding: '0 !important',
                                        }}
                                    >
                                        <CellRenderer
                                            activeSheet={activeSheet}
                                            rowIndex={rowIndex}
                                            cellIndex={cellIndex}
                                            dataFromSession={dataFromSession}
                                            editingCell={editingCell}
                                            setEditingCell={setEditingCell}
                                            handleOpenJsonPopup={handleOpenJsonPopup}
                                            updateSessionData={updateSessionData}
                                        />
                                    </TableCell>
                                ))}
                                {allowRowOperations && (
                                    <TableCell
                                        padding="none"
                                        sx={{
                                            width: 40,       // ancho muy estrecho
                                            minWidth: 40,
                                            maxWidth: 40,
                                            whiteSpace: 'normal',
                                            textAlign: 'center',
                                            verticalAlign: 'middle',
                                        }}
                                    >
                                        <Box
                                            display="flex"
                                            flexDirection="column"   // columna principal
                                            justifyContent="center"
                                            alignItems="center"
                                            height="100%"
                                            gap={0.5}               // espacio entre filas
                                        >
                                            {/* Fila superior: dos iconos */}
                                            <Box display="flex" flexDirection="row" gap={0.5}>
                                                <IconButton size="small" onClick={() => handleMoveRowUp(rowIndex)} aria-label="mover arriba">
                                                    <ArrowUpwardIcon fontSize="small" sx={{ color: '#007bff' }} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleMoveRowDown(rowIndex)} aria-label="mover abajo">
                                                    <ArrowDownwardIcon fontSize="small" sx={{ color: '#007bff' }} />
                                                </IconButton>
                                            </Box>

                                            {/* Fila inferior: otros dos iconos */}
                                            <Box display="flex" flexDirection="row" gap={0.5}>
                                                <IconButton size="small" onClick={() => handleDuplicateRow(rowIndex)} aria-label="duplicar fila">
                                                    <ContentCopyIcon fontSize="small" sx={{ color: 'green' }} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteRow(rowIndex)} aria-label="borrar fila">
                                                    <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                )}



                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </TableContainer>
    );
};

export default TableControls;
