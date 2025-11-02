import Home from './Home.jsx'; // Ajusta la ruta según la ubicación real de tu Home.jsx
const HomePage = () => {

  return (
    <div>
      <Home
        showLanding={false}

        showCarrusel={false}
        showInicio={false}
        showDescripcion={false}
        showServicios={true}
        showFaq={false}
        showContacto={true}
        showPrivacyPolicy={false}
        showTermsOfUse={false}
        showAboutUs={false}
      />
    </div>
    
  );
};

export default HomePage;
