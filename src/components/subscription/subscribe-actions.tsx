'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/use-confirm';
import { ApiError, useApiClient } from '@/lib/api-client';

type SubStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

interface Subscription {
  id: string;
  plan: 'PRO_PLAYER' | 'RECRUITER_ACCESS';
  status: SubStatus;
  provider: string;
  startedAt: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

const FEATURES = [
  'Stats avanzados de cada partida (heatmaps, KPIs por champion/role)',
  'Replay analyzer con flags automáticos',
  'Priority en alertas a scouts y orgs',
  'Badge Pro visible en tu perfil público',
  'Acceso anticipado a torneos premium',
  'Boost de visibilidad en el talent graph',
];

export function SubscribeActions({
  initialSubscription,
}: {
  initialSubscription: Subscription | null;
}) {
  const router = useRouter();
  const api = useApiClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [sub, setSub] = useState<Subscription | null>(initialSubscription);
  const [busy, setBusy] = useState<'checkout' | 'cancel' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isActive =
    sub && (sub.status === 'ACTIVE' || sub.status === 'PAST_DUE') && !sub.cancelledAt;
  const willCancel = sub && sub.cancelledAt !== null;

  async function startCheckout(provider: 'stripe' | 'mercadopago') {
    setError(null);
    setBusy('checkout');
    try {
      const result = await api.post<{ url: string; provider: string }>(
        '/subscriptions/checkout',
        { plan: 'PRO_PLAYER', provider },
      );
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
      setBusy(null);
    }
  }

  async function cancel() {
    const ok = await confirm({
      title: 'Cancelar Pulso Pro',
      description:
        'Mantienes el acceso hasta el final del período pagado. Después la suscripción no se renueva.',
      confirmLabel: 'Cancelar suscripción',
      variant: 'destructive',
    });
    if (!ok) return;
    setError(null);
    setBusy('cancel');
    try {
      const updated = await api.del<Subscription>('/subscriptions/me');
      setSub(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(null);
    }
  }

  // -----------------------------
  // States
  // -----------------------------

  if (isActive) {
    return (
      <>
        {confirmDialog}
        <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge>
              <Check className="mr-1 h-3 w-3" />
              Pro activo
            </Badge>
            {sub?.status === 'PAST_DUE' && <Badge variant="outline">Pago pendiente</Badge>}
            {willCancel && <Badge variant="outline">Cancela al final del período</Badge>}
          </div>
          <CardTitle>Pulso Pro Player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {sub && (
            <p className="text-[var(--color-muted-foreground)]">
              {willCancel
                ? `Tu acceso termina el ${new Date(sub.currentPeriodEnd).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                : `Próxima renovación: ${new Date(sub.currentPeriodEnd).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
          )}

          {error && <ErrorBox message={error} />}

          {!willCancel && (
            <Button variant="outline" onClick={cancel} disabled={busy !== null}>
              {busy === 'cancel' && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancelar al final del período
            </Button>
          )}
        </CardContent>
      </Card>
      </>
    );
  }

  // No active sub — show pricing + checkout
  return (
    <Card>
      <CardHeader>
        <Badge variant="outline" className="mb-2 self-start">
          Pulso Pro Player
        </Badge>
        <CardTitle>
          <span className="text-4xl font-bold text-[var(--color-primary)]">$99 MXN</span>{' '}
          <span className="text-base font-normal text-[var(--color-muted-foreground)]">
            / mes
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-2 text-sm">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {error && <ErrorBox message={error} />}

        <div className="space-y-2">
          <Button
            onClick={() => startCheckout('stripe')}
            disabled={busy !== null}
            className="w-full"
            size="lg"
          >
            {busy === 'checkout' && <Loader2 className="h-4 w-4 animate-spin" />}
            Hazte Pro con Stripe
          </Button>
          <Button
            onClick={() => startCheckout('mercadopago')}
            disabled={busy !== null}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Mercado Pago (próximamente)
          </Button>
        </div>

        <p className="text-center text-xs text-[var(--color-muted-foreground)]">
          Cancelas cuando quieras. Sin contrato. Mantienes el acceso hasta el final del período
          pagado.
        </p>
      </CardContent>
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
