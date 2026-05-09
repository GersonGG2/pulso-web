import { SignUp } from '@clerk/nextjs';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Crear cuenta',
  description: 'Únete a Pulso',
};

export default function SignUpPage() {
  if (!CLERK_ENABLED) {
    return <ClerkNotConfigured destination="Crear cuenta" />;
  }
  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md items-center justify-center px-4 py-16">
      <SignUp />
    </div>
  );
}
