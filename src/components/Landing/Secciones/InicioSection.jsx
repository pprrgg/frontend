import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import PlayCircleFilled from "@mui/icons-material/PlayCircleFilled";
import CloseIcon from "@mui/icons-material/Close";

const InicioSection = () => {
  const [open, setOpen] = useState(false);

  const abrirVideo = () => setOpen(true);
  const cerrarVideo = () => setOpen(false);

  return (
    <>
      {/* HERO SECTION */}
      <Box
        id="inicio"
        sx={{
          background: `
            linear-gradient(rgba(13, 71, 161, 0.45), rgba(21, 101, 192, 0.35)),
            url(img/1.png)
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          py: { xs: 10, md: 14 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          {/* LOGO / MARCA */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >


              {/* E derecha volteada */}
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1,
                  position: "relative",
                  right: 13,
                  transform: "scaleY(1.4)",
                  letterSpacing: "-0.2em",   // ❗ Acerca las letras
                }}
              >
                PRoman.blog
              </Typography>

            </Box>
          </Box>



          {/* TITULO */}
          <Typography
            sx={{
              fontSize: {
                xs: "2.2rem",
                sm: "2.8rem",
                md: "3.4rem",
              },
              fontWeight: 900,
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Informe Técnico Económico
          </Typography>

          {/* SUBTITULO (NUEVO → CLAVE) */}
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.2rem" },
              opacity: 0.9,
              maxWidth: 600,
              mx: "auto",
              mb: 4,
            }}
          >
            Genera informes profesionales en PDF a partir de plantillas de forma
            rápida, precisa y sin errores manuales.
          </Typography>

          {/* BOTONES */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {/* <Button
              variant="contained"
              color="warning"
              size="large"
              sx={{
                px: { xs: 4, md: 5 },
                py: 1.5,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Crear informe
            </Button> */}

            <Button
              variant="outlined"
              size="large"
              onClick={abrirVideo}
              startIcon={<PlayCircleFilled />}
              sx={{
                px: { xs: 3, md: 4 },
                py: 1.5,
                fontWeight: 600,
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Ver demo
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* VIDEO MODAL */}
      <Dialog
        fullScreen
        open={open}
        onClose={cerrarVideo}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0,0,0,0.9)",
            position: "relative",
          },
        }}
      >
        {/* BOTON CERRAR */}
        <IconButton
          onClick={cerrarVideo}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.4)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "2rem" }} />
        </IconButton>

        {/* VIDEO */}
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
          }}
        >
          <video
            src="video/1.mp4"
            controls
            autoPlay
            style={{
              width: "100%",
              maxHeight: "90vh",
              borderRadius: 12,
            }}
          />
        </Box>
      </Dialog>
    </>
  );
};

export default InicioSection;