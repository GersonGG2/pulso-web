import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Equipos' };

interface TeamRow {
  id: string;
  name: string;
  tag: string;
  country: string;
  logoUrl: string | null;
  members: {
    playerId: string;
    isCaptain: boolean;
    leftAt: string | null;
  }[];
}

interface Player {
  id: string;
}

async function fetchMyPlayer(token: string): Promise<Player | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/players/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok ? ((await res.json()) as Player) : null;
}

async function fetchMyTeams(token: string, playerId: string): Promise<TeamRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/teams?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: TeamRow[] };
  return data.items.filter((t) =>
    t.members.some((m) => m.playerId === playerId && !m.leftAt),
  );
}

export default async function TeamsPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Teams" />;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const player = await fetchMyPlayer(token);
  if (!player) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Necesitas un perfil de jugador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-[var(--color-muted-foreground)]">
            Para crear o unirte a equipos primero debes completar tu perfil de jugador.
          </p>
          <Button asChild>
            <Link href="/onboarding/player">Crear perfil →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const teams = await fetchMyTeams(token, player.id);

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Equipos
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tus equipos</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Necesarios para modalidad 5v5.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <Plus className="h-4 w-4" />
            Nuevo equipo
          </Link>
        </Button>
      </header>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-[var(--color-muted-foreground)]">
            Aún no estás en ningún equipo. Crea el tuyo o pide a un captain que te invite.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const myMember = t.members.find((m) => m.playerId === player.id && !m.leftAt);
            const activeMembers = t.members.filter((m) => !m.leftAt).length;
            return (
              <Link key={t.id} href={`/dashboard/teams/${t.id}`} className="group">
                <Card className="h-full transition-colors group-hover:border-[var(--color-primary)]/40">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">{t.country}</Badge>
                      {myMember?.isCaptain && <Badge>Captain</Badge>}
                    </div>
                    <CardTitle className="group-hover:text-[var(--color-primary)]">
                      {t.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-[var(--color-muted-foreground)]">
                    <p className="font-mono">{t.tag}</p>
                    <p className="mt-1">
                      {activeMembers} miembro{activeMembers !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
