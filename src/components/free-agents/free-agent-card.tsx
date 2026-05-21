'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverLift } from '@/components/motion';
import { LANE_META, type LolRole } from '@/components/team/lane-icons';

export interface FreeAgent {
  id: string;
  preferredRole: LolRole | null;
  notes: string | null;
  joinedAt: string;
  player: {
    id: string;
    zScore: number;
    tier: string;
    primaryRole: LolRole | null;
    country: string;
    user: { username: string; displayName: string; avatarUrl: string | null };
  };
}

interface FreeAgentCardProps {
  agent: FreeAgent;
  canInvite: boolean;
  busy: boolean;
  onInvite?: () => void;
}

export function FreeAgentCard({ agent, canInvite, busy, onInvite }: FreeAgentCardProps) {
  const lane = agent.preferredRole ?? agent.player.primaryRole;
  const Icon = lane ? LANE_META[lane].icon : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      <HoverLift lift={2} scale={1.01}>
        <div className="flex h-full flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-mono text-sm font-bold text-[var(--color-primary)]">
                {agent.player.user.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/players/${agent.player.user.username}`}
                  className="block truncate font-medium hover:text-[var(--color-primary)]"
                >
                  {agent.player.user.displayName}
                </Link>
                <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                  @{agent.player.user.username} · {agent.player.country}
                </p>
              </div>
            </div>
            <span className="shrink-0 font-mono text-lg font-semibold text-[var(--color-primary)]">
              {agent.player.zScore}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{agent.player.tier}</Badge>
            {lane && Icon && (
              <Badge variant="outline" className="gap-1">
                <Icon className="h-3 w-3" />
                {LANE_META[lane].label}
              </Badge>
            )}
          </div>

          {agent.notes && (
            <p className="line-clamp-3 text-xs text-[var(--color-muted-foreground)]">
              {agent.notes}
            </p>
          )}

          {canInvite && onInvite && (
            <Button size="sm" onClick={onInvite} disabled={busy} className="mt-auto">
              <UserPlus className="h-3 w-3" />
              Invitar a mi equipo
            </Button>
          )}
        </div>
      </HoverLift>
    </motion.div>
  );
}
