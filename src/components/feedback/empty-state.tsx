import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Estado vacío reutilizable — para listas/tablas sin datos.
 * Composable: cualquier hijo se pasa a `action` (típicamente un Button).
 * Copy debe venir SIEMPRE en español por convención del producto.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/40 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)]/40 text-[var(--color-muted-foreground)]">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--color-foreground)]">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
