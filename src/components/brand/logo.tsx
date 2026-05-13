import { cn } from '@/lib/utils';

/**
 * Brand mark de Pulso. Componible: usar `variant` + `size` + `tone`.
 * Sigue Single Responsibility: dibuja la marca, nada más.
 *
 * - Wordmark "PULSO" en Russo One (font-display) — vibe esports condensada
 * - Símbolo: barra vertical lima como "pulso" (latido)
 */

type Variant = 'full' | 'wordmark' | 'symbol';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Tone = 'primary' | 'foreground' | 'inverted';

interface LogoProps {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  className?: string;
}

const SIZE_PX: Record<Size, { symbol: string; text: string; gap: string }> = {
  xs: { symbol: 'h-2.5 w-1', text: 'text-sm', gap: 'gap-1.5' },
  sm: { symbol: 'h-3.5 w-1.5', text: 'text-lg', gap: 'gap-2' },
  md: { symbol: 'h-5 w-2', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { symbol: 'h-8 w-3', text: 'text-4xl', gap: 'gap-3' },
  xl: { symbol: 'h-12 w-4', text: 'text-6xl', gap: 'gap-4' },
};

const TONE_COLORS: Record<Tone, { symbol: string; text: string }> = {
  primary: {
    symbol: 'bg-[var(--color-primary)]',
    text: 'text-[var(--color-foreground)]',
  },
  foreground: {
    symbol: 'bg-[var(--color-foreground)]',
    text: 'text-[var(--color-foreground)]',
  },
  inverted: {
    symbol: 'bg-[var(--color-primary-foreground)]',
    text: 'text-[var(--color-primary-foreground)]',
  },
};

export function Logo({
  variant = 'full',
  size = 'md',
  tone = 'primary',
  className,
}: LogoProps) {
  const sz = SIZE_PX[size];
  const colors = TONE_COLORS[tone];

  if (variant === 'symbol') {
    return (
      <span
        aria-label="Pulso"
        className={cn(
          'inline-block rounded-sm',
          sz.symbol,
          colors.symbol,
          className,
        )}
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <span
        aria-label="Pulso"
        className={cn(
          'font-[family-name:var(--font-display)] tracking-wider uppercase leading-none',
          sz.text,
          colors.text,
          className,
        )}
      >
        Pulso
      </span>
    );
  }

  // variant === 'full'
  return (
    <span
      aria-label="Pulso"
      className={cn('inline-flex items-center', sz.gap, className)}
    >
      <span className={cn('rounded-sm', sz.symbol, colors.symbol)} aria-hidden />
      <span
        className={cn(
          'font-[family-name:var(--font-display)] tracking-wider uppercase leading-none',
          sz.text,
          colors.text,
        )}
      >
        Pulso
      </span>
    </span>
  );
}
