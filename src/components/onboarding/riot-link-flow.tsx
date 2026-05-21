'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

type Region = 'LAN' | 'LAS' | 'NA';

interface InitiateResponse {
  expectedIconId: number;
  originalIconId: number;
  expiresAt: string;
  riotId: string;
  instructions: string;
}

interface RiotAccountResponse {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel: number | null;
  currentTier: string | null;
  highestRankEver: string | null;
}

const REGIONS: { value: Region; label: string }[] = [
  { value: 'LAN', label: 'LAN — México y Centroamérica' },
  { value: 'LAS', label: 'LAS — Cono Sur' },
  { value: 'NA', label: 'NA — Norteamérica' },
];

export function RiotLinkFlow({ alreadyLinked }: { alreadyLinked: boolean }) {
  const api = useApiClient();

  const [step, setStep] = useState<'idle' | 'pending' | 'done'>(
    alreadyLinked ? 'done' : 'idle',
  );
  const [data, setData] = useState<InitiateResponse | null>(null);
  const [linked, setLinked] = useState<RiotAccountResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState<Region>('LAN');

  async function handleInitiate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await api.post<InitiateResponse>('/riot-account/initiate-link', {
        gameName,
        tagLine,
        region,
      });
      setData(result);
      setStep('pending');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await api.post<RiotAccountResponse>('/riot-account/confirm-link');
      setLinked(result);
      setStep('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  // Step 3 — already linked or just linked
  if (step === 'done') {
    return (
      <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge>✓ Vinculada</Badge>
          </div>
          <CardTitle>Cuenta de Riot lista</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {linked && (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              <span className="font-mono text-[var(--color-foreground)]">
                {linked.gameName}#{linked.tagLine}
              </span>{' '}
              · {linked.region}
              {linked.summonerLevel ? ` · Nivel ${linked.summonerLevel}` : ''}
              {linked.highestRankEver ? ` · Highest ${linked.highestRankEver}` : ''}
            </p>
          )}
          <div className="flex gap-3">
            <Button asChild>
              <a href="/onboarding/player">Crear perfil de jugador →</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">Ir al dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2 — pending icon verification
  if (step === 'pending' && data) {
    const iconUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${data.expectedIconId}.jpg`;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cambia tu icono en League of Legends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Encontramos tu cuenta{' '}
            <span className="font-mono text-[var(--color-foreground)]">{data.riotId}</span>.
            Ahora necesitamos verificar que sea tuya.
          </p>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-md">
              <Image
                src={iconUrl}
                alt={`Icon ID ${data.expectedIconId}`}
                width={128}
                height={128}
                unoptimized
              />
            </div>
            <p className="text-center text-sm">
              Cambia tu icono de invocador al{' '}
              <span className="font-mono text-[var(--color-primary)]">
                ID {data.expectedIconId}
              </span>{' '}
              (el que se ve arriba) en el cliente de LoL, espera ~30 segundos a que sincronice,
              luego presiona <span className="font-medium">Confirmar vinculación</span>.
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Tu icono original (ID {data.originalIconId}) lo puedes restaurar después.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar vinculación
            </Button>
            <Button variant="outline" onClick={() => setStep('idle')} disabled={submitting}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1 — initiate form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vincula tu cuenta de Riot</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">
          Ingresa tu Riot ID. Lo encuentras arriba a la derecha en tu cliente de LoL — formato{' '}
          <span className="font-mono">Nombre#Tag</span>.
        </p>

        <form onSubmit={handleInitiate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Game name</label>
              <Input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="yerzong"
                required
                minLength={3}
                maxLength={16}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tag line</label>
              <Input
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                placeholder="gygg"
                required
                minLength={3}
                maxLength={5}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Servidor</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continuar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
