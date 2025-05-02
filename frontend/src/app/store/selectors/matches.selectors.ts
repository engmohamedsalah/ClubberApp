import { createFeatureSelector, createSelector } from "@ngrx/store";
import { MatchesState } from "../state/matches.state";

// Feature selector for the matches state slice
export const selectMatchesState = createFeatureSelector<MatchesState>("matches");

// Selector for the list of matches
export const selectAllMatches = createSelector(
  selectMatchesState,
  (state: MatchesState) => state.matches
);

// Selector for the loading status
export const selectMatchesLoading = createSelector(
  selectMatchesState,
  (state: MatchesState) => state.loading
);

// Selector for the error message
export const selectMatchesError = createSelector(
  selectMatchesState,
  (state: MatchesState) => state.error
);

