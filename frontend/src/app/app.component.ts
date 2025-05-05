import { Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Observable, filter, map } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly title = 'Clubber Sports';
  isMobileMenuOpen = false;
  isLoggedIn = false; // Simplified to a boolean property
  isHomePage$: Observable<boolean>;

  // Dark mode class
  readonly darkModeClass = 'bg-gray-900 text-white';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Track if we're on the home page (/ route)
    this.isHomePage$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects === '/' || event.urlAfterRedirects === '')
    );

    // Check if user is logged in
    this.checkLoginStatus();

    // Update login status on navigation
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
    });
  }

  ngOnInit(): void {
    // Create image folder if it doesn't exist
    this.createAssetsFolders();
  }

  // Add dark mode to the body
  @HostBinding('class') get class() {
    return this.darkModeClass;
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Logout user
  logout(): void {
    this.authService.removeToken();
    localStorage.removeItem('authUser');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  // Helper to create assets folders for images
  private createAssetsFolders(): void {
    // This is a placeholder. In a real app, the folders would be created during build
    console.log('Ensuring assets folders exist...');
    // In development, we could check if the folders exist and create them if needed
  }

  // Check if user is logged in
  private checkLoginStatus(): void {
    const token = this.authService.getToken();
    const user = localStorage.getItem('authUser');
    this.isLoggedIn = !!token && !!user;
  }
}

