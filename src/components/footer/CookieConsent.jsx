import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, Box, Button, Typography } from '@mui/material';
import PrivacyPolicy from './PolíticadePrivacidad';
import TermsOfUse from './TérminosdeUso';

const CookieConsent = ({ children }) => {
  const [openModal, setOpenModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setOpenModal(true);
    } else {
      setHasConsented(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setOpenModal(false);
    setHasConsented(true);
  };

  const togglePolicy = () => {
    setShowPolicy(!showPolicy);
    setShowTerms(false);
  };

  const toggleTerms = () => {
    setShowTerms(!showTerms);
    setShowPolicy(false);
  };

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenModal(false);
    }
  };

  return (
    <div>
      {!hasConsented ? (
        <>
          <Dialog open={openModal} onClose={handleClose}>
            <DialogTitle>Aviso de Cookies</DialogTitle>
            <DialogContent>
              <Typography>
                Este sitio utiliza cookies para mejorar tu experiencia. Al continuar navegando, aceptas el uso de cookies.
                Consulta nuestra{' '}
                <Button onClick={togglePolicy} variant="text">Política de Privacidad</Button> y los{' '}
                <Button onClick={toggleTerms} variant="text">Términos de Uso</Button>.
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button onClick={acceptCookies} variant="contained" color="primary">
                  Aceptar
                </Button>
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog open={showPolicy} onClose={togglePolicy}>
            <DialogTitle>Política de Privacidad</DialogTitle>
            <DialogContent>
              <PrivacyPolicy />
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button onClick={togglePolicy} variant="outlined" color="error">
                  Cerrar
                </Button>
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog open={showTerms} onClose={toggleTerms}>
            <DialogTitle>Términos de Uso</DialogTitle>
            <DialogContent>
              <TermsOfUse />
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button onClick={toggleTerms} variant="outlined" color="error">
                  Cerrar
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};

export default CookieConsent;
