import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchesService } from '../matches/matches.service';
import { PlaylistService } from '../playlist/playlist.service';
import { AuthService } from '../auth/auth.service';
import { Match } from '../models/match.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  liveMatches: Match[] = [];
  featuredMatches: Match[] = [];
  recentMatches: Match[] = [];
  playlistCount = 0;
  username = 'User';
  loadingLive = true;
  loadingRecent = true;
  loadingPlaylist = true;
  error: string | null = null;

  constructor(
    private matchesService: MatchesService,
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load user info - in a real app, you'd get this from the auth service
    // This is just a placeholder since we don't have actual user data
    const token = this.authService.getToken();
    if (token) {
      // Simple placeholder for demo - in real app you'd decode JWT or get user data
      this.username = 'Demo User';
    }

    // *** Optimized Loading ***
    this.error = null; // Reset error initially

    // Load Live Matches (e.g., top 5)
    this.loadingLive = true;
    this.matchesService.getLiveMatches(5).subscribe({
      next: matches => {
        this.liveMatches = matches;
        this.loadingLive = false;
      },
      error: () => { // Error is handled in service, just update loading
        this.loadingLive = false;
        // Optionally set a specific error message for this section
      }
    });

    // Load Recent Matches (e.g., top 10 to pick from for featured/recent)
    this.loadingRecent = true;
    this.matchesService.getRecentMatches(10).subscribe({
      next: matches => {
        // Take top 4 for the "Recent" section
        this.recentMatches = matches.slice(0, 4);
        // Take random 6 from the fetched recent for "Featured"
        this.featuredMatches = this.getRandomMatches(matches, 6);
        this.loadingRecent = false;
      },
      error: () => { // Error is handled in service, just update loading
        this.loadingRecent = false;
        // Optionally set a specific error message for this section
      }
    });

    // Get playlist count
    this.loadingPlaylist = true;
    this.playlistService.playlist$.subscribe(playlist => {
      this.playlistCount = playlist.length;
      // Assuming playlist loading state isn't directly available,
      // we mark loading as false once we get the first emission.
      // A more robust approach might involve a dedicated loading state for playlist.
      this.loadingPlaylist = false;
    });

    // Load playlist data (still needed for the count)
    this.playlistService.loadPlaylist();

    // Handle general errors (optional, as specific calls handle errors)
    // this.matchesService.error$.subscribe(error => {
    //   if (error) {
    //     this.error = error;
    //   }
    // });
  }

  // Helper method to get random matches for featured section
  private getRandomMatches(matches: Match[], count: number): Match[] {
    const shuffled = [...matches].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Add to playlist handler
  addToPlaylist(match: Match): void {
    this.playlistService.addToPlaylist(match);
  }

  // Check if match is in playlist
  isInPlaylist(matchId: string): boolean {
    return this.playlistService.isInPlaylist(matchId);
  }

  // Format date for display
  formatMatchDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}
