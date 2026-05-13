import { LegalH2, LegalLayout, LegalList, LegalP } from '@/components/legal/legal-layout';

export const metadata = {
  title: 'Política de cookies',
  description: 'Qué cookies usa Pulso y cómo gestionarlas.',
};

export default function CookiesPage() {
  return (
    <LegalLayout category="Legal" title="Política de cookies" lastUpdated="12 de mayo de 2026">
      <LegalH2>Qué son</LegalH2>
      <LegalP>
        Las cookies son pequeños archivos que tu navegador guarda cuando visitas un sitio.
        Permiten mantener tu sesión, recordar preferencias, y entender cómo se usa el producto.
      </LegalP>

      <LegalH2>Qué cookies usamos</LegalH2>
      <LegalList>
        <li>
          <strong>Estrictamente necesarias.</strong> Sesión de Clerk para mantenerte logueado.
          Sin estas, la plataforma no funciona.
        </li>
        <li>
          <strong>Analíticas anónimas (futuro).</strong> Cuando integremos PostHog usaremos
          cookies para entender uso agregado del producto, sin identificarte personalmente.
        </li>
      </LegalList>

      <LegalP>
        No usamos cookies de publicidad ni de redes sociales (no hay píxeles de Meta, Google
        Ads, etc.).
      </LegalP>

      <LegalH2>Cómo desactivarlas</LegalH2>
      <LegalP>
        Puedes bloquear cookies desde la configuración de tu navegador. Si bloqueas las
        estrictamente necesarias, no podrás iniciar sesión en Pulso.
      </LegalP>

      <LegalH2>Cambios</LegalH2>
      <LegalP>
        Cuando agreguemos nuevas categorías (por ejemplo herramientas de marketing) lo
        notificaremos aquí y por banner en el sitio.
      </LegalP>
    </LegalLayout>
  );
}
