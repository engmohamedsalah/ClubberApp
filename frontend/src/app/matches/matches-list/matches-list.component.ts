import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Match, MatchUIHelper, MatchStatus } from '../../models/match.model';
import { MatchesService } from '../matches.service';
import { PlaylistService } from '../../playlist/playlist.service';
import { NotificationComponent, ErrorDisplayComponent, LoadingSpinnerComponent, PaginationControlsComponent } from '../../shared';
import { PaginatedResult, PaginationHelper } from '../../models/pagination.model';
import { LoggingService } from '../../core/services/logging.service';
import { MatchCardComponent } from '../../shared/components/match-card/match-card.component';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../store/reducers';
import * as fromSelectors from '../../store/selectors/matches.selectors';
import { VideoPlayerModalComponent } from '../../shared/components/video-player-modal/video-player-modal.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationComponent,
    MatchCardComponent,
    ErrorDisplayComponent,
    LoadingSpinnerComponent,
    PaginationControlsComponent,
    VideoPlayerModalComponent
  ],
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchesListComponent implements OnInit, OnDestroy {
  matches$: Observable<Match[]>;
  paginatedResult$: Observable<PaginatedResult<Match> | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  notification$: Observable<{message: string, type: 'success' | 'error'} | null>;

  currentFilter: 'All' | 'Live' | 'Replay' | 'Upcoming' = 'All';
  searchQuery = '';

  currentPage = 1;
  pageSize = 9;
  sortBy = 'date';
  sortDescending = true;

  private searchTimeout?: ReturnType<typeof setTimeout>;
  private subscriptions: Subscription[] = [];
  private sseSubscription?: Subscription;

  selectedMatchForModal: Match | null = null;

  constructor(
    private matchesService: MatchesService,
    private playlistService: PlaylistService,
    private loggingService: LoggingService,
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.matches$ = this.store.pipe(select(fromSelectors.selectAllMatches));
    this.paginatedResult$ = this.matchesService.paginatedResult$;
    this.loading$ = this.store.pipe(select(fromSelectors.selectMatchesLoading));
    this.error$ = this.store.pipe(select(fromSelectors.selectMatchesError));
    this.notification$ = this.playlistService.notification$;
  }

  ngOnInit(): void {
    this.sseSubscription = this.matchesService.getMatchesStream().subscribe({
      next: (matches) => {
        this.matchesService["matchesSubject"].next(matches);
        this.matchesService["paginatedResultSubject"].next({
          data: matches,
          page: 1,
          pageSize: matches.length > 0 ? matches.length : 10,
          totalCount: matches.length
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loggingService.logError('SSE error in MatchesListComponent', err);
      }
    });
    this.loadPaginatedMatches();
  }

  ngOnDestroy(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadPaginatedMatches(): void {
    let filterParam: 'Live' | 'Replay' | 'Upcoming' | null = null;
    if (this.currentFilter === 'Live') {
      filterParam = 'Live';
    } else if (this.currentFilter === 'Replay') {
      filterParam = 'Replay';
    } else if (this.currentFilter === 'Upcoming') {
      filterParam = 'Upcoming';
    }

    this.loggingService.logInfo('[MatchesListComponent] Calling loadPaginatedMatches with filter:', filterParam);
    this.matchesService.loadPaginatedMatches(
      this.currentPage,
      this.pageSize,
      filterParam,
      this.sortBy,
      this.sortDescending
    );
  }

  filterMatches(filter: 'All' | 'Live' | 'Replay' | 'Upcoming'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadPaginatedMatches();
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      const trimmedQuery = this.searchQuery.trim();
      if (!trimmedQuery) {
        this.loadPaginatedMatches();
      } else {
        this.matchesService.searchMatches(trimmedQuery);
      }
    }, 300);
  }

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

  getPageNumbers(result: PaginatedResult<Match>): number[] {
    return PaginationHelper.getPageNumbers(result);
  }

  getTotalPages(result: PaginatedResult<Match>): number {
    return PaginationHelper.getTotalPages(result);
  }

  addToPlaylist(match: Match): void {
    this.playlistService.addToPlaylist(match);
  }

  isInPlaylist(matchId: string): boolean {
    return this.playlistService.isInPlaylist(matchId);
  }

  openMatchVideoModal(match: Match): void {
    this.selectedMatchForModal = match;
    this.cdr.markForCheck();
  }

  closeMatchVideoModal(): void {
    this.selectedMatchForModal = null;
    this.cdr.markForCheck();
  }

  isLive(match: Match): boolean {
    return match.status === MatchStatus.Live;
  }

  isReplay(match: Match): boolean {
    return match.status === MatchStatus.OnDemand;
  }

  getLocation(match: Match): string | undefined {
    if (match.competition.includes('at ')) {
      return match.competition.split('at ')[1].trim();
    }
    return undefined;
  }

  getThumbnail(match: Match): string | undefined {
    return MatchUIHelper.getThumbnail(match);
  }

  clearPlaylistNotification(): void {
    this.playlistService.clearNotification();
  }
}

