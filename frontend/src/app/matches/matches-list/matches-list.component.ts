import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Match } from '../../models/match.model';
import { AppState } from '../../store/reducers'; // Adjust path as needed
import * as MatchesActions from '../../store/actions/matches.actions'; // Adjust path as needed
import * as PlaylistActions from '../../store/actions/playlist.actions'; // Create these later
import { selectAllMatches, selectMatchesLoading, selectMatchesError } from '../../store/selectors/matches.selectors'; // Adjust path as needed

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule], // Import CommonModule for *ngIf, *ngFor, async pipe etc.
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.css']
})
export class MatchesListComponent implements OnInit {
  matches$: Observable<Match[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store<AppState>) {
    this.matches$ = this.store.select(selectAllMatches);
    this.loading$ = this.store.select(selectMatchesLoading);
    this.error$ = this.store.select(selectMatchesError);
  }

  ngOnInit(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }

  // Changed matchId type to string
  addToPlaylist(matchId: string): void {
    console.log('Attempting to add match to playlist:', matchId);
    this.store.dispatch(PlaylistActions.addMatchToPlaylist({ matchId }));
    // Optionally show a notification (Bonus Point)
  }

  // Changed matchId type to string
  watchMatch(matchId: string): void {
    console.log('Attempting to watch match (mock):', matchId);
    // Implement mock watch functionality (Bonus Point)
    alert(`Mock: Watching match with ID: ${matchId}`);
  }
}

