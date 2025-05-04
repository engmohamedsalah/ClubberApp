import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { PlaylistService } from "../../playlist/playlist.service"; // Adjust path if needed
import * as PlaylistActions from "../actions/playlist.actions";
import { catchError, map, mergeMap, switchMap, take } from "rxjs/operators";
import { of } from "rxjs";
import { Match, MatchStatus, MatchAvailability } from "../../models/match.model";
import { Playlist } from "../../models/playlist.model";
// Optional: Import notification service if using one for bonus points
// import { ToastrService } from "ngx-toastr";

@Injectable()
export class PlaylistEffects {

  loadPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.loadPlaylist),
      switchMap(() => {
        // Call loadPlaylist which updates the playlist$ observable
        this.playlistService.loadPlaylist();

        // Return the first value from the playlist$ observable
        return this.playlistService.playlist$.pipe(
          take(1),
          map(matches => {
            // Convert matches array to a Playlist object
            const playlist: Playlist = { matches };
            return PlaylistActions.loadPlaylistSuccess({ playlist });
          }),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to load playlist";
            return of(PlaylistActions.loadPlaylistFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  addMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.addMatchToPlaylist),
      mergeMap(action => {
        // Create a minimal match object for addToPlaylist
        const match: Match = {
          id: action.matchId,
          title: '',
          competition: '',
          date: new Date(),
          status: MatchStatus.NotStarted,
          availability: MatchAvailability.Available,
          streamURL: ''
        };

        // Call addToPlaylist which updates the playlist$ observable
        this.playlistService.addToPlaylist(match);

        // Return the first value from the updated playlist$ observable
        return this.playlistService.playlist$.pipe(
          take(1),
          map(matches => {
            // Convert matches array to a Playlist object
            const playlist: Playlist = { matches };
            return PlaylistActions.addMatchToPlaylistSuccess({ playlist });
          }),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to add match to playlist";
            return of(PlaylistActions.addMatchToPlaylistFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  removeMatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.removeMatchFromPlaylist),
      mergeMap(action => {
        // Call removeFromPlaylist which updates the playlist$ observable
        this.playlistService.removeFromPlaylist(action.matchId);

        // Return the first value from the updated playlist$ observable
        return this.playlistService.playlist$.pipe(
          take(1),
          map(matches => {
            // Convert matches array to a Playlist object
            const playlist: Playlist = { matches };
            return PlaylistActions.removeMatchFromPlaylistSuccess({ playlist });
          }),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Failed to remove match from playlist";
            return of(PlaylistActions.removeMatchFromPlaylistFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private playlistService: PlaylistService
    // Optional: Inject notification service
    // private toastr: ToastrService
  ) {}
}

