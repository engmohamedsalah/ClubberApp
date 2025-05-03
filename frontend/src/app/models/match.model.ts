// Corresponds to the MatchDto from the backend
export interface Match {
  id: string; // Backend uses Guid, represented as string in TS
  title: string;
  competition: string;
  date: Date; // Or string, depending on how you handle dates
  status: MatchStatus; // Using enum instead of string
  availability: MatchAvailability; // Added to match backend DTO
  streamURL?: string; // Optional stream URL
  teams: string[]; // Array of team names
  location?: string; // Optional match location
  isLive: boolean; // Computed from status on the backend (InProgress)
  isReplay: boolean; // Computed from status on the backend (Completed)
  thumbnail?: string; // Optional thumbnail image URL
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

