'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { ChevronRight, Crown, MoreHorizontal, Plus, UserMinus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverLift } from '@/components/motion';
import { LANE_META, LANE_ORDER, type LolRole } from './lane-icons';

export interface LaneSlotMember {
  id: string;
  playerId: string;
  isCaptain: boolean;
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

interface LaneSlotProps {
  lane: LolRole;
  member: LaneSlotMember | null;
  canManage: boolean;
  isMe: boolean;
  busy: boolean;
  takenLanes: LolRole[]; // lanes already occupied (so move-to picker can show "ocupada")
  onAssign?: () => void;
  onTransferCaptain?: () => void;
  onUnassignLane?: () => void;
  onMoveToLane?: (newLane: LolRole) => void;
  onRemove?: () => void;
}

export function LaneSlot({
  lane,
  member,
  canManage,
  isMe,
  busy,
  takenLanes,
  onAssign,
  onTransferCaptain,
  onUnassignLane,
  onMoveToLane,
  onRemove,
}: LaneSlotProps) {
  const meta = LANE_META[lane];
  const Icon = meta.icon;
  const [showMove, setShowMove] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (!member) {
    return (
      <HoverLift className="h-full" lift={1} scale={1.005}>
        <div className="group flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/40 p-4 text-center transition-colors hover:border-[var(--color-primary)]/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {meta.label}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Vacante</p>
          </div>
          {canManage && onAssign && (
            <Button size="sm" variant="outline" onClick={onAssign} disabled={busy}>
              <Plus className="h-3 w-3" />
              Asignar
            </Button>
          )}
        </div>
      </HoverLift>
    );
  }

  const otherLanes = LANE_ORDER.filter((l) => l !== lane);

  return (
    <HoverLift className="h-full" lift={2} scale={1.015}>
      <motion.div
        layout
        className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-card)] to-[var(--color-card)]/70"
      >
        {/* Top: lane badge + captain crown */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-primary)]/5 px-3 py-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {meta.label}
            </span>
          </div>
          {member.isCaptain && (
            <motion.div layoutId="captain-crown">
              <Badge className="gap-1">
                <Crown className="h-3 w-3" />
                Captain
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Center: avatar + name + country */}
        <div className="flex flex-1 flex-col items-center gap-2 px-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-mono text-lg font-bold text-[var(--color-primary)]">
            {member.player.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              href={`/players/${member.player.username}`}
              className="block truncate text-sm font-semibold hover:text-[var(--color-primary)]"
            >
              {member.player.displayName}
            </Link>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">
              @{member.player.username}
              {member.player.country && ` · ${member.player.country}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {member.player.zScore !== undefined && (
              <span className="font-mono text-sm font-semibold text-[var(--color-primary)]">
                {member.player.zScore}
              </span>
            )}
            {member.player.tier && (
              <Badge variant="outline" className="text-[10px]">
                {member.player.tier}
              </Badge>
            )}
          </div>
        </div>

        {/* Footer: actions — primary actions visible, others under "más" */}
        {(canManage || isMe) && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-card)]/60 px-2 py-2">
            <AnimatePresence mode="wait" initial={false}>
              {showMove ? (
                <motion.div
                  key="move"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="space-y-1.5"
                >
                  <div className="grid grid-cols-4 gap-1">
                    {otherLanes.map((l) => {
                      const m = LANE_META[l];
                      const LIcon = m.icon;
                      const taken = takenLanes.includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => {
                            if (onMoveToLane) onMoveToLane(l);
                            setShowMove(false);
                          }}
                          disabled={busy || taken}
                          title={taken ? `${m.label} ya ocupada` : `Mover a ${m.label}`}
                          className="flex flex-col items-center gap-0.5 rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-muted-foreground)] transition-base hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-muted-foreground)]"
                        >
                          <LIcon className="h-3 w-3" />
                          <span className="text-[9px] uppercase tracking-wider">
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMove(false)}
                    className="flex w-full items-center justify-center gap-1 rounded-md py-1 text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  >
                    <X className="h-3 w-3" />
                    Cancelar
                  </button>
                </motion.div>
              ) : showMore ? (
                <motion.div
                  key="more"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex flex-wrap gap-1.5"
                >
                  {canManage && onUnassignLane && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onUnassignLane();
                        setShowMore(false);
                      }}
                      disabled={busy}
                      className="text-xs"
                      title="Deja al miembro en el equipo pero sin lane"
                    >
                      Quitar de lane
                    </Button>
                  )}
                  {onRemove && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onRemove();
                        setShowMore(false);
                      }}
                      disabled={busy}
                      className="text-xs text-[var(--color-destructive)]"
                    >
                      <UserMinus className="h-3 w-3" />
                      {isMe ? 'Salir del equipo' : 'Remover'}
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowMore(false)}
                    className="ml-auto rounded-md p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="primary"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {canManage && onMoveToLane && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowMove(true)}
                      disabled={busy}
                      className="text-xs"
                    >
                      <ChevronRight className="h-3 w-3" />
                      Mover lane
                    </Button>
                  )}
                  {canManage && !member.isCaptain && onTransferCaptain && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onTransferCaptain}
                      disabled={busy}
                      className="text-xs"
                    >
                      <Crown className="h-3 w-3" />
                      Captain
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMore(true)}
                    disabled={busy}
                    className="ml-auto px-2"
                    aria-label="Más acciones"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </HoverLift>
  );
}
