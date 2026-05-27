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
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
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
            linear-gradient(rgba(13, 71, 161, 0.55), rgba(21, 101, 192, 0.45)),
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
          {/* TITLE */}
          <Typography
            sx={{
              fontSize: {
                xs: "2.2rem",
                sm: "2.8rem",
                md: "3.2rem",
              },
              fontWeight: 900,
              lineHeight: 1.2,
              mb: 2,
              color: "white", // ⚠️ antes negro → no se veía bien
            }}
          >
            Centro de ayuda
          </Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.15rem" },
              opacity: 0.9,
              maxWidth: 600,
              mx: "auto",
              mb: 4,
            }}
          >
            Aprende paso a paso cómo generar informes técnico-económicos en PDF
            y sacar el máximo partido a la plataforma.
          </Typography>

          {/* CTA (opcional pero recomendable) */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              color="warning"
              size="large"
              onClick={abrirVideo}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
              }}
              startIcon={<PlayCircleFilledWhiteIcon />}
            >
              Ver demo
            </Button>

            {/* <Button
              variant="outlined"
              size="large"
              href="#pasos"
              sx={{
                px: 4,
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
              Ver pasos
            </Button> */}
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
        {/* CLOSE BUTTON */}
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