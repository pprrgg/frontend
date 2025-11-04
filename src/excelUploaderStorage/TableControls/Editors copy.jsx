import React from "react";
import { TextField, Select, MenuItem, Checkbox } from "@mui/material";

const Editors = ({
    cellValue,
    editingValue,
    setEditingValue,
    saveEditing,
    setEditingCell,
    isSheetEditable
}) => {
    const cellStr = String(cellValue).trim();

    if (typeof cellValue === 'string') {
        if (cellStr.includes(';')) {
            const options = cellStr.split(';').map(opt => opt.trim());
            const isBooleanOptions = options.length === 2 &&
                options.some(opt => opt.toLowerCase() === 'true') &&
                options.some(opt => opt.toLowerCase() === 'false');

            if (isBooleanOptions) {
                return (
                    <Checkbox
                        checked={editingValue.toLowerCase() === 'true'}
                        onChange={(e) => {
                            const newVal = e.target.checked ? 'True;False' : 'False;True';
                            setEditingValue(newVal);
                        }}
                        disabled={!isSheetEditable}
                    />
                );
            }

            return (
                <Select
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    size="small"
                    sx={{ width: '100%' }}
                    autoFocus
                >
                    {options.map((option, i) => (
                        <MenuItem key={i} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            );
        }

        if (cellStr.startsWith('!')) {
            return (
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEditing()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing();
                        else if (e.key === 'Escape') setEditingCell(null);
                    }}
                    variant="outlined"
                />
            );
        }

        return (
            <TextField
                autoFocus
                fullWidth
                size="small"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => saveEditing()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditing();
                    else if (e.key === 'Escape') setEditingCell(null);
                }}
                variant="outlined"
            />
        );
    }

    if (typeof cellValue === 'number') {
        return (
            <TextField
                autoFocus
                fullWidth
                size="small"
                type="number"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => saveEditing()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditing();
                    else if (e.key === 'Escape') setEditingCell(null);
                }}
                variant="outlined"
            />
        );
    }

    if (typeof cellValue === 'object' && cellValue !== null) {
        return (
            <TextField
                autoFocus
                fullWidth
                multiline
                minRows={3}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => {
                    try {
                        const parsed = JSON.parse(editingValue);
                        saveEditing(parsed);
                    } catch { }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        try {
                            const parsed = JSON.parse(editingValue);
                            saveEditing(parsed);
                        } catch { }
                    } else if (e.key === 'Escape') {
                        setEditingCell(null);
                    }
                }}
                variant="outlined"
            />
        );
    }

    return null;
};

export default Editors;