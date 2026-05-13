import { cn } from '@/lib/utils';

/**
 * Skeleton placeholder mientras carga contenido. Atomic component.
 * Usar como `<Skeleton className="h-4 w-32" />`.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-[var(--color-muted)]/60',
        className,
      )}
      {...props}
    />
  );
}
