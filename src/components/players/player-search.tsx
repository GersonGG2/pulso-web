'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface SearchedPlayer {
  id: string;
  primaryRole: string | null;
  country: string;
  zScore: number;
  tier: string;
  isPro: boolean;
  recruitable: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface PlayerSearchProps {
  /** Player ids to hide from results (e.g., already on the team) */
  excludeIds?: string[];
  /** Placeholder for the input */
  placeholder?: string;
  /** Called when a result is clicked. Returns the full player. */
  onSelect: (player: SearchedPlayer) => void;
  /** Optional pre-selected player to show as a chip (e.g., after pick) */
  selectedPlayer?: SearchedPlayer | null;
  /** Called when the chip is cleared */
  onClear?: () => void;
  /** Disable input while parent is busy */
  disabled?: boolean;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

export function PlayerSearch({
  excludeIds = [],
  placeholder = 'Busca por username o nombre…',
  onSelect,
  selectedPlayer,
  onClear,
  disabled,
}: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < MIN_QUERY_LEN) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      try {
        const res = await fetch(
          `${apiUrl}/players?q=${encodeURIComponent(query.trim())}&limit=10`,
        );
        if (res.ok) {
          const data = (await res.json()) as { items: SearchedPlayer[] };
          setResults(data.items.filter((p) => !excludeIds.includes(p.id)));
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, excludeIds]);

  if (selectedPlayer) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 font-mono text-xs font-bold text-[var(--color-primary)]">
            {selectedPlayer.user.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-sm font-medium">
              {selectedPlayer.user.displayName}
              <Check className="h-3 w-3 text-[var(--color-primary)]" />
            </p>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">
              @{selectedPlayer.user.username} · {selectedPlayer.tier} ·{' '}
              <span className="font-mono">{selectedPlayer.zScore}</span>
            </p>
          </div>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="rounded-md p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/40 hover:text-[var(--color-foreground)] disabled:opacity-40"
            aria-label="Cambiar jugador"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--color-muted-foreground)]" />
        )}
      </div>

      <AnimatePresence>
        {open && query.trim().length >= MIN_QUERY_LEN && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl"
          >
            {loading && results.length === 0 && (
              <p className="p-3 text-center text-xs text-[var(--color-muted-foreground)]">
                Buscando…
              </p>
            )}
            {!loading && results.length === 0 && (
              <p className="p-3 text-center text-xs text-[var(--color-muted-foreground)]">
                Sin resultados para “{query}”
              </p>
            )}
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                  setQuery('');
                  setResults([]);
                }}
                className="flex w-full items-center gap-3 border-b border-[var(--color-border)] p-3 text-left transition-base last:border-b-0 hover:bg-[var(--color-primary)]/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-mono text-xs font-bold text-[var(--color-primary)]">
                  {p.user.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.user.displayName}</p>
                  <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                    @{p.user.username} · {p.country}
                    {p.primaryRole && ` · ${p.primaryRole}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {p.tier}
                  </Badge>
                  <span className="font-mono text-xs font-semibold text-[var(--color-primary)]">
                    {p.zScore}
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
