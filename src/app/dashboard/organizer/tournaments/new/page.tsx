import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreateTournamentForm } from '@/components/organizer/create-tournament-form';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Nuevo torneo' };

async function isOrganizer(token: string): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/organizers/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok;
}

export default async function NewTournamentPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Create tournament" />;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  if (!(await isOrganizer(token))) {
    redirect('/dashboard/organizer/apply');
  }

  return (
    <>
      <header className="mb-6">
        <Link
          href="/dashboard/organizer"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ← Organizer
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nuevo torneo</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Se crea en estado <span className="font-mono">DRAFT</span> — puedes editarlo antes de
          publicar.
        </p>
      </header>
      <CreateTournamentForm />
    </>
  );
}
