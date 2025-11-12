import React from "react";
import {
    Box,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const LargeTableWarning = ({ columns, data }) => {
    return (
        <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.accessor} sx={{ fontWeight: "bold", textAlign: "center" }}>
                                    {column.Header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.slice(0, 4).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <MoreVertIcon sx={{ color: 'gray' }} />
            <Box sx={{ fontWeight: 'bold', color: 'gray', mt: 1 }}>
                editar offline
            </Box>

            <List dense sx={{ color: 'red', mt: 2, textAlign: 'left', display: 'inline-block' }}>
                <ListItem>
                    <ListItemText primary="* !! Hoja muy larga" />
                </ListItem>
                <ListItem>
                    <ListItemText secondary="* Exportar, editar externamente, e importar." />
                </ListItem>

                 <ListItem>
                    <ListItemText secondary="* La fecha de inicio solo es necesaria en la primera fila, correspondera a la hora-minuto 00-00." />
                </ListItem>
                 <ListItem>
                    <ListItemText secondary="* Insertar las lecturas de longitud max. 1 año, con periodo cuartohorario, en la columna 'valor'." />
                </ListItem>

             </List>
        </Box>
    );
};

export default LargeTableWarning;
