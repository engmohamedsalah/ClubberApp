import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { PlaylistService } from "../../playlist/playlist.service"; // Adjust path if needed
import * as PlaylistActions from "../actions/playlist.actions";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { of } from "rxjs";
// Optional: Import notification service if using one for bonus points
// import { ToastrService } from "ngx-toastr"; 

@Injectable()
export class PlaylistEffects {

  loadPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.loadPlaylist),
      mergeMap(() =>
        this.playlistService.getPlaylist().pipe(
          map(playlist => PlaylistActions.loadPlaylistSuccess({ playlist })),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to load playlist";
            return of(PlaylistActions.loadPlaylistFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  addMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.addMatchToPlaylist),
      mergeMap(action =>
        this.playlistService.addMatch(action.matchId).pipe(
          map(playlist => {
            // Optional: Show success notification (Bonus Point)
            // this.toastr.success("Match added to playlist!");
            return PlaylistActions.addMatchToPlaylistSuccess({ playlist });
          }),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to add match to playlist";
            // Optional: Show error notification (Bonus Point)
            // this.toastr.error(errorMessage, "Error");
            return of(PlaylistActions.addMatchToPlaylistFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  removeMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.removeMatchFromPlaylist),
      mergeMap(action =>
        this.playlistService.removeMatch(action.matchId).pipe(
          map(playlist => {
            // Optional: Show success notification (Bonus Point)
            // this.toastr.success("Match removed from playlist!");
            return PlaylistActions.removeMatchFromPlaylistSuccess({ playlist });
          }),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to remove match from playlist";
            // Optional: Show error notification (Bonus Point)
            // this.toastr.error(errorMessage, "Error");
            return of(PlaylistActions.removeMatchFromPlaylistFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private playlistService: PlaylistService
    // Optional: Inject notification service
    // private toastr: ToastrService 
  ) {}
}

