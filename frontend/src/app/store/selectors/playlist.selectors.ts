import { createFeatureSelector, createSelector } from "@ngrx/store";
import { PlaylistState } from "../state/playlist.state";

// Feature selector for the playlist state slice
export const selectPlaylistState = createFeatureSelector<PlaylistState>("playlist");

// Selector for the playlist object
export const selectUserPlaylist = createSelector(
  selectPlaylistState,
  (state: PlaylistState) => state.playlist
);

// Selector for the matches within the playlist
export const selectPlaylistMatches = createSelector(
  selectUserPlaylist,
  (playlist) => playlist?.matches ?? [] // Return empty array if playlist is null
);

// Selector for the loading status
export const selectPlaylistLoading = createSelector(
  selectPlaylistState,
  (state: PlaylistState) => state.loading
);

// Selector for the error message
export const selectPlaylistError = createSelector(
  selectPlaylistState,
  (state: PlaylistState) => state.error
);

