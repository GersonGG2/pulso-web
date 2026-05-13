import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { TournamentManagement } from '@/components/organizer/tournament-management';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Gestionar torneo' };

interface Props {
  params: Promise<{ id: string }>;
}

interface TournamentDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  status:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'REGISTRATION_OPEN'
    | 'REGISTRATION_CLOSED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  modality: string;
  region: string;
  maxParticipants: number;
  startsAt: string;
  organizer: { id: string; organizationName: string };
}

interface MatchSummary {
  id: string;
  round: number;
  bracketPosition: string;
  status: string;
  winnerSide: string | null;
  participants: {
    id: string;
    side: string;
    win: boolean | null;
    player: { id: string; username: string; displayName: string };
  }[];
}

async function fetchTournament(id: string, token: string): Promise<TournamentDetail | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/tournaments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok ? ((await res.json()) as TournamentDetail) : null;
}

async function fetchMyOrganizerId(token: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/organizers/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id: string };
  return data.id;
}

async function fetchMatches(id: string, token: string): Promise<MatchSummary[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/tournaments/${id}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: MatchSummary[] };
  return data.items;
}

export default async function ManageTournamentPage({ params }: Props) {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Tournament management" />;
  const { id } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const [tournament, myOrganizerId] = await Promise.all([
    fetchTournament(id, token),
    fetchMyOrganizerId(token),
  ]);

  if (!tournament) notFound();
  if (!myOrganizerId || tournament.organizer.id !== myOrganizerId) {
    return (
      <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-6 text-sm text-[var(--color-destructive)]">
        No tienes acceso a este torneo.
      </div>
    );
  }

  const matches = await fetchMatches(id, token);

  return (
    <>
      <header className="mb-8">
        <Link
          href="/dashboard/organizer"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ← Organizer
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{tournament.modality.replace('_', ' ')}</Badge>
          <Badge variant="outline">{tournament.region}</Badge>
        </div>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {tournament.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted-foreground)]">
          {tournament.description}
        </p>
      </header>

      <TournamentManagement
        tournament={{
          id: tournament.id,
          name: tournament.name,
          slug: tournament.slug,
          status: tournament.status as
            | 'DRAFT'
            | 'PUBLISHED'
            | 'IN_PROGRESS'
            | 'COMPLETED'
            | 'CANCELLED',
          modality: tournament.modality,
          region: tournament.region,
          maxParticipants: tournament.maxParticipants,
        }}
        initialMatches={matches}
      />
    </>
  );
}
