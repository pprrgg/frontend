import React from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import SettingsIcon from "@mui/icons-material/Settings";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useNavigate } from "react-router-dom";

const processSteps = [
  {
    icon: <NoteAltOutlinedIcon fontSize="large" />,
    title: "Elige una plantilla",
    description:
      "Selecciona la plantilla de estudio técnico que mejor se ajuste a tus necesidades.",
  },
  {
    icon: <TuneIcon fontSize="large" />,
    title: "Introduce tus datos técnicos",
    description:
      "Completa fácilmente los campos del estudio con la información de tu proyecto.",
  },
  {
    icon: <SettingsIcon fontSize="large" />,
    title: "Simula con tus datos",
    description:
      "En solo unos segundos tendrás tu estudio técnico con los resultados actualizados listo para imprimir.",
  },
  {
    icon: <PictureAsPdfIcon fontSize="large" />,
    title: "Descarga tu PDF",
    description: "Obtén tu estudio técnico en PDF listo para usar o compartir.",
  },
];

const ProcessSection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: "white",
        py: { xs: 6, md: 8, lg: 10 },

        "& .process-title": {
          fontFamily: "'Playfair Display', serif",
          position: "relative",
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          mb: { xs: 4, md: 6 },

          "&::after": {
            content: '""',
            position: "absolute",
            width: 80,
            height: 3,
            backgroundColor: "#ffb300",
            bottom: -15,
            left: "50%",
            transform: "translateX(-50%)",
          },
        },
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" className="process-title">
          Obtén tu informe en solo 4 pasos
        </Typography>

        <Grid container spacing={4}>
          {processSteps.map((step, index) => (
            <Grid key={index} item xs={12} md={3}>
              <Box
                onClick={() => navigate("/Blog")}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  px: 3,
                  py: 4,
                  borderRadius: 3,
                  backgroundColor: "#0d47a1",
                  color: "white",
                  transition: "all 0.4s ease",
                  cursor: "pointer",

                  "&:hover": {
                    filter: "invert(1)",
                  },
                }}
              >
                <Box sx={{ color: "inherit", mb: 2, fontSize: 48 }}>
                  {step.icon}
                </Box>

                <Typography variant="h6" gutterBottom sx={{ color: "inherit" }}>
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProcessSection;
