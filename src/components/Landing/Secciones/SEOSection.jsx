import React from "react";
import { Box, Typography } from "@mui/material";

const SEOSection = () => {
  return (
    <Box
      component="section"
      sx={{
        mt: 6,
        px: 2,
        py: 4,
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 800,
          mb: 2,
          textAlign: "center",
          color: "#031dadff",
          textTransform: "uppercase",
        }}
      >
        Informes Técnicos Personalizables en PDF
      </Typography>

      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          maxWidth: "900px",
          margin: "0 auto",
          color: "#333",
          mb: 3,
        }}
      >
        Crea, mejora y distribuye informes técnicos con una
        herramienta especializada que promueve el acceso abierto al
        conocimiento.
      </Typography>

      {/* Palabras clave en formato "tags" SEO */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.2,
          justifyContent: "center",
          mt: 2,
        }}
      >
        {[
          "informe técnico-económico",
          "estudio técnico-económico",
          "plantillas técnicas PDF",
          "documentación técnica automatizada",
          "energía fotovoltaica",
          "fichas técnicas profesionales",
          "documentación editable",
          "autoconsumo",
          "ingeniería",
          "automatización documental",
          "Certificados de ahorro energético",
          "creación de PDF",
          "Estudios Técnicos",
          "gestión técnica",
          "modelos de informes",
          "baterías",
          "sector industrial",
          "paneles solares",
          "Proyectos",
        ].map((keyword) => (
          <Box
            key={keyword}
            component="span"
            sx={{
              px: 1.5,
              py: 0.7,
              backgroundColor: "#031dadff",
              color: "#fff",
              fontSize: "0.85rem",
              borderRadius: "20px",
              fontWeight: 600,
              textTransform: "capitalize",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          >
            {keyword}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SEOSection;
