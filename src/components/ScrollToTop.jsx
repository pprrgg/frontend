import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTop = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {showButton && (
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: "50%",
            right: "50%",
            transform: "translate(50%, 50%)", // Centrado absoluto
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Blanco translúcido
            color: "primary",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", // Sombra
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)", // Blanco sólido al hacer hover
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon fontSize="large" />
        </IconButton>
      )}
    </>
  );
};

export default ScrollToTop;
