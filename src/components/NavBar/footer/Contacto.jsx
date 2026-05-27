import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../configURL";

const ContactoSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    requestType: "",
    area: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔴 VALIDACIÓN
    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      !formData.requestType
    ) {
      toast.error("Completa los campos *obligatorios");
      return;
    }

    
    setLoading(true);
    toast.info("Enviando formulario...");

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataToSend.append(
          key === "requestType" ? "request_type" : key,
          value
        )
      );

      const response = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        toast.error("Error del servidor. No se pudo enviar.");
        return;
      }

      const data = await response.json();

      if (data.status !== "ok") {
        toast.error(data.message || "Error al enviar el formulario");
        return;
      }

      toast.success("Formulario enviado correctamente");
      toast.success("Gracias por contactarnos. Te responderemos pronto.");

      setFormData({
        name: "",
        email: "",
        organization: "",
        requestType: "",
        area: "",
        message: "",
      });

    } catch (error) {
      toast.error("Error de conexión. Inténtalo más tarde.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔔 TOAST SIEMPRE VISIBLE */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        style={{
          top: "80px",        // ⬅️ justo debajo de la navbar
          zIndex: 9999,       // ⬅️ por encima de todo
        }}
      />

      <Box sx={{ bgcolor: "white", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 5,
              fontFamily: "'Playfair Display', serif",
              position: "relative",
            }}
          >
            Contacto
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              backgroundColor: "#fff",
              p: { xs: 3, md: 4 },
              borderRadius: "12px",
              boxShadow: 3,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="*Nombre completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="*Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Entidad / Empresa"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>*Objeto</InputLabel>
                  <Select
                    name="requestType"
                    value={formData.requestType}
                    label="Objeto"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Selecciona una opción</em>
                    </MenuItem>
                    <MenuItem value="contribuir">Contribuir</MenuItem>
                    <MenuItem value="InformePersonalizado">
                      Informe Personalizado
                    </MenuItem>
                    <MenuItem value="ProyectoCompleto">
                      Proyecto Completo
                    </MenuItem>
                    <MenuItem value="asesoria">Asesoría</MenuItem>
                    <MenuItem value="otros">Otros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Área</InputLabel>
                  <Select
                    name="area"
                    value={formData.area}
                    label="Área"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Selecciona un área</em>
                    </MenuItem>
                    <MenuItem value="contratos">Contratos</MenuItem>
                    <MenuItem value="instalaciones">Instalaciones</MenuItem>
                    <MenuItem value="energias-renovables">
                      Energías renovables
                    </MenuItem>
                    <MenuItem value="CAEs">CAEs</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="*Mensaje"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} textAlign="center">
                <Box
                  component="button"
                  type="submit"
                  disabled={loading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "#fff",
                    px: 5,
                    py: 1.5,
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    "Enviar"
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ContactoSection;
