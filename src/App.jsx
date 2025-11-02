// App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import CookieConsent from './components/footer/CookieConsent';
import Home from './components/Home';
// import Landing from './components/Landing';
import Doc from './components/Doc';
// import Scada from './components/Scada';
// import Instalaciones from './components/Instalaciones';
import Contacto from './components/footer/Contacto';
import Servicios from './components/Servicios';
import Ayuda from './components/Ayuda';
import Terminos from './components/footer/TérminosdeUso';
import Privacidad from './components/footer/PolíticadePrivacidad';
import Sobre from './components/footer/Sobremi';
// import Ayuda from './components/Ayuda';
import Docs from './components/BlogInteractivo';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Terms from './components/footer/TérminosdeUso';
import Privacy from './components/footer/PolíticadePrivacidad';

import Thingsboard from './components/iframes/Thingsboard';
import Paperless from './components/iframes/Paperless';
import SignIn from './components/iframes/Thingsboard';
import SignUp from './components/firebase/xxxSignUp';
import ForgotPassword from './components/firebase/ForgotPassword';
import Redirect from './components/firebase/Redirect';
import MapaModal from "./components/MapaModal";
import "react-toastify/dist/ReactToastify.css";

import WhatsAppButton from './components/WhatsAppButton';

const WhatsAppWrapper = () => {
  const location = useLocation();
  const hiddenPaths = ['/login', '/sign-up', '/forgot-password'];

  const hideButton = hiddenPaths.includes(location.pathname.toLowerCase());

  return !hideButton ? <WhatsAppButton /> : null;
};

const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <NavigationBar />
        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/map/:lat/:lng" element={<MapaModal />} />
            <Route path="/user/*" element={<Redirect url="/" />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/home" element={<Home />} />
            {/* <Route path="/" element={<Landing />} /> */}
            <Route path="/" element={<Docs />} />
            <Route path="/Blog" element={<Docs />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/sobre" element={<Sobre />} />
            {/* <Route path="/scada" element={<Scada />} /> */}
            {/* <Route path="/instalaciones" element={<Instalaciones />} /> */}
            <Route path="/contacto" element={<Contacto />} />
            {/* <Route path="/ayuda" element={<Ayuda />} /> */}
            <Route path="/doc" element={<Doc />} />
            {/* <Route path="/doc" element={<Doc />} /> */}
            <Route path="/thingsboard" element={<Thingsboard />} />
            <Route path="/paperless" element={<Paperless />} />
          </Routes>
        </Box>
        {/* <Footer /> */}
        <WhatsAppWrapper />


      </Router>
      <CookieConsent />
    </Box>
  );
};

export default App;
