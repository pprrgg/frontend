import { Container, Typography, Grid, Paper, Box } from "@mui/material";

import BoltIcon from "@mui/icons-material/Bolt";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import EvStationIcon from "@mui/icons-material/EvStation";
import SavingsIcon from "@mui/icons-material/Savings";
import VerifiedIcon from "@mui/icons-material/Verified"; // Icono para Certificados

const features = [
  {
    icon: <BoltIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
    title: "Optimización de Factura Eléctrica",
    description:
      "Analiza tu consumo y recibe recomendaciones para reducir tu factura eléctrica.",
  },
  {
    icon: <SolarPowerIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
    title: "Energía Solar",
    description:
      "Recibe informes sobre cómo implementar soluciones solares eficientes y sostenibles.",
  },
  {
    icon: <EvStationIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
    title: "Cargadores para Vehículos Eléctricos",
    description:
      "Informes sobre instalación y optimización de puntos de recarga para vehículos eléctricos.",
  },
  {
    icon: <SavingsIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
    title: "Eficiencia Energética",
    description:
      "Conoce cómo mejorar el rendimiento energético de tu hogar o empresa con recomendaciones prácticas.",
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
    title: "Certificados de Ahorro Energético (CAEs)",
    description:
      "Genera los documentos para obtener Certificados de Ahorro Energético que demuestran las mejoras en eficiencia energética de tu instalación.",
  },
];

export default function CamposSection() {
  return (
    <Container id="features" sx={{ py: { xs: 6, md: 8, lg: 10 } }}>
      <Typography
        variant="h2"
        align="center"
        sx={{
          mb: { xs: 4, md: 6 },
          fontFamily: "'Playfair Display', serif",
          position: "relative",
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 80,
            height: 3,
            background: "#ffb300",
            bottom: -15,
            left: "50%",
            transform: "translateX(-50%)",
          },
        }}
      >
        Funcionalidades Principales
      </Typography>

      <Grid container spacing={4} alignItems="stretch">
        {features.map((feature, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                borderRadius: 2,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>

              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
