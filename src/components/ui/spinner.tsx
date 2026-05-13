import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

/**
 * Indicador de carga circular. Usar para acciones cortas.
 * Para listas/grids con carga lenta usar `<Skeleton />`.
 */
export function Spinner({
  size = 'md',
  className,
  label = 'Cargando',
}: {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-r-transparent text-[var(--color-primary)]',
        SIZE_PX[size],
        className,
      )}
    />
  );
}
