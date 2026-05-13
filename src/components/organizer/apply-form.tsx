'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

export function ApplyOrganizerForm() {
  const router = useRouter();
  const api = useApiClient();

  const [organizationName, setOrganizationName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [rfc, setRfc] = useState('');
  const [website, setWebsite] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post('/organizers/apply', {
        organizationName,
        contactEmail,
        ...(contactPhone && { contactPhone }),
        ...(rfc && { rfc: rfc.toUpperCase() }),
        ...(website && { website }),
      });
      router.push('/dashboard/organizer');
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
        <CardTitle>Aplica como organizador</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">
          En MVP la aprobación es automática. Cuando crezcas a sponsors o premios en dinero te
          pediremos validación adicional (RFC, KYC).
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre de la organización</label>
            <Input
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              minLength={3}
              maxLength={80}
              placeholder="Liga Pulso CDMX"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email de contacto</label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              placeholder="contacto@ligapulso.mx"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Teléfono{' '}
                <span className="text-[var(--color-muted-foreground)]">(opcional, E.164)</span>
              </label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+525512345678"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                RFC <span className="text-[var(--color-muted-foreground)]">(opcional)</span>
              </label>
              <Input
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                placeholder="GAGE920101AB1"
                maxLength={13}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Website <span className="text-[var(--color-muted-foreground)]">(opcional)</span>
            </label>
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://ligapulso.mx"
            />
          </div>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Solicitar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
