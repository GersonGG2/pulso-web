'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Loader2, Mail, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Reveal } from '@/components/motion';
import { ApiError, useApiClient } from '@/lib/api-client';
import { LANE_META, type LolRole } from '@/components/team/lane-icons';

export interface PendingInvitation {
  id: string;
  proposedRole: LolRole | null;
  message: string | null;
  createdAt: string;
  team: { id: string; name: string; tag: string };
  inviter: { id: string; user: { username: string; displayName: string } };
  freeAgent: {
    id: string;
    tournament?: { id: string; name: string; slug: string };
  };
}

export function PendingInvitations({
  initialInvitations,
}: {
  initialInvitations: PendingInvitation[];
}) {
  const router = useRouter();
  const api = useApiClient();
  const [invitations, setInvitations] = useState<PendingInvitation[]>(initialInvitations);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(id: string, action: 'accept' | 'reject') {
    setBusy(`${action}-${id}`);
    setError(null);
    try {
      await api.post(`/free-agent-invitations/${id}/${action}`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(null);
    }
  }

  if (invitations.length === 0) return null;

  return (
    <Reveal>
      <Card className="border-[var(--color-primary)]/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-[var(--color-primary)]" />
            Invitaciones pendientes
            <Badge>{invitations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-sm text-[var(--color-destructive)]"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {invitations.map((inv) => {
              const lane = inv.proposedRole;
              const Icon = lane ? LANE_META[lane].icon : null;
              return (
                <motion.div
                  key={inv.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{inv.team.name}</span>{' '}
                        <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                          {inv.team.tag}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        Captain @{inv.inviter.user.username}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {lane && Icon && (
                          <Badge variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" />
                            {LANE_META[lane].label}
                          </Badge>
                        )}
                      </div>
                      {inv.message && (
                        <p className="mt-2 text-xs italic text-[var(--color-muted-foreground)]">
                          “{inv.message}”
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => respond(inv.id, 'accept')}
                        disabled={busy !== null}
                      >
                        {busy === `accept-${inv.id}` && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        <Check className="h-3 w-3" />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respond(inv.id, 'reject')}
                        disabled={busy !== null}
                      >
                        <X className="h-3 w-3" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Reveal>
  );
}
