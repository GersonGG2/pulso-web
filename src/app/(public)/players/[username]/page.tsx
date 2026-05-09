import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, ApiError } from '@/lib/api';
import type { PlayerTier } from '@/lib/types';

interface UserPublic {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface PlayerLite {
  id: string;
  primaryRole: string | null;
  secondaryRole: string | null;
  country: string;
  city: string | null;
  zScore: number;
  tier: PlayerTier;
  isPro: boolean;
  recruitable: boolean;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null };
  riotAccount: {
    gameName: string;
    tagLine: string;
    region: string;
    summonerLevel: number | null;
    currentTier: string | null;
    currentRank: string | null;
    highestRankEver: string | null;
  } | null;
}

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Perfil público de @${username} en Pulso.`,
  };
}

async function fetchUserAndPlayer(
  username: string,
): Promise<{ user: UserPublic; player: PlayerLite | null } | null> {
  try {
    const user = await apiGet<UserPublic>(`/users/by-username/${encodeURIComponent(username)}`);
    let player: PlayerLite | null = null;
    try {
      const list = await apiGet<{ items: PlayerLite[] }>(
        `/players?country=&limit=1&offset=0`,
      );
      player = list.items.find((p) => p.user.id === user.id) ?? null;
    } catch {
      player = null;
    }
    return { user, player };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function PlayerProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await fetchUserAndPlayer(username);
  if (!data) notFound();

  const { user, player } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{user.displayName}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">@{user.username}</p>
        </div>
        {player && (
          <div className="flex items-center gap-3">
            <Badge variant="outline">{player.tier}</Badge>
            {player.isPro && <Badge>Pro</Badge>}
            {player.recruitable && <Badge variant="outline">Recruitable</Badge>}
          </div>
        )}
      </header>

      {!player ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-[var(--color-muted-foreground)]">
              Este usuario aún no tiene perfil de jugador en Pulso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ZScore</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-5xl font-semibold text-[var(--color-primary)]">
                {player.zScore}
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                Tier {player.tier} · {player.country}
                {player.city ? ` · ${player.city}` : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rol</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                <span className="text-[var(--color-muted-foreground)]">Primario:</span>{' '}
                <span className="font-medium">{player.primaryRole ?? '—'}</span>
              </p>
              <p className="mt-1">
                <span className="text-[var(--color-muted-foreground)]">Secundario:</span>{' '}
                <span className="font-medium">{player.secondaryRole ?? '—'}</span>
              </p>
            </CardContent>
          </Card>

          {player.riotAccount && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Cuenta de League of Legends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-mono">
                  {player.riotAccount.gameName}#{player.riotAccount.tagLine}{' '}
                  <span className="text-[var(--color-muted-foreground)]">
                    · {player.riotAccount.region}
                  </span>
                </p>
                <p className="text-[var(--color-muted-foreground)]">
                  Nivel {player.riotAccount.summonerLevel ?? '—'} ·{' '}
                  Rank actual{' '}
                  {player.riotAccount.currentTier
                    ? `${player.riotAccount.currentTier} ${player.riotAccount.currentRank ?? ''}`
                    : 'unranked'}{' '}
                  · Highest{' '}
                  {player.riotAccount.highestRankEver ?? '—'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
