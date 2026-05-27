import React from "react";
import { Container, Grid, Typography, Box } from "@mui/material";

export default function AboutSection() {
  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              mt: 3,
              fontWeight: "bold",
              color: "#007BFF",
            }}
          >
            ¿Qué es?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            Un espacio en línea donde se comparten informes técnicos
            "aplantillados" para recibir parámetros y adaptarse
            automáticamente a distintos contextos o necesidades.
          </Typography>

          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "#007BFF" }}
          >
            Pasión
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
          >
            Este proyecto mantiene viva la pasión por la ingeniería
            y por el aprendizaje constante. Cada estudio técnico refleja
            el aprecio por una disciplina que continúa inspirando curiosidad.
          </Typography>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "#007BFF" }}
          >
            Propósito
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            El objetivo es que estos materiales resulten útiles y
            sirvan de inspiración. Que quienes lleguen aquí
            encuentren no solo herramientas técnicas, sino también
            la motivación para crear más informes técnicos.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "bold",
              color: "#1976d2",
            }}
          >
            Principios que guían este proyecto
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
              💝 Más que una simple actividad: una forma de bienestar integral.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
              🌱 Cultivar y mantener la curiosidad.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
              🔧 Preservar la esencia de la ingeniería práctica.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
              🤝 Contribuir con soluciones útiles y simples.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
              ✨ Disfrutar del aprendizaje continuo.
            </Typography>
          </Box>

          {/* Mensaje adicional */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "rgba(0, 123, 255, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(0, 123, 255, 0.3)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", textAlign: "center" }}
            >
              "No dejes que las ideas se queden guardadas: ayudanos a crear un nuevo estudio y compártelo con el resto."
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
