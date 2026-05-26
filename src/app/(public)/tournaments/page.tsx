import { FadeIn } from '@/components/motion';
import { TournamentsBrowser } from '@/components/tournament/tournaments-browser';
import { apiGet, ApiError } from '@/lib/api';
import type { PaginatedList, TournamentStatus, TournamentSummary } from '@/lib/types';

export const metadata = {
  title: 'Torneos',
  description: 'Torneos abiertos de League of Legends en México y LATAM.',
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function fetchInitial(params: URLSearchParams) {
  try {
    const res = await apiGet<PaginatedList<TournamentSummary>>(
      `/tournaments?${params.toString()}`,
    );
    return res;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Tournaments fetch failed: ${err.status} ${err.message}`);
    }
    return null;
  }
}

export default async function TournamentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const statusRaw = typeof sp.status === 'string' ? sp.status : '';
  const sortRaw = typeof sp.sort === 'string' ? sp.sort : 'starting';
  const page = typeof sp.page === 'string' ? Math.max(1, Number(sp.page) || 1) : 1;

  const ALLOWED_STATUSES: TournamentStatus[] = [
    'PUBLISHED',
    'REGISTRATION_OPEN',
    'REGISTRATION_CLOSED',
    'IN_PROGRESS',
    'COMPLETED',
  ];
  const status = (ALLOWED_STATUSES as string[]).includes(statusRaw)
    ? (statusRaw as TournamentStatus)
    : '';
  const sort = (['starting', 'popular', 'recent'] as const).includes(
    sortRaw as 'starting' | 'popular' | 'recent',
  )
    ? (sortRaw as 'starting' | 'popular' | 'recent')
    : 'starting';

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);
  params.set('limit', String(PAGE_SIZE));
  params.set('offset', String((page - 1) * PAGE_SIZE));

  const initial = await fetchInitial(params);
  const fallback: PaginatedList<TournamentSummary> = {
    items: [],
    total: 0,
    limit: PAGE_SIZE,
    offset: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <FadeIn>
        <header className="mb-8 max-w-2xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Torneos
          </h1>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            Encuentra el siguiente torneo donde competir. Filtra por estado, ordena por
            prize pool y busca por nombre u organizador.
          </p>
        </header>
      </FadeIn>

      <TournamentsBrowser
        initialData={initial ?? fallback}
        initialFilters={{ q, status, sort, page }}
      />
    </div>
  );
}
