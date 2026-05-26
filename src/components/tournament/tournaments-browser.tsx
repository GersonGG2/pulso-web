'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Search, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { TournamentCard } from './tournament-card';
import type { PaginatedList, TournamentStatus, TournamentSummary } from '@/lib/types';

const PAGE_SIZE = 12;

const STATUS_OPTIONS: { value: TournamentStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PUBLISHED', label: 'Próximamente' },
  { value: 'REGISTRATION_OPEN', label: 'Inscripciones abiertas' },
  { value: 'REGISTRATION_CLOSED', label: 'Inscripciones cerradas' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'COMPLETED', label: 'Finalizados' },
];

const SORT_OPTIONS: { value: 'starting' | 'popular' | 'recent'; label: string }[] = [
  { value: 'starting', label: 'Próximos a iniciar' },
  { value: 'popular', label: 'Mayor prize pool' },
  { value: 'recent', label: 'Más recientes' },
];

export function TournamentsBrowser({
  initialData,
  initialFilters,
}: {
  initialData: PaginatedList<TournamentSummary>;
  initialFilters: {
    q: string;
    status: TournamentStatus | '';
    sort: 'starting' | 'popular' | 'recent';
    page: number;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(initialData);
  const [q, setQ] = useState(initialFilters.q);
  const [status, setStatus] = useState<TournamentStatus | ''>(initialFilters.status);
  const [sort, setSort] = useState<'starting' | 'popular' | 'recent'>(
    initialFilters.sort,
  );
  const [page, setPage] = useState(initialFilters.page);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const isFirstRender = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-fetch when filters change (debounced for q, immediate for others)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const isQueryChange = q !== initialFilters.q;
    const delay = isQueryChange ? 300 : 0;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setErrored(false);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (status) params.set('status', status);
        if (sort) params.set('sort', sort);
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String((page - 1) * PAGE_SIZE));

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/tournaments?${params.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('API error');
        const json = (await res.json()) as PaginatedList<TournamentSummary>;
        setData(json);

        // Sync URL (shallow) without scroll jump
        const url = new URLSearchParams(searchParams.toString());
        url.delete('q');
        url.delete('status');
        url.delete('sort');
        url.delete('page');
        if (q.trim()) url.set('q', q.trim());
        if (status) url.set('status', status);
        if (sort !== 'starting') url.set('sort', sort);
        if (page > 1) url.set('page', String(page));
        const qs = url.toString();
        router.replace(qs ? `/tournaments?${qs}` : '/tournaments', { scroll: false });
      } catch {
        setErrored(true);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, sort, page]);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, data.total);

  function resetPageOnFilterChange() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="grid gap-3 sm:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                resetPageOnFilterChange();
              }}
              placeholder="Buscar por nombre u organizador…"
              className="pl-9"
              autoComplete="off"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TournamentStatus | '');
              resetPageOnFilterChange();
            }}
            className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as typeof sort);
              resetPageOnFilterChange();
            }}
            className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </FadeIn>

      {/* Status row */}
      <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
        <p>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Buscando…
            </span>
          ) : data.total === 0 ? (
            'Sin resultados'
          ) : (
            <>
              Mostrando <span className="text-[var(--color-foreground)]">{startIdx}–{endIdx}</span>{' '}
              de <span className="text-[var(--color-foreground)]">{data.total}</span>
            </>
          )}
        </p>
      </div>

      {/* Body */}
      {errored ? (
        <ErrorState
          title="No pudimos cargar torneos"
          description="Refresca la página o intenta de nuevo en un momento."
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Sin torneos que coincidan"
          description="Prueba quitar filtros o buscar otro término."
        />
      ) : (
        <Stagger
          className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60 transition-opacity' : ''}`}
          delay={0}
        >
          {data.items.map((t) => (
            <StaggerItem key={t.id}>
              <TournamentCard t={t} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="px-3 text-sm text-[var(--color-muted-foreground)]">
            Página <span className="text-[var(--color-foreground)]">{page}</span> de{' '}
            <span className="text-[var(--color-foreground)]">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
