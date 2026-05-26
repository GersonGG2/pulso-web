'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

const MODALITIES = [
  { value: 'SOLO_1V1', label: 'Solo 1v1' },
  { value: 'TEAM_5V5', label: 'Equipos 5v5' },
  { value: 'ARAM', label: 'ARAM (solo)' },
] as const;

const FORMATS = [
  { value: 'SINGLE_ELIM', label: 'Single elimination' },
  { value: 'DOUBLE_ELIM', label: 'Double elimination' },
  { value: 'ROUND_ROBIN', label: 'Round robin' },
  { value: 'SWISS', label: 'Swiss' },
  { value: 'GROUP_STAGE_PLAYOFFS', label: 'Grupos + playoffs' },
] as const;

const BRACKET_TYPES = [
  { value: 'SEEDED', label: 'Sembrado' },
  { value: 'RANDOM', label: 'Aleatorio' },
  { value: 'POD_BASED', label: 'Por pods' },
] as const;

function toLocalISO(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function CreateTournamentForm() {
  const router = useRouter();
  const api = useApiClient();

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const inWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [format, setFormat] = useState<(typeof FORMATS)[number]['value']>('SINGLE_ELIM');
  const [modality, setModality] = useState<(typeof MODALITIES)[number]['value']>('SOLO_1V1');
  const [bracketType, setBracketType] = useState<(typeof BRACKET_TYPES)[number]['value']>(
    'SEEDED',
  );
  const [region, setRegion] = useState('MX');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [entryFeeMxn, setEntryFeeMxn] = useState(0);
  const [regOpens, setRegOpens] = useState(toLocalISO(tomorrow));
  const [regCloses, setRegCloses] = useState(toLocalISO(inWeek));
  const [startsAt, setStartsAt] = useState(toLocalISO(inTwoWeeks));
  const [rulesetVersion, setRulesetVersion] = useState('1.0.0');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const created = await api.post<{ id: string; slug: string }>('/tournaments', {
        name,
        description,
        ...(bannerUrl && { bannerUrl }),
        format,
        modality,
        bracketType,
        region,
        maxParticipants,
        entryFeeMxnCents: entryFeeMxn * 100,
        registrationOpensAt: new Date(regOpens).toISOString(),
        registrationClosesAt: new Date(regCloses).toISOString(),
        startsAt: new Date(startsAt).toISOString(),
        rulesetVersion,
      });
      router.push(`/dashboard/organizer/tournaments/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  const selectClass =
    'flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo torneo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={5}
              maxLength={80}
              placeholder="Open Solo MX — Mayo 2026"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={4000}
              rows={4}
              placeholder="Torneo abierto LoL 5v5 LAN..."
              className="flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Mínimo 20 caracteres.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Banner URL{' '}
              <span className="text-[var(--color-muted-foreground)]">(opcional, 16:9)</span>
            </label>
            <Input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://i.imgur.com/abc.png"
            />
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Pega un enlace público (Imgur, CDN propio, Drive público). El upload directo
              llega después.
            </p>
            {bannerUrl && (
              <div className="mt-3 overflow-hidden rounded-md border border-[var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerUrl}
                  alt="Preview"
                  className="aspect-[16/9] w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Modalidad</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as typeof modality)}
                className={selectClass}
              >
                {MODALITIES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
                className={selectClass}
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Seeding</label>
              <select
                value={bracketType}
                onChange={(e) => setBracketType(e.target.value as typeof bracketType)}
                className={selectClass}
              >
                {BRACKET_TYPES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Región</label>
              <Input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                placeholder="MX"
                maxLength={24}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cupo</label>
              <Input
                type="number"
                min={2}
                max={1024}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                required
              />
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                Usa potencias de 2 para brackets single-elim (2, 4, 8, 16...).
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Entry fee (MXN)</label>
              <Input
                type="number"
                min={0}
                value={entryFeeMxn}
                onChange={(e) => setEntryFeeMxn(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Apertura registros</label>
              <Input
                type="datetime-local"
                value={regOpens}
                onChange={(e) => setRegOpens(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cierre registros</label>
              <Input
                type="datetime-local"
                value={regCloses}
                onChange={(e) => setRegCloses(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Inicio del torneo</label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Versión de reglamento</label>
            <Input
              value={rulesetVersion}
              onChange={(e) => setRulesetVersion(e.target.value)}
              required
              maxLength={24}
            />
          </div>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear (DRAFT)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
