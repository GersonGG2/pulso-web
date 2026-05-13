import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SubscribeActions } from '@/components/subscription/subscribe-actions';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Pulso Pro Player',
  description: 'Acceso premium: stats avanzados, visibilidad para scouts, replay analyzer.',
};

interface Subscription {
  id: string;
  plan: 'PRO_PLAYER' | 'RECRUITER_ACCESS';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  provider: string;
  startedAt: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

async function fetchSubscription(token: string): Promise<Subscription | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/subscriptions/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  // NestJS returns an empty body when the controller returns null,
  // so we cannot blindly .json() it.
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Subscription;
  } catch {
    return null;
  }
}

export default async function SubscribePage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Pulso Pro" />;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/subscribe');
  const token = await getToken();
  if (!token) redirect('/sign-in?redirect_url=/subscribe');

  const sub = await fetchSubscription(token);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Conviértete en{' '}
          <span className="text-[var(--color-primary)]">Pulso Pro</span>
        </h1>
        <p className="mt-3 text-balance text-sm text-[var(--color-muted-foreground)] sm:text-base">
          Stats avanzados, visibilidad prioritaria para scouts, y acceso anticipado a torneos
          premium.
        </p>
      </header>

      <SubscribeActions initialSubscription={sub} />
    </div>
  );
}
