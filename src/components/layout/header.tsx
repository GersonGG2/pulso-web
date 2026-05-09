import Link from 'next/link';
import { HeaderAuth } from '@/components/auth/header-auth';

const NAV = [
  { href: '/tournaments', label: 'Torneos' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-[var(--color-primary)]" />
          <span className="text-lg font-semibold tracking-tight">Pulso</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
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
