import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.css']
})
export class PaginationControlsComponent<T = unknown> {
  @Input() currentPage = 1;
  @Input() result!: PaginationResult<T>;
  @Output() pageChange = new EventEmitter<number>();

  getTotalPages(result: PaginationResult<T>): number {
    return result && result.totalCount && result.pageSize
      ? Math.ceil(result.totalCount / result.pageSize)
      : 1;
  }

  getPageNumbers(result: PaginationResult<T>): number[] {
    const total = this.getTotalPages(result);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage() {
    const total = this.getTotalPages(this.result);
    if (this.currentPage < total) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
