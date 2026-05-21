import Link from 'next/link';
import { PageTransition } from '@/components/motion';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-8 inline-block text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
      >
        ← Dashboard
      </Link>
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
