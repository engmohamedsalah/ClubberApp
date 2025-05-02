import { createAction, props } from "@ngrx/store";
import { Match } from "../../models/match.model";

// Load Matches Actions
export const loadMatches = createAction("[Matches] Load Matches");

export const loadMatchesSuccess = createAction(
  "[Matches] Load Matches Success",
  props<{ matches: Match[] }>()
);

export const loadMatchesFailure = createAction(
  "[Matches] Load Matches Failure",
  props<{ error: string }>()
);

// Add other match-related actions if needed (e.g., search, filter)

