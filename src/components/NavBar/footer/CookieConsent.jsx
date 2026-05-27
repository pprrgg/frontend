import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControlLabel,
  Switch,
  Link,
} from "@mui/material";
import CookieIcon from "@mui/icons-material/Cookie";
import SettingsIcon from "@mui/icons-material/Settings";

const CookieConsent = ({ children }) => {
  const [cookieOpen, setCookieOpen] = useState(false);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({
    necesarias: true,
    rendimiento: false,
    funcionalidad: false,
    publicidad: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setCookieOpen(true);
    } else {
      setHasConsented(true);
    }
  }, []);

  const handleCookieAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setCookieOpen(false);
    setHasConsented(true);
  };

  const handleCookieSettingsSave = () => {
    localStorage.setItem(
      "cookieConsentSettings",
      JSON.stringify(cookieSettings)
    );
    setCookieSettingsOpen(false);
    setCookieOpen(false);
    setHasConsented(true);
  };

  return (
    <div>
      {!hasConsented && cookieOpen && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            zIndex: 1300,
            bgcolor: "#0d47a1",
            color: "white",
            borderRadius: 0,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="body2" gutterBottom>
                  Utilizamos cookies propias y de terceros para mejorar nuestros
                  servicios y analizar el uso del sitio.
                </Typography>
                <Typography variant="body2">
                  Puede obtener más información en nuestra{" "}
                  <Link
                    href="https://www.allaboutcookies.org/es/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "#ffb300", textDecoration: "underline" }}
                  >
                    Política de Cookies
                  </Link>
                  .
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleCookieAccept}
                  startIcon={<CookieIcon />}
                >
                  Aceptar
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setCookieSettingsOpen(true)}
                  startIcon={<SettingsIcon />}
                >
                  Configurar
                </Button>
              </Box>
            </Box>
          </Container>
        </Paper>
      )}

      {/* Cookie Settings Dialog */}
      <Dialog
        open={cookieSettingsOpen}
        onClose={() => setCookieSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CookieIcon />
            Configuración de Cookies
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Puede gestionar sus preferencias de cookies aquí. Las cookies
            necesarias son esenciales para el funcionamiento del sitio y no se
            pueden desactivar.
          </Typography>

          {["Necesarias", "Rendimiento", "Funcionalidad", "Publicidad"].map(
            (type) => (
              <Paper
                key={type}
                sx={{ p: 2, mb: 2, bgcolor: "#f8fafc", borderRadius: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1">{`Cookies ${type}`}</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cookieSettings[type.toLowerCase()]}
                        onChange={(e) =>
                          setCookieSettings({
                            ...cookieSettings,
                            [type.toLowerCase()]: e.target.checked,
                          })
                        }
                        disabled={type === "Necesarias"}
                      />
                    }
                    label=""
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {type === "Necesarias" &&
                    "Estas cookies son esenciales para el funcionamiento básico del sitio web y no se pueden desactivar."}
                  {type === "Rendimiento" &&
                    "Estas cookies nos permiten contar visitas y fuentes de tráfico para medir y mejorar el rendimiento."}
                  {type === "Funcionalidad" &&
                    "Permiten ofrecer una experiencia más personalizada, recordando sus preferencias y configuraciones."}
                  {type === "Publicidad" &&
                    "Estas cookies pueden ser establecidas a través de nuestro sitio por nuestros socios publicitarios."}
                </Typography>
              </Paper>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCookieSettingsOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCookieSettingsSave}
            color="primary"
          >
            Guardar Preferencias
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render children si ya se dio consentimiento */}
      {hasConsented && children}
    </div>
  );
};

export default CookieConsent;
