import Link from 'next/link';

interface LegalLayoutProps {
  category: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Layout reutilizable para documentos legales (Términos, Privacidad, Cookies, etc).
 * Aplica jerarquía tipográfica consistente y disclaimer de "borrador" hasta que
 * un abogado valide el copy. SOLID: Single Responsibility (presentación legal),
 * Open/Closed (children son la fuente del contenido).
 */
export function LegalLayout({ category, title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-wider text-[var(--color-primary)]">
          {category}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Última actualización: {lastUpdated}
        </p>
      </header>

      <div className="mb-10 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-[var(--color-warning)]">
        <strong>Borrador.</strong> Este documento está en revisión legal. La versión final será
        publicada antes del lanzamiento público de Pulso. El uso del producto hoy se rige por
        las prácticas estándar de la industria y la legislación mexicana aplicable.
      </div>

      <div className="prose-pulso space-y-6 text-sm leading-relaxed text-[var(--color-foreground)]">
        {children}
      </div>

      <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted-foreground)]">
        <p>
          Cualquier duda escríbenos a{' '}
          <Link href="mailto:legal@pulsogg.gg" className="text-[var(--color-primary)]">
            legal@pulsogg.gg
          </Link>
          .
        </p>
      </div>
    </article>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-4 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-[var(--color-muted-foreground)]">{children}</p>;
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-[var(--color-muted-foreground)]">{children}</ul>
  );
}
