import React from 'react';
import { IconButton } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';

const PDFToolbar = ({ onSettingsClick, onDownloadClick, isAuthenticated }) => {
  return (
    <>
      <IconButton
        onClick={onSettingsClick}
        color="success"
        style={{
          position: 'fixed',
          top: '50%',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <TuneIcon />
      </IconButton>

      <IconButton
        onClick={onDownloadClick}
        color="success"
        style={{
          position: 'fixed',
          top: '60%',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <DownloadIcon />
      </IconButton>
    </>
  );
};

export default PDFToolbar;
