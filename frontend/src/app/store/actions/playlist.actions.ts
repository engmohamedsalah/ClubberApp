import { createAction, props } from "@ngrx/store";
import { Playlist } from "../../models/playlist.model";

// Load Playlist Actions
export const loadPlaylist = createAction("[Playlist] Load Playlist");

export const loadPlaylistSuccess = createAction(
  "[Playlist] Load Playlist Success",
  props<{ playlist: Playlist }>()
);

export const loadPlaylistFailure = createAction(
  "[Playlist] Load Playlist Failure",
  props<{ error: string }>()
);

// Add Match to Playlist Actions
export const addMatchToPlaylist = createAction(
  "[Playlist] Add Match To Playlist",
  props<{ matchId: string }>() // Changed type to string
);

export const addMatchToPlaylistSuccess = createAction(
  "[Playlist] Add Match To Playlist Success",
  props<{ playlist: Playlist }>() // Assuming backend returns updated playlist
);

export const addMatchToPlaylistFailure = createAction(
  "[Playlist] Add Match To Playlist Failure",
  props<{ error: string }>()
);

// Remove Match from Playlist Actions
export const removeMatchFromPlaylist = createAction(
  "[Playlist] Remove Match From Playlist",
  props<{ matchId: string }>() // Changed type to string
);

export const removeMatchFromPlaylistSuccess = createAction(
  "[Playlist] Remove Match From Playlist Success",
  props<{ playlist: Playlist }>() // Assuming backend returns updated playlist
);

export const removeMatchFromPlaylistFailure = createAction(
  "[Playlist] Remove Match From Playlist Failure",
  props<{ error: string }>()
);

