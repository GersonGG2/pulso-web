import { SignIn } from '@clerk/nextjs';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Sign in',
  description: 'Inicia sesión en Pulso',
};

export default function SignInPage() {
  if (!CLERK_ENABLED) {
    return <ClerkNotConfigured destination="Sign in" />;
  }
  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md items-center justify-center px-4 py-16">
      <SignIn />
    </div>
  );
}
