import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A reusable component for displaying error messages consistently across the application
 */
@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errorMessage"
      class="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded-lg mb-6 animate-fadeIn"
      role="alert">
      <div class="flex items-start">
        <!-- Error icon -->
        <svg class="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>

        <!-- Error content -->
        <div class="flex-1">
          <p class="font-medium" [class.mb-2]="errorDetails">{{ errorMessage }}</p>
          <p *ngIf="errorDetails" class="text-sm text-red-300">{{ errorDetails }}</p>
        </div>

        <!-- Close button -->
        <button
          *ngIf="dismissible"
          class="ml-auto -mr-1 text-red-300 hover:text-white transition-colors"
          (click)="dismiss()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Retry button for network errors -->
      <div *ngIf="showRetry" class="mt-3 flex justify-end">
        <button
          class="px-3 py-1 text-sm bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
          (click)="retry()">
          Retry
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ErrorDisplayComponent {
  /** The main error message to display */
  @Input() errorMessage: string | null = null;

  /** Optional additional error details */
  @Input() errorDetails: string | null = null;

  /** Whether to show a close button to dismiss the error */
  @Input() dismissible = true;

  /** Whether to show a retry button */
  @Input() showRetry = false;

  /** Event emitted when the error is dismissed */
  @Output() dismissed = new EventEmitter<void>();

  /** Event emitted when retry is clicked */
  @Output() retried = new EventEmitter<void>();

  /** Dismiss the error */
  dismiss(): void {
    this.dismissed.emit();
  }

  /** Retry the operation that caused the error */
  retry(): void {
    this.retried.emit();
  }
}
