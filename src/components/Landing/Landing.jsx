
import InicioSection from "./Secciones/InicioSection";
import DescripcionSection from "./Secciones/DescripcionSection";
import ProcessSection from "./Secciones/ProcessSection";
import CamposSection from "./Secciones/CamposSection";
import ContactoSection from "../NavBar/footer/Contacto";
import SEOSection from "./Secciones/SEOSection";

const HomePage = () => {

  // Sección informativa alternada con más temas


  return (
    <div>
      <InicioSection/>
      <DescripcionSection/>
      <ProcessSection/>
      <CamposSection/>
      <SEOSection/>
      <ContactoSection/>

    </div>
  );
};

export default HomePage;
