import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Match, MatchUIHelper } from '../../models/match.model';
import { MatchesService } from '../matches.service';
import { PlaylistService } from '../../playlist/playlist.service';
import { NotificationComponent } from '../../shared';
import { PaginatedResult, PaginationHelper } from '../../models/pagination.model';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.css']
})
export class MatchesListComponent implements OnInit, OnDestroy {
  matches$: Observable<Match[]>;
  paginatedResult$: Observable<PaginatedResult<Match> | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  notification$: Observable<{message: string, type: 'success' | 'error'} | null>;

  currentFilter: 'All' | 'Live' | 'Replay' | 'Upcoming' = 'All';
  searchQuery = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 9; // Adjust based on your UI layout (3x3 grid looks good)
  sortBy = 'date';
  sortDescending = true;

  private searchTimeout?: ReturnType<typeof setTimeout>;
  private subscriptions: Subscription[] = [];

  constructor(
    private matchesService: MatchesService,
    private playlistService: PlaylistService
  ) {
    this.matches$ = this.matchesService.matches$;
    this.paginatedResult$ = this.matchesService.paginatedResult$;
    this.loading$ = this.matchesService.loading$;
    this.error$ = this.matchesService.error$;
    this.notification$ = this.playlistService.notification$;
  }

  ngOnInit(): void {
    // Load paginated matches initially
    this.loadPaginatedMatches();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
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

  // Load paginated matches
  loadPaginatedMatches(): void {
    let filterParam: 'Live' | 'Replay' | 'Upcoming' | null = null;
    if (this.currentFilter === 'Live') {
      filterParam = 'Live';
    } else if (this.currentFilter === 'Replay') {
      filterParam = 'Replay';
    } else if (this.currentFilter === 'Upcoming') {
      filterParam = 'Upcoming';
    }

    this.matchesService.loadPaginatedMatches(
      this.currentPage,
      this.pageSize,
      filterParam,
      this.sortBy,
      this.sortDescending
    );
  }

  // Filter matches by Live/Replay/All
  filterMatches(filter: 'All' | 'Live' | 'Replay' | 'Upcoming'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
    this.loadPaginatedMatches();
  }

  // Search matches by competition name
  onSearchChange(): void {
    // Debounce search to avoid too many requests
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset to first page on search
      // For simplicity, using the non-paginated search for now
      // In a real app, you would implement server-side search with pagination
      this.matchesService.searchMatches(this.searchQuery);
    }, 300);
  }

  // Pagination controls
  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadPaginatedMatches();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Helper function to get page numbers for display
  getPageNumbers(result: PaginatedResult<Match>): number[] {
    return PaginationHelper.getPageNumbers(result);
  }

  // Helper function to get total pages
  getTotalPages(result: PaginatedResult<Match>): number {
    return PaginationHelper.getTotalPages(result);
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
          <iframe src="${match.streamURL || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'}"
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

