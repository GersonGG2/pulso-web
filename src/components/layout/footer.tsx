import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

const NAV_PRODUCT = [
  { href: '/tournaments', label: 'Torneos' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/subscribe', label: 'Pulso Pro' },
];

const NAV_COMPANY = [
  { href: '/about', label: 'Sobre Pulso' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/faq', label: 'Preguntas frecuentes' },
];

const NAV_LEGAL = [
  { href: '/legal/terminos', label: 'Términos' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <Logo size="sm" />
            <p className="text-sm text-[var(--color-muted-foreground)]">
              El pulso del esports en LATAM. Talento sobre contactos.
            </p>
          </div>

          <FooterColumn title="Producto" items={NAV_PRODUCT} />
          <FooterColumn title="Pulso" items={NAV_COMPANY} />
          <FooterColumn title="Legal" items={NAV_LEGAL} />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Pulso. Hecho en México.</p>
          <p>
            League of Legends es una marca de Riot Games, Inc. Pulso opera bajo el programa
            comunitario de Riot.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground)]">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-[var(--color-muted-foreground)] transition-base hover:text-[var(--color-foreground)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
