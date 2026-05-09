import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { apiGet, ApiError } from '@/lib/api';
import type { PaginatedList, PlayerSummary } from '@/lib/types';

export const metadata = {
  title: 'Leaderboard',
  description: 'Top jugadores de LoL en México por ZScore.',
};

const TIER_COLORS: Record<string, string> = {
  AMATEUR: 'bg-[var(--color-secondary)] text-[var(--color-foreground)]',
  COMPETIDOR: 'bg-blue-500/20 text-blue-300',
  SEMI_PRO: 'bg-purple-500/20 text-purple-300',
  PRO: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
};

async function getLeaderboard(): Promise<PaginatedList<PlayerSummary> | null> {
  try {
    return await apiGet<PaginatedList<PlayerSummary>>('/players/leaderboard?limit=50');
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Leaderboard fetch failed: ${err.status} ${err.message}`);
    }
    return null;
  }
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Leaderboard
        </h1>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          Top jugadores por ZScore. Ranking público y auditable basado en partidas oficiales en
          Pulso.
        </p>
      </div>

      {!data ? (
        <EmptyState
          title="No pudimos cargar el leaderboard"
          body="El backend no está disponible. Si estás en local, verifica que pulso-backend esté corriendo en el puerto 3000."
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="Aún no hay jugadores rankeados"
          body="El leaderboard se llenará a medida que jueguen sus primeras partidas oficiales."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-4 py-3 sm:px-6">#</th>
                <th className="px-4 py-3">Jugador</th>
                <th className="px-4 py-3">Tier</th>
                <th className="hidden px-4 py-3 md:table-cell">Rol</th>
                <th className="hidden px-4 py-3 md:table-cell">País</th>
                <th className="px-4 py-3 text-right sm:px-6">ZScore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.items.map((p, i) => (
                <tr key={p.id} className="transition-colors hover:bg-[var(--color-muted)]/40">
                  <td className="px-4 py-3 font-mono text-xs sm:px-6">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${p.user.username}`}
                      className="font-medium hover:text-[var(--color-primary)]"
                    >
                      {p.user.displayName}
                    </Link>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      @{p.user.username}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={TIER_COLORS[p.tier] ?? ''}>{p.tier}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-muted-foreground)] md:table-cell">
                    {p.primaryRole ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-muted-foreground)] md:table-cell">
                    {p.country}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-semibold text-[var(--color-primary)] sm:px-6">
                    {p.zScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{body}</p>
    </div>
  );
}
