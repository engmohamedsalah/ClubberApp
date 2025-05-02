import { createReducer, on } from "@ngrx/store";
import { MatchesState, initialMatchesState } from "../state/matches.state";
import * as MatchesActions from "../actions/matches.actions";

export const matchesReducer = createReducer(
  initialMatchesState,

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

