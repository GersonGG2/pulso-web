'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

const ROLES: { value: Role; label: string }[] = [
  { value: 'TOP', label: 'Top' },
  { value: 'JUNGLE', label: 'Jungle' },
  { value: 'MID', label: 'Mid' },
  { value: 'ADC', label: 'ADC' },
  { value: 'SUPPORT', label: 'Support' },
];

const COUNTRIES: { value: string; label: string }[] = [
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Perú' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'CR', label: 'Costa Rica' },
];

export function PlayerProfileForm() {
  const router = useRouter();
  const api = useApiClient();

  const [country, setCountry] = useState('MX');
  const [city, setCity] = useState('');
  const [primaryRole, setPrimaryRole] = useState<Role | ''>('');
  const [secondaryRole, setSecondaryRole] = useState<Role | ''>('');
  const [recruitable, setRecruitable] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/players', {
        country,
        ...(primaryRole && { primaryRole }),
        ...(secondaryRole && { secondaryRole }),
        ...(city && { city }),
        recruitable,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu perfil de jugador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">País</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Ciudad <span className="text-[var(--color-muted-foreground)]">(opcional)</span>
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="CDMX"
                maxLength={80}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Rol primario{' '}
                <span className="text-[var(--color-muted-foreground)]">(opcional)</span>
              </label>
              <select
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value as Role | '')}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                <option value="">— Sin definir —</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Rol secundario{' '}
                <span className="text-[var(--color-muted-foreground)]">(opcional)</span>
              </label>
              <select
                value={secondaryRole}
                onChange={(e) => setSecondaryRole(e.target.value as Role | '')}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                <option value="">— Sin definir —</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <input
              type="checkbox"
              checked={recruitable}
              onChange={(e) => setRecruitable(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[var(--color-primary)]"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Disponible para reclutamiento</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                Los scouts y orgs te pueden encontrar en el talent graph público. Lo puedes
                desactivar después.
              </p>
            </div>
          </label>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear perfil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
