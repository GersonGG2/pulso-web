'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { ChevronUp, Crown, MoreHorizontal, UserMinus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverLift } from '@/components/motion';

type TeamRole = 'STARTER' | 'SUBSTITUTE' | 'COACH' | 'MANAGER';

export interface MemberCardData {
  id: string;
  playerId: string;
  role: TeamRole;
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

const ROLE_META: Record<TeamRole, { label: string; tone: string }> = {
  STARTER: { label: 'Starter', tone: 'text-[var(--color-primary)]' },
  SUBSTITUTE: { label: 'Suplente', tone: 'text-blue-400' },
  COACH: { label: 'Coach', tone: 'text-purple-400' },
  MANAGER: { label: 'Manager', tone: 'text-amber-400' },
};

interface MemberCardProps {
  member: MemberCardData;
  canManage: boolean;
  isMe: boolean;
  busy: boolean;
  onPromote?: () => void;
  onTransferCaptain?: () => void;
  onRemove?: () => void;
}

export function MemberCard({
  member,
  canManage,
  isMe,
  busy,
  onPromote,
  onTransferCaptain,
  onRemove,
}: MemberCardProps) {
  const [showMore, setShowMore] = useState(false);
  const roleMeta = ROLE_META[member.role];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      <HoverLift className="h-full" lift={2} scale={1.015}>
        <div className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-card)] to-[var(--color-card)]/70">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)]/40 px-3 py-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${roleMeta.tone}`}>
              {roleMeta.label}
            </span>
            {member.isCaptain && (
              <motion.div layoutId="captain-crown">
                <Badge className="gap-1">
                  <Crown className="h-3 w-3" />
                  Captain
                </Badge>
              </motion.div>
            )}
          </div>

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
            {(member.player.zScore !== undefined || member.player.tier) && (
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
            )}
          </div>

          {(canManage || isMe) && (
            <div className="border-t border-[var(--color-border)] bg-[var(--color-card)]/60 px-2 py-2">
              <AnimatePresence mode="wait" initial={false}>
                {showMore ? (
                  <motion.div
                    key="more"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex flex-wrap gap-1.5"
                  >
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
                        {isMe ? 'Salir' : 'Remover'}
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
                    {canManage && onPromote && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onPromote}
                        disabled={busy}
                        className="text-xs"
                      >
                        <ChevronUp className="h-3 w-3" />
                        Subir a starter
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
                    {(canManage || isMe) && onRemove && (
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
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </HoverLift>
    </motion.div>
  );
}
