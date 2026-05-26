'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CLERK_ENABLED, SIGN_IN_URL, SIGN_UP_URL } from '@/lib/auth';

export function HeaderAuth() {
  if (!CLERK_ENABLED) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={SIGN_IN_URL}>Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={SIGN_UP_URL}>Crear cuenta</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Button variant="ghost" size="sm" asChild>
          <Link href={SIGN_IN_URL}>Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={SIGN_UP_URL}>Crear cuenta</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/dashboard/profile">Mi perfil</Link>
        </Button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
