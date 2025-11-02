import React, { useEffect, useState } from 'react';
import { Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DoctecEmbed = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // const url = 'https://doctec.duckdns.org/nodered';
  const url = 'https://doctec.duckdns.org/';

  useEffect(() => {
    toast.info(
      <div>
        <strong>Usuario de prueba:</strong><br />
        Username: dd@dd.dd<br />
        Password: dddddd
      </div>, {
      position: 'top-right',
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // Probar conexión con fetch (mode no-cors para evitar bloqueos CORS)
    fetch(url, { mode: 'no-cors' })
      .then(() => {
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  return (
    <>
      <Card sx={{ height: '90vh', width: '100%', mt: '64px', position: 'relative' }}>
        <CardContent sx={{ height: '100%', padding: 0, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}>
              <CircularProgress color="inherit" sx={{ color: "black" }} />
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              textAlign: 'center',
              padding: 20,
            }}>
              <Typography variant="h4" gutterBottom>
                😵‍💫
              </Typography>
              <Typography variant="h6">
                ¡Ups! No se pudo cargar el contenido.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Por favor, verifica tu conexión o intenta recargar.
              </Typography>
            </div>
          )}

          {!loading && !error && (
            <iframe
              src={url}
              title="Doctec"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          )}
        </CardContent>
      </Card>
      <ToastContainer />
    </>
  );
};

export default DoctecEmbed;
