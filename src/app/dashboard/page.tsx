import { auth, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard',
};

interface RiotAccountState {
  linked: boolean;
  data: {
    gameName: string;
    tagLine: string;
    region: string;
    summonerLevel: number | null;
    currentTier: string | null;
    highestRankEver: string | null;
  } | null;
}

interface PlayerState {
  created: boolean;
  data: {
    zScore: number;
    tier: string;
    primaryRole: string | null;
    country: string;
    recruitable: boolean;
  } | null;
}

async function loadDashboardState(token: string): Promise<{
  riot: RiotAccountState;
  player: PlayerState;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const headers = { Authorization: `Bearer ${token}` };

  const [riotRes, playerRes] = await Promise.all([
    fetch(`${apiUrl}/riot-account/me`, { headers, cache: 'no-store' }),
    fetch(`${apiUrl}/players/me`, { headers, cache: 'no-store' }),
  ]);

  return {
    riot: {
      linked: riotRes.ok,
      data: riotRes.ok ? await riotRes.json() : null,
    },
    player: {
      created: playerRes.ok,
      data: playerRes.ok ? await playerRes.json() : null,
    },
  };
}

export default async function DashboardPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Dashboard" />;

  const [user, { getToken }] = await Promise.all([currentUser(), auth()]);
  if (!user) return null;
  const token = await getToken();
  const state = token
    ? await loadDashboardState(token)
    : { riot: { linked: false, data: null }, player: { created: false, data: null } };

  const displayName = user.firstName ?? user.username ?? 'Jugador';
  const riotLinked = state.riot.linked;
  const playerCreated = state.player.created;
  const fullySetup = riotLinked && playerCreated;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {displayName}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {fullySetup
              ? 'Tu perfil está completo. Ya estás en el talent graph público.'
              : 'Completa tu perfil para empezar a competir y ser visible.'}
          </p>
        </div>
        {state.player.data && (
          <div className="flex items-center gap-3">
            <Badge variant="outline">Tier {state.player.data.tier}</Badge>
            <span className="font-mono text-2xl font-semibold text-[var(--color-primary)]">
              {state.player.data.zScore}
            </span>
          </div>
        )}
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center gap-2">
              {riotLinked && (
                <Badge>
                  <Check className="mr-1 h-3 w-3" />
                  Listo
                </Badge>
              )}
            </div>
            <CardTitle>Cuenta de Riot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riotLinked && state.riot.data ? (
              <>
                <p className="font-mono text-sm">
                  {state.riot.data.gameName}#{state.riot.data.tagLine}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {state.riot.data.region} · Nivel{' '}
                  {state.riot.data.summonerLevel ?? '—'} ·{' '}
                  {state.riot.data.currentTier
                    ? `Rank ${state.riot.data.currentTier}`
                    : 'Unranked'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Linkea tu cuenta para que tu perfil empiece a generar ZScore.
                </p>
                <Button asChild className="w-full">
                  <Link href="/onboarding/riot">Vincular Riot</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center gap-2">
              {playerCreated && (
                <Badge>
                  <Check className="mr-1 h-3 w-3" />
                  Listo
                </Badge>
              )}
            </div>
            <CardTitle>Perfil de jugador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {playerCreated && state.player.data ? (
              <>
                <p className="text-sm">
                  {state.player.data.primaryRole ?? 'Sin rol'} · {state.player.data.country}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {state.player.data.recruitable
                    ? '✓ Disponible para reclutamiento'
                    : 'No recruitable'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Define rol primario, país y disponibilidad para reclutamiento.
                </p>
                <Button
                  variant={riotLinked ? 'default' : 'outline'}
                  asChild
                  className="w-full"
                  disabled={!riotLinked}
                >
                  {riotLinked ? (
                    <Link href="/onboarding/player">Configurar perfil</Link>
                  ) : (
                    <span>Vincula Riot primero</span>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explora torneos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Encuentra el siguiente torneo para inscribirte.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/tournaments">Ver torneos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organiza torneos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Crea, publica y gestiona tus propios torneos. Aprobación automática en MVP.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/organizer">Ir al panel de organizador</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tus equipos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Crea un equipo 5v5 o gestiona uno donde ya eres miembro.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/teams">Ver equipos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
