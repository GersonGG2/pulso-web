/**
 * Inline type definitions for backend responses.
 * Will move to `pulso-shared` package once we settle which contracts to share.
 */

export type PlayerTier = 'AMATEUR' | 'COMPETIDOR' | 'SEMI_PRO' | 'PRO';
export type LolRole = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
export type TournamentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
export type Modality = 'SOLO_1V1' | 'TEAM_5V5' | 'ARAM';

export interface PlayerSummary {
  id: string;
  primaryRole: LolRole | null;
  secondaryRole: LolRole | null;
  country: string;
  city: string | null;
  zScore: number;
  tier: PlayerTier;
  isPro: boolean;
  recruitable: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  riotAccount: {
    gameName: string;
    tagLine: string;
    region: string;
    summonerLevel: number | null;
    currentTier: string | null;
    currentRank: string | null;
    highestRankEver: string | null;
  } | null;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface TournamentSignedEntry {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  teamName: string | null;
  teamTag: string | null;
  teamLogoUrl: string | null;
}

export interface TournamentSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  modality: Modality;
  status: TournamentStatus;
  region: string;
  maxParticipants: number;
  entryFeeMxnCents: number;
  prizePool: Record<string, unknown> | null;
  registrationOpensAt: string;
  registrationClosesAt: string;
  startsAt: string;
  organizer: {
    id: string;
    organizationName: string;
    logoUrl: string | null;
    verified: boolean;
  };
  registrationsCount: number;
  signedSample: TournamentSignedEntry[];
}

export interface HallOfFameTeam {
  id: string;
  name: string;
  tag: string;
  country: string;
  logoUrl: string | null;
  tournamentsWonCount: number;
  activeMembersCount: number;
}
