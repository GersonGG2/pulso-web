import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'card' | 'inline' | 'rows' | 'grid';
  label?: string;
  rows?: number;
  className?: string;
}

/**
 * Loading state reutilizable. Cuatro modos:
 *  - 'inline': spinner pequeño con label, para acciones de botón
 *  - 'card':   spinner grande centrado, para fetch de página
 *  - 'rows':   skeleton de filas tipo tabla (N rows por defecto 5)
 *  - 'grid':   skeleton de cards en grid (N items por defecto 6)
 *
 * Copy siempre en español ("Cargando...").
 */
export function LoadingState({
  variant = 'card',
  label = 'Cargando',
  rows = 5,
  className,
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]', className)}>
        <Spinner size="sm" />
        {label}
      </span>
    );
  }

  if (variant === 'rows') {
    return (
      <div className={cn('space-y-3', className)} aria-busy="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
        aria-busy="true"
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-4 h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // variant === 'card'
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-6 py-16',
        className,
      )}
      aria-busy="true"
    >
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">{label}…</p>
    </div>
  );
}
