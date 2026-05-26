'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HoverLift } from '@/components/motion';
import type { TournamentSummary } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Próximamente',
  REGISTRATION_OPEN: 'Inscripciones abiertas',
  REGISTRATION_CLOSED: 'Inscripciones cerradas',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
  DRAFT: 'Borrador',
};

const STATUS_TONE: Record<string, string> = {
  REGISTRATION_OPEN: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  COMPLETED: 'bg-[var(--color-muted)]/40 text-[var(--color-muted-foreground)]',
  CANCELLED: 'bg-red-500/20 text-red-300',
};

function formatPrize(prizePool: Record<string, unknown> | null): string | null {
  if (!prizePool) return null;
  const total = (prizePool.totalMxn ??
    prizePool.total ??
    prizePool.mxn) as number | undefined;
  if (typeof total !== 'number' || total <= 0) return null;
  return `$${total.toLocaleString('es-MX')} MXN`;
}

export function TournamentCard({ t }: { t: TournamentSummary }) {
  const startsAt = new Date(t.startsAt);
  const prize = formatPrize(t.prizePool);
  const sample = t.signedSample ?? [];

  return (
    <Link href={`/t/${t.slug}`} className="group block h-full">
      <HoverLift className="h-full" lift={2} scale={1.01}>
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] transition-colors group-hover:border-[var(--color-primary)]/40">
          {/* Banner */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/20 via-purple-500/10 to-[var(--color-background)]">
            {t.bannerUrl ? (
              <Image
                src={t.bannerUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-12 w-12 text-[var(--color-primary)]/40" />
              </div>
            )}
            <div className="absolute right-3 top-3">
              <Badge className={STATUS_TONE[t.status] ?? ''}>
                {STATUS_LABEL[t.status] ?? t.status}
              </Badge>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <header className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                {t.organizer.logoUrl ? (
                  <Image
                    src={t.organizer.logoUrl}
                    alt={t.organizer.organizationName}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="font-mono text-xs font-bold">
                    {t.organizer.organizationName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {startsAt.toLocaleString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <h3 className="line-clamp-2 text-base font-semibold leading-tight group-hover:text-[var(--color-primary)]">
                  {t.name}
                </h3>
              </div>
            </header>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-3 text-xs">
              <Stat label="Prize pool" value={prize ?? (t.entryFeeMxnCents === 0 ? 'Gratis' : '—')} />
              <Stat
                label="Inscritos"
                value={`${t.registrationsCount}/${t.maxParticipants}`}
              />
              <Stat label="Modalidad" value={t.modality.replace('_', ' ')} />
            </div>

            {/* Footer: organizer + signed */}
            <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Organiza
                </p>
                <p className="truncate text-xs font-medium">
                  {t.organizer.organizationName}
                  {t.organizer.verified && (
                    <span className="ml-1 text-[var(--color-primary)]">✓</span>
                  )}
                </p>
              </div>
              {sample.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {sample.slice(0, 3).map((s) => (
                      <Avatar key={s.id} entry={s} />
                    ))}
                  </div>
                  <Users className="ml-1 h-3 w-3 text-[var(--color-muted-foreground)]" />
                </div>
              )}
            </footer>
          </div>
        </article>
      </HoverLift>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold">{value}</p>
    </div>
  );
}

function Avatar({
  entry,
}: {
  entry: {
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    teamName: string | null;
    teamLogoUrl: string | null;
    teamTag: string | null;
  };
}) {
  const initials =
    entry.teamTag?.slice(0, 2).toUpperCase() ??
    entry.displayName?.slice(0, 2).toUpperCase() ??
    '??';
  const imgUrl = entry.teamLogoUrl ?? entry.avatarUrl;
  const title = entry.teamName ?? entry.displayName ?? '';

  return (
    <div
      title={title}
      className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-card)] bg-[var(--color-primary)]/10 font-mono text-[10px] font-bold text-[var(--color-primary)]"
    >
      {imgUrl ? (
        <Image
          src={imgUrl}
          alt={title}
          width={28}
          height={28}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        initials
      )}
    </div>
  );
}
