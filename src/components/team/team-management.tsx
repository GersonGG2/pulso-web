'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

type TeamRole = 'STARTER' | 'SUBSTITUTE' | 'COACH' | 'MANAGER';

const TEAM_ROLES: { value: TeamRole; label: string }[] = [
  { value: 'STARTER', label: 'Starter' },
  { value: 'SUBSTITUTE', label: 'Substitute' },
  { value: 'COACH', label: 'Coach' },
  { value: 'MANAGER', label: 'Manager' },
];

interface TeamMember {
  id: string;
  playerId: string;
  role: TeamRole;
  isCaptain: boolean;
  joinedAt: string;
  leftAt: string | null;
  player: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface Team {
  id: string;
  name: string;
  tag: string;
  country: string;
  logoUrl: string | null;
  createdAt: string;
  members: TeamMember[];
}

export function TeamManagement({
  team: initialTeam,
  myPlayerId,
}: {
  team: Team;
  myPlayerId: string | null;
}) {
  const router = useRouter();
  const api = useApiClient();
  const [team, setTeam] = useState<Team>(initialTeam);
  const [newPlayerId, setNewPlayerId] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<TeamRole>('STARTER');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const myMember = team.members.find((m) => m.playerId === myPlayerId && !m.leftAt);
  const isCaptain = myMember?.isCaptain === true;
  const isMember = !!myMember;

  async function refresh() {
    const fresh = await api.get<Team>(`/teams/${team.id}`);
    setTeam(fresh);
    router.refresh();
  }

  async function run<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    setBusy(label);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    const ok = await run('add', () =>
      api.post(`/teams/${team.id}/members`, {
        playerId: newPlayerId,
        role: newPlayerRole,
      }),
    );
    if (ok) {
      setNewPlayerId('');
      setNewPlayerRole('STARTER');
      await refresh();
    }
  }

  async function changeRole(playerId: string, role: TeamRole) {
    const ok = await run(`role-${playerId}`, () =>
      api.patch(`/teams/${team.id}/members/${playerId}`, { role }),
    );
    if (ok) await refresh();
  }

  async function transferCaptain(playerId: string) {
    if (!confirm('¿Transferir captain a este miembro? Dejarás de ser captain.')) return;
    const ok = await run(`captain-${playerId}`, () =>
      api.patch(`/teams/${team.id}/members/${playerId}`, { isCaptain: true }),
    );
    if (ok) await refresh();
  }

  async function removeMember(playerId: string) {
    const self = playerId === myPlayerId;
    if (
      !confirm(self ? '¿Salir del equipo?' : '¿Remover este miembro?')
    )
      return;
    const ok = await run(`remove-${playerId}`, () =>
      api.del(`/teams/${team.id}/members/${playerId}`),
    );
    if (ok) {
      if (self) router.push('/dashboard/teams');
      else await refresh();
    }
  }

  async function deleteTeam() {
    if (
      !confirm(
        `¿Eliminar el equipo "${team.name}"? Esta acción no es reversible y desinscribe al equipo de cualquier torneo.`,
      )
    )
      return;
    const ok = await run('delete', () => api.del(`/teams/${team.id}`));
    if (ok) router.push('/dashboard/teams');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {team.name}{' '}
              <span className="ml-2 font-mono text-sm text-[var(--color-muted-foreground)]">
                {team.tag}
              </span>
            </CardTitle>
            <Badge variant="outline">{team.country}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-[var(--color-muted-foreground)]">
            {team.members.filter((m) => !m.leftAt).length} miembros activos · creado{' '}
            {new Date(team.createdAt).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          {isCaptain && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteTeam}
              disabled={busy !== null}
            >
              {busy === 'delete' && <Loader2 className="h-4 w-4 animate-spin" />}
              <Trash2 className="h-4 w-4" />
              Eliminar equipo
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Miembros ({team.members.filter((m) => !m.leftAt).length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.members
            .filter((m) => !m.leftAt)
            .map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] p-3"
              >
                <div className="flex items-center gap-3">
                  {member.isCaptain && (
                    <Crown className="h-4 w-4 text-[var(--color-primary)]" />
                  )}
                  <div>
                    <p className="font-medium">{member.player.displayName}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      @{member.player.username}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isCaptain && !member.isCaptain ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        changeRole(member.playerId, e.target.value as TeamRole)
                      }
                      disabled={busy !== null}
                      className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 text-xs"
                    >
                      {TEAM_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="outline">{member.role}</Badge>
                  )}

                  {member.isCaptain && <Badge>Captain</Badge>}

                  {isCaptain && !member.isCaptain && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => transferCaptain(member.playerId)}
                      disabled={busy !== null}
                    >
                      Hacer captain
                    </Button>
                  )}

                  {(isCaptain || member.playerId === myPlayerId) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMember(member.playerId)}
                      disabled={busy !== null}
                    >
                      {member.playerId === myPlayerId ? 'Salir' : 'Remover'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {isCaptain && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={addMember}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]"
            >
              <Input
                placeholder="Player ID (cuid)"
                value={newPlayerId}
                onChange={(e) => setNewPlayerId(e.target.value)}
                required
              />
              <select
                value={newPlayerRole}
                onChange={(e) => setNewPlayerRole(e.target.value as TeamRole)}
                className="flex h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                {TEAM_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={busy !== null || !newPlayerId}>
                {busy === 'add' && <Loader2 className="h-4 w-4 animate-spin" />}
                Agregar
              </Button>
            </form>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Por ahora ingresa el Player ID manualmente. Buscador por username viene después.
            </p>
          </CardContent>
        </Card>
      )}

      {!isMember && (
        <Card>
          <CardContent className="py-6 text-sm text-[var(--color-muted-foreground)]">
            No eres miembro de este equipo. Solo el captain puede invitarte.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
