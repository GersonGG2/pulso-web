'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Crown, Loader2, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { FadeIn, Stagger, StaggerItem, HoverLift } from '@/components/motion';
import { ApiError, useApiClient } from '@/lib/api-client';
import { LANE_META, LANE_ORDER, type LolRole } from './lane-icons';
import { LaneSlot, type LaneSlotMember } from './lane-slot';

type TeamRole = 'STARTER' | 'SUBSTITUTE' | 'COACH' | 'MANAGER';

interface TeamMember {
  id: string;
  playerId: string;
  role: TeamRole;
  lolRole: LolRole | null;
  isCaptain: boolean;
  joinedAt: string;
  leftAt: string | null;
  player: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    zScore?: number;
    tier?: string;
    country?: string;
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

type Confirm = {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => Promise<void> | void;
} | null;

export function TeamRoster({
  team: initialTeam,
  myPlayerId,
}: {
  team: Team;
  myPlayerId: string | null;
}) {
  const router = useRouter();
  const api = useApiClient();
  const [team, setTeam] = useState<Team>(initialTeam);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<Confirm>(null);
  const [showAdd, setShowAdd] = useState<TeamRole | null>(null);
  const [presetLane, setPresetLane] = useState<LolRole | undefined>();

  const activeMembers = team.members.filter((m) => !m.leftAt);
  const myMember = activeMembers.find((m) => m.playerId === myPlayerId);
  const isCaptain = myMember?.isCaptain === true;
  const isMember = !!myMember;

  const startersByLane: Record<LolRole, TeamMember | undefined> = {
    TOP: undefined,
    JUNGLE: undefined,
    MID: undefined,
    ADC: undefined,
    SUPPORT: undefined,
  };
  const startersWithoutLane: TeamMember[] = [];
  for (const m of activeMembers) {
    if (m.role !== 'STARTER') continue;
    if (m.lolRole && !startersByLane[m.lolRole]) {
      startersByLane[m.lolRole] = m;
    } else {
      startersWithoutLane.push(m);
    }
  }
  const takenLanes = (Object.keys(startersByLane) as LolRole[]).filter(
    (l) => startersByLane[l],
  );
  const substitutes = activeMembers.filter((m) => m.role === 'SUBSTITUTE');
  const staff = activeMembers.filter((m) => m.role === 'COACH' || m.role === 'MANAGER');

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

  // -----------------------------
  // Direct mutations (no confirm)
  // -----------------------------

  async function changeLane(playerId: string, lolRole: LolRole | null) {
    const ok = await run(`lane-${playerId}`, () =>
      api.patch(`/teams/${team.id}/members/${playerId}`, { lolRole }),
    );
    if (ok) await refresh();
  }

  async function changeRole(playerId: string, role: TeamRole) {
    const ok = await run(`role-${playerId}`, () =>
      api.patch(`/teams/${team.id}/members/${playerId}`, { role }),
    );
    if (ok) await refresh();
  }

  // -----------------------------
  // Confirmed mutations
  // -----------------------------

  function requestTransferCaptain(target: TeamMember) {
    setConfirmDialog({
      title: `Transferir captain a ${target.player.displayName}`,
      description:
        'Vas a dejar de ser captain. La nueva persona podrá editar el equipo, invitar miembros y gestionar inscripciones.',
      confirmLabel: 'Transferir captain',
      onConfirm: async () => {
        const ok = await run(`captain-${target.playerId}`, () =>
          api.patch(`/teams/${team.id}/members/${target.playerId}`, { isCaptain: true }),
        );
        if (ok) {
          setConfirmDialog(null);
          await refresh();
        }
      },
    });
  }

  function requestRemoveOther(target: TeamMember) {
    setConfirmDialog({
      title: `Remover a ${target.player.displayName}`,
      description: `Se quitará del equipo "${team.name}". Puedes volver a invitarlo después si lo necesitas.`,
      confirmLabel: 'Remover',
      variant: 'destructive',
      onConfirm: async () => {
        const ok = await run(`remove-${target.playerId}`, () =>
          api.del(`/teams/${team.id}/members/${target.playerId}`),
        );
        if (ok) {
          setConfirmDialog(null);
          await refresh();
        }
      },
    });
  }

  function requestLeaveTeam() {
    if (!myMember) return;
    // Captain trying to leave with other members → combined flow
    if (isCaptain && activeMembers.length > 1) {
      const candidate = activeMembers.find((m) => m.playerId !== myMember.playerId);
      if (!candidate) return;
      setConfirmDialog({
        title: 'Eres captain del equipo',
        description: `Para salir, primero tienes que transferir captaincy. ¿Pasar captain a ${candidate.player.displayName} y salir del equipo?`,
        confirmLabel: `Transferir y salir`,
        variant: 'destructive',
        onConfirm: async () => {
          const transferOk = await run('captain-transfer', () =>
            api.patch(`/teams/${team.id}/members/${candidate.playerId}`, {
              isCaptain: true,
            }),
          );
          if (!transferOk) return;
          const leaveOk = await run('leave', () =>
            api.del(`/teams/${team.id}/members/${myMember.playerId}`),
          );
          if (leaveOk) {
            setConfirmDialog(null);
            router.push('/dashboard/teams');
          }
        },
      });
      return;
    }

    setConfirmDialog({
      title: 'Salir del equipo',
      description: 'Tu plaza queda libre. Si te re-invitan podrás volver a entrar.',
      confirmLabel: 'Salir',
      variant: 'destructive',
      onConfirm: async () => {
        const ok = await run('leave', () =>
          api.del(`/teams/${team.id}/members/${myMember.playerId}`),
        );
        if (ok) {
          setConfirmDialog(null);
          router.push('/dashboard/teams');
        }
      },
    });
  }

  function requestDeleteTeam() {
    setConfirmDialog({
      title: `Eliminar "${team.name}"`,
      description:
        'Esta acción no es reversible. El equipo se borra y se desinscribe de cualquier torneo activo.',
      confirmLabel: 'Eliminar equipo',
      variant: 'destructive',
      onConfirm: async () => {
        const ok = await run('delete', () => api.del(`/teams/${team.id}`));
        if (ok) {
          setConfirmDialog(null);
          router.push('/dashboard/teams');
        }
      },
    });
  }

  function openAddForLane(lane: LolRole) {
    setPresetLane(lane);
    setShowAdd('STARTER');
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-baseline gap-3">
                {team.name}
                <span className="font-mono text-sm text-[var(--color-muted-foreground)]">
                  {team.tag}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{team.country}</Badge>
                {isCaptain && <Badge>Eres captain</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-[var(--color-muted-foreground)]">
              {activeMembers.length} miembros activos · creado{' '}
              {new Date(team.createdAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-[var(--color-destructive)]"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2">
              {isMember && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestLeaveTeam}
                  disabled={busy !== null}
                >
                  {busy === 'leave' && <Loader2 className="h-4 w-4 animate-spin" />}
                  <UserMinus className="h-4 w-4" />
                  Salir del equipo
                </Button>
              )}
              {isCaptain && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestDeleteTeam}
                  disabled={busy !== null}
                >
                  {busy === 'delete' && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Trash2 className="h-4 w-4" />
                  Eliminar equipo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Starters</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            5 slots por lane — TOP / JG / MID / ADC / SUPP
          </p>
        </div>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" delay={0.1}>
          {LANE_ORDER.map((lane) => {
            const member = startersByLane[lane];
            const slotMember: LaneSlotMember | null = member
              ? {
                  id: member.id,
                  playerId: member.playerId,
                  isCaptain: member.isCaptain,
                  player: member.player,
                }
              : null;
            return (
              <StaggerItem key={lane}>
                <LaneSlot
                  lane={lane}
                  member={slotMember}
                  canManage={isCaptain}
                  isMe={member?.playerId === myPlayerId}
                  busy={busy !== null}
                  takenLanes={takenLanes}
                  onAssign={() => openAddForLane(lane)}
                  onMoveToLane={
                    member && isCaptain ? (l) => changeLane(member.playerId, l) : undefined
                  }
                  onUnassignLane={
                    member && isCaptain ? () => changeLane(member.playerId, null) : undefined
                  }
                  onTransferCaptain={
                    member && isCaptain && !member.isCaptain
                      ? () => requestTransferCaptain(member)
                      : undefined
                  }
                  onRemove={
                    member && isCaptain && member.playerId !== myPlayerId
                      ? () => requestRemoveOther(member)
                      : undefined
                  }
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {startersWithoutLane.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Starters sin lane asignada
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {startersWithoutLane.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isCaptainView={isCaptain}
                isMe={m.playerId === myPlayerId}
                busy={busy !== null}
                takenLanes={takenLanes}
                onAssignLane={(lane) => changeLane(m.playerId, lane)}
                onTransferCaptain={() => requestTransferCaptain(m)}
                onRemove={() => requestRemoveOther(m)}
                showLaneSelect
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Suplentes ({substitutes.length})
        </h3>
        {substitutes.length === 0 ? (
          <EmptyBench
            label="Sin suplentes"
            hint={
              isCaptain
                ? 'Agrega jugadores de respaldo para emergencias durante un torneo.'
                : undefined
            }
            onAdd={isCaptain ? () => setShowAdd('SUBSTITUTE') : undefined}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {substitutes.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isCaptainView={isCaptain}
                  isMe={m.playerId === myPlayerId}
                  busy={busy !== null}
                  takenLanes={takenLanes}
                  onPromote={() => changeRole(m.playerId, 'STARTER')}
                  onRemove={() => requestRemoveOther(m)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Staff ({staff.length})
        </h3>
        {staff.length === 0 ? (
          <EmptyBench
            label="Sin coach ni manager"
            hint={isCaptain ? 'Opcional — staff técnico y administrativo.' : undefined}
            onAdd={isCaptain ? () => setShowAdd('COACH') : undefined}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {staff.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isCaptainView={isCaptain}
                  isMe={m.playerId === myPlayerId}
                  busy={busy !== null}
                  takenLanes={takenLanes}
                  onRemove={() => requestRemoveOther(m)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {isCaptain && (
        <AnimatePresence mode="wait">
          {showAdd && (
            <motion.div
              key={showAdd}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <AddMemberForm
                teamId={team.id}
                defaultRole={showAdd}
                defaultLane={presetLane}
                busy={busy !== null}
                onSubmit={async ({ playerId, role, lolRole }) => {
                  const ok = await run('add', () =>
                    api.post(`/teams/${team.id}/members`, { playerId, role, lolRole }),
                  );
                  if (ok) {
                    setShowAdd(null);
                    setPresetLane(undefined);
                    await refresh();
                  }
                }}
                onCancel={() => {
                  setShowAdd(null);
                  setPresetLane(undefined);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {isCaptain && !showAdd && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowAdd('STARTER')}>
            <UserPlus className="h-4 w-4" />
            Agregar starter
          </Button>
          <Button variant="outline" onClick={() => setShowAdd('SUBSTITUTE')}>
            <UserPlus className="h-4 w-4" />
            Agregar suplente
          </Button>
          <Button variant="outline" onClick={() => setShowAdd('COACH')}>
            <UserPlus className="h-4 w-4" />
            Agregar staff
          </Button>
        </div>
      )}

      {!isMember && (
        <Card>
          <CardContent className="py-6 text-sm text-[var(--color-muted-foreground)]">
            No eres miembro de este equipo. Solo el captain puede invitarte.
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant}
        loading={busy !== null}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}

// -----------------------------
// MemberRow — used for subs, staff, starters without lane
// -----------------------------

interface MemberRowProps {
  member: TeamMember;
  isCaptainView: boolean;
  isMe: boolean;
  busy: boolean;
  takenLanes: LolRole[];
  onAssignLane?: (lane: LolRole) => void;
  onPromote?: () => void;
  onTransferCaptain?: () => void;
  onRemove?: () => void;
  showLaneSelect?: boolean;
}

function MemberRow({
  member,
  isCaptainView,
  isMe,
  busy,
  takenLanes,
  onAssignLane,
  onPromote,
  onTransferCaptain,
  onRemove,
  showLaneSelect,
}: MemberRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      <HoverLift lift={1} scale={1.005}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-mono text-xs font-bold text-[var(--color-primary)]">
              {member.player.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <Link
                href={`/players/${member.player.username}`}
                className="block truncate font-medium hover:text-[var(--color-primary)]"
              >
                {member.player.displayName}
              </Link>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                @{member.player.username}
                {member.player.tier && ` · ${member.player.tier}`}
              </p>
            </div>
            {member.isCaptain && (
              <Badge className="gap-1">
                <Crown className="h-3 w-3" />
                Captain
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {member.role}
            </Badge>
            {showLaneSelect && isCaptainView && onAssignLane && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) onAssignLane(e.target.value as LolRole);
                }}
                disabled={busy}
                className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 text-xs"
              >
                <option value="">Asignar lane…</option>
                {LANE_ORDER.map((l) => (
                  <option key={l} value={l} disabled={takenLanes.includes(l)}>
                    {LANE_META[l].label}
                    {takenLanes.includes(l) ? ' (ocupada)' : ''}
                  </option>
                ))}
              </select>
            )}
            {isCaptainView && onPromote && (
              <Button size="sm" variant="outline" onClick={onPromote} disabled={busy}>
                Subir a starter
              </Button>
            )}
            {isCaptainView && !member.isCaptain && onTransferCaptain && (
              <Button
                size="sm"
                variant="outline"
                onClick={onTransferCaptain}
                disabled={busy}
              >
                <Crown className="h-3 w-3" />
                Captain
              </Button>
            )}
            {isCaptainView && !isMe && onRemove && (
              <Button size="sm" variant="outline" onClick={onRemove} disabled={busy}>
                <UserMinus className="h-3 w-3" />
                Remover
              </Button>
            )}
          </div>
        </div>
      </HoverLift>
    </motion.div>
  );
}

// -----------------------------
// EmptyBench
// -----------------------------

function EmptyBench({
  label,
  hint,
  onAdd,
}: {
  label: string;
  hint?: string;
  onAdd?: () => void;
}) {
  return (
    <HoverLift lift={1} scale={1.005}>
      <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/30 p-5">
        <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
        {hint && <p className="text-xs text-[var(--color-muted-foreground)]/70">{hint}</p>}
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <UserPlus className="h-3 w-3" />
            Agregar
          </Button>
        )}
      </div>
    </HoverLift>
  );
}

// -----------------------------
// AddMemberForm
// -----------------------------

interface AddMemberFormProps {
  teamId: string;
  defaultRole: TeamRole;
  defaultLane?: LolRole;
  busy: boolean;
  onSubmit: (input: { playerId: string; role: TeamRole; lolRole?: LolRole }) => Promise<void>;
  onCancel: () => void;
}

function AddMemberForm({
  defaultRole,
  defaultLane,
  busy,
  onSubmit,
  onCancel,
}: AddMemberFormProps) {
  const [playerId, setPlayerId] = useState('');
  const [role, setRole] = useState<TeamRole>(defaultRole);
  const [lolRole, setLolRole] = useState<LolRole | ''>(defaultLane ?? '');

  function handle(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      playerId,
      role,
      lolRole: role === 'STARTER' && lolRole ? (lolRole as LolRole) : undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Agregar {role === 'STARTER' ? 'starter' : role === 'SUBSTITUTE' ? 'suplente' : 'staff'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handle} className="space-y-4">
          <Input
            placeholder="Player ID (cuid)"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Tipo</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm"
              >
                <option value="STARTER">Starter</option>
                <option value="SUBSTITUTE">Suplente</option>
                <option value="COACH">Coach</option>
                <option value="MANAGER">Manager</option>
              </select>
            </label>
            <AnimatePresence>
              {role === 'STARTER' && (
                <motion.label
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm"
                >
                  <span className="mb-1 block font-medium">Lane (opcional)</span>
                  <div className="grid grid-cols-5 gap-1">
                    {LANE_ORDER.map((l) => {
                      const meta = LANE_META[l];
                      const Icon = meta.icon;
                      const active = lolRole === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLolRole(active ? '' : l)}
                          className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-base ${
                            active
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-[10px] uppercase tracking-wider">
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.label>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !playerId}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Agregar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Por ahora ingresa el Player ID manualmente. Buscador por username viene después.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
