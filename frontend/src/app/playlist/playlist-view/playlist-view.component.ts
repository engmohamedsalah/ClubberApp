import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Match } from '../../models/match.model';
import { AppState } from '../../store/reducers'; // Adjust path as needed
import * as PlaylistActions from '../../store/actions/playlist.actions';
import { selectPlaylistMatches, selectPlaylistLoading, selectPlaylistError } from '../../store/selectors/playlist.selectors'; // Adjust path as needed

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [CommonModule], // Import CommonModule for *ngIf, *ngFor, async pipe etc.
  templateUrl: './playlist-view.component.html',
  styleUrls: ['./playlist-view.component.css']
})
export class PlaylistViewComponent implements OnInit {
  playlistMatches$: Observable<Match[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store<AppState>) {
    this.playlistMatches$ = this.store.select(selectPlaylistMatches);
    this.loading$ = this.store.select(selectPlaylistLoading);
    this.error$ = this.store.select(selectPlaylistError);
  }

  ngOnInit(): void {
    this.store.dispatch(PlaylistActions.loadPlaylist());
  }

  // Changed matchId type to string
  removeFromPlaylist(matchId: string): void {
    console.log('Attempting to remove match from playlist:', matchId);
    this.store.dispatch(PlaylistActions.removeMatchFromPlaylist({ matchId }));
    // Optionally show a notification (Bonus Point)
  }

  // Changed matchId type to string
  watchMatch(matchId: string): void {
    console.log('Attempting to watch match (mock):', matchId);
    // Implement mock watch functionality (Bonus Point)
    alert(`Mock: Watching match with ID: ${matchId}`);
  }
}

