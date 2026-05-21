'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/use-confirm';
import { ApiError, useApiClient } from '@/lib/api-client';

type TournamentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

interface MatchParticipant {
  id: string;
  side: 'BLUE' | 'RED' | string;
  win: boolean | null;
  player: { id: string; username: string; displayName: string };
}

interface Match {
  id: string;
  round: number;
  bracketPosition: string;
  status: string;
  winnerSide: string | null;
  participants: MatchParticipant[];
}

export function TournamentManagement({
  tournament,
  initialMatches,
}: {
  tournament: {
    id: string;
    name: string;
    slug: string;
    status: TournamentStatus;
    modality: string;
    region: string;
    maxParticipants: number;
  };
  initialMatches: Match[];
}) {
  const router = useRouter();
  const api = useApiClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [status, setStatus] = useState<TournamentStatus>(tournament.status);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function publish() {
    const result = await run('publish', () =>
      api.post<{ status: TournamentStatus }>(`/tournaments/${tournament.id}/publish`),
    );
    if (result) {
      setStatus(result.status);
      router.refresh();
    }
  }

  async function cancel() {
    const ok = await confirm({
      title: 'Cancelar torneo',
      description: `Vas a cancelar "${tournament.name}". La acción no es reversible.`,
      confirmLabel: 'Cancelar torneo',
      variant: 'destructive',
    });
    if (!ok) return;
    const result = await run('cancel', () =>
      api.post<{ status: TournamentStatus }>(`/tournaments/${tournament.id}/cancel`),
    );
    if (result) {
      setStatus(result.status);
      router.refresh();
    }
  }

  async function start() {
    const result = await run('start', () =>
      api.post<{ items: Match[] }>(`/tournaments/${tournament.id}/start`),
    );
    if (result) {
      setStatus('IN_PROGRESS');
      // Refrescar matches después de generar bracket
      const fresh = await api.get<{ items: Match[] }>(
        `/tournaments/${tournament.id}/matches`,
      );
      setMatches(fresh.items);
      router.refresh();
    }
  }

  async function reportMatch(matchId: string, winnerSide: 'BLUE' | 'RED') {
    const result = await run(`report-${matchId}`, () =>
      api.post<Match>(`/matches/${matchId}/report`, { winnerSide }),
    );
    if (result) {
      const fresh = await api.get<{ items: Match[] }>(
        `/tournaments/${tournament.id}/matches`,
      );
      setMatches(fresh.items);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Status
              </p>
              <CardTitle className="mt-1">
                <Badge>{status}</Badge>
              </CardTitle>
            </div>
            <Link
              href={`/t/${tournament.slug}`}
              className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
            >
              Ver página pública ↗
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {status === 'DRAFT' && (
              <Button onClick={publish} disabled={busy !== null}>
                {busy === 'publish' && <Loader2 className="h-4 w-4 animate-spin" />}
                Publicar
              </Button>
            )}
            {status === 'PUBLISHED' && (
              <Button onClick={start} disabled={busy !== null}>
                {busy === 'start' && <Loader2 className="h-4 w-4 animate-spin" />}
                Iniciar torneo (genera bracket)
              </Button>
            )}
            {status !== 'COMPLETED' && status !== 'CANCELLED' && (
              <Button variant="outline" onClick={cancel} disabled={busy !== null}>
                {busy === 'cancel' && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancelar
              </Button>
            )}
          </div>

          {status === 'PUBLISHED' && (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Para iniciar necesitas mínimo 2 inscripciones CHECKED_IN y que sean potencia de 2
              (2, 4, 8, 16...).
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bracket / Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Sin matches generados. Inicia el torneo cuando los registros cierren.
            </p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="rounded-md border border-[var(--color-border)] p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                      {m.bracketPosition}
                    </span>
                    <Badge variant="outline">{m.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    {m.participants.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
                          p.win ? 'bg-[var(--color-primary)]/10 font-medium' : ''
                        }`}
                      >
                        <span>{p.player.displayName}</span>
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          {p.side}
                        </span>
                      </div>
                    ))}
                  </div>
                  {m.status !== 'COMPLETED' && m.status !== 'CANCELLED' && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reportMatch(m.id, 'BLUE')}
                        disabled={busy !== null}
                      >
                        Gana BLUE
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reportMatch(m.id, 'RED')}
                        disabled={busy !== null}
                      >
                        Gana RED
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
