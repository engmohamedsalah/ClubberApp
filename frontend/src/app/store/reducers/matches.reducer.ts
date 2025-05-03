import { createReducer, on } from '@ngrx/store';
import { Match } from '../../models/match.model';
import * as MatchesActions from '../actions/matches.actions';

// Define the state interface directly here
export interface MatchesState {
  matches: Match[];
  loading: boolean;
  error: string | null;
}

export const initialState: MatchesState = {
  matches: [],
  loading: false,
  error: null
};

export const matchesReducer = createReducer(
  initialState,

  // Load Matches
  on(MatchesActions.loadMatches, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(MatchesActions.loadMatchesSuccess, (state, { matches }) => ({
    ...state,
    matches: matches,
    loading: false,
    error: null,
  })),
  on(MatchesActions.loadMatchesFailure, (state, { error }) => ({
    ...state,
    matches: [], // Clear matches on failure
    loading: false,
    error: error,
  }))
);

