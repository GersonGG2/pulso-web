import { Hero } from '@/components/home/hero';
import { ValueProps } from '@/components/home/value-props';
import { WaitlistForm } from '@/components/home/waitlist-form';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <WaitlistForm />
    </>
  );
}
