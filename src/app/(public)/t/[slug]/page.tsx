import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, Reveal, Stagger, StaggerItem, HoverLift } from '@/components/motion';
import {
  RegistrationActions,
  type TournamentInfo,
} from '@/components/tournament/registration-actions';
import { FreeAgentPool } from '@/components/free-agents/free-agent-pool';
import type { FreeAgent } from '@/components/free-agents/free-agent-card';
import { apiGet, ApiError } from '@/lib/api';
import { CLERK_ENABLED } from '@/lib/auth';
import type { TournamentSummary } from '@/lib/types';

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

interface MyRegistration {
  id: string;
  tournamentId: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'WITHDRAWN' | 'DISQUALIFIED';
  player: { id: string; username: string; displayName: string } | null;
  team: { id: string; name: string; tag: string } | null;
  checkedInAt: string | null;
  registeredAt: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const t = await apiGet<TournamentSummary>(`/tournaments/by-slug/${slug}`);
    return { title: t.name, description: t.description };
  } catch {
    return { title: 'Torneo' };
  }
}

async function fetchTournament(slug: string) {
  try {
    return await apiGet<TournamentSummary>(`/tournaments/by-slug/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function fetchMatches(tournamentId: string): Promise<MatchSummary[]> {
  try {
    const r = await apiGet<{ items: MatchSummary[] }>(
      `/tournaments/${tournamentId}/matches`,
      0,
    );
    return r.items;
  } catch {
    return [];
  }
}

async function fetchFreeAgentPool(tournamentId: string): Promise<FreeAgent[]> {
  try {
    return await apiGet<FreeAgent[]>(`/tournaments/${tournamentId}/free-agents`, 0);
  } catch {
    return [];
  }
}

interface MyCaptainTeam {
  id: string;
  name: string;
  tag: string;
}

async function fetchMyState(
  tournamentId: string,
  token: string,
): Promise<{
  player: { id: string } | null;
  myFreeAgentId: string | null;
  captainOfTeam: MyCaptainTeam | null;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const headers = { Authorization: `Bearer ${token}` };

  const playerRes = await fetch(`${apiUrl}/players/me`, { headers, cache: 'no-store' });
  if (!playerRes.ok) {
    return { player: null, myFreeAgentId: null, captainOfTeam: null };
  }
  const player = (await playerRes.json()) as { id: string };

  // Try to find if I'm currently a free agent in this tournament.
  let myFreeAgentId: string | null = null;
  try {
    const poolRes = await fetch(
      `${apiUrl}/tournaments/${tournamentId}/free-agents`,
      { headers, cache: 'no-store' },
    );
    if (poolRes.ok) {
      const pool = (await poolRes.json()) as { id: string; player: { id: string } }[];
      myFreeAgentId = pool.find((p) => p.player.id === player.id)?.id ?? null;
    }
  } catch {
    // ignore
  }

  // Try to find my first team where I'm captain (MVP: pick the first one).
  let captainOfTeam: MyCaptainTeam | null = null;
  try {
    const myTeamsRes = await fetch(`${apiUrl}/teams/me`, { headers, cache: 'no-store' });
    if (myTeamsRes.ok) {
      const teams = (await myTeamsRes.json()) as {
        id: string;
        name: string;
        tag: string;
        members: { playerId: string; isCaptain: boolean; leftAt: string | null }[];
      }[];
      const captainTeam = teams.find((t) =>
        t.members.some(
          (m) => m.playerId === player.id && m.isCaptain && !m.leftAt,
        ),
      );
      if (captainTeam) {
        captainOfTeam = { id: captainTeam.id, name: captainTeam.name, tag: captainTeam.tag };
      }
    }
  } catch {
    // ignore
  }

  return { player, myFreeAgentId, captainOfTeam };
}

async function fetchMyRegistration(
  tournamentId: string,
  token: string,
): Promise<MyRegistration | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const res = await fetch(
      `${apiUrl}/tournaments/${tournamentId}/registrations/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as MyRegistration | null;
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function TournamentPage({ params }: Props) {
  const { slug } = await params;
  const tournament = await fetchTournament(slug);
  if (!tournament) notFound();

  const matches = await fetchMatches(tournament.id);
  const rounds = groupByRound(matches);

  let myRegistration: MyRegistration | null = null;
  let myFreeAgentId: string | null = null;
  let captainOfTeam: MyCaptainTeam | null = null;
  let hasPlayerProfile = false;
  let isSignedIn = false;
  if (CLERK_ENABLED) {
    const { userId, getToken } = await auth();
    if (userId) {
      isSignedIn = true;
      const token = await getToken();
      if (token) {
        myRegistration = await fetchMyRegistration(tournament.id, token);
        const state = await fetchMyState(tournament.id, token);
        hasPlayerProfile = !!state.player;
        myFreeAgentId = state.myFreeAgentId;
        captainOfTeam = state.captainOfTeam;
      }
    }
  }

  const showFreeAgentPool = tournament.modality === 'TEAM_5V5';
  const freeAgentPool = showFreeAgentPool ? await fetchFreeAgentPool(tournament.id) : [];

  const tournamentInfo: TournamentInfo = {
    id: tournament.id,
    status: tournament.status,
    modality: tournament.modality,
    entryFeeMxnCents: tournament.entryFeeMxnCents,
    registrationOpensAt: tournament.registrationOpensAt as unknown as string,
    registrationClosesAt: tournament.registrationClosesAt as unknown as string,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <FadeIn>
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{tournament.modality.replace('_', ' ')}</Badge>
            <Badge>{tournament.status}</Badge>
            <Badge variant="outline">{tournament.region}</Badge>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {tournament.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
            {tournament.description}
          </p>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            Organiza{' '}
            <span className="text-[var(--color-foreground)]">
              {tournament.organizer.organizationName}
            </span>
            {tournament.organizer.verified && (
              <span className="ml-2 text-[var(--color-primary)]">✓ Verificado</span>
            )}
          </p>
        </header>
      </FadeIn>

      <Stagger className="mb-10 grid gap-4 sm:grid-cols-3" delay={0.1}>
        <Stat label="Cupo" value={String(tournament.maxParticipants)} />
        <Stat
          label="Inicio"
          value={new Date(tournament.startsAt).toLocaleString('es-MX', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        <Stat
          label="Inscripción"
          value={
            tournament.entryFeeMxnCents === 0
              ? 'Gratis'
              : `$${(tournament.entryFeeMxnCents / 100).toFixed(0)} MXN`
          }
        />
      </Stagger>

      <RegistrationActions
        tournament={tournamentInfo}
        initialRegistration={myRegistration}
      />

      {showFreeAgentPool && (
        <div className="mb-10">
          <FreeAgentPool
            tournamentId={tournament.id}
            initialPool={freeAgentPool}
            isSignedIn={isSignedIn}
            hasPlayerProfile={hasPlayerProfile}
            myFreeAgentId={myFreeAgentId}
            canManageTeam={captainOfTeam}
          />
        </div>
      )}

      <Reveal>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Bracket</h2>
      </Reveal>
      {rounds.length === 0 ? (
        <Reveal className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-[var(--color-muted-foreground)]">
            El bracket se generará cuando el organizador inicie el torneo.
          </p>
        </Reveal>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {rounds.map((round, idx) => (
            <div key={idx} className="flex min-w-[260px] flex-col gap-3">
              <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Ronda {idx + 1}
              </h3>
              {round.map((m) => (
                <Card key={m.id}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-[var(--color-muted-foreground)]">
                      {m.bracketPosition} · {m.status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-4 pt-0 text-sm">
                    {m.participants.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between rounded px-2 py-1 ${
                          p.win ? 'bg-[var(--color-primary)]/10' : ''
                        }`}
                      >
                        <span className={p.win ? 'font-semibold' : ''}>
                          {p.player.displayName}
                        </span>
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          {p.side}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <StaggerItem>
      <HoverLift className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold">{value}</p>
      </HoverLift>
    </StaggerItem>
  );
}

function groupByRound(matches: MatchSummary[]): MatchSummary[][] {
  const map = new Map<number, MatchSummary[]>();
  for (const m of matches) {
    const arr = map.get(m.round) ?? [];
    arr.push(m);
    map.set(m.round, arr);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, list]) =>
      [...list].sort((a, b) => a.bracketPosition.localeCompare(b.bracketPosition)),
    );
}
