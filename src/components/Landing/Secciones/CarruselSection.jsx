import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CardMedia,
  Box,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { cardsData } from "./data/cardsData";

const CarruselSection = () => {
  const navigate = useNavigate();

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  const handleCardClick = (grupo, link) => {
    sessionStorage.setItem("selectedGroup", grupo);
    navigate(link);
  };

  return (
    <Container sx={{ py: 8 }}>
      <Slider {...carouselSettings}>
        {cardsData.map((card) => (
          <Box
            key={card.id}
            sx={{
              position: "relative",
              borderRadius: 3,
              overflow: "hidden",
              cursor: "pointer",
              border: "2px solid rgba(0, 0, 0, 0.2)",
              background: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              },
            }}
            onClick={() => handleCardClick(card.group, "/Blog")}
          >
            <CardMedia
              component="img"
              src={card.image}
              alt={card.title_es}
              onError={(e) => {
                e.target.src = "/img/defecto.png";
              }}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                p: 3,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                color: "#fff",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {card.title_es}
              </Typography>
              <Typography variant="body1">
                {card.description_es}
              </Typography>
            </Box>
          </Box>
        ))}
      </Slider>
    </Container>
  );
};

export default CarruselSection;
