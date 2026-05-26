import Image from 'next/image';
import { Award, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HoverLift, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { apiGet } from '@/lib/api';
import type { HallOfFameTeam } from '@/lib/types';

async function getHallOfFame(): Promise<HallOfFameTeam[]> {
  try {
    return await apiGet<HallOfFameTeam[]>('/teams/hall-of-fame?limit=5');
  } catch {
    return [];
  }
}

export async function HallOfFame() {
  const items = await getHallOfFame();
  if (items.length === 0) return null;

  const withWins = items.filter((t) => t.tournamentsWonCount > 0);
  if (withWins.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Salón de la fama
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Equipos con más torneos ganados en Pulso.
            </p>
          </div>
        </div>
      </Reveal>

      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {withWins.map((team, idx) => (
          <StaggerItem key={team.id}>
            <HoverLift className="h-full" lift={2}>
              <article className="flex h-full flex-col items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-400">
                    #{idx + 1}
                  </span>
                </div>
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {team.logoUrl ? (
                    <Image
                      src={team.logoUrl}
                      alt={team.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="font-mono text-sm font-bold">{team.tag}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{team.name}</p>
                  <p className="font-mono text-xs text-[var(--color-muted-foreground)]">
                    {team.tag} · {team.country}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <Badge>
                    {team.tournamentsWonCount} {team.tournamentsWonCount === 1 ? 'título' : 'títulos'}
                  </Badge>
                </div>
              </article>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
