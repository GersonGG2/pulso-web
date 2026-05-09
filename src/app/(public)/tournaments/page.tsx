import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, ApiError } from '@/lib/api';
import type { PaginatedList, TournamentSummary } from '@/lib/types';

export const metadata = {
  title: 'Torneos',
  description: 'Torneos abiertos de League of Legends en México y LATAM.',
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Inscripciones abiertas',
  REGISTRATION_OPEN: 'Inscripciones abiertas',
  REGISTRATION_CLOSED: 'Inscripciones cerradas',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
  DRAFT: 'Borrador',
};

async function getTournaments(): Promise<PaginatedList<TournamentSummary> | null> {
  try {
    return await apiGet<PaginatedList<TournamentSummary>>('/tournaments?limit=24');
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Tournaments fetch failed: ${err.status} ${err.message}`);
    }
    return null;
  }
}

export default async function TournamentsPage() {
  const data = await getTournaments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Torneos
          </h1>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            Encuentra el siguiente torneo donde competir.
          </p>
        </div>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
          <h2 className="text-lg font-semibold">Aún no hay torneos publicados</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Cuando un organizador publique su primer torneo, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t) => (
            <Link key={t.id} href={`/t/${t.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-[var(--color-primary)]/40">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{t.modality.replace('_', ' ')}</Badge>
                    <Badge>{STATUS_LABEL[t.status] ?? t.status}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-[var(--color-primary)]">
                    {t.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                  <p className="line-clamp-2">{t.description}</p>
                  <div className="flex items-center gap-4 pt-2 text-xs">
                    <span>
                      Inicia{' '}
                      <span className="text-[var(--color-foreground)]">
                        {new Date(t.startsAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </span>
                    <span>
                      Cupo{' '}
                      <span className="text-[var(--color-foreground)]">
                        {t.maxParticipants}
                      </span>
                    </span>
                    {t.entryFeeMxnCents > 0 && (
                      <span>
                        $<span className="text-[var(--color-foreground)]">
                          {(t.entryFeeMxnCents / 100).toFixed(0)}
                        </span>{' '}
                        MXN
                      </span>
                    )}
                    {t.entryFeeMxnCents === 0 && (
                      <span className="text-[var(--color-primary)]">Gratis</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
