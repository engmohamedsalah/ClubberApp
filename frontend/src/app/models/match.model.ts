// Corresponds to the MatchDto from the backend
export interface Match {
  id: string; // Backend uses Guid, represented as string in TS
  title: string;
  competition: string;
  date: Date; // Or string, depending on how you handle dates
  status: string; // e.g., "Live", "Replay"
}

