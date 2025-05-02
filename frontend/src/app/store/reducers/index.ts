import { ActionReducerMap } from '@ngrx/store';
import { authReducer } from './auth.reducer';
import { AuthState } from '../state/auth.state';
import { matchesReducer } from './matches.reducer';
import { MatchesState } from '../state/matches.state';
import { playlistReducer } from './playlist.reducer'; // Import playlist reducer
import { PlaylistState } from '../state/playlist.state'; // Import playlist state

// Define the overall application state interface
export interface AppState {
  auth: AuthState;
  matches: MatchesState;
  playlist: PlaylistState; // Add playlist state slice
}

// Define the root reducer map
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  matches: matchesReducer,
  playlist: playlistReducer, // Add playlist reducer
};

