import React, { useState } from "react";
import { Container, Card, Button, Typography, Link } from "@mui/material";

export default function TermsOfUse() {
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const toggleTermsOfUse = () => {
    setShowTermsOfUse((prev) => !prev);
  };

  return (
    <div>


      {/* TÉRMINOS DE USO */}
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
                border: "2px solid #2e7d32",
                boxShadow: "0 8px 25px rgba(46, 125, 50, 0.3)",
              },
            }}
          >
            <Typography variant="h4" gutterBottom>
              Términos de Uso
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Última actualización: {new Date().getFullYear()}</strong>
            </Typography>

            <Typography variant="h5" gutterBottom>
              Licencia Creative Commons{" "}
              <Link
                href="https://creativecommons.org/licenses/by/4.0/deed.es"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ color: "#1976d2" }}
              >
                <img
                  src="https://licensebuttons.net/l/by/4.0/88x31.png"
                  alt="Creative Commons Attribution 4.0 License"
                  style={{ verticalAlign: "middle", height: 20 }}
                />
              </Link>
            </Typography>

            <Typography variant="body1" paragraph>
              Usted es libre de:
            </Typography>
            <Typography variant="body2" paragraph>
              - Compartir, copiar y distribuir el material en cualquier medio o
              formato para cualquier propósito, incluso comercialmente.<br />
              - Adaptar, remezclar, transformar y construir a partir del material
              para cualquier propósito, incluso comercialmente.<br /><br />
              La licenciante no puede revocar estas libertades en tanto usted siga
              los términos de la licencia.
            </Typography>

            <Typography variant="body1" paragraph>
              Bajo los siguientes términos:
            </Typography>
            <Typography variant="body2" paragraph>
              - <strong>Atribución</strong> — Usted debe dar crédito de manera adecuada,
              brindar un enlace a la licencia, e indicar si se han realizado cambios.<br /><br />
              Puede hacerlo en cualquier forma razonable, pero no de forma tal que sugiera
              que usted o su uso tienen el apoyo de la licenciante.
            </Typography>
            <Typography variant="body2" paragraph>
              No hay restricciones adicionales — No puede aplicar términos legales ni medidas
              tecnológicas que restrinjan legalmente a otras personas a hacer cualquier uso permitido por la licencia.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Aceptación de los Términos
            </Typography>
            <Typography variant="body1" paragraph>
              Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos
              de Uso y a nuestra Política de Privacidad. Si no está de acuerdo con estos términos,
              le solicitamos que no utilice el sitio.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Modificaciones a los Términos
            </Typography>
            <Typography variant="body1" paragraph>
              PRoman.blog se reserva el derecho de modificar estos Términos de Uso en cualquier momento.
              Los cambios entrarán en vigor una vez que se publiquen en este sitio. Es su responsabilidad
              revisar periódicamente los términos para estar al tanto de cualquier modificación.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Uso Permitido
            </Typography>
            <Typography variant="body1" paragraph>
              Usted se compromete a utilizar este sitio solo con fines legales y de manera que no infrinja
              los derechos de otros. No podrá utilizar este sitio de ninguna manera que pueda dañar,
              deshabilitar, sobrecargar o perjudicar el mismo, ni utilizarlo para realizar actividades
              fraudulentas, engañosas o malintencionadas.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Limitación de Responsabilidad
            </Typography>
            <Typography variant="body1" paragraph>
              En la máxima medida permitida por la ley, PRoman.blog no será responsable de ningún daño directo,
              indirecto, incidental, especial, punitivo o consecuente que surja de su acceso o uso
              del sitio, incluyendo, pero no limitado a, la pérdida de beneficios o ingresos, o la interrupción del negocio.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Enlaces a Sitios de Terceros
            </Typography>
            <Typography variant="body1" paragraph>
              Este sitio puede contener enlaces a otros sitios web que no son propiedad ni están
              controlados por PRoman.blog. No somos responsables del contenido de dichos sitios y no asumimos
              ninguna responsabilidad por las prácticas de privacidad de los mismos. Le recomendamos
              que revise los términos y políticas de privacidad de cualquier sitio web de terceros que visite.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Sanciones por Incumplimiento
            </Typography>
            <Typography variant="body1" paragraph>
              En caso de que se descubra que ha proporcionado información falsa, inexacta o engañosa,
              PRoman.blog se reserva el derecho de suspender o eliminar su cuenta sin previo aviso. Dependiendo
              de la gravedad del caso, PRoman.blog se reserva el derecho de tomar medidas legales adicionales para
              proteger sus derechos y los de otros usuarios.
            </Typography>

            <Typography variant="h5" gutterBottom>
              Ley Aplicable
            </Typography>
            <Typography variant="body1" paragraph>
              Estos Términos de Uso se rigen por las leyes de España. Cualquier disputa relacionada con
              estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de Málaga.
            </Typography>
          </Card>
        </Container>
      )}
    </div>
  );
}
