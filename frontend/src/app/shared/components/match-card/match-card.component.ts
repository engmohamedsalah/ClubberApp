import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, MatchUIHelper } from '../../../models/match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  @Input({ required: true }) match!: Match;
  @Input() context: 'matches-list' | 'playlist-view' = 'matches-list'; // To control button display
  @Input() isInPlaylist = false; // State passed from parent

  @Output() addToPlaylist = new EventEmitter<Match>();
  @Output() removeFromPlaylist = new EventEmitter<string>(); // Emits match ID
  @Output() watchMatch = new EventEmitter<Match>();

  // --- Helper methods needed by the template ---

  isLive(match: Match): boolean {
    return MatchUIHelper.isLive(match);
  }

  isReplay(match: Match): boolean {
    return MatchUIHelper.isReplay(match);
  }

  getLocation(match: Match): string | undefined {
    // Basic implementation copied from previous components
    if (match.competition.includes('at ')) {
      return match.competition.split('at ')[1].trim();
    }
    return undefined;
  }

  getThumbnail(match: Match): string | undefined {
    return MatchUIHelper.getThumbnail(match);
  }

  // --- Event Emitters ---

  onAddToPlaylistClick(): void {
    this.addToPlaylist.emit(this.match);
  }

  onRemoveFromPlaylistClick(): void {
    this.removeFromPlaylist.emit(this.match.id);
  }

  onWatchMatchClick(): void {
    this.watchMatch.emit(this.match);
  }
}
