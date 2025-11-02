import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingIndicator = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress sx={{ color: 'white' }}/>
      cargando
    </div>
  );
};

export default LoadingIndicator;
