'use client';

import { Trophy, Eye, ShieldCheck } from 'lucide-react';
import { Reveal, Stagger, StaggerItem, HoverLift } from '@/components/motion';

const PROPS = [
  {
    icon: Trophy,
    title: 'ZScore público y auditable',
    body: 'Cada partida que juegas en Pulso actualiza tu ZScore con una fórmula abierta basada en stats reales de Riot. Sin black box, sin invitaciones a dedo.',
  },
  {
    icon: Eye,
    title: 'Visibilidad para reclutamiento',
    body: 'Tu perfil queda en el talent graph público — filtrable por rol, país, tier y disponibilidad. Si juegas bien, los scouts te encuentran.',
  },
  {
    icon: ShieldCheck,
    title: 'Identidad verificada anti-smurf',
    body: 'Cuenta de Riot vinculada con verificación de icono + SMS. Un teléfono real, una identidad. Sin trampa, sin boosting.',
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mb-12 max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          La meritocracia que <span className="text-[var(--color-primary)]">no tenías</span>.
        </h2>
        <p className="mt-4 text-[var(--color-muted-foreground)]">
          Existen muchas plataformas para correr brackets. Ninguna está pensada para que un
          jugador con talento real, sin contactos ni patrocinio, pueda ser visto en LATAM.
          Eso es Pulso.
        </p>
      </Reveal>

      <Stagger className="grid gap-6 md:grid-cols-3">
        {PROPS.map(({ icon: Icon, title, body }) => (
          <StaggerItem key={title}>
            <HoverLift className="h-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{body}</p>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
