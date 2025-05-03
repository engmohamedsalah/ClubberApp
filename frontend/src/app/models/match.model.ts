// Corresponds to the MatchDto from the backend
export interface Match {
  id: string; // Backend uses Guid, represented as string in TS
  title: string;
  competition: string;
  date: Date; // Or string, depending on how you handle dates
  status: MatchStatus; // Using enum instead of string
  availability: MatchAvailability; // From backend DTO
  streamURL: string;
}

// Match the backend enums
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

// UI Helper functions to derive display properties from the backend model
export class MatchUIHelper {
  // Check if a match is live based on its status
  static isLive(match: Match): boolean {
    return match.status === MatchStatus.InProgress;
  }

  // Check if a match is available for replay
  static isReplay(match: Match): boolean {
    return match.status === MatchStatus.Completed;
  }

  // Get match location from title (assuming format "Team1 vs Team2" with venue info in components)
  static getTeams(match: Match): string[] {
    // Extract team names from title, assuming format "Team1 vs Team2"
    const teamParts = match.title.split(' vs ');
    return teamParts.length === 2 ? teamParts : [match.title];
  }

  // Generate thumbnail URL based on match data if needed
  static getThumbnail(match: Match): string | undefined {
    // In a real app, this might use team data or competition to generate a relevant image URL
    // For now, return undefined since thumbnails would typically come from a media service
    return undefined;
  }
}

