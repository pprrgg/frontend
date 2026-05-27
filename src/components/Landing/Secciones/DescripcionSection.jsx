import React from "react";
import { Container, Card, Typography, Link, Grid, Box } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import TableChartIcon from "@mui/icons-material/TableChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BuildIcon from "@mui/icons-material/Build";
import EuroSymbolIcon from "@mui/icons-material/EuroSymbol";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import EngineeringIcon from "@mui/icons-material/Engineering";
import DescriptionIcon from "@mui/icons-material/Description";

const DescripcionSection = () => {
  const features = [
    {
      icon: (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <EuroSymbolIcon sx={{ fontSize: 50, color: "#ff9800" }} />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: 2,
              backgroundColor: "#ff9800",
              transform: "rotate(45deg)",
              transformOrigin: "center",
            }}
          />
        </Box>
      ),
      title: "100% Gratuito",
      description:
        "La aplicación es completamente gratuita para todos los usuarios, sin pagos ocultos ni suscripciones.",
    },
    {
      icon: <PersonOffIcon sx={{ fontSize: 50, color: "#ff9800" }} />,
      title: "Sin Registro",
      description:
        "Puedes usar la aplicación sin necesidad de crear una cuenta ni proporcionar datos personales.",
    },
    {
      icon: <CloudOffIcon sx={{ fontSize: 50, color: "#ff9800" }} />,
      title: "Cloud-free / Sin nube",
      description:
        "Máxima seguridad y privacidad. Tus datos no se almacenan en la nube ni en servidores externos.",
    },
    {
      icon: <PictureAsPdfIcon sx={{ fontSize: 50, color: "red" }} />,
      title: "Descarga de Informes PDF",
      description: "Obtén documentos PDF con informes técnicos personalizados.",
    },
    {
      icon: <TableChartIcon sx={{ fontSize: 50, color: "#217346" }} />,
      title: "Importar y Exportar en Excel",
      description:
        "Guarda tus sesiones localmente. Puedes importar/exportar tus datos en archivos Excel.",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
      title: "Informes Estándar",
      description:
        "Los informes estándar se están ampliando continuamente para cubrir más temas.",
    },
    {
      icon: <BuildIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
      title: "Informes Personalizados",
      description:
        "Si tu estudio no está disponible, contáctanos y lo generaremos a medida para ti.",
    },
    {
      icon: (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <EngineeringIcon sx={{ fontSize: 50, color: "#1976d2" }} />
          <DescriptionIcon
            sx={{
              fontSize: 28,
              color: "#1976d2",
              position: "absolute",
              bottom: -5,
              right: -10,
            }}
          />
        </Box>
      ),
      title: "Proyecto Completo",
      description:
        "Nos encargargamos de todo: \
elaboramos el proyecto completo de tu instalación, \
te damos asesoría personalizada y te ofrecemos soluciones profesionales pensadas para garantizarte seguridad, eficiencia y tranquilidad...",
    },
  ];

  return (
    <Container id="descripcion" sx={{ py: { xs: 6, md: 8, lg: 10 } }}>
      <Typography
        variant="h2"
        align="center"
        sx={{
          mb: { xs: 4, md: 6 },
          fontFamily: "'Playfair Display', serif",
          position: "relative",
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          "&::after": {
            content: "''",
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
        Obtén tu informe con plantillas inteligentes que se adaptan a ti.
        {/* Genera informes dinámicos: Elige una plantilla, cambiale los parámetros y el sistema recalcula todo por ti. */}
        {/* Plataforma para personalizar informes técnico-económicos a partir de plantillas. */}
      </Typography>

      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {features.map((feature, index) => (
          <Grid k
          ey={index} item xs={12} md={6} lg={4}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                p: 3,
                borderTop: "4px solid",
                borderColor: "primary.main",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h5" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DescripcionSection;
