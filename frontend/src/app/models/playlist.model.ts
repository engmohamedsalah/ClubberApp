import { Match } from "./match.model";

// Corresponds to the PlaylistDto from the backend
// Represents the list of matches in the user's playlist
export interface Playlist {
  matches: Match[];
}




// Corresponds to the PlaylistActionResultDto from the backend
export interface PlaylistActionResult {
  succeeded: boolean;
  message: string;
  playlist: Playlist | null; // The updated playlist content
}

