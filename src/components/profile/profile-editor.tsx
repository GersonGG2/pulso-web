'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/motion';
import { LANE_META, LANE_ORDER, type LolRole } from '@/components/team/lane-icons';
import { PhoneVerificationFlow } from './phone-verification-flow';
import { ApiError, useApiClient } from '@/lib/api-client';

type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

interface PlayerProfile {
  id: string;
  primaryRole: LolRole | null;
  secondaryRole: LolRole | null;
  country: string;
  city: string | null;
  recruitable: boolean;
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  bio: string | null;
  birthDate: string | null;
  twitchHandle: string | null;
  xHandle: string | null;
  instagramHandle: string | null;
  facebookUrl: string | null;
  zScore: number;
  tier: string;
}

interface RiotAccount {
  gameName: string;
  tagLine: string;
  region: string;
  phoneNumber?: string | null;
  smsVerified?: boolean;
}

export interface ProfileData {
  player: PlayerProfile;
  riot: RiotAccount | null;
}

type Tab = 'personal' | 'game' | 'social' | 'contact';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decir' },
];

const TABS: { value: Tab; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'game', label: 'Juego' },
  { value: 'social', label: 'Redes sociales' },
  { value: 'contact', label: 'Contacto' },
];

export function ProfileEditor({ data }: { data: ProfileData }) {
  const router = useRouter();
  const api = useApiClient();
  const [tab, setTab] = useState<Tab>('personal');
  const [player, setPlayer] = useState<PlayerProfile>(data.player);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(patch: Partial<PlayerProfile>) {
    setBusy(true);
    setError(null);
    try {
      const updated = await api.patch<PlayerProfile>('/players/me', patch);
      setPlayer(updated);
      setSavedAt(new Date());
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-base ${
                  tab === t.value
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {tab === t.value && (
                  <motion.span
                    layoutId="profile-tab-pill"
                    className="absolute inset-0 -z-10 rounded-md bg-[var(--color-primary)]/10"
                    transition={{ duration: 0.22 }}
                  />
                )}
                {t.label}
              </button>
            ))}
          </nav>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]"
              >
                {error}
              </motion.div>
            )}
            {savedAt && !error && (
              <motion.p
                key={savedAt.toISOString()}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-[var(--color-primary)]"
              >
                <Check className="h-4 w-4" />
                Guardado
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {tab === 'personal' && (
                <PersonalForm player={player} busy={busy} onSave={save} />
              )}
              {tab === 'game' && <GameForm player={player} busy={busy} onSave={save} />}
              {tab === 'social' && <SocialForm player={player} busy={busy} onSave={save} />}
              {tab === 'contact' && <ContactSection riot={data.riot} />}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

// -----------------------------
// Personal tab
// -----------------------------

function PersonalForm({
  player,
  busy,
  onSave,
}: {
  player: PlayerProfile;
  busy: boolean;
  onSave: (patch: Partial<PlayerProfile>) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(player.firstName ?? '');
  const [lastName, setLastName] = useState(player.lastName ?? '');
  const [gender, setGender] = useState<Gender | ''>(player.gender ?? '');
  const [birthDate, setBirthDate] = useState(
    player.birthDate ? new Date(player.birthDate).toISOString().slice(0, 10) : '',
  );
  const [bio, setBio] = useState(player.bio ?? '');

  function handle(e: FormEvent) {
    e.preventDefault();
    onSave({
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      gender: gender || null,
      birthDate: birthDate ? new Date(birthDate).toISOString() : null,
      bio: bio.trim() || null,
    } as Partial<PlayerProfile>);
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre">
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Gerson"
            maxLength={60}
            disabled={busy}
          />
        </Field>
        <Field label="Apellido">
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="García"
            maxLength={60}
            disabled={busy}
          />
        </Field>
        <Field label="Género">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | '')}
            disabled={busy}
            className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm"
          >
            <option value="">Sin especificar</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de nacimiento">
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={busy}
          />
        </Field>
      </div>
      <Field label="Bio" hint="500 caracteres máx — visible en tu perfil público.">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Cuéntale a scouts y orgs cómo juegas, tu disponibilidad, tus metas…"
          disabled={busy}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        <p className="mt-1 text-right text-xs text-[var(--color-muted-foreground)]">
          {bio.length}/500
        </p>
      </Field>
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar
      </Button>
    </form>
  );
}

// -----------------------------
// Game tab
// -----------------------------

function GameForm({
  player,
  busy,
  onSave,
}: {
  player: PlayerProfile;
  busy: boolean;
  onSave: (patch: Partial<PlayerProfile>) => Promise<void>;
}) {
  const [primaryRole, setPrimaryRole] = useState<LolRole | ''>(player.primaryRole ?? '');
  const [secondaryRole, setSecondaryRole] = useState<LolRole | ''>(
    player.secondaryRole ?? '',
  );
  const [country, setCountry] = useState(player.country ?? '');
  const [city, setCity] = useState(player.city ?? '');
  const [recruitable, setRecruitable] = useState(player.recruitable);

  function handle(e: FormEvent) {
    e.preventDefault();
    onSave({
      primaryRole: (primaryRole || null) as LolRole | null,
      secondaryRole: (secondaryRole || null) as LolRole | null,
      country: country.trim().toUpperCase(),
      city: city.trim() || null,
      recruitable,
    });
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Lane primaria">
        <LanePicker value={primaryRole} onChange={setPrimaryRole} disabled={busy} />
      </Field>
      <Field label="Lane secundaria (opcional)">
        <LanePicker value={secondaryRole} onChange={setSecondaryRole} disabled={busy} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="País" hint="ISO 2 letras (MX, AR, CL, US…)">
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            placeholder="MX"
            maxLength={2}
            disabled={busy}
          />
        </Field>
        <Field label="Ciudad">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Monterrey"
            maxLength={80}
            disabled={busy}
          />
        </Field>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--color-border)] p-3">
        <input
          type="checkbox"
          checked={recruitable}
          onChange={(e) => setRecruitable(e.target.checked)}
          disabled={busy}
          className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
        />
        <div className="text-sm">
          <p className="font-medium">Visible para scouts</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Si lo activas, scouts y orgs pueden contactarte vía el talent graph.
          </p>
        </div>
      </label>
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar
      </Button>
    </form>
  );
}

