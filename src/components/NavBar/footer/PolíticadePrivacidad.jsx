import React, { useState } from "react";
import { Container, Card, Button } from "@mui/material";

export default function PrivacyPolicy() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const togglePrivacyPolicy = () => {
    setShowPrivacyPolicy((prev) => !prev);
  };

  return (
    <div>


      {/* POLÍTICA DE PRIVACIDAD */}
      {true && (
        <Container sx={{ py: 8 }}>
          <Card
            sx={{
              p: 4,
              borderRadius: "12px",
              background: "white",
              border: "2px solid rgba(0, 0, 0, 0.2)",
              color: "#000",
              transition: "all 0.3s ease",
              "&:hover": {
                border: "2px solid #1976d2",
                boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
              },
            }}
          >
            <h1>Política de Privacidad</h1>
            <p>
              <strong>Última actualización: {new Date().getFullYear()}</strong>
            </p>

            <h2>1. Información que Recopilamos</h2>
            <p>
              Recopilamos información que usted nos proporciona directamente, así como información sobre su uso de nuestros servicios:
            </p>
            <ul>
              <li>
                <strong>Información Personal</strong>: Al registrarse, es posible que le solicitemos información personal, como su nombre, dirección de correo electrónico y otra información relevante.
              </li>
              <li>
                <strong>Información de Uso</strong>: Recopilamos información sobre cómo interactúa con nuestros servicios, incluyendo la fecha y hora de su visita, la duración de la visita y las páginas que visita.
              </li>
            </ul>

            <h2>2. Uso de la Información</h2>
            <p>Utilizamos la información que recopilamos para:</p>
            <ul>
              <li>Proporcionar y mantener nuestros servicios.</li>
              <li>Mejorar y personalizar su experiencia.</li>
              <li>Comunicarnos con usted, incluyendo el envío de correos electrónicos sobre actualizaciones, ofertas y promociones.</li>
              <li>Cumplir con nuestras obligaciones legales y resolver disputas.</li>
            </ul>

            <h2>3. Almacenamiento de Datos</h2>
            <p>
              Almacenamos su información personal durante el tiempo que sea necesario para cumplir con los fines establecidos en esta política, y de acuerdo con nuestras obligaciones legales.
            </p>

            <h2>4. Compartir Información</h2>
            <p>No compartimos su información personal con terceros, excepto en las siguientes circunstancias:</p>
            <ul>
              <li>Con su consentimiento explícito.</li>
              <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio y proporcionarle nuestros servicios (por ejemplo, servicios de correo electrónico).</li>
              <li>Para cumplir con la ley, responder a citaciones o solicitudes legales, o proteger nuestros derechos o los de otros.</li>
            </ul>

            <h2>5. Sus Derechos</h2>
            <p>Usted tiene los siguientes derechos respecto a su información personal:</p>
            <ul>
              <li><strong>Acceso</strong>: Puede solicitar una copia de la información que tenemos sobre usted.</li>
              <li><strong>Rectificación</strong>: Puede solicitar la corrección de información inexacta o incompleta.</li>
              <li><strong>Eliminación</strong>: Puede solicitar la eliminación de su información personal bajo ciertas condiciones.</li>
              <li><strong>Oposición</strong>: Puede oponerse al tratamiento de su información personal en determinadas circunstancias.</li>
            </ul>

            <h2>6. Seguridad de la Información</h2>
            <p>
              Tomamos medidas razonables para proteger su información personal contra pérdida, robo y uso indebido. Sin embargo, ningún método de transmisión a través de Internet o método de almacenamiento electrónico es 100% seguro. Por lo tanto, no podemos garantizar su seguridad absoluta.
            </p>

            <h2>7. Cambios a Esta Política de Privacidad</h2>
            <p>
              Podemos actualizar esta política de privacidad de vez en cuando. Le notificaremos sobre cambios significativos en la forma en que tratamos la información personal enviándole un aviso a la dirección de correo electrónico que nos proporcionó.
            </p>
          </Card>
        </Container>
      )}
    </div>
  );
}
