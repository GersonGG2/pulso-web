import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { HeaderAuth } from '@/components/auth/header-auth';

const NAV = [
  { href: '/tournaments', label: 'Torneos' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Pulso — Inicio"
          className="transition-base hover:opacity-90"
        >
          <Logo size="sm" />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--color-muted-foreground)] transition-base hover:text-[var(--color-foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderAuth />
      </div>
    </header>
  );
}
