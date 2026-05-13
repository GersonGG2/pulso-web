import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Organizer · Dashboard' };

interface Organizer {
  id: string;
  organizationName: string;
  verified: boolean;
}

interface TournamentRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  modality: string;
  region: string;
  maxParticipants: number;
  startsAt: string;
  organizer: { id: string; organizationName: string };
}

async function fetchOrganizer(token: string): Promise<Organizer | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/organizers/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok ? ((await res.json()) as Organizer) : null;
}

async function fetchMyTournaments(
  token: string,
  organizerId: string,
): Promise<TournamentRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  // Backend no soporta filtro por organizerId aún; pedimos un page grande y filtramos
  const res = await fetch(`${apiUrl}/tournaments?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: TournamentRow[] };
  return data.items.filter((t) => t.organizer.id === organizerId);
}

export default async function OrganizerDashboardPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Organizer" />;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const organizer = await fetchOrganizer(token);

  if (!organizer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aún no eres organizador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Solicita tu perfil de organizador para empezar a publicar torneos en Pulso. En MVP la
            aprobación es automática.
          </p>
          <Button asChild>
            <Link href="/dashboard/organizer/apply">Solicitar acceso →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tournaments = await fetchMyTournaments(token, organizer.id);

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Organizador
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {organizer.organizationName}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {organizer.verified ? (
              <span className="text-[var(--color-primary)]">✓ Verificado</span>
            ) : (
              'Pendiente de verificación'
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/organizer/tournaments/new">
            <Plus className="h-4 w-4" />
            Nuevo torneo
          </Link>
        </Button>
      </header>

      <h2 className="mb-4 text-xl font-semibold tracking-tight">Tus torneos</h2>

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-[var(--color-muted-foreground)]">
            Aún no tienes torneos. Crea el primero — sale en estado DRAFT y lo puedes editar
            antes de publicar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/organizer/tournaments/${t.id}`}
              className="group"
            >
              <Card className="h-full transition-colors group-hover:border-[var(--color-primary)]/40">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{t.modality.replace('_', ' ')}</Badge>
                    <Badge>{t.status}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-[var(--color-primary)]">
                    {t.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-[var(--color-muted-foreground)]">
                  <p>
                    Cupo{' '}
                    <span className="text-[var(--color-foreground)]">
                      {t.maxParticipants}
                    </span>{' '}
                    · {t.region}
                  </p>
                  <p>
                    Inicia{' '}
                    <span className="text-[var(--color-foreground)]">
                      {new Date(t.startsAt).toLocaleString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
