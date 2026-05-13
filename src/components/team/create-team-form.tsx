'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

const COUNTRIES = [
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Perú' },
] as const;

export function CreateTeamForm() {
  const router = useRouter();
  const api = useApiClient();

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [country, setCountry] = useState('MX');
  const [logoUrl, setLogoUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const team = await api.post<{ id: string }>('/teams', {
        name,
        tag,
        country,
        ...(logoUrl && { logoUrl }),
      });
      router.push(`/dashboard/teams/${team.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo equipo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">
          Al crear el equipo te vuelves captain automáticamente. Después puedes invitar miembros
          y transferir el captain a otro jugador.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={40}
              placeholder="Quetzal Esports"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tag <span className="text-[var(--color-muted-foreground)]">(2-6 alfanuméricos)</span>
            </label>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              required
              minLength={2}
              maxLength={6}
              placeholder="QTZ"
              className="uppercase"
            />
          </div>

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
              Logo URL{' '}
              <span className="text-[var(--color-muted-foreground)]">(opcional)</span>
            </label>
            <Input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://cdn.pulsogg.gg/teams/qtz.png"
            />
          </div>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear equipo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
