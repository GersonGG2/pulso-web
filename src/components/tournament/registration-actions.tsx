'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/components/ui/use-confirm';
import { ApiError, useApiClient } from '@/lib/api-client';

type Modality = 'SOLO_1V1' | 'TEAM_5V5' | 'ARAM';
type RegistrationStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'WITHDRAWN'
  | 'DISQUALIFIED';

interface Registration {
  id: string;
  tournamentId: string;
  status: RegistrationStatus;
  player: { id: string; username: string; displayName: string } | null;
  team: { id: string; name: string; tag: string } | null;
  checkedInAt: string | null;
  registeredAt: string;
}

export interface TournamentInfo {
  id: string;
  status: string;
  modality: Modality;
  entryFeeMxnCents: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
}

export function RegistrationActions({
  tournament,
  initialRegistration,
}: {
  tournament: TournamentInfo;
  initialRegistration: Registration | null;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const api = useApiClient();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [registration, setRegistration] = useState<Registration | null>(initialRegistration);
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isTeamModality = tournament.modality === 'TEAM_5V5';
  const now = Date.now();
  const opens = new Date(tournament.registrationOpensAt).getTime();
  const closes = new Date(tournament.registrationClosesAt).getTime();

  const beforeWindow = now < opens;
  const afterWindow = now >= closes;
  const isPublished = tournament.status === 'PUBLISHED';

  async function register() {
    setError(null);
    setBusy(true);
    try {
      const body = isTeamModality ? { teamId } : {};
      const reg = await api.post<Registration>(
        `/tournaments/${tournament.id}/registrations`,
        body,
      );
      setRegistration(reg);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  async function checkIn() {
    if (!registration) return;
    setError(null);
    setBusy(true);
    try {
      const updated = await api.post<Registration>(
        `/tournaments/${tournament.id}/registrations/${registration.id}/check-in`,
      );
      setRegistration(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!registration) return;
    const ok = await confirm({
      title: 'Bajarte del torneo',
      description:
        'Tu inscripción quedará como WITHDRAWN. Si las inscripciones siguen abiertas puedes volver a inscribirte después.',
      confirmLabel: 'Bajarme',
      variant: 'destructive',
    });
    if (!ok) return;
    setError(null);
    setBusy(true);
    try {
      await api.del(`/tournaments/${tournament.id}/registrations/${registration.id}`);
      setRegistration({ ...registration, status: 'WITHDRAWN' });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  // -----------------------------
  // Render branches
  // -----------------------------

  if (!isSignedIn) {
    return (
      <RegistrationCard title="Inscripciones">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Inicia sesión para inscribirte a este torneo.
        </p>
        <Button asChild>
          <Link href="/sign-in">Iniciar sesión</Link>
        </Button>
      </RegistrationCard>
    );
  }

  if (registration && registration.status !== 'WITHDRAWN' && registration.status !== 'DISQUALIFIED') {
    return (
      <>
        {confirmDialog}
        <RegistrationCard title="Tu inscripción">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            <Check className="mr-1 h-3 w-3" />
            {readableStatus(registration.status)}
          </Badge>
          {registration.team && (
            <Badge variant="outline">
              {registration.team.name} ({registration.team.tag})
            </Badge>
          )}
        </div>

        {registration.status === 'PENDING_PAYMENT' && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Tu inscripción quedó registrada, esperando confirmación de pago.
          </p>
        )}
        {registration.status === 'CONFIRMED' && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Estás dentro. Cuando el organizador abra check-in, presiona el botón abajo.
          </p>
        )}
        {registration.status === 'CHECKED_IN' && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            ✓ Check-in completado. Listo para el torneo.
          </p>
        )}

        {error && <ErrorBox message={error} />}

        <div className="flex flex-wrap gap-2">
          {registration.status === 'CONFIRMED' && (
            <Button onClick={checkIn} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Hacer check-in
            </Button>
          )}
          <Button variant="outline" onClick={withdraw} disabled={busy}>
            Bajarme del torneo
          </Button>
        </div>
      </RegistrationCard>
      </>
    );
  }

  // Withdrawn / disqualified / not registered
  if (!isPublished) {
    return (
      <RegistrationCard title="Inscripciones">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Las inscripciones aún no abren — el torneo está en {tournament.status}.
        </p>
      </RegistrationCard>
    );
  }

  if (beforeWindow) {
    return (
      <RegistrationCard title="Inscripciones">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Abren el{' '}
          <span className="text-[var(--color-foreground)]">
            {new Date(opens).toLocaleString('es-MX', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          .
        </p>
      </RegistrationCard>
    );
  }

  if (afterWindow) {
    return (
      <RegistrationCard title="Inscripciones">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Las inscripciones cerraron.
        </p>
      </RegistrationCard>
    );
  }

  // Open + signed in + not registered yet (or withdrawn before)
  return (
    <RegistrationCard title="Inscríbete">
      <p className="text-sm text-[var(--color-muted-foreground)]">
        {tournament.entryFeeMxnCents === 0
          ? 'Inscripción gratuita.'
          : `Inscripción $${(tournament.entryFeeMxnCents / 100).toFixed(0)} MXN (pagas al confirmar).`}
      </p>

      {isTeamModality && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            ID del equipo{' '}
            <span className="text-[var(--color-muted-foreground)]">
              (debes ser captain)
            </span>
          </label>
          <Input
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="clx_team_..."
          />
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Copia el ID del team del que eres captain. Vendrá un selector visual en una próxima
            iteración.
          </p>
        </div>
      )}

      {error && <ErrorBox message={error} />}

      <Button onClick={register} disabled={busy || (isTeamModality && !teamId)}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Inscribirme
      </Button>
    </RegistrationCard>
  );
}

function RegistrationCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
      {message}
    </div>
  );
}

function readableStatus(status: RegistrationStatus): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Pago pendiente';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'CHECKED_IN':
      return 'Check-in completado';
    case 'WITHDRAWN':
      return 'Te bajaste';
    case 'DISQUALIFIED':
      return 'Descalificado';
  }
}
