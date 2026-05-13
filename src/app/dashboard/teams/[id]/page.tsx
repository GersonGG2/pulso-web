import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { TeamManagement } from '@/components/team/team-management';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Equipo' };

interface Props {
  params: Promise<{ id: string }>;
}

interface TeamDetail {
  id: string;
  name: string;
  tag: string;
  country: string;
  logoUrl: string | null;
  createdAt: string;
  members: {
    id: string;
    playerId: string;
    role: 'STARTER' | 'SUBSTITUTE' | 'COACH' | 'MANAGER';
    isCaptain: boolean;
    joinedAt: string;
    leftAt: string | null;
    player: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  }[];
}

async function fetchTeam(id: string, token: string): Promise<TeamDetail | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/teams/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok ? ((await res.json()) as TeamDetail) : null;
}

async function fetchMyPlayerId(token: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/players/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id: string };
  return data.id;
}

export default async function TeamDetailPage({ params }: Props) {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Team" />;
  const { id } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const [team, myPlayerId] = await Promise.all([fetchTeam(id, token), fetchMyPlayerId(token)]);
  if (!team) notFound();

  return (
    <>
      <header className="mb-6">
        <Link
          href="/dashboard/teams"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ← Equipos
        </Link>
      </header>
      <TeamManagement team={team} myPlayerId={myPlayerId} />
    </>
  );
}
