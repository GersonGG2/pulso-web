import { PageTransition } from '@/components/motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
