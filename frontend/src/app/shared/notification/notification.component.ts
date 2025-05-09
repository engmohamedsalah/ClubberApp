import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() notification: { message: string, type: 'success' | 'error' } | null = null;
  @Output() closeNotification = new EventEmitter<void>();

  get notificationClass(): string {
    return this.notification?.type === 'success'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : 'bg-red-50 text-red-800 border border-red-200';
  }

  get closeButtonClass(): string {
    return this.notification?.type === 'success'
      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50'
      : 'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50';
  }

  onClose(): void {
    this.closeNotification.emit();
  }
}
