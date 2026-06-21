import React from 'react';
import ExcelUploaderStorage from './XLS/AppXLS.jsx';
import { PdfViewerContent } from './XLS/XLShojas/PDF/AppPDF.jsx';

import {
  HashRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Box } from '@mui/material';

// Importación de componentes
import Landing from './components/Landing/Landing';
import Plantillas from './components/Plantillas/Plantillas';
import Ayuda from './components/Ayuda/Ayuda';
import Contacto from './components/NavBar/footer/Contacto';
import CookieConsent from './components/NavBar/footer/CookieConsent';
import Terminos from './components/NavBar/footer/TérminosdeUso';
import Privacidad from './components/NavBar/footer/PolíticadePrivacidad';
import Sobre from './components/NavBar/footer/Sobremi';
import NavigationBar from './components/NavBar/NavigationBar';

/**
 * App principal configurada con HashRouter.
 * Ideal para despliegues en GitHub Pages o servidores estáticos.
 */
const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HashRouter>
        {/* El NavigationBar está dentro del HashRouter para poder usar Links internamente */}
        <NavigationBar />

        <Routes>
          {/* Rutas principales */}
          <Route path="/" element={<Plantillas />} />
          <Route path="/Plantillas" element={<Plantillas />} />
          <Route path="/ayuda" element={<Ayuda />} />

          {/* Rutas legales y contacto */}
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/sobre" element={<Sobre />} />

          {/* Redirección automática si la ruta no existe */}
          <Route path="*" element={<Navigate to="/" replace />} />


          {/* 1. REDIRECCIÓN INICIAL
             Importante: No añadas /aa/ aquí, el router ya sabe dónde está.
        */}
          <Route
            path="/"
            element={
              <Navigate
                to="/A0_Sistema_FV/A61_Conectado_a_red/FV01_Autoconsumo_sin_excedentes"
                replace
              />
            }
          />

          {/* 2. VISOR PDF */}
          <Route
            path="/pdf/:sector/:grupo/:cod"
            element={<PdfViewerContent />}
          />

          {/* 3. EDITOR EXCEL */}
          <Route
            path="/:sector/:grupo/:cod"
            element={<ExcelUploaderStorage />}
          />

          {/* 4. CATCH-ALL
             Si alguien entra en una ruta que no existe dentro de la app, 
             volvemos al inicio (dentro del hash).
        */}
          <Route path="*" element={<Navigate to="/" replace />} />





        </Routes>

        {/* El Footer o componentes globales pueden ir aquí */}
      </HashRouter>

      {/* CookieConsent fuera del HashRouter si no usa navegación interna */}
      <CookieConsent />
    </Box>
  );
};

export default App;