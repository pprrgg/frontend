// components/WhatsAppButton.jsx
import React from 'react';
import { Tooltip, Fab } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsAppButton = () => {
  const phoneNumber = '34600366211'; // Reemplaza por tu número
  const message = 'Hola, he visto tu blog y ...';

  return (
    <Tooltip title="Chatear por WhatsApp" arrow placement="left">
      <Fab
        variant="outlined"
        aria-label="whatsapp"
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 16,
          zIndex: 9999,
          border: '2px solid #25D366',       // contorno verde WhatsApp
          backgroundColor: 'transparent',    // sin relleno
          color: '#25D366',                  // ícono verde
          '&:hover': {
            backgroundColor: 'rgba(37, 211, 102, 0.1)', // efecto hover suave
          },
        }}
        onClick={() =>
          window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
        }
      >
        <WhatsAppIcon sx={{ mt: -0.5 }} />
      </Fab>
    </Tooltip>

  );
};

export default WhatsAppButton;
