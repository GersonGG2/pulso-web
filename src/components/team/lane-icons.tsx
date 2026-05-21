import { Crosshair, Heart, Swords, Trees, Wand2, type LucideIcon } from 'lucide-react';

export type LolRole = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export const LANE_ORDER: LolRole[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

export const LANE_META: Record<LolRole, { label: string; icon: LucideIcon; hint: string }> = {
  TOP: { label: 'Top', icon: Swords, hint: 'Toplaner — 1v1 y teamfights' },
  JUNGLE: { label: 'Jungle', icon: Trees, hint: 'Jungler — control de mapa' },
  MID: { label: 'Mid', icon: Wand2, hint: 'Midlaner — carry o playmaker' },
  ADC: { label: 'ADC', icon: Crosshair, hint: 'Bot lane — daño sostenido' },
  SUPPORT: { label: 'Support', icon: Heart, hint: 'Support — protege al ADC' },
};
