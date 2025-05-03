import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Clubber Sports';

  // Add dark mode to the body
  @HostBinding('class') get class() {
    return 'bg-gray-900 text-white';
  }

  // Toggle mobile menu (this would be connected to a button in the template)
  toggleMobileMenu(): void {
    const mobileMenu = document.querySelector('.md\\:hidden:not(button)') as HTMLElement;
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  }
}

