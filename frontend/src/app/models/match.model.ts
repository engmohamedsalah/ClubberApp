// Corresponds to the MatchDto from the backend
export interface Match {
  id: string; // Backend uses Guid, represented as string in TS
  title: string;
  competition: string;
  date: Date; // Or string, depending on how you handle dates
  status: MatchStatus; // Using enum instead of string
  availability: MatchAvailability; // Added to match backend DTO
  streamURL?: string; // Optional stream URL

  // Frontend-specific properties (derived from backend data)
  location?: string; // Optional match location
  thumbnail?: string; // Optional thumbnail image URL
  teams?: string[]; // Array of team names - derived from title

  // These properties are computed in the component from status
  isLive?: boolean; // Computed from status === MatchStatus.InProgress
  isReplay?: boolean; // Computed from status === MatchStatus.Completed
}

// Match the backend enums exactly
export enum MatchStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum MatchAvailability {
  Available = 'Available',
  Unavailable = 'Unavailable'
}

// Utility functions to derive frontend-specific properties
export function isMatchLive(match: Match): boolean {
  return match.status === MatchStatus.InProgress;
}

export function isMatchReplay(match: Match): boolean {
  return match.status === MatchStatus.Completed;
}

// Helper to prepare match data from backend DTO
export function prepareMatchData(match: Match): Match {
  return {
    ...match,
    isLive: isMatchLive(match),
    isReplay: isMatchReplay(match),
    // Extract teams from title if not provided (e.g., "Team A vs Team B")
    teams: match.teams || (match.title?.includes(' vs ') ? match.title.split(' vs ') : undefined)
  };
}

