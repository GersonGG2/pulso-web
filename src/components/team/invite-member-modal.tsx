'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PlayerSearch,
  type SearchedPlayer,
} from '@/components/players/player-search';
import { LANE_META, LANE_ORDER, type LolRole } from './lane-icons';

type TeamRole = 'STARTER' | 'SUBSTITUTE' | 'COACH' | 'MANAGER';

export interface InviteMemberSubmit {
  playerId: string;
  role: TeamRole;
  lolRole?: LolRole;
  message?: string;
}

interface InviteMemberModalProps {
  open: boolean;
  defaultRole: TeamRole;
  defaultLane?: LolRole;
  excludePlayerIds: string[];
  takenLanes: LolRole[];
  busy: boolean;
  onSubmit: (input: InviteMemberSubmit) => Promise<void> | void;
  onCancel: () => void;
}

export function InviteMemberModal({
  open,
  defaultRole,
  defaultLane,
  excludePlayerIds,
  takenLanes,
  busy,
  onSubmit,
  onCancel,
}: InviteMemberModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<SearchedPlayer | null>(null);
  const [role, setRole] = useState<TeamRole>(defaultRole);
  const [lolRole, setLolRole] = useState<LolRole | ''>(defaultLane ?? '');
  const [message, setMessage] = useState('');

  // Reset when re-opened with different defaults
  useEffect(() => {
    if (open) {
      setSelectedPlayer(null);
      setRole(defaultRole);
      setLolRole(defaultLane ?? '');
      setMessage('');
    }
  }, [open, defaultRole, defaultLane]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  function handle(e: FormEvent) {
    e.preventDefault();
    if (!selectedPlayer) return;
    onSubmit({
      playerId: selectedPlayer.id,
      role,
      lolRole: role === 'STARTER' && lolRole ? (lolRole as LolRole) : undefined,
      message: message.trim() || undefined,
    });
  }

  const roleLabel =
    role === 'STARTER' ? 'starter' : role === 'SUBSTITUTE' ? 'suplente' : 'staff';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={busy ? undefined : onCancel}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              aria-label="Cerrar"
              className="absolute right-3 top-3 rounded-md p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)]/40 hover:text-[var(--color-foreground)]"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-semibold tracking-tight">
              Invitar {roleLabel} al equipo
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              El jugador recibe una invitación en su dashboard. Solo entra al equipo si la
              acepta.
            </p>

            <form onSubmit={handle} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Jugador</label>
                <PlayerSearch
                  excludeIds={excludePlayerIds}
                  selectedPlayer={selectedPlayer}
                  onSelect={setSelectedPlayer}
                  onClear={() => setSelectedPlayer(null)}
                  disabled={busy}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamRole)}
                  disabled={busy}
                  className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm"
                >
                  <option value="STARTER">Starter</option>
                  <option value="SUBSTITUTE">Suplente</option>
                  <option value="COACH">Coach</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <AnimatePresence>
                {role === 'STARTER' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="mb-1 block text-sm font-medium">
                      Lane propuesta (opcional)
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {LANE_ORDER.map((l) => {
                        const meta = LANE_META[l];
                        const Icon = meta.icon;
                        const active = lolRole === l;
                        const taken = takenLanes.includes(l);
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setLolRole(active ? '' : l)}
                            disabled={busy || taken}
                            title={taken ? `${meta.label} ya ocupada` : meta.label}
                            className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-base ${
                              active
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                : taken
                                  ? 'cursor-not-allowed border-[var(--color-border)] opacity-40'
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
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1 block text-sm font-medium">Mensaje (opcional)</label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Te quiero en el equipo para el torneo X…"
                  maxLength={280}
                  disabled={busy}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy || !selectedPlayer}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enviar invitación
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
