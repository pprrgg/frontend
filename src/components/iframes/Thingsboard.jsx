import React, { useEffect, useState } from 'react';
import { Card, CardContent, CircularProgress, Typography, Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DoctecEmbed = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false); // estado para la sesión
  const url = 'https://tb.doctec.duckdns.org/';


  
  useEffect(() => {
    // toast.info(
    //   <div>
    //     <strong>Usuario invitado:</strong><br />
    //     Username: vatiacoblog@gmail.com<br />
    //     Password: invitado
    //   </div>, {
    //   position: 'top-right',
    //   autoClose: 10000,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   progress: undefined,
    // });

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

    // Listener para recibir postMessage desde el iframe
    const handleMessage = (event) => {
      // 🔹 Opcional: verificar origen event.origin === 'https://doctec.duckdns.org'
      if (event.data?.loggedIn) {
        setLoggedIn(true);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <Card sx={{ height: '100vh', width: '100%', mt: '0px', position: 'relative' }}>
        <CardContent sx={{ height: '100%', padding: 0, position: 'relative' }}>
          {/* Botón que se muestra solo si hay sesión */}
          {/* {loggedIn && ( */}


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
