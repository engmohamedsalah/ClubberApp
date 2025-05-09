import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A reusable component for displaying error messages consistently across the application
 */
@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.css']
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
