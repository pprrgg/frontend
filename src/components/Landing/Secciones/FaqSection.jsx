import React from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { cardsData } from "./data/cardsData";

const FaqSection = () => {
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
        Preguntas frecuentes
      </Typography>
      {cardsData.map((card) => (
        <Accordion
          key={card.id}
          sx={{
            background: "white",
            border: "2px solid rgba(0, 0, 0, 0.2)",
            borderRadius: "8px !important",
            color: "#000",
            mb: 2,
            "&:before": { display: "none" },
            "&:hover": {
              border: "2px solid #ed6c02",
            },
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
            <Typography>{card.description_es}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default FaqSection;