// -----------------------------
// Social tab
// -----------------------------

function SocialForm({
  player,
  busy,
  onSave,
}: {
  player: PlayerProfile;
  busy: boolean;
  onSave: (patch: Partial<PlayerProfile>) => Promise<void>;
}) {
  const [twitch, setTwitch] = useState(player.twitchHandle ?? '');
  const [x, setX] = useState(player.xHandle ?? '');
  const [instagram, setInstagram] = useState(player.instagramHandle ?? '');
  const [facebook, setFacebook] = useState(player.facebookUrl ?? '');

  function handle(e: FormEvent) {
    e.preventDefault();
    onSave({
      twitchHandle: twitch.trim() || null,
      xHandle: x.trim().replace(/^@/, '') || null,
      instagramHandle: instagram.trim().replace(/^@/, '') || null,
      facebookUrl: facebook.trim() || null,
    });
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Twitch" hint="Solo el usuario, sin URL.">
        <Input
          value={twitch}
          onChange={(e) => setTwitch(e.target.value)}
          placeholder="pulsogg"
          maxLength={50}
          disabled={busy}
        />
      </Field>
      <Field label="X (Twitter)" hint="Sin @.">
        <Input
          value={x}
          onChange={(e) => setX(e.target.value)}
          placeholder="pulso_gg"
          maxLength={50}
          disabled={busy}
        />
      </Field>
      <Field label="Instagram" hint="Sin @.">
        <Input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="pulso.gg"
          maxLength={50}
          disabled={busy}
        />
      </Field>
      <Field label="Facebook" hint="URL completa del perfil o página.">
        <Input
          type="url"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="https://facebook.com/pulso.gg"
          disabled={busy}
        />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar
      </Button>
    </form>
  );
}

// -----------------------------
// Contact tab (read-only by ahora; cambiar número requiere flujo SMS dedicado)
// -----------------------------

function ContactSection({ riot }: { riot: RiotAccount | null }) {
  const [verifiedRiot, setVerifiedRiot] = useState<RiotAccount | null>(riot);

  if (!verifiedRiot) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Vincula tu cuenta de Riot primero para poder verificar tu teléfono.{' '}
        <a href="/onboarding/riot" className="text-[var(--color-primary)] hover:underline">
          Vincular Riot →
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)]/40 p-3 text-xs text-[var(--color-muted-foreground)]">
        Riot ID vinculado:{' '}
        <span className="font-mono text-[var(--color-foreground)]">
          {verifiedRiot.gameName}#{verifiedRiot.tagLine}
        </span>{' '}
        ({verifiedRiot.region})
      </div>

      <PhoneVerificationFlow
        currentNumber={verifiedRiot.phoneNumber ?? null}
        verified={!!verifiedRiot.smsVerified}
        onVerified={(newNumber) =>
          setVerifiedRiot({ ...verifiedRiot, phoneNumber: newNumber, smsVerified: true })
        }
      />
    </div>
  );
}

// -----------------------------
// Atoms
// -----------------------------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{hint}</p>
      )}
    </label>
  );
}

function LanePicker({
  value,
  onChange,
  disabled,
}: {
  value: LolRole | '';
  onChange: (v: LolRole | '') => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {LANE_ORDER.map((l) => {
        const meta = LANE_META[l];
        const Icon = meta.icon;
        const active = value === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(active ? '' : l)}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-base ${
              active
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
