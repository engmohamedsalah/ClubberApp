import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MatchesService } from "../../matches/matches.service"; // Adjust path if needed
import * as MatchesActions from "../actions/matches.actions";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { of } from "rxjs";

@Injectable()
export class MatchesEffects {

  loadMatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.loadMatches),
      switchMap(() => {
        // Load matches, which will update the matches$ observable
        this.matchesService.loadMatches();

        // Return the first emission from matches$
        return this.matchesService.matches$.pipe(
          take(1),
          map(matches => MatchesActions.loadMatchesSuccess({ matches })),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to load matches";
            return of(MatchesActions.loadMatchesFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private matchesService: MatchesService
  ) {}
}

