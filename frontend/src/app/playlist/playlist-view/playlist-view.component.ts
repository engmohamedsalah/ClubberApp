import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Match, MatchUIHelper } from '../../models/match.model';
import { PlaylistService } from '../playlist.service';
import { NotificationComponent } from '../../shared';

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './playlist-view.component.html',
  styleUrls: ['./playlist-view.component.css']
})
export class PlaylistViewComponent implements OnInit, OnDestroy {
  playlist$: Observable<Match[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  notification$: Observable<{message: string, type: 'success' | 'error'} | null>;

  searchQuery = '';
  private subscriptions: Subscription[] = [];
  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(private playlistService: PlaylistService) {
    this.playlist$ = this.playlistService.playlist$;
    this.loading$ = this.playlistService.loading$;
    this.error$ = this.playlistService.error$;
    this.notification$ = this.playlistService.notification$;
  }

  ngOnInit(): void {
    this.playlistService.loadPlaylist();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Helper methods to make UI properties available to the template
  isLive(match: Match): boolean {
    return MatchUIHelper.isLive(match);
  }

  isReplay(match: Match): boolean {
    return MatchUIHelper.isReplay(match);
  }

  getTeams(match: Match): string[] {
    return MatchUIHelper.getTeams(match);
  }

  getLocation(match: Match): string | undefined {
    // In a real app, this might come from a separate venue/location DB
    // For demo purposes, extract it from the competition field if present
    if (match.competition.includes('at ')) {
      return match.competition.split('at ')[1].trim();
    }
    return undefined;
  }

  getThumbnail(): string | undefined {
    return MatchUIHelper.getThumbnail();
  }

  searchPlaylist(): void {
    // Debounce search to avoid too many filtering operations
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      // Client-side filtering since playlist is already loaded
      const query = this.searchQuery.toLowerCase().trim();

      // If search query is empty, reset to showing all matches in playlist
      if (!query) {
        this.playlistService.loadPlaylist();
        return;
      }
    }, 300);
  }

  // Remove match from playlist
  removeFromPlaylist(matchId: string): void {
    this.playlistService.removeFromPlaylist(matchId);
  }

  // Watch match (mock streaming)
  watchMatch(match: Match): void {
    console.log('Opening mock stream for match:', match.id);

    // Create a simple modal with embedded video
    const modalDiv = document.createElement('div');
    modalDiv.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modalDiv.id = 'stream-modal';

    const location = this.getLocation(match);
    const teams = this.getTeams(match);

    // Modal content
    modalDiv.innerHTML = `
      <div class="bg-gray-900 rounded-lg overflow-hidden max-w-4xl w-full mx-4">
        <div class="p-4 flex justify-between items-center border-b border-gray-700">
          <h3 class="text-xl font-bold text-white">${match.title} - ${this.isLive(match) ? 'Live Stream' : 'Replay'}</h3>
          <button id="close-modal" class="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="relative" style="padding-top: 56.25%">
          <iframe src="${match.streamURL || ''}"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <div class="p-4 text-gray-300">
          <p>Competition: ${match.competition}</p>
          <p>Teams: ${teams.join(' vs ')}</p>
          ${location ? `<p>Location: ${location}</p>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modalDiv);

    // Add close event listener
    document.getElementById('close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modalDiv);
    });
  }

  // Clear notification
  clearNotification(): void {
    this.playlistService.clearNotification();
  }
}

