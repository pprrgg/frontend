import React, { useState } from "react";
import JSONButtonRenderer from "./JSONButtonRenderer";
import Editors from "./Editors";
import { Checkbox, Select, MenuItem } from "@mui/material";

const CellRenderer = ({
    activeSheet,
    rowIndex,
    cellIndex,
    dataFromSession,
    editingCell,
    setEditingCell,
    handleOpenJsonPopup,
    updateSessionData
}) => {
    const [editingValue, setEditingValue] = useState("");
    
    const isSheetEditable = (sheetName) => sheetName && sheetName.length > 0;
    
    const getCurrentCellValue = () => {
        const sheet = dataFromSession[activeSheet];
        if (!sheet || !sheet[rowIndex + 1]) return null;
        return sheet[rowIndex + 1][cellIndex];
    };

    const handleChangeValue = (newValue, hasPrefix = false) => {
        const updatedData = { ...dataFromSession };
        const sheetData = [...updatedData[activeSheet]];
        sheetData[rowIndex + 1][cellIndex] = hasPrefix && typeof newValue === 'string' ? `!${newValue}` : newValue;
        updateSessionData(updatedData);
    };

    const handleCheckboxToggle = () => {
        if (!isSheetEditable(activeSheet)) return;
        const updatedData = { ...dataFromSession };
        const sheetData = [...updatedData[activeSheet]];
        const currentValue = sheetData[rowIndex + 1][cellIndex];
        const options = currentValue.split(';').map(s => s.trim());
        const isChecked = options[0].toLowerCase() === 'true';
        const newValue = isChecked ? 'False;True' : 'True;False';
        sheetData[rowIndex + 1][cellIndex] = newValue;
        updateSessionData(updatedData);
    };

    const startEditing = () => {
        if (!isSheetEditable(activeSheet)) return;
        const cellValue = getCurrentCellValue();
        const cellStr = String(cellValue).trim();
        const isNonEditableString = typeof cellValue === 'string' &&
            !cellStr.includes(';') &&
            !cellStr.startsWith('!') &&
            !cellStr.startsWith('{');
        if (isNonEditableString) return;
        
        if (typeof cellValue === 'string' && cellValue.startsWith('!')) {
            setEditingValue(cellValue.substring(1));
        } else {
            setEditingValue(cellValue);
        }
        setEditingCell({ row: rowIndex, cell: cellIndex });
    };

    const saveEditing = (forcedValue = null) => {
        const originalValue = getCurrentCellValue();
        const hasPrefix = typeof originalValue === 'string' && originalValue.startsWith('!');
        let valueToSave = forcedValue !== null ? forcedValue : editingValue;

        if (typeof originalValue === 'number') {
            const parsedNumber = Number(valueToSave);
            valueToSave = isNaN(parsedNumber) ? 0 : parsedNumber;
        }

        handleChangeValue(valueToSave, hasPrefix);
        setEditingCell(null);
    };

    const cellValue = getCurrentCellValue();
    if (cellValue == null) return null;

    const cellStr = String(cellValue).trim();

    // JSON con botón para editar
    if (cellStr.startsWith('{') && cellStr.endsWith('}')) {
        return <JSONButtonRenderer 
            cellValue={cellValue} 
            rowIndex={rowIndex} 
            cellIndex={cellIndex} 
            handleOpenJsonPopup={handleOpenJsonPopup} 
        />;
    }

    // Editando celda activa
    if (editingCell?.row === rowIndex && editingCell.cell === cellIndex) {
        return <Editors 
            cellValue={cellValue}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            saveEditing={saveEditing}
            setEditingCell={setEditingCell}
            isSheetEditable={isSheetEditable(activeSheet)}
        />;
    }

    // No en edición:
    if (typeof cellValue === 'string' && cellStr.includes(';')) {
        const options = cellStr.split(';').map(opt => opt.trim());
        const isBooleanOptions = options.length === 2 &&
            options.some(opt => opt.toLowerCase() === 'true') &&
            options.some(opt => opt.toLowerCase() === 'false');

        if (isBooleanOptions) {
            return (
                <Checkbox
                    checked={options[0].toLowerCase() === 'true'}
                    onChange={handleCheckboxToggle}
                    disabled={!isSheetEditable(activeSheet)}
                />
            );
        }

        if (isSheetEditable(activeSheet)) {
            return (
                <Select
                    value={options[0]}
                    onChange={(e) => {
                        const selected = e.target.value;
                        const updatedData = { ...dataFromSession };
                        const sheetData = [...updatedData[activeSheet]];
                        const cellVal = sheetData[rowIndex + 1][cellIndex];
                        const allOptions = cellVal.split(';').map(s => s.trim());
                        const reordered = [selected, ...allOptions.filter(opt => opt !== selected)].join(';');
                        sheetData[rowIndex + 1][cellIndex] = reordered;
                        updateSessionData(updatedData);
                    }}
                    size="small"
                    sx={{ width: '100%', color: 'black' }}
                >
                    {options.map((opt, i) => (
                        <MenuItem key={i} value={opt}>
                            {opt}
                        </MenuItem>
                    ))}
                </Select>
            );
        } else {
            return <div style={{ color: 'gray' }}>{options[0]}</div>;
        }
    }

    if (typeof cellValue === 'string' && cellStr.startsWith('!')) {
        return (
            <div
                onClick={startEditing}
                style={{ cursor: isSheetEditable(activeSheet) ? 'pointer' : 'default', padding: '8px' }}
            >
                {cellStr.substring(1)}
            </div>
        );
    }

    if (!isNaN(parseFloat(cellValue)) && isFinite(cellValue)) {
        return (
            <div
                onClick={startEditing}
                style={{
                    cursor: isSheetEditable(activeSheet) ? 'pointer' : 'default',
                    padding: '8px'
                }}
            >
                {cellValue}
            </div>
        );
    }

    return (
        <div
            onClick={startEditing}
            style={{
                cursor: isSheetEditable(activeSheet) ? 'pointer' : 'default',
                padding: '8px',
                color: 'black'
            }}
        >
            {cellValue}
        </div>
    );
};

export default CellRenderer;