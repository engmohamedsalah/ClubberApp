import { Match } from "../../models/match.model";

export interface MatchesState {
  matches: Match[];
  loading: boolean;
  error: string | null;
}

export const initialMatchesState: MatchesState = {
  matches: [],
  loading: false,
  error: null,
};

