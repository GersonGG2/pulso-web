import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Preguntas frecuentes',
  description: 'Respuestas a las dudas más comunes sobre Pulso, ZScore, torneos y pagos.',
};

const SECTIONS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Sobre Pulso',
    items: [
      {
        q: '¿Qué es Pulso?',
        a: 'Una plataforma de torneos de League of Legends enfocada en hacer visible el talento amateur de LATAM. Juegas, generas ZScore con tus partidas, y entras al talent graph público donde scouts y equipos pueden encontrarte.',
      },
      {
        q: '¿Cuánto cuesta?',
        a: 'Gratis para jugar. Si quieres acceso premium (stats avanzados, prioridad para scouts, acceso anticipado a torneos), Pulso Pro cuesta $99 MXN al mes. Lo cancelas cuando quieras.',
      },
      {
        q: '¿Qué juegos soportan?',
        a: 'League of Legends en el MVP. Estamos enfocados 100% en LoL hasta consolidar el flujo. Próximos juegos en evaluación: Valorant, Wild Rift, TFT.',
      },
      {
        q: '¿Funciona fuera de México?',
        a: 'Hoy MX, LAN y LAS. Expansión a Argentina, Chile y Colombia en el segundo semestre de 2026.',
      },
    ],
  },
  {
    title: 'ZScore',
    items: [
      {
        q: '¿Qué es el ZScore?',
        a: 'Es nuestra moneda de mérito. Sube cuando ganas en Pulso, baja cuando pierdes. El algoritmo es Elo + bonificadores por performance, tier mismatch y peso del torneo. Todo público y auditable.',
      },
      {
        q: '¿Por qué empiezo con 1500?',
        a: 'Es el valor inicial estándar en sistemas tipo Elo. Después de algunas partidas, tu ZScore reflejará tu nivel real.',
      },
      {
        q: '¿Puedo perder ZScore por inactividad?',
        a: 'Sí, pero gradualmente. Si no juegas en varias semanas, el score baja un poco para que el ranking refleje a quien está activo. Hay un techo de decay máximo.',
      },
    ],
  },
  {
    title: 'Cuenta y verificación',
    items: [
      {
        q: '¿Por qué tengo que vincular mi cuenta de Riot?',
        a: 'Porque tus stats reales son la base del ZScore. Vincular tu cuenta nos permite leer tus partidas oficiales y validar tu identidad esports.',
      },
      {
        q: '¿Cómo previenen smurfing?',
        a: 'Verificación de icono (debes cambiar tu icono al ID que te asignamos), verificación por SMS al número de teléfono, y captura del rank histórico al momento del link. Un teléfono = una identidad.',
      },
      {
        q: '¿Pueden ver mis datos de Riot?',
        a: 'Solo lo que Riot expone públicamente vía su API: partidas oficiales, stats agregadas, rank actual e histórico. No vemos mensajes, no vemos datos privados de tu cuenta Riot.',
      },
    ],
  },
  {
    title: 'Torneos y pagos',
    items: [
      {
        q: '¿Cómo me inscribo a un torneo?',
        a: 'Encuentras el torneo en /tournaments, das click, y desde la página del torneo presionas "Inscribirme". Si es gratis quedas confirmado al instante. Si tiene entry fee, pagas con Stripe o Mercado Pago.',
      },
      {
        q: '¿Pueden los organizadores cobrar?',
        a: 'Sí. Pulso cobra una comisión del 8% sobre el entry fee. El resto va al organizador. En MVP los pagos van directo al organizador (Connect futuro).',
      },
      {
        q: '¿Los premios son en dinero?',
        a: 'En MVP los premios son en especie, RP de Riot, o ZScore digital. No manejamos premios monetarios todavía para evitar complicación fiscal mexicana. Cuando lleguemos a tener marco fiscal claro, los habilitamos.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-wider text-[var(--color-primary)]">FAQ</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Preguntas frecuentes
        </h1>
        <p className="mt-4 text-[var(--color-muted-foreground)]">
          Lo que la mayoría de jugadores y organizadores nos preguntan.
        </p>
      </header>

      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {section.title}
            </h2>
            <ul className="space-y-6">
              {section.items.map((item) => (
                <li
                  key={item.q}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6"
                >
                  <h3 className="text-base font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                    {item.a}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-[var(--color-border)] pt-10 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          ¿No encontraste lo que buscabas?
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="mailto:hola@pulsogg.gg">Escríbenos</Link>
        </Button>
      </div>
    </article>
  );
}
