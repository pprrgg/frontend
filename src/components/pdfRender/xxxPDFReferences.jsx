import React from 'react';
import { List, ListItem, ListItemText, Link, Typography } from '@mui/material';

const PDFReferences = ({ references }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Referencias
      </Typography>
      <List>
        {references.map((referencia, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                <Link href={referencia.url} target="_blank" rel="noopener noreferrer" underline="hover">
                  {referencia.nombre}
                </Link>
              }
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default PDFReferences;
