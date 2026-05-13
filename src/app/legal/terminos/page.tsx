import { LegalH2, LegalLayout, LegalList, LegalP } from '@/components/legal/legal-layout';

export const metadata = {
  title: 'Términos y condiciones',
  description: 'Términos de uso de la plataforma Pulso.',
};

export default function TermsPage() {
  return (
    <LegalLayout category="Legal" title="Términos y condiciones" lastUpdated="12 de mayo de 2026">
      <LegalH2>1. Aceptación</LegalH2>
      <LegalP>
        Al crear una cuenta o usar Pulso aceptas estos términos. Si no estás de acuerdo, no uses
        la plataforma.
      </LegalP>

      <LegalH2>2. Quién puede usar Pulso</LegalH2>
      <LegalList>
        <li>Personas mayores de 13 años con consentimiento parental cuando aplique.</li>
        <li>Mayores de 18 años para participar en torneos con premios económicos.</li>
        <li>Cuentas verificables: una sola por persona física.</li>
      </LegalList>

      <LegalH2>3. Uso aceptable</LegalH2>
      <LegalP>
        Está prohibido el smurfing, boosting, uso de cheats, manipulación de partidas, lenguaje
        de odio, acoso, y cualquier conducta que comprometa la integridad competitiva. Las
        violaciones resultan en suspensión o eliminación de la cuenta.
      </LegalP>

      <LegalH2>4. Tu contenido y datos</LegalH2>
      <LegalP>
        Conservas la propiedad de tu nombre, avatar, biografía y cualquier contenido que
        publiques. Nos otorgas licencia limitada para mostrarlos en la plataforma según los
        términos del producto.
      </LegalP>

      <LegalH2>5. Pagos y suscripciones</LegalH2>
      <LegalP>
        Pulso Pro es una suscripción mensual no contractual. Puedes cancelarla en cualquier
        momento; conservas acceso hasta el final del período pagado. Los pagos se procesan vía
        Stripe o Mercado Pago según el país.
      </LegalP>

      <LegalH2>6. Torneos y premios</LegalH2>
      <LegalP>
        Los premios en torneos son responsabilidad del organizador, no de Pulso. Pulso es la
        infraestructura; el organizador define reglas específicas, premios y operación. Pulso
        retiene el 8% del entry fee como comisión por uso de la plataforma.
      </LegalP>

      <LegalH2>7. Cuentas de Riot</LegalH2>
      <LegalP>
        Pulso opera bajo el programa de Riot Community Competition. League of Legends y demás
        marcas son propiedad de Riot Games, Inc. La conexión con la API de Riot se hace bajo
        sus términos.
      </LegalP>

      <LegalH2>8. Limitación de responsabilidad</LegalH2>
      <LegalP>
        Pulso se proporciona &ldquo;tal cual&rdquo; en su fase MVP. No garantizamos
        disponibilidad continua y nos reservamos el derecho de modificar funcionalidad con
        previo aviso razonable.
      </LegalP>

      <LegalH2>9. Cambios a estos términos</LegalH2>
      <LegalP>
        Cuando actualicemos estos términos publicaremos la nueva versión con fecha. Para
        cambios materiales notificaremos por email con 30 días de anticipación.
      </LegalP>

      <LegalH2>10. Ley aplicable</LegalH2>
      <LegalP>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
        controversia se somete a la jurisdicción de los tribunales de la Ciudad de México.
      </LegalP>
    </LegalLayout>
  );
}
