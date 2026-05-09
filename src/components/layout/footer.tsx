import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-[var(--color-primary)]" />
          <span className="text-sm font-medium">Pulso</span>
          <span className="text-sm text-[var(--color-muted-foreground)]">
            · El pulso del esports en LATAM
          </span>
        </div>

        <nav className="flex flex-wrap gap-6 text-sm text-[var(--color-muted-foreground)]">
          <Link href="/tournaments" className="hover:text-[var(--color-foreground)]">
            Torneos
          </Link>
          <Link href="/leaderboard" className="hover:text-[var(--color-foreground)]">
            Leaderboard
          </Link>
          <Link href="/about" className="hover:text-[var(--color-foreground)]">
            Sobre Pulso
          </Link>
          <Link href="/legal" className="hover:text-[var(--color-foreground)]">
            Legal
          </Link>
        </nav>

        <p className="text-xs text-[var(--color-muted-foreground)]">© 2026 Pulso</p>
      </div>
    </footer>
  );
}
