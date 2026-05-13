import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Manifesto',
  description:
    'Los principios que rigen a Pulso. Por qué construimos lo que construimos y para quién.',
};

const PRINCIPLES = [
  {
    title: 'Talento sobre contactos.',
    body: 'Si juegas bien, te ves. Sin necesidad de conocer a alguien, sin patrocinador detrás, sin influencer que te invite. El producto entero está diseñado para que el mérito sea lo que decide.',
  },
  {
    title: 'Transparencia radical.',
    body: 'El algoritmo del ZScore es público y auditable. Las decisiones de seeding son explicables. Los rankings no se editan a mano. Si no podemos defender una decisión en público, no la tomamos.',
  },
  {
    title: 'Latinoamérica primero.',
    body: 'Construimos para nuestra región, en nuestro idioma, con nuestros métodos de pago y respetando nuestras leyes. No copiamos productos gringos traducidos al español.',
  },
  {
    title: 'Anti-trampa, sin excusas.',
    body: 'Una cuenta de Riot verificada, un teléfono real, un perfil único. El smurfing y boosting no tienen lugar en Pulso. Preferimos crecer despacio con identidades reales que rápido con cuentas falsas.',
  },
  {
    title: 'Pipeline, no destino.',
    body: 'No competimos con la LRN o la LTA — somos el camino que lleva a ellas. Cada feature debe responder: ¿esto ayuda a un jugador amateur a llegar al siguiente nivel?',
  },
  {
    title: 'Honestidad antes que hype.',
    body: 'Si algo no funciona, lo decimos. Si tardamos en lanzar algo, lo decimos. Si un torneo se canceló por error, lo asumimos. La comunidad puede ver el producto como es.',
  },
];

export default function ManifestoPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-wider text-[var(--color-primary)]">
          Manifesto
        </p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Los principios que nos rigen.
        </h1>
        <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">
          No son slogans. Son las reglas que usamos cada vez que tomamos una decisión de
          producto, contratación o comunicación.
        </p>
      </header>

      <ol className="space-y-10">
        {PRINCIPLES.map((p, i) => (
          <li key={p.title} className="flex gap-6">
            <span className="flex-shrink-0 font-[family-name:var(--font-display)] text-4xl text-[var(--color-primary)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-2 leading-relaxed text-[var(--color-muted-foreground)]">
                {p.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 border-t border-[var(--color-border)] pt-10">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Si compartes estos principios, vas a sentirte bien jugando aquí. Si no — quizás Pulso
          no es para ti, y está bien.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sign-up">Crear cuenta</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about">Sobre Pulso</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
