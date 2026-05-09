'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { CLERK_ENABLED } from '@/lib/auth';

/**
 * Wraps the tree in ClerkProvider only when Clerk is configured.
 * When the keys are missing the children render unmodified, which keeps
 * the public site fully functional in early dev.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!CLERK_ENABLED) return <>{children}</>;

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#a3e635',
          colorBackground: '#0a0b0f',
          colorInputBackground: '#1a1b22',
          colorInputText: '#f8fafc',
          colorText: '#f8fafc',
          colorTextSecondary: '#94a3b8',
          borderRadius: '0.5rem',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
