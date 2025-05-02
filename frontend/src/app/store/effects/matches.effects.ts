import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MatchesService } from "../../matches/matches.service"; // Adjust path if needed
import * as MatchesActions from "../actions/matches.actions";
import { catchError, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";

@Injectable()
export class MatchesEffects {

  loadMatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MatchesActions.loadMatches),
      mergeMap(() =>
        this.matchesService.getMatches().pipe(
          map(matches => MatchesActions.loadMatchesSuccess({ matches })),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to load matches";
            return of(MatchesActions.loadMatchesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private matchesService: MatchesService
  ) {}
}

