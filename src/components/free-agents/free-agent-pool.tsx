'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/components/ui/use-confirm';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { ApiError, useApiClient } from '@/lib/api-client';
import { LANE_META, LANE_ORDER, type LolRole } from '@/components/team/lane-icons';
import { FreeAgentCard, type FreeAgent } from './free-agent-card';

interface MyTeam {
  id: string;
  name: string;
  tag: string;
}

interface FreeAgentPoolProps {
  tournamentId: string;
  initialPool: FreeAgent[];
  isSignedIn: boolean;
  hasPlayerProfile: boolean;
  myFreeAgentId: string | null;
  canManageTeam: MyTeam | null; // not null if I'm a captain with my team
}

export function FreeAgentPool({
  tournamentId,
  initialPool,
  isSignedIn,
  hasPlayerProfile,
  myFreeAgentId,
  canManageTeam,
}: FreeAgentPoolProps) {
  const router = useRouter();
  const api = useApiClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [pool, setPool] = useState<FreeAgent[]>(initialPool);
  const [inPool, setInPool] = useState<string | null>(myFreeAgentId);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<FreeAgent | null>(null);

  async function refresh() {
    try {
      const fresh = await api.get<FreeAgent[]>(`/tournaments/${tournamentId}/free-agents`);
      setPool(fresh);
      router.refresh();
    } catch {
      // Silenciar — no rompemos UX si el refetch falla.
    }
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

  async function joinPool(input: { preferredRole?: LolRole; notes?: string }) {
    const created = await run('join', () =>
      api.post<FreeAgent>(`/tournaments/${tournamentId}/free-agents`, input),
    );
    if (created) {
      setInPool(created.id);
      setShowJoinForm(false);
      await refresh();
    }
  }

  async function leavePool() {
    const ok = await confirm({
      title: 'Salir del pool',
      description: 'Si sales, los captains ya no podrán invitarte para este torneo.',
      confirmLabel: 'Salir',
      variant: 'destructive',
    });
    if (!ok) return;
    const left = await run('leave', () =>
      api.del(`/tournaments/${tournamentId}/free-agents/me`),
    );
    if (left) {
      setInPool(null);
      await refresh();
    }
  }

  async function sendInvite(input: { proposedRole?: LolRole; message?: string }) {
    if (!inviteTarget || !canManageTeam) return;
    const ok = await run(`invite-${inviteTarget.id}`, () =>
      api.post(`/tournaments/${tournamentId}/free-agents/${inviteTarget.id}/invite`, {
        teamId: canManageTeam.id,
        proposedRole: input.proposedRole,
        message: input.message,
      }),
    );
    if (ok) {
      setInviteTarget(null);
      await refresh();
    }
  }

  return (
    <section className="space-y-4">
      {confirmDialog}
      <Reveal>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Pool de free agents{' '}
              <span className="text-[var(--color-muted-foreground)]">({pool.length})</span>
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Jugadores sin equipo que pueden ser reclutados para este torneo.
            </p>
          </div>

          {isSignedIn && hasPlayerProfile && !inPool && !canManageTeam && (
            <Button onClick={() => setShowJoinForm(true)} disabled={busy !== null}>
              <UserPlus className="h-4 w-4" />
              Entrar al pool
            </Button>
          )}
          {isSignedIn && inPool && (
            <Button variant="outline" onClick={leavePool} disabled={busy !== null}>
              {busy === 'leave' && <Loader2 className="h-4 w-4 animate-spin" />}
              <LogOut className="h-4 w-4" />
              Salir del pool
            </Button>
          )}
        </div>
      </Reveal>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showJoinForm && (
          <motion.div
            key="join-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <JoinPoolForm
              busy={busy === 'join'}
              onSubmit={joinPool}
              onCancel={() => setShowJoinForm(false)}
            />
          </motion.div>
        )}

        {inviteTarget && (
          <motion.div
            key={`invite-${inviteTarget.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <InviteForm
              agent={inviteTarget}
              team={canManageTeam!}
              busy={busy === `invite-${inviteTarget.id}`}
              onSubmit={sendInvite}
              onCancel={() => setInviteTarget(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {pool.length === 0 ? (
        <Reveal>
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Aún no hay free agents en este torneo.
            </p>
          </div>
        </Reveal>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {pool.map((agent) => (
              <StaggerItem key={agent.id}>
                <FreeAgentCard
                  agent={agent}
                  canInvite={!!canManageTeam}
                  busy={busy !== null}
                  onInvite={() => setInviteTarget(agent)}
                />
              </StaggerItem>
            ))}
          </AnimatePresence>
        </Stagger>
      )}
    </section>
  );
}

// -----------------------------
// JoinPoolForm
// -----------------------------

function JoinPoolForm({
  busy,
  onSubmit,
  onCancel,
}: {
  busy: boolean;
  onSubmit: (input: { preferredRole?: LolRole; notes?: string }) => void;
  onCancel: () => void;
}) {
  const [lane, setLane] = useState<LolRole | ''>('');
  const [notes, setNotes] = useState('');

  function handle(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      preferredRole: lane ? (lane as LolRole) : undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Entrar al pool de free agents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Lane preferida (opcional)
            </label>
            <div className="grid grid-cols-5 gap-1">
              {LANE_ORDER.map((l) => {
                const meta = LANE_META[l];
                const Icon = meta.icon;
                const active = lane === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLane(active ? '' : l)}
                    className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-base ${
                      active
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Notas para los captains (opcional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Disponible noches, hablo español, etc."
              maxLength={280}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar al pool
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// -----------------------------
// InviteForm
// -----------------------------

function InviteForm({
  agent,
  team,
  busy,
  onSubmit,
  onCancel,
}: {
  agent: FreeAgent;
  team: MyTeam;
  busy: boolean;
  onSubmit: (input: { proposedRole?: LolRole; message?: string }) => void;
  onCancel: () => void;
}) {
  const [lane, setLane] = useState<LolRole | ''>(
    agent.preferredRole ?? agent.player.primaryRole ?? '',
  );
  const [message, setMessage] = useState('');

  function handle(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      proposedRole: lane ? (lane as LolRole) : undefined,
      message: message.trim() || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Invitar a {agent.player.user.displayName} a {team.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Lane que le propones</label>
            <div className="grid grid-cols-5 gap-1">
              {LANE_ORDER.map((l) => {
                const meta = LANE_META[l];
                const Icon = meta.icon;
                const active = lane === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLane(active ? '' : l)}
                    className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-base ${
                      active
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-wider">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Mensaje (opcional)</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bienvenido al squad, jugamos noches…"
              maxLength={280}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar invitación
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
