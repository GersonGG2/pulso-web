import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { RiotLinkFlow } from '@/components/onboarding/riot-link-flow';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Vincula tu cuenta de Riot',
};

async function checkAlreadyLinked(token: string): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/riot-account/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function OnboardingRiotPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Onboarding" />;

  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  const alreadyLinked = token ? await checkAlreadyLinked(token) : false;

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Paso 1 de 2
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Vincula tu cuenta de Riot</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Necesitamos verificar que la cuenta es tuya antes de empezar a registrar partidas.
        </p>
      </header>
      <RiotLinkFlow alreadyLinked={alreadyLinked} />
    </>
  );
}
