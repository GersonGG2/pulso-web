import Link from 'next/link';
import { ArrowRight, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverLift, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { apiGet } from '@/lib/api';
import type { PaginatedList, PlayerSummary } from '@/lib/types';

async function getTop(): Promise<PlayerSummary[]> {
  try {
    const res = await apiGet<PaginatedList<PlayerSummary>>(
      '/players/leaderboard?limit=5',
    );
    return res.items;
  } catch {
    return [];
  }
}

export async function TopPlayers() {
  const items = await getTop();
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Top jugadores
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Talento real, medido por ZScore — sin invitaciones a dedo.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/leaderboard">
              Ver leaderboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>

      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((p, idx) => (
          <StaggerItem key={p.id}>
            <Link
              href={`/players/${p.user.username}`}
              className="group block h-full"
            >
              <HoverLift className="h-full" lift={2}>
                <article className="flex h-full flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-colors group-hover:border-[var(--color-primary)]/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-[var(--color-muted-foreground)]/40">
                      #{idx + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {p.tier}
                    </Badge>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-mono text-base font-bold text-[var(--color-primary)]">
                    {p.user.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold group-hover:text-[var(--color-primary)]">
                      {p.user.displayName}
                    </p>
                    <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                      @{p.user.username} · {p.country}
                    </p>
                  </div>
                  <p className="font-mono text-2xl font-bold text-[var(--color-primary)]">
                    {p.zScore}
                  </p>
                </article>
              </HoverLift>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
