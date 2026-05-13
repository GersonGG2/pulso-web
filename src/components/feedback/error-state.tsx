import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'card' | 'inline';
  className?: string;
}

/**
 * Estado de error reutilizable. Dos variantes:
 *  - 'card': bloque grande para fallos a nivel de página/sección
 *  - 'inline': franja compacta para fallos a nivel de form/acción
 *
 * Convención: títulos cortos en español. Descripciones accionables
 * ("Vuelve a intentar...") en vez de técnicas ("HTTP 500").
 */
export function ErrorState({
  title = 'Algo salió mal',
  description = 'Vuelve a intentarlo. Si el problema persiste, contáctanos.',
  action,
  variant = 'card',
  className,
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-start gap-2 rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]',
          className,
        )}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <p className="font-medium">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs opacity-90">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-destructive)]/20 text-[var(--color-destructive)]">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-destructive)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted-foreground)]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
