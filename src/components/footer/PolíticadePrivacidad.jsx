

import Home from '../Home.jsx'; // Ajusta la ruta según la ubicación real de tu Home.jsx
const HomePage = () => {

  // Sección informativa alternada con más temas


  return (
    <div>
      <Home
        showLanding={false}
        showCarrusel={false}
        showInicio={false}
        showDescripcion={false}
        showServicios={false}
        showFaq={false}
        showContacto={false}
        showPrivacyPolicy={true}
        showTermsOfUse={false}
        showAboutUs={false}
      />

    </div>
  );
};

export default HomePage;
