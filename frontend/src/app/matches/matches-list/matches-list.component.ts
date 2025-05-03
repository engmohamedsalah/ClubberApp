import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Match } from '../../models/match.model';
import { MatchesService } from '../matches.service';
import { PlaylistService } from '../../playlist/playlist.service';
import { NotificationComponent } from '../../shared';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.css']
})
export class MatchesListComponent implements OnInit, OnDestroy {
  matches$: Observable<Match[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  notification$: Observable<{message: string, type: 'success' | 'error'} | null>;

  currentFilter: 'All' | 'Live' | 'Replay' = 'All';
  searchQuery = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;
  private subscriptions: Subscription[] = [];

  constructor(
    private matchesService: MatchesService,
    private playlistService: PlaylistService
  ) {
    this.matches$ = this.matchesService.matches$;
    this.loading$ = this.matchesService.loading$;
    this.error$ = this.matchesService.error$;
    this.notification$ = this.playlistService.notification$;
  }

  ngOnInit(): void {
    // Load all matches initially
    this.matchesService.loadMatches();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Filter matches by Live/Replay/All
  filterMatches(filter: 'All' | 'Live' | 'Replay'): void {
    this.currentFilter = filter;
    if (filter === 'All') {
      this.matchesService.loadMatches();
    } else if (filter === 'Live') {
      this.matchesService.filterMatches('Live');
    } else if (filter === 'Replay') {
      this.matchesService.filterMatches('Replay');
    }
  }

  // Search matches by competition name
  onSearchChange(): void {
    // Debounce search to avoid too many requests
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.matchesService.searchMatches(this.searchQuery);
    }, 300);
  }

  // Add match to playlist
  addToPlaylist(match: Match): void {
    this.playlistService.addToPlaylist(match);
  }

  // Check if match is already in playlist
  isInPlaylist(matchId: string): boolean {
    return this.playlistService.isInPlaylist(matchId);
  }

  // Open mock streaming view
  watchMatch(match: Match): void {
    console.log('Opening mock stream for match:', match.id);

    // Create a simple modal with embedded video
    const modalDiv = document.createElement('div');
    modalDiv.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modalDiv.id = 'stream-modal';

    // Modal content
    modalDiv.innerHTML = `
      <div class="bg-gray-900 rounded-lg overflow-hidden max-w-4xl w-full mx-4">
        <div class="p-4 flex justify-between items-center border-b border-gray-700">
          <h3 class="text-xl font-bold text-white">${match.title} - Live Stream</h3>
          <button id="close-modal" class="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="relative" style="padding-top: 56.25%">
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <div class="p-4 text-gray-300">
          <p>Competition: ${match.competition}</p>
          <p>Location: ${match.location || 'Unknown'}</p>
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

