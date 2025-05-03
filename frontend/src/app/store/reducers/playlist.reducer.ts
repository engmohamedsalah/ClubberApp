import { createReducer, on } from "@ngrx/store";
import { Playlist } from '../../models/playlist.model';
import * as PlaylistActions from "../actions/playlist.actions";

// Define the state interface directly here
export interface PlaylistState {
  playlist: Playlist | null;
  loading: boolean;
  error: string | null;
}

export const initialState: PlaylistState = {
  playlist: null,
  loading: false,
  error: null
};

export const playlistReducer = createReducer(
  initialState,

  // Load Playlist
  on(PlaylistActions.loadPlaylist, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PlaylistActions.loadPlaylistSuccess, (state, { playlist }) => ({
    ...state,
    playlist: playlist,
    loading: false,
    error: null,
  })),
  on(PlaylistActions.loadPlaylistFailure, (state, { error }) => ({
    ...state,
    playlist: null,
    loading: false,
    error: error,
  })),

  // Add Match to Playlist
  on(PlaylistActions.addMatchToPlaylist, (state) => ({
    ...state,
    loading: true, // Indicate loading while adding
    error: null, // Clear previous errors
  })),
  on(PlaylistActions.addMatchToPlaylistSuccess, (state, { playlist }) => ({
    ...state,
    playlist: playlist, // Update playlist with the result from backend
    loading: false,
  })),
  on(PlaylistActions.addMatchToPlaylistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),

  // Remove Match from Playlist
  on(PlaylistActions.removeMatchFromPlaylist, (state) => ({
    ...state,
    loading: true, // Indicate loading while removing
    error: null, // Clear previous errors
  })),
  on(PlaylistActions.removeMatchFromPlaylistSuccess, (state, { playlist }) => ({
    ...state,
    playlist: playlist, // Update playlist with the result from backend
    loading: false,
  })),
  on(PlaylistActions.removeMatchFromPlaylistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  }))
);

