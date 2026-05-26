import { Hero } from '@/components/home/hero';
import { PopularTournaments } from '@/components/home/popular-tournaments';
import { TopPlayers } from '@/components/home/top-players';
import { HallOfFame } from '@/components/home/hall-of-fame';
import { ValueProps } from '@/components/home/value-props';
import { WaitlistForm } from '@/components/home/waitlist-form';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularTournaments />
      <TopPlayers />
      <HallOfFame />
      <ValueProps />
      <WaitlistForm />
    </>
  );
}
