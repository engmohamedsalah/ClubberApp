import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, AfterViewInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, MatchStatus } from '../../../models/match.model'; // Adjust path as needed
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player-modal.component.html',
  styleUrls: ['./video-player-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerModalComponent implements OnChanges, AfterViewInit {
  @Input() match: Match | null = null;
  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('modalOverlayRef') modalOverlay?: ElementRef<HTMLDivElement>;

  safeStreamUrl: SafeResourceUrl = '';
  isLive = false;
  // Expose MatchStatus enum to the template if needed for more complex conditions, though isLive handles the main case.
  // public MatchStatus = MatchStatus;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match'] && this.match) {
      this.safeStreamUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.match.streamURL || '');
      this.isLive = this.match.status === MatchStatus.Live;
    } else if (!this.match) {
      // Reset if match is cleared
      this.safeStreamUrl = '';
      this.isLive = false;
    }
  }

  ngAfterViewInit(): void {
    // Focus the modal or a focusable element inside when it becomes visible
    if (this.match && this.modalOverlay?.nativeElement) {
        this.modalOverlay.nativeElement.focus();
    }
  }

  onOverlayClick(event: Event): void {
    // Check if the click target is the overlay itself, not its children (the modal box)
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }

  // HostListener for the Escape key is now directly in the template for the modal-box for better context
  // @HostListener('document:keydown.escape', ['$event'])
  // onKeydownHandler(event: KeyboardEvent) {
  //   if (this.match) { // Only close if modal is open
  //    this.closeModal.emit();
  //   }
  // }
}
