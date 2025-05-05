import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchesService } from '../matches/matches.service';
import { PlaylistService } from '../playlist/playlist.service';
import { AuthService } from '../auth/auth.service';
import { Match, MatchStatus } from '../models/match.model';

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
  loading = true;
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

    // Load matches
    this.matchesService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    this.matchesService.loadMatches();

    // Subscribe to matches
    this.matchesService.matches$.subscribe(matches => {
      if (matches.length > 0) {
        // Filter live matches
        this.liveMatches = matches.filter(m => m.status === MatchStatus.Live).slice(0, 5);

        // Get recent matches (using date to simulate - in reality you might have a 'recentlyAdded' flag)
        this.recentMatches = [...matches]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 4);

        // Get featured matches (this would ideally be determined by your backend)
        // For demo purposes, we'll just take some random ones
        this.featuredMatches = this.getRandomMatches(matches, 6);
      }
    });

    // Get playlist count
    this.playlistService.playlist$.subscribe(playlist => {
      this.playlistCount = playlist.length;
    });

    // Load playlist data
    this.playlistService.loadPlaylist();

    // Handle errors
    this.matchesService.error$.subscribe(error => {
      if (error) {
        this.error = error;
      }
    });
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
