import { Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter, map } from 'rxjs';
import { selectIsAuthenticated } from './store/selectors/auth.selectors';
import * as AuthActions from './store/actions/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly title = 'Clubber Sports';
  isMobileMenuOpen = false;
  isLoggedIn$: Observable<boolean>;
  isHomePage$: Observable<boolean>;

  // Dark mode class
  readonly darkModeClass = 'bg-gray-900 text-white';

  constructor(
    private router: Router,
    private store: Store
  ) {
    this.isLoggedIn$ = this.store.select(selectIsAuthenticated);

    // Track if we're on the home page (/ route)
    this.isHomePage$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects === '/' || event.urlAfterRedirects === '')
    ) as Observable<boolean>;
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
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/']);
  }

  // Helper to create assets folders for images
  private createAssetsFolders(): void {
    // This is a placeholder. In a real app, the folders would be created during build
    console.log('Ensuring assets folders exist...');
    // In development, we could check if the folders exist and create them if needed
  }
}

