import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Sobre Pulso',
  description:
    'Pulso es el pipeline meritocrático de esports para Latinoamérica. Cómo nació, qué resuelve y dónde vamos.',
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-wider text-[var(--color-primary)]">
          Sobre Pulso
        </p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          El pipeline que LATAM no tenía.
        </h1>
      </header>

      <div className="space-y-6 text-base leading-relaxed text-[var(--color-foreground)]">
        <p>
          Pulso nace de una observación simple: en México y Latinoamérica hay{' '}
          <strong>talento real</strong> en esports. Lo que falta no son jugadores buenos — lo
          que falta es un puente entre ese talento y los equipos, scouts y organizaciones que
          podrían reclutarlo.
        </p>

        <p>
          Hoy, llegar a la élite competitiva en LATAM depende casi siempre de tres cosas:
          conocer a alguien, tener apoyo económico para auto-financiarse, o haberse mudado a
          una región donde sí existe infraestructura. Eso no es meritocracia. Es geografía y
          contactos.
        </p>

        <p>
          Construimos Pulso para cambiarlo. Cada partida que juegas en nuestra plataforma
          genera un <strong>ZScore</strong> público y auditable, basado en tus stats reales de
          Riot. No es un número que decide un algoritmo cerrado; es una fórmula abierta que
          cualquiera puede revisar. Subes de tier por desempeño, no por marketing.
        </p>

        <h2 className="pt-6 text-2xl font-semibold tracking-tight">Qué resolvemos</h2>

        <ul className="list-disc space-y-2 pl-5 text-[var(--color-muted-foreground)]">
          <li>
            <strong className="text-[var(--color-foreground)]">Para jugadores:</strong>{' '}
            visibilidad real ante scouts y orgs sin necesidad de conocer a nadie.
          </li>
          <li>
            <strong className="text-[var(--color-foreground)]">Para organizadores:</strong> una
            plataforma con integración profunda a Riot, pagos locales (OXXO, SPEI, Mercado
            Pago) y soporte en español.
          </li>
          <li>
            <strong className="text-[var(--color-foreground)]">Para equipos pro:</strong>{' '}
            acceso a un talent graph donde el ranking es objetivo y los perfiles son
            verificables (anti-smurf real).
          </li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold tracking-tight">Dónde vamos</h2>

        <p>
          MVP en México con League of Legends. Expansión a Argentina y Chile en el segundo
          semestre de 2026. Cuando consolidemos LATAM, ampliamos a más juegos. Nuestro
          objetivo a 3 años: ser el pipeline número uno desde el solo queue hasta la LRN y
          eventualmente la LTA.
        </p>

        <p>
          Si juegas en LATAM y crees que mereces ser visto — bienvenido a Pulso.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/sign-up">Crear cuenta</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/manifesto">Leer el manifesto</Link>
        </Button>
      </div>
    </article>
  );
}
