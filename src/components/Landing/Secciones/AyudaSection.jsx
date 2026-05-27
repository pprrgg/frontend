import React, { useState } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ayuda } from "./data/ayudaData";

const AyudaSection = () => {
  const [openVideo, setOpenVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  const handleOpenVideo = (video) => {
    setCurrentVideo(video);
    setOpenVideo(true);
  };

  const handleCloseVideo = () => {
    setOpenVideo(false);
    setCurrentVideo(null);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <Container sx={{ py: 8 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 4,
          color: "#000",
          textAlign: "center",
        }}
      >
        Ayuda
      </Typography>

      {ayuda.map((card) => (
        <Accordion
          key={card.id}
          expanded={expandedAccordion === card.id}
          onChange={handleAccordionChange(card.id)}
          sx={{
            background: "white",
            border: "2px solid rgba(0, 0, 0, 0.2)",
            borderRadius: "8px !important",
            color: "#000",
            mb: 2,
            "&:before": { display: "none" },
            "&:hover": { border: "2px solid #ed6c02" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
            sx={{
              "& .MuiAccordionSummary-content": {
                alignItems: "center",
              },
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>
              {card.title_es}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {card.description_es}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenVideo(card.video)}
            >
              Ver video
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Dialog con video dinámico */}
      <Dialog
        open={openVideo}
        onClose={handleCloseVideo}
        maxWidth={false}
        PaperProps={{
          sx: {
            height: "100vh",
            aspectRatio: "9 / 18.3",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "auto",
            boxShadow: 8,
          },
        }}
      >
        {/* Video dinámico */}
        {currentVideo && (
          <video
            src={currentVideo}
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              backgroundColor: "#000",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Botón de cerrar */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleCloseVideo();
          }}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(255, 0, 0, 0.9)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "rgba(200, 0, 0, 1)",
              transform: "scale(1.05)",
            },
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Box>
      </Dialog>
    </Container>
  );
};

export default AyudaSection;
