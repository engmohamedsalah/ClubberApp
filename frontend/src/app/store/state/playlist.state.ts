import { Playlist } from "../../models/playlist.model";

export interface PlaylistState {
  playlist: Playlist | null;
  loading: boolean;
  error: string | null;
}

export const initialPlaylistState: PlaylistState = {
  playlist: null,
  loading: false,
  error: null,
};

