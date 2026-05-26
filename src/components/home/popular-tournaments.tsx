import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { apiGet } from '@/lib/api';
import type { PaginatedList, TournamentSummary } from '@/lib/types';

async function getPopular(): Promise<TournamentSummary[]> {
  try {
    const res = await apiGet<PaginatedList<TournamentSummary>>(
      '/tournaments?sort=popular&limit=12',
    );
    return res.items.filter(
      (t) => t.status !== 'DRAFT' && t.status !== 'CANCELLED',
    ).slice(0, 6);
  } catch {
    return [];
  }
}

export async function PopularTournaments() {
  const items = await getPopular();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Torneos populares
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Los más relevantes en LATAM por prize pool y participación.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tournaments">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <Reveal>
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Aún no hay torneos publicados. Pronto se llenará esta sección.
            </p>
          </div>
        </Reveal>
      ) : (
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <StaggerItem key={t.id}>
              <TournamentCard t={t} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
