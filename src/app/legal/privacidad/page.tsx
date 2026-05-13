import { LegalH2, LegalLayout, LegalList, LegalP } from '@/components/legal/legal-layout';

export const metadata = {
  title: 'Aviso de privacidad',
  description: 'Cómo Pulso recolecta, usa y protege tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout category="Legal" title="Aviso de privacidad" lastUpdated="12 de mayo de 2026">
      <LegalH2>Quiénes somos</LegalH2>
      <LegalP>
        Pulso es una plataforma de torneos de esports operada por su equipo fundador en
        México. Este aviso describe cómo tratamos los datos personales conforme a la Ley
        Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
      </LegalP>

      <LegalH2>Qué datos recolectamos</LegalH2>
      <LegalList>
        <li>Email, nombre, avatar (vía Clerk / OAuth Google).</li>
        <li>Número de teléfono cuando lo verificas (anti-smurf).</li>
        <li>Riot ID, PUUID, summoner level, rank histórico (vía API pública de Riot).</li>
        <li>Stats de partidas oficiales jugadas en torneos de Pulso.</li>
        <li>Información de pago (procesada por Stripe o Mercado Pago — no la almacenamos directamente).</li>
        <li>Datos técnicos: IP, navegador, eventos de uso (para analítica anónima).</li>
      </LegalList>

      <LegalH2>Para qué los usamos</LegalH2>
      <LegalList>
        <li>Operar la plataforma: autenticación, ranking, inscripciones, brackets.</li>
        <li>Anti-smurf: validar que una cuenta corresponde a una persona real.</li>
        <li>Visibilidad pública opcional: tu perfil de jugador en el talent graph.</li>
        <li>Comunicación transaccional: confirmaciones, recordatorios, soporte.</li>
        <li>Métricas agregadas para mejorar el producto.</li>
      </LegalList>

      <LegalH2>Con quién los compartimos</LegalH2>
      <LegalList>
        <li><strong>Clerk</strong> (autenticación).</li>
        <li><strong>Stripe / Mercado Pago</strong> (pagos).</li>
        <li><strong>Twilio</strong> (envío de SMS para verificación).</li>
        <li><strong>Riot Games</strong> (consumimos su API pero no le mandamos tus datos).</li>
        <li>No vendemos tus datos a terceros con fines de marketing.</li>
      </LegalList>

      <LegalH2>Tus derechos ARCO</LegalH2>
      <LegalP>
        Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos.
        Para ejercerlos escríbenos a <strong>privacidad@pulsogg.gg</strong>. Respondemos en un
        máximo de 20 días hábiles.
      </LegalP>

      <LegalH2>Cookies y similares</LegalH2>
      <LegalP>
        Usamos cookies estrictamente necesarias (sesión de Clerk) y analíticas anónimas. Ver el
        aviso de cookies para detalle.
      </LegalP>

      <LegalH2>Seguridad</LegalH2>
      <LegalP>
        TLS en todas las conexiones, almacenamiento de contraseñas delegado a Clerk (no las
        manejamos), tokens de Stripe en lugar de números de tarjeta, y revisiones de seguridad
        periódicas. Nada es 100% seguro, pero aplicamos las mejores prácticas estándar.
      </LegalP>

      <LegalH2>Cambios</LegalH2>
      <LegalP>
        Cuando actualicemos este aviso publicaremos la fecha de revisión arriba y notificaremos
        por email los cambios materiales.
      </LegalP>
    </LegalLayout>
  );
}
