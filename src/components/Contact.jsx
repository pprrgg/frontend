import React, { useState, useEffect } from "react";
import Home from './Home.jsx'; // Ajusta la ruta según la ubicación real de tu Home.jsx
const HomePage = () => {

  // Sección informativa alternada con más temas

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    sessionStorage.setItem("selectedGroup", selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    sessionStorage.setItem("selectedSector", selectedSector);
  }, [selectedSector]);

  useEffect(() => {
    sessionStorage.setItem("searchText", searchText);
  }, [searchText]);



  return (
    <div>
      <Home
        showCarrusel={false}
        showInicio={true}
        showDescripcion={false}
        showServicios={false}
        showFaq={false}
        showInformacion={false}
        showContacto={true}
      />

    </div>
  );
};

export default HomePage;
